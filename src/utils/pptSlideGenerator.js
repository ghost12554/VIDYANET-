import { jsPDF } from 'jspdf';
import { formatFileSize } from './fileAttachmentUtils';

export const PPT_THEMES = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Indigo (Tech)',
    bg: [15, 23, 42], // #0F172A
    cardBg: [30, 41, 59], // #1E293B
    cardBorder: [51, 65, 85], // #334155
    primary: [99, 102, 241], // #6366F1
    primaryLight: [224, 231, 255],
    accent: [168, 85, 247], // #A855F7
    textPrimary: [255, 255, 255],
    textSecondary: [203, 213, 225],
    codeBg: [10, 15, 30],
    codeText: [167, 243, 208],
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Clean (Algorithmic)',
    bg: [6, 30, 24], // Deep Dark Green
    cardBg: [15, 46, 38],
    cardBorder: [24, 76, 62],
    primary: [16, 185, 129], // Emerald 500
    primaryLight: [209, 250, 229],
    accent: [52, 211, 153],
    textPrimary: [255, 255, 255],
    textSecondary: [204, 251, 241],
    codeBg: [4, 20, 16],
    codeText: [110, 231, 183],
  },
  crimson: {
    id: 'crimson',
    name: 'Academic Crimson (Ivy League)',
    bg: [35, 10, 18], // Deep Crimson
    cardBg: [55, 18, 30],
    cardBorder: [88, 28, 48],
    primary: [244, 63, 94], // Rose
    primaryLight: [255, 228, 230],
    accent: [251, 191, 36], // Gold
    textPrimary: [255, 255, 255],
    textSecondary: [254, 205, 211],
    codeBg: [25, 7, 12],
    codeText: [253, 230, 138],
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Neon (Futuristic)',
    bg: [10, 10, 18],
    cardBg: [20, 22, 38],
    cardBorder: [38, 42, 70],
    primary: [6, 182, 212], // Cyan
    primaryLight: [207, 250, 254],
    accent: [236, 72, 153], // Pink
    textPrimary: [255, 255, 255],
    textSecondary: [186, 230, 253],
    codeBg: [5, 6, 12],
    codeText: [103, 232, 249],
  },
  light: {
    id: 'light',
    name: 'Studio Minimal (Clean Light)',
    bg: [248, 250, 252],
    cardBg: [255, 255, 255],
    cardBorder: [226, 232, 240],
    primary: [79, 70, 229],
    primaryLight: [238, 242, 255],
    accent: [16, 185, 129],
    textPrimary: [15, 23, 42],
    textSecondary: [71, 85, 105],
    codeBg: [15, 23, 42],
    codeText: [167, 243, 208],
  },
};

/**
 * Generates an official 16:9 Widescreen Presentation PDF Slide Deck
 * Format: 297mm x 167mm (Exact 16:9 widescreen presentation ratio)
 */
export function generatePresentationPdf(ppt, themeId = 'midnight') {
  if (!ppt || !Array.isArray(ppt.slides) || ppt.slides.length === 0) return null;

  const theme = PPT_THEMES[themeId] || PPT_THEMES.midnight;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [297, 167], // 16:9 widescreen
  });

  const pageWidth = 297;
  const pageHeight = 167;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const slides = ppt.slides;

  slides.forEach((slide, sIdx) => {
    if (sIdx > 0) doc.addPage([297, 167], 'landscape');

    // 1. Slide Canvas Background
    doc.setFillColor(...theme.bg);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Subtle decorative top accent bar
    doc.setFillColor(...theme.primary);
    doc.rect(0, 0, pageWidth, 2.5, 'F');

    // 2. Top Header Navigation
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...theme.textSecondary);
    doc.text(
      'INDIRA UNIVERSITY • DEPT. OF ARTIFICIAL INTELLIGENCE & MACHINE LEARNING',
      margin,
      10
    );

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...theme.primary);
    doc.text(
      `${(ppt.topic || 'Academic Lecture').toUpperCase()}`,
      pageWidth - margin,
      10,
      { align: 'right' }
    );

    // 3. Slide Category Pill & Highlight
    const category = slide.category || (sIdx === 0 ? 'LECTURE OVERVIEW' : `MODULE 0${sIdx}`);
    doc.setFillColor(...theme.primary);
    doc.roundedRect(margin, 15, 36, 6, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'bold');
    doc.text(category.toUpperCase(), margin + 18, 19.2, { align: 'center' });

    if (slide.highlightPill) {
      doc.setFillColor(...theme.cardBg);
      doc.setDrawColor(...theme.cardBorder);
      doc.roundedRect(margin + 39, 15, 42, 6, 1.5, 1.5, 'FD');
      doc.setTextColor(...theme.accent);
      doc.text(slide.highlightPill.toUpperCase(), margin + 60, 19.2, { align: 'center' });
    }

    // 4. Slide Title & Subtitle
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(...theme.textPrimary);
    const titleLines = doc.splitTextToSize(slide.title || `Slide ${sIdx + 1}`, contentWidth);
    doc.text(titleLines, margin, 29);

    const titleH = titleLines.length * 7;
    let currentY = 29 + titleH;

    if (slide.subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...theme.textSecondary);
      const subLines = doc.splitTextToSize(slide.subtitle, contentWidth);
      doc.text(subLines, margin, currentY);
      currentY += subLines.length * 4.8 + 3;
    } else {
      currentY += 2;
    }

    // 5. Dual-Column Content Cards (2-Card Responsive Grid)
    const cardTop = Math.max(currentY, 48);
    const cardH = 92;
    const colGap = 8;
    const colW = (contentWidth - colGap) / 2;

    // --- LEFT CARD: Core Concepts & Key Takeaways ---
    doc.setFillColor(...theme.cardBg);
    doc.setDrawColor(...theme.cardBorder);
    doc.roundedRect(margin, cardTop, colW, cardH, 2.5, 2.5, 'FD');

    // Left card accent header bar
    doc.setFillColor(...theme.primary);
    doc.roundedRect(margin, cardTop, colW, 7, 2, 2, 'F');
    doc.rect(margin, cardTop + 5, colW, 2, 'F'); // square bottom corners of top header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('KEY TECHNICAL CONCEPTS & ANALYSIS', margin + 5, cardTop + 4.8);

    // Left card bullet points
    let bulletY = cardTop + 14;
    const bullets = slide.bullets || slide.bulletPoints || [
      'Core architectural motivation and system invariants.',
      'Algorithmic trade-offs and complexity guarantees.',
      'Practical engineering applications in enterprise systems.',
    ];

    bullets.forEach((point) => {
      if (bulletY + 12 > cardTop + cardH) return;

      // Bullet vector circle
      doc.setFillColor(...theme.primary);
      doc.circle(margin + 5, bulletY + 1.2, 1, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.2);
      doc.setTextColor(...theme.textSecondary);
      const splitPoint = doc.splitTextToSize(point, colW - 14);
      doc.text(splitPoint, margin + 9, bulletY + 2);
      bulletY += splitPoint.length * 4.5 + 4;
    });

    // --- RIGHT CARD: Code Block or Visual Architecture Deep Dive ---
    const rightX = margin + colW + colGap;
    doc.setFillColor(...theme.cardBg);
    doc.setDrawColor(...theme.cardBorder);
    doc.roundedRect(rightX, cardTop, colW, cardH, 2.5, 2.5, 'FD');

    if (slide.codeSnippet) {
      // Right Card as IDE Code Box
      doc.setFillColor(15, 23, 42); // Dark slate
      doc.roundedRect(rightX, cardTop, colW, cardH, 2.5, 2.5, 'F');

      // Top IDE window controls bar
      doc.setFillColor(30, 41, 59);
      doc.rect(rightX, cardTop, colW, 7, 'F');

      // Window dots
      doc.setFillColor(239, 68, 68);
      doc.circle(rightX + 4.5, cardTop + 3.5, 1, 'F');
      doc.setFillColor(245, 158, 11);
      doc.circle(rightX + 8, cardTop + 3.5, 1, 'F');
      doc.setFillColor(16, 185, 129);
      doc.circle(rightX + 11.5, cardTop + 3.5, 1, 'F');

      doc.setFont('courier', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(148, 163, 184);
      doc.text('PYTHON REFERENCE IMPLEMENTATION', rightX + 17, cardTop + 4.8);

      // Code text
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(167, 243, 208); // Light Emerald
      const splitCode = doc.splitTextToSize(slide.codeSnippet, colW - 8);
      doc.text(splitCode.slice(0, 18), rightX + 4, cardTop + 13);
    } else {
      // Right Card as Deep Dive & Architecture Insights
      doc.setFillColor(...theme.accent);
      doc.roundedRect(rightX, cardTop, colW, 7, 2, 2, 'F');
      doc.rect(rightX, cardTop + 5, colW, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text('SYSTEM ARCHITECTURE & PEDAGOGICAL INSIGHT', rightX + 5, cardTop + 4.8);

      let insightY = cardTop + 14;
      const insights = slide.insights || [
        `Architecture Profile: High throughput, deterministic memory layout.`,
        `Invariant Guarantee: Pre-condition checks enforced prior to state mutations.`,
        `Exam Focus: Be prepared to justify asymptotic bounds in oral vivas.`,
      ];

      insights.forEach((ins) => {
        if (insightY + 14 > cardTop + cardH) return;
        doc.setFillColor(...theme.accent);
        doc.circle(rightX + 5, insightY + 1.2, 1, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.2);
        doc.setTextColor(...theme.textSecondary);
        const splitIns = doc.splitTextToSize(ins, colW - 14);
        doc.text(splitIns, rightX + 9, insightY + 2);
        insightY += splitIns.length * 4.5 + 4;
      });

      // Bottom speaker note banner
      if (slide.speakerNotes) {
        const noteBoxY = cardTop + cardH - 24;
        doc.setFillColor(...theme.bg);
        doc.setDrawColor(...theme.cardBorder);
        doc.roundedRect(rightX + 4, noteBoxY, colW - 8, 20, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(...theme.primary);
        doc.text('PROFESSOR LECTURE REMARKS:', rightX + 7, noteBoxY + 4.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(...theme.textSecondary);
        const splitNotes = doc.splitTextToSize(slide.speakerNotes, colW - 14);
        doc.text(splitNotes.slice(0, 3), rightX + 7, noteBoxY + 9);
      }
    }

    // 6. Running Presentation Footer
    doc.setDrawColor(...theme.cardBorder);
    doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(...theme.textSecondary);
    doc.text(
      'Teacher Co-Pilot (AI Assistant for Teachers) • Faculty: Prof. Sarita Byagar (HOD - AIML)',
      margin,
      pageHeight - 5.5
    );

    // Slide Number Counter
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...theme.primary);
    doc.text(
      `Slide ${sIdx + 1} of ${slides.length}`,
      pageWidth - margin,
      pageHeight - 5.5,
      { align: 'right' }
    );
  });

  const cleanFilename = `${(ppt.title || 'Lecture_Presentation')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40)}_16x9_Deck.pdf`;

  const dataUrl = doc.output('datauristring');
  const rawArray = doc.output('arraybuffer');
  const sizeStr = formatFileSize(rawArray.byteLength);

  return {
    id: `ppt-pdf-${Date.now()}`,
    name: cleanFilename,
    size: sizeStr,
    rawSize: rawArray.byteLength,
    type: 'application/pdf',
    dataUrl: dataUrl,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Triggers browser download for 16:9 presentation PDF
 */
export function downloadPresentationPdf(ppt, themeId = 'midnight') {
  const att = generatePresentationPdf(ppt, themeId);
  if (!att || !att.dataUrl) return;

  const link = document.createElement('a');
  link.href = att.dataUrl;
  link.download = att.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports a standalone, responsive, interactive HTML presentation deck
 * Works in any browser with keyboard controls (Arrow keys, Space, Esc) and Fullscreen toggle!
 */
export function exportPresentationHtml(ppt, themeId = 'midnight') {
  if (!ppt || !Array.isArray(ppt.slides)) return;

  const theme = PPT_THEMES[themeId] || PPT_THEMES.midnight;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ppt.title || 'Teacher Co-Pilot (AI Assistant for Teachers)'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: rgb(${theme.bg.join(',')});
      color: rgb(${theme.textPrimary.join(',')});
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgb(${theme.cardBorder.join(',')});
      background: rgba(0,0,0,0.2);
    }
    .brand { font-size: 13px; font-weight: 700; color: rgb(${theme.primary.join(',')}); }
    .faculty { font-size: 12px; color: rgb(${theme.textSecondary.join(',')}); }
    main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
    }
    .slide-card {
      width: 100%;
      max-width: 1100px;
      aspect-ratio: 16 / 9;
      background: rgb(${theme.cardBg.join(',')});
      border: 1px solid rgb(${theme.cardBorder.join(',')});
      border-radius: 20px;
      padding: 36px 44px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      position: relative;
    }
    .pill {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      background: rgb(${theme.primary.join(',')});
      color: white;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 14px;
      align-self: flex-start;
    }
    h1 { font-size: 28px; font-weight: 800; line-height: 1.3; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: rgb(${theme.textSecondary.join(',')}); margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; flex: 1; }
    .panel {
      background: rgba(0,0,0,0.25);
      border: 1px solid rgb(${theme.cardBorder.join(',')});
      border-radius: 14px;
      padding: 18px 22px;
      overflow-y: auto;
    }
    .panel h3 { font-size: 12px; text-transform: uppercase; color: rgb(${theme.primary.join(',')}); margin-bottom: 12px; font-weight: 700; }
    ul { list-style: none; }
    li { font-size: 13px; line-height: 1.6; margin-bottom: 10px; color: rgb(${theme.textSecondary.join(',')}); position: relative; padding-left: 18px; }
    li::before { content: "•"; position: absolute; left: 0; color: rgb(${theme.primary.join(',')}); font-size: 18px; line-height: 1; }
    pre {
      background: rgb(${theme.codeBg.join(',')});
      color: rgb(${theme.codeText.join(',')});
      padding: 14px;
      border-radius: 10px;
      font-family: monospace;
      font-size: 11px;
      line-height: 1.5;
      overflow-x: auto;
    }
    footer {
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgb(${theme.cardBorder.join(',')});
      background: rgba(0,0,0,0.2);
    }
    .controls { display: flex; gap: 8px; align-items: center; }
    button {
      padding: 8px 16px;
      border-radius: 10px;
      background: rgb(${theme.primary.join(',')});
      color: white;
      border: none;
      font-weight: 700;
      cursor: pointer;
      font-size: 12px;
      transition: opacity 0.2s;
    }
    button:disabled { opacity: 0.3; cursor: not-allowed; }
    button:hover:not(:disabled) { opacity: 0.85; }
    .counter { font-size: 13px; font-weight: 700; color: rgb(${theme.textSecondary.join(',')}); }
  </style>
</head>
<body>
  <header>
    <div class="brand">Teacher Co-Pilot • ${ppt.topic || 'Lecture Presentation'}</div>
    <div class="faculty">Prof. Sarita Byagar (HOD - AIML)</div>
  </header>
  <main>
    <div id="slide-container" class="slide-card"></div>
  </main>
  <footer>
    <div class="counter" id="slide-counter">Slide 1 of ${ppt.slides.length}</div>
    <div class="controls">
      <button id="prev-btn" onclick="prevSlide()">← Previous</button>
      <button id="next-btn" onclick="nextSlide()">Next →</button>
      <button onclick="toggleFullscreen()">Fullscreen (F)</button>
    </div>
  </footer>

  <script>
    const slides = ${JSON.stringify(ppt.slides)};
    let currentIndex = 0;

    function renderSlide() {
      const s = slides[currentIndex];
      const container = document.getElementById('slide-container');
      const counter = document.getElementById('slide-counter');
      const prevBtn = document.getElementById('prev-btn');
      const nextBtn = document.getElementById('next-btn');

      counter.textContent = 'Slide ' + (currentIndex + 1) + ' of ' + slides.length;
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === slides.length - 1;

      let rightContent = '';
      if (s.codeSnippet) {
        rightContent = '<pre>' + s.codeSnippet.replace(/</g, '&lt;') + '</pre>';
      } else {
        const insights = s.insights || [
          'High throughput, deterministic memory layout.',
          'Invariant Guarantee: Pre-condition checks enforced prior to state mutations.',
          'Exam Focus: Justify asymptotic bounds during faculty oral examinations.'
        ];
        rightContent = '<ul>' + insights.map(i => '<li>' + i + '</li>').join('') + '</ul>';
      }

      const bulletsHtml = (s.bullets || s.bulletPoints || []).map(b => '<li>' + b + '</li>').join('');

      container.innerHTML = 
        '<div class="pill">' + (s.category || 'MODULE 0' + (currentIndex + 1)) + '</div>' +
        '<h1>' + s.title + '</h1>' +
        '<div class="subtitle">' + (s.subtitle || '') + '</div>' +
        '<div class="grid">' +
          '<div class="panel"><h3>Core Concepts</h3><ul>' + bulletsHtml + '</ul></div>' +
          '<div class="panel"><h3>' + (s.codeSnippet ? 'Implementation' : 'Architecture & Remarks') + '</h3>' + rightContent + '</div>' +
        '</div>';
    }

    function prevSlide() { if (currentIndex > 0) { currentIndex--; renderSlide(); } }
    function nextSlide() { if (currentIndex < slides.length - 1) { currentIndex++; renderSlide(); } }
    function toggleFullscreen() {
      if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); }
      else { document.exitFullscreen(); }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    });

    renderSlide();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(ppt.title || 'Presentation').replace(/\s+/g, '_')}_Interactive_Deck.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
