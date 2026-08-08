import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET(request: NextRequest) {
  try {
    // Get reference from query parameters
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get("reference");
    const email = searchParams.get("email"); // Optional: for additional verification

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 }
      );
    }

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create Supabase Admin client (no auth required for this route)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify purchase exists and is completed
    const purchaseQuery = supabaseAdmin
      .from("purchases")
      .select("id, email, product_id, status")
      .eq("transaction_id", reference)
      .eq("product_id", "talk-to-ai-like-a-pro")
      .eq("status", "completed")
      .limit(1);

    const { data: purchases, error: purchaseError } = await purchaseQuery;

    if (purchaseError) {
      console.error("Error checking purchase:", purchaseError);
      return NextResponse.json(
        { error: "Failed to verify access" },
        { status: 500 }
      );
    }

    if (!purchases || purchases.length === 0) {
      return NextResponse.json(
        { error: "Access denied. Purchase not found or not completed." },
        { status: 403 }
      );
    }

    // Optional: Verify email matches if provided
    if (email) {
      const purchase = purchases[0];
      if (purchase.email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json(
          { error: "Access denied. Email does not match purchase record." },
          { status: 403 }
        );
      }
    }

    // PDF file path
    const pdfFileName = "Talk to AI like a PRO.pdf";
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
          return NextResponse.json(
            { error: "Malformed Range header" },
            { status: 416 }
          );
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

        return new NextResponse(new Uint8Array(chunk), {
          status: 206,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${pdfFileName}"`,
            "Accept-Ranges": "bytes",
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Content-Length": contentLength,
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }

      // Full content response
      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${pdfFileName}"`,
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
  } catch (error: unknown) {
    console.error("Error in ebook download route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
