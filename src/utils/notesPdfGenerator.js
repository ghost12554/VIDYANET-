import { jsPDF } from 'jspdf';
import { formatFileSize } from './fileAttachmentUtils';

/**
 * Generates an official, publication-grade academic lecture notes PDF
 * @param {Object} note
 * @returns {Object} attachment object with name, size, type, dataUrl
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

  const checkPageBreak = (neededHeight) => {
    if (cursorY + neededHeight > pageHeight - 16) {
      doc.addPage();
      cursorY = margin;
      drawHeaderBanner(false);
    }
  };

  const drawHeaderBanner = (isFirstPage = true) => {
    // Top banner
    doc.setFillColor(30, 27, 75); // Deep Indigo (#1E1B4B)
    doc.rect(margin, cursorY, contentWidth, isFirstPage ? 24 : 11, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isFirstPage ? 11 : 8.5);
    doc.text('INDIRA UNIVERSITY, PUNE • VIDYANET CAMPUS ERP', margin + contentWidth / 2, cursorY + (isFirstPage ? 7 : 5), {
      align: 'center',
    });

    doc.setFontSize(isFirstPage ? 8.5 : 7);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'DEPARTMENT OF ARTIFICIAL INTELLIGENCE & MACHINE LEARNING • AY 2026-2027',
      margin + contentWidth / 2,
      cursorY + (isFirstPage ? 13 : 8.5),
      { align: 'center' }
    );

    if (isFirstPage) {
      doc.setFontSize(8);
      doc.setTextColor(216, 180, 254);
      doc.text(
        'OFFICIAL COURSEWORK STUDY NOTES & COMPREHENSIVE LECTURE HANDOUT',
        margin + contentWidth / 2,
        cursorY + 19,
        { align: 'center' }
      );
    }

    cursorY += isFirstPage ? 28 : 15;
  };

  // 1. Initial Banner
  drawHeaderBanner(true);

  // 2. Note Title
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const titleLines = doc.splitTextToSize(note.title || 'Course Lecture Notes', contentWidth);
  doc.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 5.5 + 2;

  // 3. Metadata Table
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, cursorY, contentWidth, 23, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const col1 = margin + 4;
  const col2 = margin + contentWidth / 2 + 4;
  const rowH = 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Subject:', col1, cursorY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(String(note.subject || 'Artificial Intelligence & Machine Learning'), col1 + 16, cursorY + 5);

  doc.setFont('helvetica', 'bold');
  doc.text('Faculty:', col2, cursorY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(String(note.author || note.uploadedBy || 'Prof. Sarita Byagar (HOD - AIML)'), col2 + 15, cursorY + 5);

  doc.setFont('helvetica', 'bold');
  doc.text('Department:', col1, cursorY + 5 + rowH);
  doc.setFont('helvetica', 'normal');
  doc.text(String(note.department || 'AIML (Division A)'), col1 + 20, cursorY + 5 + rowH);

  doc.setFont('helvetica', 'bold');
  doc.text('Academic Date:', col2, cursorY + 5 + rowH);
  doc.setFont('helvetica', 'normal');
  doc.text(String(note.date || new Date().toISOString().split('T')[0]), col2 + 25, cursorY + 5 + rowH);

  doc.setFont('helvetica', 'bold');
  doc.text('Read Time:', col1, cursorY + 5 + rowH * 2);
  doc.setFont('helvetica', 'normal');
  doc.text(String(note.readTime || '12-15 mins'), col1 + 18, cursorY + 5 + rowH * 2);

  doc.setFont('helvetica', 'bold');
  doc.text('Handout Format:', col2, cursorY + 5 + rowH * 2);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Verified Study Material', col2 + 26, cursorY + 5 + rowH * 2);

  cursorY += 28;

  // 4. Executive Summary Box
  const summaryText = note.summary || note.description;
  if (summaryText) {
    checkPageBreak(25);
    doc.setFillColor(243, 244, 246);
    doc.setDrawColor(209, 213, 219);

    const sumLines = doc.splitTextToSize(summaryText, contentWidth - 8);
    const boxHeight = Math.max(16, sumLines.length * 4.5 + 10);

    doc.roundedRect(margin, cursorY, contentWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 27, 75);
    doc.text('EXECUTIVE OVERVIEW & LEARNING OBJECTIVES:', margin + 4, cursorY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);
    doc.text(sumLines, margin + 4, cursorY + 10);

    cursorY += boxHeight + 5;
  }

  // 5. Render Structured Content or Markdown Lines
  const content = note.content || '';
  if (content) {
    const rawLines = content.split('\n');
    let inCodeBlock = false;
    let codeBuffer = [];

    const flushCodeBuffer = () => {
      if (codeBuffer.length === 0) return;
      const codeStr = codeBuffer.join('\n');
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      const splitCode = doc.splitTextToSize(codeStr, contentWidth - 8);
      const codeHeight = splitCode.length * 3.8 + 6;

      checkPageBreak(codeHeight + 4);

      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, cursorY, contentWidth, codeHeight, 2, 2, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.text(splitCode, margin + 4, cursorY + 4.5);

      cursorY += codeHeight + 4;
      codeBuffer = [];
    };

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      const trimmed = line.trim();

      // Code block toggles
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBuffer();
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBuffer = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      if (!trimmed) {
        cursorY += 2;
        continue;
      }

      // Horizontal line
      if (trimmed === '---' || trimmed === '***') {
        checkPageBreak(6);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, cursorY + 2, margin + contentWidth, cursorY + 2);
        cursorY += 6;
        continue;
      }

      // H1 (# )
      if (trimmed.startsWith('# ')) {
        const text = trimmed.slice(2);
        checkPageBreak(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 27, 75);
        const split = doc.splitTextToSize(text, contentWidth);
        doc.text(split, margin, cursorY + 4);
        cursorY += split.length * 5 + 3;
        continue;
      }

      // H2 (## )
      if (trimmed.startsWith('## ')) {
        const text = trimmed.slice(3);
        checkPageBreak(10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(67, 56, 202); // Indigo
        const split = doc.splitTextToSize(text, contentWidth);
        doc.text(split, margin, cursorY + 3.5);
        cursorY += split.length * 4.5 + 2.5;
        continue;
      }

      // H3 (### )
      if (trimmed.startsWith('### ')) {
        const text = trimmed.slice(4);
        checkPageBreak(8);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(17, 24, 39);
        const split = doc.splitTextToSize(text, contentWidth);
        doc.text(split, margin, cursorY + 3);
        cursorY += split.length * 4 + 2;
        continue;
      }

      // Bullet points (- or * or numbered 1. )
      const bulletMatch = trimmed.match(/^([-*]|\d+\.)\s+(.+)$/);
      if (bulletMatch) {
        const bulletSymbol = bulletMatch[1].endsWith('.') ? bulletMatch[1] : '•';
        const bodyText = bulletMatch[2];
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        const split = doc.splitTextToSize(bodyText, contentWidth - 8);
        checkPageBreak(split.length * 4 + 2);

        doc.setFont('helvetica', 'bold');
        doc.text(bulletSymbol, margin + 2, cursorY + 3);
        doc.setFont('helvetica', 'normal');
        doc.text(split, margin + 7, cursorY + 3);
        cursorY += split.length * 4 + 1.5;
        continue;
      }

      // Standard paragraph text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const split = doc.splitTextToSize(trimmed, contentWidth);
      checkPageBreak(split.length * 4 + 2);
      doc.text(split, margin, cursorY + 3);
      cursorY += split.length * 4 + 2;
    }

    if (inCodeBlock) {
      flushCodeBuffer();
    }
  }

  // 6. High Yield Exam & Viva-Voce Review Points (if provided)
  const takeaways = note.keyTakeaways || [
    'Understand theoretical invariants and worst-case complexity bounds before practical implementation.',
    'Always verify boundary constraints, null/empty edge cases, and memory leak vulnerabilities.',
    'Be prepared to justify architectural trade-offs during faculty oral examinations.',
  ];

  checkPageBreak(30);
  cursorY += 4;
  doc.setFillColor(254, 243, 199); // Warm amber
  doc.setDrawColor(251, 191, 36);

  const takeawayLines = takeaways.map((t, idx) => `${idx + 1}. ${t}`);
  const combinedTakeaway = doc.splitTextToSize(takeawayLines.join('\n'), contentWidth - 8);
  const takeBoxHeight = Math.max(18, combinedTakeaway.length * 4 + 10);

  doc.roundedRect(margin, cursorY, contentWidth, takeBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14); // Amber 800
  doc.text('HIGH-YIELD EXAM REVIEW & VIVA-VOCE CHECKLIST:', margin + 4, cursorY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 53, 15);
  doc.text(combinedTakeaway, margin + 4, cursorY + 10);

  cursorY += takeBoxHeight + 6;

  // Add Page Numbers and Footer to every page
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);

    doc.line(margin, pageHeight - 11, margin + contentWidth, pageHeight - 11);
    doc.text(
      'Vidyanet Campus Academic Portal • Guide: Prof. Sarita Byagar (HOD - AIML)',
      margin,
      pageHeight - 6.5
    );
    doc.text(`Page ${p} of ${totalPages}`, margin + contentWidth, pageHeight - 6.5, { align: 'right' });
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
