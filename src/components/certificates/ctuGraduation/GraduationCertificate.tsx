import React from "react";
import "./GraduationCertificate.css";
import type { CertificateData, CertificateSideData } from "./certificateData";

interface GraduationCertificateProps {
  data: CertificateData;
}

interface CertificatePageProps {
  lang: "en" | "vi";
  d: CertificateSideData;
  logoUrl?: string;
  side: "left" | "right";
}

export function CertificatePage({
  lang,
  d,
  logoUrl,
  side,
}: CertificatePageProps) {
  const isEn = lang === "en";

  const labels = isEn
    ? {
        country: "Socialist Republic of Vietnam",
        countrySub: "Independence - Freedom - Happiness",
        univTitle: "Rector\nof Can Tho University",
        confer: "has conferred",
        degree: "Certificate of Graduation",
        upon: "Upon:",
        dob: "Date of birth:",
        gradYear: "Year of graduation:",
        classification: "Degree classification:",
        studyMode: "Mode of study:",
        regNo: "Reg. No:",
        serialNo: "Serial No:",
        sealLine1: "CAN THO UNIVERSITY",
        sealLine2: "OFFICIAL SEAL",
      }
    : {
        country: "Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam",
        countrySub: "Độc lập - Tự do - Hạnh phúc",
        univTitle: "Hiệu Trưởng\nTrường Đại Học Cần Thơ",
        confer: "cấp",
        degree: "Giấy Chứng Nhận Tốt Nghiệp",
        upon: "Cho:",
        dob: "Ngày sinh:",
        gradYear: "Năm tốt nghiệp:",
        classification: "Xếp loại tốt nghiệp:",
        studyMode: "Hình thức đào tạo:",
        regNo: "Số vào sổ:",
        serialNo: "Số hiệu:",
        sealLine1: "ĐẠI HỌC CẦN THƠ",
        sealLine2: "OFFICIAL SEAL",
      };

  return (
    <div className={`gc-page gc-page--${side}`}>
      <div className="gc-content">
        <div className="gc-country-title">{labels.country}</div>

        <div className="gc-country-sub">{labels.countrySub}</div>

        <div className="gc-univ-title">
          {labels.univTitle.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i === 0 && <br />}
            </React.Fragment>
          ))}
        </div>

        <div className="gc-confer-text">{labels.confer}</div>

        <div className="gc-degree-title">{labels.degree}</div>

        <div className="gc-major-title">{d.major}</div>

        {logoUrl && (
          <div className="gc-center-logo">
            <img src={logoUrl} alt="logo" />
          </div>
        )}

        <div className="gc-info-grid">
          <div className="gc-info-row">
            <div className="gc-info-label">{labels.upon}</div>
            <div className="gc-info-value gc-name-val">{d.fullName}</div>
          </div>

          <div className="gc-info-row">
            <div className="gc-info-label">{labels.dob}</div>
            <div className="gc-info-value">{d.dob}</div>
          </div>

          <div className="gc-info-row">
            <div className="gc-info-label">{labels.gradYear}</div>
            <div className="gc-info-value">{d.graduationYear}</div>
          </div>

          <div className="gc-info-row">
            <div className="gc-info-label">{labels.classification}</div>
            <div className="gc-info-value gc-info-value--classification">
              {d.classification}
            </div>
          </div>

          <div className="gc-info-row">
            <div className="gc-info-label">{labels.studyMode}</div>
            <div className="gc-info-value">{d.studyMode}</div>
          </div>
        </div>

        <div className="gc-footer">
          <div className="gc-red-seal">
            <div className="gc-seal-content">
              {labels.sealLine1}
              <br />★<br />
              {labels.sealLine2}
            </div>
          </div>

          <div className="gc-reg-box">
            {labels.regNo} <strong>{d.regNo}</strong>
            <br />
            {labels.serialNo} <strong>{d.serialNo}</strong>
          </div>

          <div className="gc-signature-box">
            <div className="gc-date">{d.issueDate}</div>

            <div className="gc-title">{d.signerTitle}</div>

            <div className="gc-mock-signature">{d.signatureText}</div>

            <div className="gc-signer-name">{d.signerName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GraduationCertificate({
  data,
}: GraduationCertificateProps) {
  const bg = data.backgroundImage ?? "./template_cred.png";

  return (
    <div className="gc-wrap">
      <div
        className="gc-book"
        style={{
          backgroundImage: `url(${bg})`,
        }}
      >
        <CertificatePage
          lang="en"
          d={data.en}
          logoUrl={data.logoUrl}
          side="left"
        />

        <CertificatePage
          lang="vi"
          d={data.vi}
          logoUrl={data.logoUrl}
          side="right"
        />
      </div>
    </div>
  );
}

export default GraduationCertificate;