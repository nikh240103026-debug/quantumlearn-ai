import "server-only";

import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from "pdf-lib";

import type { CertificateRecord } from "./types";
import {
  CERTIFICATE_ISSUER,
  certificateHeading,
  certificateStatement,
  formatIssueDate,
  verificationUrl,
} from "./format";

/*
 * The PDF uses the built-in Times/Helvetica fonts (no font files to ship),
 * which only cover Latin characters. When a name or title contains other
 * scripts, the verify page offers "Print / Save as PDF" instead, which
 * renders the HTML certificate with full Unicode support.
 */
const WIN_ANSI = /^[\x20-\x7E -ÿ–—‘’“”•…]*$/;

export function canRenderPdf(certificate: CertificateRecord) {
  return [certificate.recipientName, certificate.title, certificate.level ?? ""].every(
    (text) => WIN_ANSI.test(text),
  );
}

const INK = rgb(0.086, 0.09, 0.106);
const INK_SOFT = rgb(0.365, 0.361, 0.341);
const RULE = rgb(0.871, 0.855, 0.816);
const SHEET = rgb(1, 0.992, 0.973);
const ACCENT = rgb(0.137, 0.251, 0.902);

function centered(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color = INK,
  maxWidth?: number,
) {
  let fontSize = size;
  if (maxWidth) {
    while (fontSize > 10 && font.widthOfTextAtSize(text, fontSize) > maxWidth) {
      fontSize -= 1;
    }
  }
  const width = font.widthOfTextAtSize(text, fontSize);
  page.drawText(text, {
    x: (page.getWidth() - width) / 2,
    y,
    size: fontSize,
    font,
    color,
  });
  return fontSize;
}

function spaced(text: string) {
  return text.toUpperCase().split("").join(" ");
}

export async function renderCertificatePdf(certificate: CertificateRecord) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${certificateHeading(certificate)} — ${certificate.recipientName}`);
  pdf.setAuthor(CERTIFICATE_ISSUER);
  pdf.setSubject(certificate.title);
  pdf.setCreator(CERTIFICATE_ISSUER);
  pdf.setCreationDate(new Date(certificate.issuedAt));

  const page = pdf.addPage([841.89, 595.28]); // A4 landscape
  const { width, height } = page.getSize();

  const [serif, serifBold, serifItalic, serifBoldItalic, sans, sansBold] =
    await Promise.all([
      pdf.embedFont(StandardFonts.TimesRoman),
      pdf.embedFont(StandardFonts.TimesRomanBold),
      pdf.embedFont(StandardFonts.TimesRomanItalic),
      pdf.embedFont(StandardFonts.TimesRomanBoldItalic),
      pdf.embedFont(StandardFonts.Helvetica),
      pdf.embedFont(StandardFonts.HelveticaBold),
    ]);

  // Sheet and frames
  page.drawRectangle({ x: 0, y: 0, width, height, color: SHEET });
  page.drawRectangle({
    x: 22, y: 22, width: width - 44, height: height - 44,
    borderColor: INK, borderWidth: 2.2,
  });
  page.drawRectangle({
    x: 30, y: 30, width: width - 60, height: height - 60,
    borderColor: INK, borderWidth: 0.6,
  });

  // Guilloche band along the top and bottom inner edge
  for (const baseY of [41, height - 41]) {
    for (let phase = 0; phase < 3; phase++) {
      let path = "";
      for (let x = 46; x <= width - 46; x += 4) {
        const y = Math.sin((x / 18) + phase * 2.1) * 4;
        path += `${x === 46 ? "M" : "L"}${x.toFixed(1)} ${(-y).toFixed(2)} `;
      }
      page.drawSvgPath(path, {
        x: 0, y: baseY,
        borderColor: RULE, borderWidth: 0.5,
      });
    }
  }

  // Header
  centered(page, spaced(CERTIFICATE_ISSUER), height - 96, sansBold, 10, INK_SOFT);
  centered(page, certificateHeading(certificate), height - 152, serif, 40);
  page.drawLine({
    start: { x: width / 2 - 60, y: height - 172 },
    end: { x: width / 2 + 60, y: height - 172 },
    thickness: 0.8, color: ACCENT,
  });

  centered(page, "This is to certify that", height - 208, serifItalic, 15, INK_SOFT);
  centered(page, certificate.recipientName, height - 258, serifBoldItalic, 38, INK, 620);
  page.drawLine({
    start: { x: width / 2 - 230, y: height - 272 },
    end: { x: width / 2 + 230, y: height - 272 },
    thickness: 0.6, color: INK_SOFT,
  });

  const statement = certificateStatement(certificate);
  centered(page, statement.lead, height - 306, serif, 15, INK_SOFT);
  centered(page, statement.title, height - 338, serifBold, 24, INK, 640);
  if (statement.tail) {
    centered(page, statement.tail, height - 364, serifItalic, 14, INK_SOFT);
  }

  // Footer: date · seal · number
  const footY = 112;
  const colX = [150, width - 150];
  const labels: Array<[string, string]> = [
    ["DATE OF ISSUE", formatIssueDate(certificate.issuedAt)],
    ["CERTIFICATE NO.", certificate.certificateNumber],
  ];
  labels.forEach(([label, value], i) => {
    const valueFont = i === 0 ? serif : sansBold;
    const valueSize = i === 0 ? 15 : 12;
    const vw = valueFont.widthOfTextAtSize(value, valueSize);
    page.drawText(value, { x: colX[i] - vw / 2, y: footY + 8, size: valueSize, font: valueFont, color: INK });
    page.drawLine({
      start: { x: colX[i] - 95, y: footY },
      end: { x: colX[i] + 95, y: footY },
      thickness: 0.6, color: INK_SOFT,
    });
    const lw = sans.widthOfTextAtSize(label, 7.5);
    page.drawText(label, { x: colX[i] - lw / 2, y: footY - 14, size: 7.5, font: sans, color: INK_SOFT });
  });

  // Rosette seal
  const sealX = width / 2;
  const sealY = footY + 4;
  for (let i = 0; i < 24; i++) {
    page.drawEllipse({
      x: sealX, y: sealY, xScale: 44, yScale: 16,
      rotate: degrees((i * 180) / 24),
      borderColor: ACCENT, borderWidth: 0.35, borderOpacity: 0.7,
    });
  }
  page.drawCircle({ x: sealX, y: sealY, size: 22, color: SHEET, borderColor: ACCENT, borderWidth: 1 });
  page.drawCircle({ x: sealX, y: sealY, size: 46, borderColor: ACCENT, borderWidth: 0.8 });
  const ql = "QL";
  page.drawText(ql, {
    x: sealX - serifBold.widthOfTextAtSize(ql, 18) / 2,
    y: sealY - 6, size: 18, font: serifBold, color: ACCENT,
  });

  // Verification line
  centered(
    page,
    `Verify this certificate at ${verificationUrl(certificate.verificationToken)}`,
    56, sans, 8, INK_SOFT,
  );

  return pdf.save();
}
