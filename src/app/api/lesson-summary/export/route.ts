import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ExportRequest {
  title?: string;
  summary?: string;
  format?: "docx" | "pdf";
}

export async function POST(
  request: NextRequest,
) {
  try {
    // ========================================================
    // AUTHENTICATION
    // ========================================================

    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error:
            "You must be logged in to export a lesson summary.",
        },
        {
          status: 401,
        },
      );
    }

    // ========================================================
    // REQUEST
    // ========================================================

    const body =
      (await request.json()) as ExportRequest;

    const title =
      typeof body.title ===
      "string"
        ? body.title.trim()
        : "Lesson Summary";

    const summary =
      typeof body.summary ===
      "string"
        ? body.summary.trim()
        : "";

    const format =
      body.format;

    if (!summary) {
      return NextResponse.json(
        {
          error:
            "Summary content is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      format !== "docx" &&
      format !== "pdf"
    ) {
      return NextResponse.json(
        {
          error:
            "Export format must be DOCX or PDF.",
        },
        {
          status: 400,
        },
      );
    }

    const filename =
      safeFilename(title);

    // ========================================================
    // DOCX
    // ========================================================

    if (format === "docx") {
      const buffer =
        await createDocx(
          title,
          summary,
        );

      const docxBody =
        new Uint8Array(
          buffer.length,
        );

      docxBody.set(buffer);

      return new NextResponse(
        docxBody.buffer,
        {
          headers: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

            "Content-Disposition":
              `attachment; filename="${filename}-summary.docx"`,

            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    // ========================================================
    // PDF
    // ========================================================

    const pdfBytes =
      await createPdf(
        title,
        summary,
      );

    const pdfBody =
      new Uint8Array(
        pdfBytes.length,
      );

    pdfBody.set(pdfBytes);

    return new NextResponse(
      pdfBody.buffer,
      {
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="${filename}-summary.pdf"`,

          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Lesson summary export error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to export the lesson summary.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// DOCX GENERATOR
// ============================================================

async function createDocx(
  title: string,
  markdown: string,
) {
  const lines =
    markdown.split(/\r?\n/);

  const children:
    Paragraph[] = [];

  children.push(
    new Paragraph({
      text: title,
      heading:
        HeadingLevel.TITLE,
      spacing: {
        after: 400,
      },
    }),
  );

  for (const line of lines) {
    const trimmed =
      line.trim();

    if (!trimmed) {
      children.push(
        new Paragraph({
          text: "",
          spacing: {
            after: 120,
          },
        }),
      );

      continue;
    }

    if (
      trimmed.startsWith(
        "### ",
      )
    ) {
      children.push(
        new Paragraph({
          text: stripMarkdown(
            trimmed.slice(4),
          ),
          heading:
            HeadingLevel.HEADING_3,
          spacing: {
            before: 240,
            after: 120,
          },
        }),
      );

      continue;
    }

    if (
      trimmed.startsWith(
        "## ",
      )
    ) {
      children.push(
        new Paragraph({
          text: stripMarkdown(
            trimmed.slice(3),
          ),
          heading:
            HeadingLevel.HEADING_2,
          spacing: {
            before: 300,
            after: 140,
          },
        }),
      );

      continue;
    }

    if (
      trimmed.startsWith(
        "# ",
      )
    ) {
      children.push(
        new Paragraph({
          text: stripMarkdown(
            trimmed.slice(2),
          ),
          heading:
            HeadingLevel.HEADING_1,
          spacing: {
            before: 350,
            after: 160,
          },
        }),
      );

      continue;
    }

    if (
      trimmed.startsWith(
        "- ",
      ) ||
      trimmed.startsWith(
        "* ",
      )
    ) {
      children.push(
        new Paragraph({
          text: stripMarkdown(
            trimmed.slice(2),
          ),
          bullet: {
            level: 0,
          },
          spacing: {
            after: 100,
          },
        }),
      );

      continue;
    }

    const ordered =
      trimmed.match(
        /^\d+\.\s+(.*)$/,
      );

    if (ordered) {
      children.push(
        new Paragraph({
          text: stripMarkdown(
            ordered[1],
          ),
          numbering: {
            reference:
              "summary-numbering",
            level: 0,
          },
          spacing: {
            after: 100,
          },
        }),
      );

      continue;
    }

    children.push(
      new Paragraph({
        children:
          parseInlineMarkdown(
            trimmed,
          ),
        spacing: {
          after: 160,
          line: 280,
        },
      }),
    );
  }

  const document =
    new Document({
      numbering: {
        config: [
          {
            reference:
              "summary-numbering",
            levels: [
              {
                level: 0,
                format:
                  "decimal",
                text:
                  "%1.",
                alignment:
                  "left",
              },
            ],
          },
        ],
      },

      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },

          children,
        },
      ],
    });

  return Packer.toBuffer(
    document,
  );
}

// ============================================================
// PDF GENERATOR
// ============================================================

async function createPdf(
  title: string,
  markdown: string,
) {
  const pdf =
    await PDFDocument.create();

  const font =
    await pdf.embedFont(
      StandardFonts.Helvetica,
    );

  const boldFont =
    await pdf.embedFont(
      StandardFonts.HelveticaBold,
    );

  const pageWidth = 595;
  const pageHeight = 842;

  const margin = 55;
  const contentWidth =
    pageWidth -
    margin * 2;

  let page =
    pdf.addPage([
      pageWidth,
      pageHeight,
    ]);

  let y =
    pageHeight - margin;

  const titleSize = 22;
  const headingSize = 15;
  const bodySize = 10.5;
  const lineHeight = 16;

  page.drawText(
    title,
    {
      x: margin,
      y,
      size: titleSize,
      font: boldFont,
      color: rgb(
        0.067,
        0.075,
        0.094,
      ),
      maxWidth:
        contentWidth,
    },
  );

  y -= 40;

  const lines =
    markdown.split(/\r?\n/);

  for (const rawLine of lines) {
    const line =
      rawLine.trim();

    if (!line) {
      y -= 10;
      continue;
    }

    let fontToUse =
      font;

    let size =
      bodySize;

    let text =
      line;

    if (
      line.startsWith(
        "### ",
      )
    ) {
      text =
        line.slice(4);

      fontToUse =
        boldFont;

      size = headingSize;
      y -= 8;
    } else if (
      line.startsWith(
        "## ",
      )
    ) {
      text =
        line.slice(3);

      fontToUse =
        boldFont;

      size = headingSize;
      y -= 10;
    } else if (
      line.startsWith(
        "# ",
      )
    ) {
      text =
        line.slice(2);

      fontToUse =
        boldFont;

      size = 17;
      y -= 10;
    } else if (
      line.startsWith(
        "- ",
      ) ||
      line.startsWith(
        "* ",
      )
    ) {
      text =
        "• " +
        line.slice(2);
    } else {
      const ordered =
        line.match(
          /^\d+\.\s+(.*)$/,
        );

      if (ordered) {
        text =
          "• " +
          ordered[1];
      }
    }

    text =
      stripMarkdown(text);

    const wrapped =
      wrapText(
        text,
        fontToUse,
        size,
        contentWidth,
      );

    for (
      let index = 0;
      index < wrapped.length;
      index++
    ) {
      if (y < margin + 35) {
        page =
          pdf.addPage([
            pageWidth,
            pageHeight,
          ]);

        y =
          pageHeight -
          margin;
      }

      page.drawText(
        wrapped[index],
        {
          x: margin,
          y,
          size,
          font: fontToUse,
          color: rgb(
            0.12,
            0.13,
            0.15,
          ),
        },
      );

      y -= lineHeight;
    }

    y -=
      size === headingSize
        ? 7
        : 3;
  }

  return pdf.save();
}

// ============================================================
// HELPERS
// ============================================================

function stripMarkdown(
  value: string,
) {
  return value
    .replace(
      /!\[([^\]]*)\]\([^)]+\)/g,
      "$1",
    )
    .replace(
      /\[([^\]]+)\]\([^)]+\)/g,
      "$1",
    )
    .replace(
      /(\*\*|__)(.*?)\1/g,
      "$2",
    )
    .replace(
      /(\*|_)(.*?)\1/g,
      "$2",
    )
    .replace(
      /`([^`]+)`/g,
      "$1",
    )
    .replace(
      /^>\s?/,
      "",
    )
    .trim();
}

function parseInlineMarkdown(
  value: string,
) {
  const clean =
    stripMarkdown(value);

  return [
    new TextRun({
      text: clean,
      size: 22,
    }),
  ];
}

function wrapText(
  text: string,
  font: any,
  size: number,
  maxWidth: number,
) {
  const words =
    text.split(/\s+/);

  const lines: string[] = [];

  let current = "";

  for (const word of words) {
    const test =
      current
        ? `${current} ${word}`
        : word;

    const width =
      font.widthOfTextAtSize(
        test,
        size,
      );

    if (
      width <= maxWidth
    ) {
      current = test;
    } else {
      if (current) {
        lines.push(
          current,
        );
      }

      current = word;
    }
  }

  if (current) {
    lines.push(
      current,
    );
  }

  return lines;
}

function safeFilename(
  value: string,
) {
  return (
    value
      .replace(
        /[^a-z0-9]+/gi,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      )
      .toLowerCase()
      .slice(0, 80) ||
    "lesson"
  );
}