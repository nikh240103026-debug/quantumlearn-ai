import { ImageResponse } from "next/og";

import { getPublicCertificate } from "@/lib/certificates/certificate-service";
import {
  CERTIFICATE_ISSUER,
  certificateHeading,
  certificateStatement,
  formatIssueDate,
} from "@/lib/certificates/format";

export const alt = "QuantumLearn AI certificate";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const certificate = await getPublicCertificate(token);

  const heading = certificate ? certificateHeading(certificate) : "Certificate";
  const statement = certificate ? certificateStatement(certificate) : null;
  const revoked = certificate?.status === "revoked";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#05070d",
          padding: 36,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#fffdf8",
            border: "6px solid #16171b",
            color: "#16171b",
            fontFamily: "serif",
            position: "relative",
            padding: "0 70px",
          }}
        >
          <div style={{ fontSize: 20, letterSpacing: 8, color: "#5d5c57", fontFamily: "sans-serif", fontWeight: 700 }}>
            {CERTIFICATE_ISSUER.toUpperCase()}
          </div>
          <div style={{ fontSize: 58, marginTop: 18 }}>{heading}</div>
          <div style={{ width: 120, height: 3, background: "#2340e6", marginTop: 16 }} />
          {certificate && (
            <div style={{ fontSize: 30, fontStyle: "italic", color: "#5d5c57", marginTop: 28 }}>
              awarded to
            </div>
          )}
          <div style={{ fontSize: 64, fontWeight: 700, fontStyle: "italic", marginTop: 6, textAlign: "center" }}>
            {certificate?.recipientName ?? "Not found"}
          </div>
          {statement && (
            <div style={{ fontSize: 32, fontWeight: 700, marginTop: 22, textAlign: "center" }}>
              {statement.title}
            </div>
          )}
          {certificate && (
            <div
              style={{
                position: "absolute",
                bottom: 40,
                display: "flex",
                gap: 16,
                fontSize: 20,
                fontFamily: "sans-serif",
                color: revoked ? "#c42b2b" : "#0b7a44",
                fontWeight: 700,
              }}
            >
              {revoked ? "REVOKED" : "VERIFIED"}
              <span style={{ color: "#5d5c57", fontWeight: 400 }}>
                {formatIssueDate(certificate.issuedAt)} · {certificate.certificateNumber}
              </span>
            </div>
          )}
        </div>
      </div>
    ),
    size,
  );
}
