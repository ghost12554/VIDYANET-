import { jsPDF } from 'jspdf';
import { formatFileSize } from './fileAttachmentUtils';

/**
 * Clean raw Markdown and LaTeX math syntax into pristine, readable human text
 * Strictly maps to standard 7-bit ASCII & WinAnsi to prevent font encoding glyph corruptions (like ')' for '\cap')
 */
function cleanFormatting(raw) {
  if (!raw) return '';
  return raw
    // Convert common LaTeX mathematical symbols into clean ASCII representations
    .replace(/\\rightarrow/g, ' -> ')
    .replace(/\\leftarrow/g, ' <- ')
    .replace(/\\implies/g, ' => ')
    .replace(/\\iff/g, ' <=> ')
    .replace(/\\subseteq/g, ' subset-of ')
    .replace(/\\subset/g, ' subset-of ')
    .replace(/\\in/g, ' in ')
    .replace(/\\notin/g, ' not-in ')
    .replace(/\\cap/g, ' INTERSECT ')
    .replace(/\\cup/g, ' UNION ')
    .replace(/\\times/g, ' x ')
    .replace(/\\pm/g, ' +/- ')
    .replace(/\\Theta/g, 'Theta')
    .replace(/\\Omega/g, 'Omega')
    .replace(/\\alpha/g, 'alpha')
    .replace(/\\beta/g, 'beta')
    .replace(/\\gamma/g, 'gamma')
    .replace(/\\delta/g, 'delta')
    .replace(/\\lambda/g, 'lambda')
    .replace(/\\sigma/g, 'sigma')
    .replace(/\\odot/g, ' [x] ')
    .replace(/\\mathcal\{L\}/g, 'Loss')
    .replace(/\\mathbb\{R\}/g, 'R')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\^{([^}]+)\}/g, '^$1')
    .replace(/\_{([^}]+)\}/g, '_$1')
    .replace(/\\cdot/g, ' * ')
    .replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, 'SUM($1..$2)')
    .replace(/\\sum/g, 'SUM')
    .replace(/\\log/g, 'log')
    .replace(/\\quad/g, ' ')
    .replace(/\\,/g, ' ')
    .replace(/\\([a-zA-Z]+)/g, '$1')
    // Pre-existing unicode mathematical operators mapped to clean ASCII
    .replace(/∩/g, ' INTERSECT ')
    .replace(/∪/g, ' UNION ')
    .replace(/⊆/g, ' subset-of ')
    .replace(/⊂/g, ' subset-of ')
    .replace(/∈/g, ' in ')
    .replace(/∉/g, ' not-in ')
    .replace(/→/g, ' -> ')
    .replace(/←/g, ' <- ')
    .replace(/⇒/g, ' => ')
    .replace(/·/g, ' * ')
    .replace(/•/g, '-')
    // Clean inline dollar signs used for math
    .replace(/\$([^\$]+)\$/g, '$1')
    .replace(/\$/g, '')
    // Strip bold and italic markdown tags (**text**, *text*, __text__)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Strip inline backticks (`code`)
    .replace(/`([^`]+)`/g, '$1')
    // Clean weird residual symbols
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Designer-Grade PDF Engine for Teacher Co-Pilot (AI Assistant for Teachers) Academic Lecture Notes
 * Formats notes with publication-level typography, cards, IDE-styled code blocks, and zero syntax artifacts.
 */
export function generateNotesPdf(note) {
  if (!note) return null;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Header Banner Drawer
  const drawHeaderBanner = (isFirstPage = true) => {
    if (isFirstPage) {
      // Primary top corporate banner
      doc.setFillColor(24, 28, 62); // #181C3E Deep Navy
      doc.rect(margin, cursorY, contentWidth, 22, 'F');

      // Accent gold/indigo hairline stripe
      doc.setFillColor(99, 102, 241); // #6366F1
      doc.rect(margin, cursorY + 21, contentWidth, 1.2, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('INDIRA UNIVERSITY, PUNE • Teacher Co-Pilot (AI Assistant for Teachers)', margin + contentWidth / 2, cursorY + 7, {
        align: 'center',
      });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225);
      doc.text(
        'DEPARTMENT OF ARTIFICIAL INTELLIGENCE & MACHINE LEARNING • AY 2026-2027',
        margin + contentWidth / 2,
        cursorY + 13,
        { align: 'center' }
      );

      doc.setFontSize(7.5);
      doc.setTextColor(224, 231, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(
        'OFFICIAL COURSEWORK STUDY NOTES & COMPREHENSIVE LECTURE HANDOUT',
        margin + contentWidth / 2,
        cursorY + 18,
        { align: 'center' }
      );

      cursorY += 27;
    } else {
      // Sleek running header for pages 2+
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, cursorY, contentWidth, 9, 'FD');

      // Accent left notch
      doc.setFillColor(99, 102, 241);
      doc.rect(margin, cursorY, 3, 9, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text(
        `${(note.title || 'Course Lecture Notes').slice(0, 55)} • ${note.subject || 'AIML'}`,
        margin + 6,
        cursorY + 5.5
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('Faculty: Prof. Sarita Byagar', margin + contentWidth - 4, cursorY + 5.5, { align: 'right' });

      cursorY += 13;
    }
  };

  const checkPageBreak = (neededHeight) => {
    if (cursorY + neededHeight > pageHeight - 16) {
      doc.addPage();
      cursorY = margin;
      drawHeaderBanner(false);
    }
  };

  // 1. Initial Page Header
  drawHeaderBanner(true);

  // 2. Note Title with Accent Bar
  const cleanTitle = cleanFormatting(note.title || 'Course Lecture Handout');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // #0F172A

  const titleLines = doc.splitTextToSize(cleanTitle, contentWidth - 6);
  doc.setFillColor(99, 102, 241);
  doc.rect(margin, cursorY + 1, 2.5, titleLines.length * 5.5 + 1, 'F');
  doc.text(titleLines, margin + 6, cursorY + 5);
  cursorY += titleLines.length * 5.5 + 4;

  // 3. Designer Metadata Grid Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, cursorY, contentWidth, 23, 2, 2, 'FD');

  const col1 = margin + 4;
  const col2 = margin + contentWidth / 2 + 4;
  const rowH = 5.2;

  doc.setFontSize(7.5);

  // Subject
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229); // Indigo
  doc.text('COURSE / SUBJECT:', col1, cursorY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(String(note.subject || 'Relational Database Management Systems'), col1 + 32, cursorY + 5);

  // Faculty
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('FACULTY GUIDE:', col2, cursorY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(String(note.author || note.uploadedBy || 'Prof. Sarita Byagar (HOD - AIML)'), col2 + 28, cursorY + 5);

  // Department
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('DEPARTMENT:', col1, cursorY + 5 + rowH);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(String(note.department || 'Information Technology (AIML)'), col1 + 32, cursorY + 5 + rowH);

  // Academic Date
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('ACADEMIC DATE:', col2, cursorY + 5 + rowH);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(String(note.date || new Date().toLocaleDateString('en-GB')), col2 + 28, cursorY + 5 + rowH);

  // Read Time
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('EST. READ TIME:', col1, cursorY + 5 + rowH * 2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(String(note.readTime || '12-15 min read'), col1 + 32, cursorY + 5 + rowH * 2);

  // Verification Status
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text('VERIFICATION:', col2, cursorY + 5 + rowH * 2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(5, 150, 105);
  doc.text('Official Verified Curriculum Handout', col2 + 28, cursorY + 5 + rowH * 2);

  cursorY += 28;

  // 4. Executive Summary Box with Left Accent Bar
  const rawSummary = note.summary || note.description;
  if (rawSummary) {
    const cleanSum = cleanFormatting(rawSummary);
    const sumLines = doc.splitTextToSize(cleanSum, contentWidth - 10);
    const boxHeight = Math.max(16, sumLines.length * 4.2 + 9);

    checkPageBreak(boxHeight + 4);

    doc.setFillColor(245, 247, 255); // Very soft indigo tint
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(margin, cursorY, contentWidth, boxHeight, 2, 2, 'FD');

    // Left accent pill bar
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(margin, cursorY, 3, boxHeight, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(49, 46, 129); // Dark Indigo
    doc.text('EXECUTIVE OVERVIEW & LEARNING OBJECTIVES:', margin + 6, cursorY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(51, 65, 85);
    doc.text(sumLines, margin + 6, cursorY + 9);

    cursorY += boxHeight + 5;
  }

  // 5. Parse and Render Main Content Body with High-Quality Formatting
  const rawContent = note.content || '';
  if (rawContent) {
    const lines = rawContent.split('\n');
    let inCodeBlock = false;
    let codeBuffer = [];
    let codeLang = 'code';

    // Helper to render stylish IDE terminal code box
    const flushCodeBox = () => {
      if (codeBuffer.length === 0) return;
      const codeText = codeBuffer.join('\n');
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.2);
      const splitCode = doc.splitTextToSize(codeText, contentWidth - 8);
      const boxH = splitCode.length * 3.6 + 9;

      // Ensure room for code block (at least header + 4 lines)
      checkPageBreak(Math.min(boxH, 45));

      // Dark IDE container
      doc.setFillColor(15, 23, 42); // #0F172A
      doc.setDrawColor(30, 41, 59);
      doc.roundedRect(margin, cursorY, contentWidth, boxH, 2, 2, 'FD');

      // Top title bar with 3 window buttons
      doc.setFillColor(30, 41, 59);
      doc.rect(margin, cursorY, contentWidth, 5.5, 'F');

      // Window dots
      doc.setFillColor(239, 68, 68); // Red
      doc.circle(margin + 4, cursorY + 2.8, 1, 'F');
      doc.setFillColor(245, 158, 11); // Yellow
      doc.circle(margin + 7.5, cursorY + 2.8, 1, 'F');
      doc.setFillColor(16, 185, 129); // Green
      doc.circle(margin + 11, cursorY + 2.8, 1, 'F');

      doc.setFont('courier', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`${codeLang.toUpperCase()} Reference Implementation`, margin + 16, cursorY + 3.8);

      // Code text in bright emerald / light cyan
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(167, 243, 208); // Light Emerald
      doc.text(splitCode, margin + 4, cursorY + 9.5);

      cursorY += boxH + 5;
      codeBuffer = [];
    };

    let skippedIntroCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      // Check code block fences
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBox();
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeLang = trimmed.slice(3).trim() || 'code';
          codeBuffer = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(rawLine);
        continue;
      }

      if (!trimmed) {
        cursorY += 1.5;
        continue;
      }

      // Filter out redundant top title repeats that duplicate the header banner
      if (
        skippedIntroCount < 5 &&
        (trimmed.startsWith('# ') ||
          trimmed.startsWith('## Subject') ||
          trimmed.startsWith('*Prepared by') ||
          trimmed === '---')
      ) {
        skippedIntroCount++;
        continue;
      }

      // Horizontal dividers
      if (trimmed === '---' || trimmed === '***') {
        checkPageBreak(6);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, cursorY + 2, margin + contentWidth, cursorY + 2);
        cursorY += 5;
        continue;
      }

      // Clean the line of raw markdown symbols and LaTeX
      const cleanLine = cleanFormatting(trimmed);

      // Markdown Table Detection & Structured Rendering
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines = [];
        let j = i;
        while (j < lines.length && lines[j].trim().startsWith('|') && lines[j].trim().endsWith('|')) {
          tableLines.push(lines[j].trim());
          j++;
        }
        i = j - 1; // Advance loop past table

        // Parse cells and filter out delimiter row (| :--- | :--- |)
        const parsedRows = tableLines
          .map((rowStr) =>
            rowStr
              .split('|')
              .slice(1, -1)
              .map((c) => cleanFormatting(c.trim()))
          )
          .filter((cells) => !cells.every((c) => /^[-:\s]+$/.test(c)));

        if (parsedRows.length > 0) {
          const numCols = Math.max(...parsedRows.map((r) => r.length));
          const colWidth = contentWidth / numCols;

          checkPageBreak(Math.min(parsedRows.length * 6 + 10, 35));

          // 1. Table Header (Row 0)
          const headers = parsedRows[0];
          doc.setFillColor(24, 28, 62); // #181C3E Deep Navy
          doc.rect(margin, cursorY, contentWidth, 6.5, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.2);
          doc.setTextColor(255, 255, 255);

          for (let c = 0; c < numCols; c++) {
            const cellText = headers[c] || '';
            const cellX = margin + c * colWidth + 2;
            doc.text(cellText, cellX, cursorY + 4.5);
          }
          cursorY += 6.5;

          // 2. Data Rows
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          for (let rIdx = 1; rIdx < parsedRows.length; rIdx++) {
            const rowData = parsedRows[rIdx];
            const maxLinesInRow = Math.max(
              1,
              ...rowData.map((cell) => doc.splitTextToSize(cell, colWidth - 4).length)
            );
            const rowH = Math.max(5.5, maxLinesInRow * 3.4 + 2);

            checkPageBreak(rowH + 2);

            // Alternating zebra striping
            const isEven = rIdx % 2 === 0;
            doc.setFillColor(isEven ? 248 : 255, isEven ? 250 : 255, isEven ? 252 : 255);
            doc.setDrawColor(226, 232, 240);
            doc.rect(margin, cursorY, contentWidth, rowH, 'FD');

            doc.setTextColor(51, 65, 85);
            for (let c = 0; c < numCols; c++) {
              const cellText = rowData[c] || '';
              const splitCell = doc.splitTextToSize(cellText, colWidth - 4);
              const cellX = margin + c * colWidth + 2;
              doc.text(splitCell, cellX, cursorY + 3.8);
            }
            cursorY += rowH;
          }
          cursorY += 4;
        }
        continue;
      }

      // Check for Markdown Headings (# , ## , ### , #### )
      const isMarkdownHeading = trimmed.startsWith('#');
      const isExplicitSectionNum = /^[1-6]\.\s+(Executive Summary|Introduction|Core|Architecture|Operations|Complexity|Analysis|Exam|High-Yield)/i.test(
        cleanLine
      );

      if ((isMarkdownHeading || isExplicitSectionNum) && !cleanLine.toLowerCase().includes('q:')) {
        // Strip any leading # characters so raw "### " NEVER prints inside the box!
        const headerTitle = cleanLine.replace(/^#+\s*/, '').trim();

        // Level 1 / Major Section Header (Major modules get the highlighted section bar)
        const isMajorSection =
          trimmed.startsWith('# ') ||
          trimmed.startsWith('## ') ||
          trimmed.startsWith('### 1') ||
          trimmed.startsWith('### 2') ||
          trimmed.startsWith('### 3') ||
          trimmed.startsWith('### 4') ||
          trimmed.startsWith('### 5') ||
          trimmed.startsWith('### 6') ||
          isExplicitSectionNum;

        if (isMajorSection) {
          // High orphan protection: require at least 30mm left on the page
          checkPageBreak(30);

          doc.setFillColor(241, 245, 249);
          doc.setDrawColor(203, 213, 225);
          doc.roundedRect(margin, cursorY, contentWidth, 7.5, 1.5, 1.5, 'FD');

          // Left colored pill
          doc.setFillColor(79, 70, 229);
          doc.roundedRect(margin, cursorY, 2.5, 7.5, 1, 1, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(30, 27, 75); // Deep Indigo
          doc.text(headerTitle, margin + 5, cursorY + 5.2);

          cursorY += 11;
          continue;
        } else {
          // Sub-heading (e.g. "A. First Normal Form", "B. Second Normal Form")
          checkPageBreak(20);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.8);
          doc.setTextColor(67, 56, 202); // Rich Indigo
          const splitSub = doc.splitTextToSize(headerTitle, contentWidth - 4);
          doc.text(splitSub, margin + 2, cursorY + 3.5);
          cursorY += splitSub.length * 4.2 + 2;
          continue;
        }
      }

      // Exam Question Item (e.g. "1. Q: Why does 3NF allow...", "Q: ...")
      if (/^(\d+\.\s+)?Q:/.test(cleanLine)) {
        checkPageBreak(18);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.2);
        doc.setTextColor(15, 23, 42); // Dark slate

        // Small indicator circle
        doc.setFillColor(79, 70, 229);
        doc.circle(margin + 3.5, cursorY + 2.8, 1.1, 'F');

        const qSplit = doc.splitTextToSize(cleanLine, contentWidth - 8);
        doc.text(qSplit, margin + 7, cursorY + 3.5);
        cursorY += qSplit.length * 4.2 + 2;
        continue;
      }

      // Model Answer Item (e.g. "Model Answer: ...", "- Model Answer: ...")
      if (cleanLine.toLowerCase().includes('model answer:')) {
        const cleanAns = cleanLine.replace(/^[-*]\s*/, '');
        const ansSplit = doc.splitTextToSize(cleanAns, contentWidth - 10);
        const ansHeight = ansSplit.length * 4 + 4;

        checkPageBreak(ansHeight + 3);

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin + 3, cursorY, contentWidth - 6, ansHeight, 1.5, 1.5, 'FD');

        // Light amber indicator bar
        doc.setFillColor(245, 158, 11);
        doc.rect(margin + 3, cursorY, 1.5, ansHeight, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.8);
        doc.setTextColor(51, 65, 85);
        doc.text(ansSplit, margin + 7, cursorY + 4);

        cursorY += ansHeight + 3.5;
        continue;
      }

      // Bullet points (- or * or numbered 1. )
      const bulletMatch = trimmed.match(/^([-*•]|\d+\.)\s+(.+)$/);
      if (bulletMatch) {
        const isNumbered = bulletMatch[1].endsWith('.');
        const rawBody = bulletMatch[2];
        const cleanBody = cleanFormatting(rawBody);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);

        const splitBody = doc.splitTextToSize(cleanBody, contentWidth - 8);
        checkPageBreak(splitBody.length * 3.8 + 2.5);

        if (isNumbered) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(79, 70, 229);
          doc.text(bulletMatch[1], margin + 2, cursorY + 3);
        } else {
          // Sharp vector bullet
          doc.setFillColor(99, 102, 241);
          doc.circle(margin + 3.5, cursorY + 2.4, 0.75, 'F');
        }

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(splitBody, margin + 7, cursorY + 3);

        cursorY += splitBody.length * 3.8 + 1.8;
        continue;
      }

      // Standard body paragraph
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);

      const splitPara = doc.splitTextToSize(cleanLine, contentWidth);
      checkPageBreak(splitPara.length * 3.8 + 2);
      doc.text(splitPara, margin, cursorY + 3);
      cursorY += splitPara.length * 3.8 + 2.2;
    }

    if (inCodeBlock) {
      flushCodeBox();
    }
  }

  // 6. High-Yield Exam Review & Viva-Voce Checklist (Styled Card)
  const takeaways = note.keyTakeaways || [
    '1NF eliminates repeating groups and composite attributes through atomic column domains.',
    '2NF eliminates partial functional dependencies on candidate keys for tables in 1NF.',
    '3NF eliminates transitive dependencies (every non-prime attribute is non-transitively dependent on candidate keys).',
    'BCNF strictly mandates that for every non-trivial FD X -> Y, X must be a superkey.',
    'Lossless-join decomposition is guaranteed if and only if (R1 ∩ R2 -> R1) or (R1 ∩ R2 -> R2).',
  ];

  if (takeaways.length > 0) {
    const cleanedTakeaways = takeaways.map((t, idx) => `${idx + 1}. ${cleanFormatting(t)}`);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    const splitChecklist = doc.splitTextToSize(cleanedTakeaways.join('\n\n'), contentWidth - 10);
    const checkHeight = Math.max(22, splitChecklist.length * 3.8 + 11);

    // Keep checklist together cleanly
    checkPageBreak(Math.min(checkHeight, 60));

    cursorY += 2;
    doc.setFillColor(254, 252, 232); // Light Warm Amber (#FEFCE8)
    doc.setDrawColor(251, 191, 36); // #FBBF24
    doc.roundedRect(margin, cursorY, contentWidth, checkHeight, 2, 2, 'FD');

    // Left gold bar
    doc.setFillColor(217, 119, 6);
    doc.roundedRect(margin, cursorY, 2.5, checkHeight, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(146, 64, 14); // Amber 800
    doc.text('HIGH-YIELD EXAM REVIEW & VIVA-VOCE CHECKLIST:', margin + 6, cursorY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(120, 53, 15);
    doc.text(splitChecklist, margin + 6, cursorY + 9.5);

    cursorY += checkHeight + 6;
  }

  // 7. Stamp Running Footer & Page Numbers on ALL Pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 9, margin + contentWidth, pageHeight - 9);

    doc.text(
      'Teacher Co-Pilot (AI Assistant for Teachers) • Faculty Guide: Prof. Sarita Byagar (HOD - AIML)',
      margin,
      pageHeight - 5
    );
    doc.text(`Page ${p} of ${totalPages}`, margin + contentWidth, pageHeight - 5, { align: 'right' });
  }

  const cleanFilename = `${(note.title || 'Study_Notes')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40)}_Lecture_Notes.pdf`;

  const dataUrl = doc.output('datauristring');
  const rawArray = doc.output('arraybuffer');
  const sizeStr = formatFileSize(rawArray.byteLength);

  return {
    id: `pdf-note-${Date.now()}`,
    name: cleanFilename,
    size: sizeStr,
    rawSize: rawArray.byteLength,
    type: 'application/pdf',
    dataUrl: dataUrl,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Triggers browser download for generated study notes PDF
 */
export function downloadNotesPdf(note) {
  const att = generateNotesPdf(note);
  if (!att || !att.dataUrl) return;

  const link = document.createElement('a');
  link.href = att.dataUrl;
  link.download = att.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
