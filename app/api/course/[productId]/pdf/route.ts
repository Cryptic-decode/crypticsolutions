import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Get authorization token from header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Create Supabase client for server-side authentication
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Verify user has access to this product
    const { data: purchases, error: purchaseError } = await supabase
      .from("purchases")
      .select("id, product_id, status")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .eq("status", "completed")
      .limit(1);

    if (purchaseError) {
      console.error("Error checking purchase:", purchaseError);
      return NextResponse.json(
        { error: "Failed to verify access" },
        { status: 500 }
      );
    }

    if (!purchases || purchases.length === 0) {
      return NextResponse.json(
        { error: "Access denied. You don't have access to this course." },
        { status: 403 }
      );
    }

    // Map productId to PDF file path
    const productPdfMap: Record<string, string> = {
      "ielts-manual": "ielts-manual.pdf",
    };

    const pdfFileName = productPdfMap[productId];

    if (!pdfFileName) {
      return NextResponse.json(
        { error: "PDF not found for this product" },
        { status: 404 }
      );
    }

    // Read PDF file from private assets (not publicly accessible)
    const pdfPath = join(process.cwd(), "assets", "pdfs", pdfFileName);

    try {
      const pdfBuffer = readFileSync(pdfPath);

      // Handle HTTP Range requests (used by PDF.js for streaming/seek)
      const range = request.headers.get("range");
      const fileSize = pdfBuffer.length;

      if (range) {
        // Example: Range: bytes=0-1023
        const bytesPrefix = "bytes=";
        if (!range.startsWith(bytesPrefix)) {
          return NextResponse.json({ error: "Malformed Range header" }, { status: 416 });
        }

        const rangeParts = range.replace(bytesPrefix, "").split("-");
        let start = parseInt(rangeParts[0], 10);
        let end = rangeParts[1] ? parseInt(rangeParts[1], 10) : fileSize - 1;

        // Validate and clamp
        if (Number.isNaN(start) || start < 0) start = 0;
        if (Number.isNaN(end) || end >= fileSize) end = fileSize - 1;
        if (end < start) end = start;

        const chunk = pdfBuffer.subarray(start, end + 1);
        const contentLength = chunk.length.toString();

        return new NextResponse(chunk, {
          status: 206,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${pdfFileName}"`,
            "Accept-Ranges": "bytes",
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Content-Length": contentLength,
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }

      // Full content response
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${pdfFileName}"`,
          "Accept-Ranges": "bytes",
          "Content-Length": fileSize.toString(),
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch (fileError) {
      console.error("Error reading PDF file:", fileError);
      return NextResponse.json(
        { error: "PDF file not found" },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error("Error in PDF route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

