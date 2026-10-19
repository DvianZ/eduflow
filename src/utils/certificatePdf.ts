import { Certificate } from '@/types/elearning';
import { Alert } from '@/utils/alert';

/**
 * Generates a clean, sanitized PDF filename for the certificate matching the enrolled cohort class
 * e.g., EduFlow_Certificate_React_Native_Cohort_Budi_Santoso.pdf
 */
export function getCertificatePdfFilename(
  classNameOrCourse: string,
  studentName: string
): string {
  const cleanClass = (classNameOrCourse || 'Cohort_Class')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/__+/g, '_')
    .replace(/^_|_$/g, '');

  const cleanStudent = (studentName || 'Student')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/__+/g, '_')
    .replace(/^_|_$/g, '');

  return `EduFlow_Certificate_${cleanClass}_${cleanStudent}.pdf`;
}

/**
 * Builds standalone printable HTML representation of the certificate
 */
export function buildCertificateHTML(cert: Certificate): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${cert.courseTitle} - ${cert.studentName}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #FFFFFF;
      color: #0F172A;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .cert-frame {
      width: 100%;
      max-width: 960px;
      padding: 28px;
      background: #FFFDF7;
      border: 8px solid #D97706;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(217, 119, 6, 0.15);
      position: relative;
    }
    .cert-inner {
      border: 2px dashed #B45309;
      border-radius: 12px;
      padding: 36px 40px;
      text-align: center;
      background: #FFFFFF;
    }
    .cert-badge {
      display: inline-block;
      width: 60px;
      height: 60px;
      background: #FEF3C7;
      border: 2px solid #D97706;
      border-radius: 50%;
      line-height: 56px;
      font-size: 30px;
      margin-bottom: 12px;
    }
    .cert-title {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 3px;
      color: #92400E;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .cert-number {
      font-size: 12px;
      font-weight: 700;
      color: #D97706;
      letter-spacing: 1px;
      margin-bottom: 24px;
    }
    .cert-lead {
      font-size: 13px;
      color: #78350F;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .cert-recipient {
      font-size: 32px;
      font-weight: 900;
      color: #1E3A8A;
      letter-spacing: -0.5px;
      margin-bottom: 16px;
      text-decoration: underline;
      text-underline-offset: 6px;
      text-decoration-color: #F59E0B;
    }
    .cert-desc {
      font-size: 13px;
      color: #475569;
      max-width: 680px;
      margin: 0 auto 16px auto;
      line-height: 1.6;
    }
    .cert-program {
      font-size: 20px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 4px;
    }
    .cert-cohort {
      font-size: 14px;
      font-weight: 700;
      color: #2563EB;
      margin-bottom: 30px;
    }
    .cert-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 24px;
      border-top: 1px solid #E2E8F0;
      margin-top: 20px;
    }
    .cert-score-box {
      text-align: left;
    }
    .cert-score-label {
      font-size: 10px;
      font-weight: 800;
      color: #64748B;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .cert-score-val {
      font-size: 22px;
      font-weight: 900;
      color: #10B981;
    }
    .cert-seal {
      text-align: center;
    }
    .cert-seal-text {
      font-size: 11px;
      font-weight: 800;
      color: #D97706;
      border: 1.5px solid #FDE68A;
      background: #FFFBEB;
      padding: 6px 14px;
      border-radius: 20px;
    }
    .cert-sig-box {
      text-align: right;
    }
    .cert-sig-line {
      font-size: 14px;
      font-weight: 800;
      color: #0F172A;
      border-bottom: 1px solid #0F172A;
      padding-bottom: 2px;
      display: inline-block;
      margin-bottom: 4px;
    }
    .cert-sig-title {
      font-size: 11px;
      color: #64748B;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="cert-frame">
    <div class="cert-inner">
      <div class="cert-badge">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-top: 12px;"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
      </div>
      <div class="cert-title">Certificate of Completion</div>
      <div class="cert-number">CREDENTIAL #${cert.certificateNumber}</div>
      <div class="cert-lead">This is to officially certify that</div>
      <div class="cert-recipient">${cert.studentName}</div>
      <div class="cert-desc">
        has successfully completed all required curriculum modules, rigorous assessments, and capstone project deliverables for the accredited collaborative learning program:
      </div>
      <div class="cert-program">${cert.courseTitle}</div>
      <div class="cert-cohort">${cert.batchName}</div>
      
      <div class="cert-footer">
        <div class="cert-score-box">
          <div class="cert-score-label">Graduation Composite Score</div>
          <div class="cert-score-val">${cert.finalScore} / 100</div>
        </div>
        <div class="cert-seal">
          <span class="cert-seal-text">✓ VERIFIED OFFICIAL CREDENTIAL</span>
        </div>
        <div class="cert-sig-box">
          <div class="cert-sig-line">${cert.instructorName}</div>
          <div class="cert-sig-title">Lead Instructor & Academic Mentor</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers PDF printing or download with proper class-based naming format
 */
export function printCertificatePDF(cert: Certificate): boolean {
  const filename = getCertificatePdfFilename(cert.batchName || cert.courseTitle, cert.studentName);

  try {
    if (typeof window !== 'undefined') {
      // 1. Web / Browser print via dedicated iframe for isolated certificate document
      const originalTitle = typeof document !== 'undefined' ? document.title : '';

      // Set document title so browser print dialog defaults to the requested filename
      if (typeof document !== 'undefined') {
        document.title = filename.replace(/\.pdf$/i, '');
      }

      // Check if iframe print is supported
      if (typeof document !== 'undefined') {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(buildCertificateHTML(cert));
          iframeDoc.close();

          setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
              document.body.removeChild(iframe);
              if (originalTitle) {
                document.title = originalTitle;
              }
            }, 1000);
          }, 300);

          return true;
        }
      }

      // Direct fallback to window.print()
      if (window.print) {
        window.print();
        if (originalTitle && typeof document !== 'undefined') {
          setTimeout(() => {
            document.title = originalTitle;
          }, 1000);
        }
        return true;
      }
    }

    // Mobile / native fallback
    Alert.alert(
      'Official Certificate PDF',
      `Certificate is configured for export as:\n"${filename}"\n\nRecipient: ${cert.studentName}\nClass: ${cert.batchName}\nCredential #${cert.certificateNumber}`
    );
    return true;
  } catch {
    Alert.alert(
      'Print Notification',
      `Certificate #${cert.certificateNumber} ready. Target file: "${filename}"`
    );
    return false;
  }
}
