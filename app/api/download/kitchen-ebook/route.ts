import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import {
  KITCHEN_EBOOK_PDF_FILES,
  canDownloadKitchenPart,
  isKitchenEbookProductId,
  type KitchenEbookPart,
} from "@/lib/kitchen-ebook-products";

function isKitchenPart(value: string | null): value is KitchenEbookPart {
  return value === "part-one" || value === "part-two";
}

function servePdfRange(request: NextRequest, pdfBuffer: Buffer, fileName: string) {
  const range = request.headers.get("range");
  const fileSize = pdfBuffer.length;

  if (!range) {
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Accept-Ranges": "bytes",
        "Content-Length": fileSize.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const bytesPrefix = "bytes=";
  if (!range.startsWith(bytesPrefix)) {
    return NextResponse.json({ error: "Malformed Range header" }, { status: 416 });
  }

  const rangeParts = range.replace(bytesPrefix, "").split("-");
  let start = parseInt(rangeParts[0], 10);
  let end = rangeParts[1] ? parseInt(rangeParts[1], 10) : fileSize - 1;

  if (Number.isNaN(start) || start < 0) start = 0;
  if (Number.isNaN(end) || end >= fileSize) end = fileSize - 1;
  if (end < start) end = start;

  const chunk = pdfBuffer.subarray(start, end + 1);

  return new NextResponse(new Uint8Array(chunk), {
    status: 206,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Accept-Ranges": "bytes",
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Content-Length": chunk.length.toString(),
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get("reference");
    const part = searchParams.get("part");
    const email = searchParams.get("email");

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 });
    }

    if (!isKitchenPart(part)) {
      return NextResponse.json(
        { error: "Valid part is required (part-one or part-two)" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: purchases, error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .select("id, email, product_id, status")
      .eq("transaction_id", reference)
      .eq("status", "completed")
      .limit(1);

    if (purchaseError) {
      console.error("Error checking kitchen ebook purchase:", purchaseError);
      return NextResponse.json({ error: "Failed to verify access" }, { status: 500 });
    }

    if (!purchases?.length) {
      return NextResponse.json(
        { error: "Access denied. Purchase not found or not completed." },
        { status: 403 }
      );
    }

    const purchase = purchases[0];

    if (!isKitchenEbookProductId(purchase.product_id)) {
      return NextResponse.json({ error: "Invalid product for this download." }, { status: 403 });
    }

    if (!canDownloadKitchenPart(purchase.product_id, part)) {
      return NextResponse.json(
        { error: "This purchase does not include the requested part." },
        { status: 403 }
      );
    }

    if (email && purchase.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "Access denied. Email does not match purchase record." },
        { status: 403 }
      );
    }

    const pdfFileName = KITCHEN_EBOOK_PDF_FILES[part];
    const pdfPath = join(process.cwd(), "assets", "pdfs", pdfFileName);

    try {
      const pdfBuffer = readFileSync(pdfPath);
      return servePdfRange(request, pdfBuffer, pdfFileName);
    } catch (fileError) {
      console.error("Kitchen ebook PDF not found:", pdfPath, fileError);
      return NextResponse.json(
        {
          error:
            "PDF file not found on server. Please contact support if you just completed payment.",
        },
        { status: 404 }
      );
    }
  } catch (error: unknown) {
    console.error("Error in kitchen ebook download route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
