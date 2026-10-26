import { jsPDF } from 'jspdf';
import { formatFileSize } from './fileAttachmentUtils';

/**
 * Generates an official Indira University academic assignment PDF
 * @param {Object} assignment
 * @returns {Object} attachment object with name, size, type, dataUrl
 */
export function generateAssignmentPdf(assignment) {
  if (!assignment) return null;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const checkPageBreak = (neededHeight) => {
    if (cursorY + neededHeight > pageHeight - 15) {
      doc.addPage();
      cursorY = margin;
      drawHeaderBanner(false);
    }
  };

  const drawHeaderBanner = (isFirstPage = true) => {
    // Header background banner
    doc.setFillColor(30, 27, 75); // Deep Indigo
    doc.rect(margin, cursorY, contentWidth, isFirstPage ? 24 : 12, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isFirstPage ? 12 : 9);
    doc.text('INDIRA UNIVERSITY, PUNE', margin + contentWidth / 2, cursorY + (isFirstPage ? 7 : 5), { align: 'center' });

    doc.setFontSize(isFirstPage ? 9 : 7);
    doc.setFont('helvetica', 'normal');
    doc.text('SCHOOL OF INFORMATION TECHNOLOGY (SOIT) • ACADEMIC YEAR 2026-2027', margin + contentWidth / 2, cursorY + (isFirstPage ? 13 : 9), { align: 'center' });

    if (isFirstPage) {
      doc.setFontSize(8);
      doc.setTextColor(216, 180, 254);
      doc.text('OFFICIAL COURSEWORK ASSIGNMENT BRIEF & EVALUATION SPECIFICATION', margin + contentWidth / 2, cursorY + 19, { align: 'center' });
    }

    cursorY += isFirstPage ? 28 : 16;
  };

  // 1. Initial Page Header
  drawHeaderBanner(true);

  // 2. Assignment Title & Metadata
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const titleLines = doc.splitTextToSize(assignment.title || 'Coursework Assignment', contentWidth);
  doc.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 6 + 2;

  // Metadata Table Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, cursorY, contentWidth, 24, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  const col1 = margin + 4;
  const col2 = margin + contentWidth / 2 + 4;
  const rowH = 5.5;

  doc.setFont('helvetica', 'bold');
  doc.text('Department:', col1, cursorY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(String(assignment.department || 'Information Technology (AIML)'), col1 + 22, cursorY + 5);

  doc.setFont('helvetica', 'bold');
  doc.text('Subject:', col2, cursorY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(String(assignment.subject || 'Computer Science & Engineering'), col2 + 15, cursorY + 5);

  doc.setFont('helvetica', 'bold');
  doc.text('Total Marks:', col1, cursorY + 5 + rowH);
  doc.setFont('helvetica', 'normal');
  doc.text(`${assignment.totalMarks || assignment.maxMarks || 45} Marks`, col1 + 22, cursorY + 5 + rowH);

  doc.setFont('helvetica', 'bold');
  doc.text('Deadline:', col2, cursorY + 5 + rowH);
  doc.setFont('helvetica', 'normal');
  const deadlineStr = assignment.deadline ? new Date(assignment.deadline).toLocaleString() : 'As per semester schedule';
  doc.text(deadlineStr, col2 + 16, cursorY + 5 + rowH);

  doc.setFont('helvetica', 'bold');
  doc.text('Difficulty:', col1, cursorY + 5 + rowH * 2);
  doc.setFont('helvetica', 'normal');
  doc.text(String(assignment.difficulty || 'Intermediate / Academic Standard'), col1 + 22, cursorY + 5 + rowH * 2);

  doc.setFont('helvetica', 'bold');
  doc.text('Faculty Guide:', col2, cursorY + 5 + rowH * 2);
  doc.setFont('helvetica', 'normal');
  doc.text('Prof. Sarita Byagar (HOD - AIML)', col2 + 22, cursorY + 5 + rowH * 2);

  cursorY += 28;

  // 3. Instructions & Problem Overview
  if (assignment.description || assignment.instructions) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 27, 75);
    doc.text('General Instructions & Problem Context:', margin, cursorY);
    cursorY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const instrText = assignment.description || assignment.instructions;
    const splitInstr = doc.splitTextToSize(instrText, contentWidth);
    doc.text(splitInstr, margin, cursorY);
    cursorY += splitInstr.length * 4.2 + 5;
  }

  // 4. Problem Statements
  const problems = assignment.questions || assignment.problems || [];
  if (problems.length > 0) {
    checkPageBreak(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 27, 75);
    doc.text(`Assignment Problems & Problem Sets (${problems.length} Problems):`, margin, cursorY);
    cursorY += 6;

    problems.forEach((prob, idx) => {
      const pTitle = prob.title || `Problem #${idx + 1}`;
      const pDesc = prob.problem || prob.description || (typeof prob === 'string' ? prob : '');
      const pDeliverable = prob.deliverables || 'Documented source code, step-by-step calculations, and runtime proof.';
      const pMarks = prob.marks ? `[${prob.marks} Marks]` : `[${Math.round((assignment.totalMarks || 45) / problems.length)} Marks]`;

      const titleLines = doc.splitTextToSize(`Problem ${idx + 1}: ${pTitle} ${pMarks}`, contentWidth - 4);
      const descLines = doc.splitTextToSize(pDesc, contentWidth - 4);
      const delivLines = doc.splitTextToSize(`Deliverable: ${pDeliverable}`, contentWidth - 4);

      const boxHeight = titleLines.length * 5 + descLines.length * 4.2 + delivLines.length * 4.2 + 8;
      checkPageBreak(boxHeight + 5);

      // Problem card box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, cursorY, contentWidth, boxHeight, 1.5, 1.5, 'FD');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(67, 56, 202); // Indigo-700
      doc.text(titleLines, margin + 2, cursorY + 5);
      let innerY = cursorY + 5 + titleLines.length * 4.5;

      // Description
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(descLines, margin + 2, innerY);
      innerY += descLines.length * 4.2 + 2;

      // Deliverable
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(109, 40, 217); // Purple
      doc.text(delivLines, margin + 2, innerY);

      cursorY += boxHeight + 4;
    });
  }

  // 5. Evaluation Rubric Box
  if (assignment.rubric) {
    checkPageBreak(25);
    doc.setFillColor(243, 244, 246);
    doc.setDrawColor(209, 213, 219);
    const rubricLines = doc.splitTextToSize(assignment.rubric, contentWidth - 6);
    const rBoxHeight = rubricLines.length * 4.2 + 10;

    doc.roundedRect(margin, cursorY, contentWidth, rBoxHeight, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    doc.text('Official Evaluation Rubric & Marking Scheme:', margin + 3, cursorY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(75, 85, 99);
    doc.text(rubricLines, margin + 3, cursorY + 10);
    cursorY += rBoxHeight + 6;
  }

  // 6. Page Footers (Page X of Y)
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Teacher Co-Pilot (AI Assistant for Teachers) • AI Assessment Hub', margin, pageHeight - 6);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  const cleanFilename = `${(assignment.title || 'Assignment').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)}_Question_Brief.pdf`;
  const dataUrl = doc.output('datauristring');
  const rawArray = doc.output('arraybuffer');
  const sizeStr = formatFileSize(rawArray.byteLength);

  return {
    id: `pdf-${Date.now()}`,
    name: cleanFilename,
    size: sizeStr,
    rawSize: rawArray.byteLength,
    type: 'application/pdf',
    dataUrl: dataUrl,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Triggers browser download for generated assignment PDF
 */
export function downloadAssignmentPdf(assignment) {
  const att = generateAssignmentPdf(assignment);
  if (!att || !att.dataUrl) return;

  const link = document.createElement('a');
  link.href = att.dataUrl;
  link.download = att.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
