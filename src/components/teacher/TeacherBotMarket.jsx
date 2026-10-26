import React, { useState, useMemo } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { useGoogleDialog } from '../common/GoogleDialog';
import {
  generateAIQuiz,
  generateAIAssignment,
  generateAICodingTest,
  generateAINotes,
  generateAIPpt,
  evaluateSubmissionWithAI,
} from '../../services/aiGeneratorService';
import { readFileAsAttachment, downloadAttachment, formatFileSize } from '../../utils/fileAttachmentUtils';
import { generateAssignmentPdf, downloadAssignmentPdf } from '../../utils/assignmentPdfGenerator';
import { generateNotesPdf, downloadNotesPdf } from '../../utils/notesPdfGenerator';
import {
  PPT_THEMES,
  generatePresentationPdf,
  downloadPresentationPdf,
  exportPresentationHtml,
} from '../../utils/pptSlideGenerator';
import {
  Bot,
  Sparkles,
  HelpCircle,
  FileText,
  Code,
  Presentation,
  CheckCircle,
  Trash2,
  Calendar,
  Check,
  X,
  Clock,
  Upload,
  Send,
  Layers,
  Search,
  Filter,
  CheckSquare,
  Square,
  AlertCircle,
  Eye,
  RefreshCw,
  Award,
  ChevronRight,
  ChevronDown,
  Download,
  Terminal,
  UserCheck,
  UserX,
  Paperclip,
  CheckCheck,
  Edit3,
  BookOpen,
  Maximize2,
  Minimize2,
  Play,
  Palette,
  Monitor,
} from 'lucide-react';

export default function TeacherBotMarket() {
  const {
    currentUser,
    students,
    attendance,
    recordAttendance,
    deleteAttendanceRecord,
    deleteSelectedAttendanceRecords,
    clearAllAttendanceHistory,
    updateAttendanceRecord,
    createTest,
    createAssignment,
    addNote,
    botHistory,
    saveBotHistoryItem,
    deleteBotHistoryItem,
    clearBotHistory,
    assignments,
    gradeAssignment,
  } = useCollege();
  const { showConfirm, showAlert } = useGoogleDialog();

  // Active sub-panel in BotMarket
  const [activeSubPanel, setActiveSubPanel] = useState('quizGen');

  // 1. QUIZ GENERATOR STATE
  const [quizForm, setQuizForm] = useState({
    topic: '',
    numQuestions: 5,
    numOptions: 4,
    marksPerQuestion: 5,
    timeLimit: 15,
    referenceDoc: null,
  });
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // 2. ASSIGNMENT GENERATOR STATE
  const [assignGenForm, setAssignGenForm] = useState({
    topic: '',
    numQuestions: 3,
    deadline: '2026-10-30T23:59',
    maxMarks: 45,
    referenceDoc: null,
  });
  const [generatedAssignment, setGeneratedAssignment] = useState(null);
  const [isGeneratingAssign, setIsGeneratingAssign] = useState(false);

  // 3. CODE / TYPING TEST GENERATOR STATE
  const [codeTestForm, setCodeTestForm] = useState({
    topic: '',
    numQuestions: 2,
    timeLimit: 30,
    totalMarks: 30,
    testType: 'coding', // 'coding' | 'typing'
    referenceDoc: null,
  });
  const [generatedCodeTest, setGeneratedCodeTest] = useState(null);
  const [isGeneratingCodeTest, setIsGeneratingCodeTest] = useState(false);
  const [selectedCodingSubmission, setSelectedCodingSubmission] = useState(null);

  // 4. NOTES GENERATOR STATE
  const [notesGenForm, setNotesGenForm] = useState({
    topic: '',
    subject: 'Relational Database Management Systems',
    focusArea: 'Comprehensive academic lecture notes: Explain update/delete anomalies, Armstrong axioms for functional dependencies, step-by-step normal form reduction from 1NF to BCNF with concrete violations and schema decompositions, SQL DDL schema, and high-yield viva-voce questions.',
    referenceDoc: null,
  });
  const [generatedNotes, setGeneratedNotes] = useState(null);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editableNotesTitle, setEditableNotesTitle] = useState('');
  const [editableNotesSubject, setEditableNotesSubject] = useState('');
  const [editableNotesSummary, setEditableNotesSummary] = useState('');
  const [editableNotesContent, setEditableNotesContent] = useState('');

  // 5. PPT SLIDE GENERATOR STATE
  const [pptForm, setPptForm] = useState({
    topic: '',
    numSlides: 5,
    theme: 'midnight',
    audience: 'SY.B.Sc AIML Undergraduates',
    rules: 'Include architectural layer diagrams description, stride/padding formulas, mathematical intuition, and practical PyTorch code hints.',
    referenceDoc: null,
  });
  const [generatedPpt, setGeneratedPpt] = useState(null);
  const [isGeneratingPpt, setIsGeneratingPpt] = useState(false);
  const [pptThinkingStage, setPptThinkingStage] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreenPpt, setIsFullscreenPpt] = useState(false);
  const [activePptTheme, setActivePptTheme] = useState('midnight');

  // 6. AI SUBMISSIONS ANALYZER STATE
  const [analyzerTargetAssign, setAnalyzerTargetAssign] = useState(assignments[0]?.id || '');
  const [analyzerPrompt, setAnalyzerPrompt] = useState(
    'Check strictly for algorithm correctness, boundary conditions (empty inputs, duplicates), and time complexity. Award numerical marks out of maximum marks.'
  );
  const [analyzedResults, setAnalyzedResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 7. ATTENDANCE TAKING & HISTORY STATE
  const [attendanceDept, setAttendanceDept] = useState('Information Technology (AIML)');
  const [attendanceSubject, setAttendanceSubject] = useState('DS');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceDay, setAttendanceDay] = useState('Monday');
  const [attendanceChecks, setAttendanceChecks] = useState({});
  const [attendanceSubTab, setAttendanceSubTab] = useState('take'); // 'take' | 'history'

  // History filtering & Selection
  const [historyDeptFilter, setHistoryDeptFilter] = useState('all');
  const [historySubjectFilter, setHistorySubjectFilter] = useState('all');
  const [historyDateFilter, setHistoryDateFilter] = useState('');
  const [selectedHistoryIds, setSelectedHistoryIds] = useState([]);
  const [expandedRecordId, setExpandedRecordId] = useState(null);

  // 8. BOT HISTORY STATE
  const [historyFilter, setHistoryFilter] = useState('all');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [expandedBotHistId, setExpandedBotHistId] = useState(null);

  // Available departments extracted dynamically from student database
  const availableDepartments = useMemo(() => {
    return Array.from(
      new Set([
        'Information Technology (AIML)',
        'Computer Science & Engineering',
        'Data Science & Analytics',
        'Software Engineering',
        ...students.map((s) => s.department).filter(Boolean),
      ])
    );
  }, [students]);

  // Active department students (only approved students) sorted dynamically in ASCENDING numerical order by Roll Number
  // Dynamic Auto-Append: When any student registers, they immediately appear in this list sorted by roll no!
  const approvedDeptStudents = useMemo(() => {
    return students
      .filter((s) => {
        if (s.status !== 'APPROVED') return false;
        if (!attendanceDept || attendanceDept === 'ALL') return true;
        return (
          s.department?.toLowerCase() === attendanceDept.toLowerCase() ||
          s.department?.toLowerCase().includes(attendanceDept.toLowerCase()) ||
          attendanceDept.toLowerCase().includes(s.department?.toLowerCase())
        );
      })
      .sort((a, b) => (parseInt(a.rollNo, 10) || 0) - (parseInt(b.rollNo, 10) || 0));
  }, [students, attendanceDept]);

  // Ensure default present for students in active list if not set
  useMemo(() => {
    setAttendanceChecks((prev) => {
      const next = { ...prev };
      approvedDeptStudents.forEach((s) => {
        if (next[s.rollNo] === undefined) {
          next[s.rollNo] = true; // default present
        }
      });
      return next;
    });
  }, [approvedDeptStudents]);

  // File Upload Handlers
  const handleFileUpload = async (e, formSetter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const att = await readFileAsAttachment(file);
      formSetter((prev) => ({ ...prev, referenceDoc: att }));
    } catch (err) {
      alert(`Upload error: ${err.message}`);
    }
  };

  // --- 1. AI QUIZ GENERATION HANDLER ---
  const handleLoadQuizSample = () => {
    setQuizForm({
      topic: 'Binary Search Trees & AVL Tree Rotations: High conceptual university rigor. Focus on balance factors (-1, 0, 1), LL/RR/LR/RL rotation algorithms, boundary edge cases, and worst-case log(N) runtime proof.',
      numQuestions: 5,
      numOptions: 4,
      marksPerQuestion: 5,
      timeLimit: 15,
      referenceDoc: {
        id: 'sample-doc-1',
        name: 'Unit2_AVL_Trees_Specification.pdf',
        size: '1.4 MB',
      },
    });
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!quizForm.topic.trim()) {
      alert('Quiz Topic & Prompt is mandatory.');
      return;
    }
    setIsGeneratingQuiz(true);
    try {
      const quizResult = await generateAIQuiz({
        topic: quizForm.topic.trim(),
        numQuestions: quizForm.numQuestions,
        rules: quizForm.topic.trim(),
        numOptions: quizForm.numOptions,
        timeLimit: quizForm.timeLimit,
        marksPerQuestion: quizForm.marksPerQuestion,
        department: attendanceDept,
        referenceText: quizForm.referenceDoc?.name || '',
      });

      setGeneratedQuiz({ ...quizResult, _generatedAt: Date.now() });

      saveBotHistoryItem({
        panel: 'Quiz Generator',
        title: quizResult.title,
        details: `${quizResult.questions.length} MCQs generated on "${quizForm.topic.slice(0, 50)}..." (${quizResult.marksPerQuestion} marks/q, total ${quizResult.totalMarks})`,
        data: quizResult,
      });
    } catch (err) {
      console.error('Quiz Generation Error:', err);
      alert('Error generating quiz. Please try again.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const publishQuizToTests = () => {
    if (!generatedQuiz) return;
    createTest(generatedQuiz);
    alert(`Successfully published "${generatedQuiz.title}" to the Student Portal Test Center! Students can now take this assessment.`);
  };

  // --- 2. AI ASSIGNMENT GENERATION HANDLER ---
  const handleLoadAssignSample = () => {
    setAssignGenForm({
      topic: 'Graph Theory: Dijkstra & Bellman-Ford Shortest Paths. Include 1 mathematical proof problem, 1 step-by-step trace problem with adjacency matrix, and 1 algorithm efficiency implementation problem with negative edge analysis.',
      numQuestions: 3,
      deadline: '2026-10-30T23:59',
      maxMarks: 45,
      referenceDoc: {
        id: 'sample-assign-doc',
        name: 'Graph_Algorithms_Handout_Unit3.pdf',
        size: '2.1 MB',
      },
    });
  };

  const handleGenerateAssignment = async (e) => {
    e.preventDefault();
    if (!assignGenForm.topic.trim()) {
      alert('Assignment Topic & Instructions Prompt is mandatory.');
      return;
    }
    setIsGeneratingAssign(true);
    try {
      const assignResult = await generateAIAssignment({
        topic: assignGenForm.topic.trim(),
        numQuestions: assignGenForm.numQuestions,
        rules: assignGenForm.topic.trim(),
        deadline: assignGenForm.deadline,
        maxMarks: assignGenForm.maxMarks,
        department: attendanceDept,
        referenceText: assignGenForm.referenceDoc?.name || '',
      });

      // Automatically synthesize official Indira University Assignment PDF
      let pdfAtt = null;
      try {
        pdfAtt = generateAssignmentPdf(assignResult);
      } catch (pdfErr) {
        console.warn('PDF auto-generation warning:', pdfErr);
      }

      const fullAssignment = {
        ...assignResult,
        attachment: pdfAtt || assignResult.attachment || null,
        _generatedAt: Date.now(),
      };

      setGeneratedAssignment(fullAssignment);

      saveBotHistoryItem({
        panel: 'Assignment Generator',
        title: assignResult.title,
        details: `${assignGenForm.numQuestions} problems • Due: ${assignGenForm.deadline} • Max Marks: ${assignResult.maxMarks} (Official PDF Generated)`,
        data: fullAssignment,
      });
    } catch (err) {
      console.error('Assignment Generation Error:', err);
      alert('Error generating assignment. Please try again.');
    } finally {
      setIsGeneratingAssign(false);
    }
  };

  const publishAssignmentToPortal = () => {
    if (!generatedAssignment) return;
    let finalAssign = { ...generatedAssignment };
    if (!finalAssign.attachment) {
      try {
        finalAssign.attachment = generateAssignmentPdf(finalAssign);
      } catch (err) {
        console.warn('PDF auto-generation on publish:', err);
      }
    }
    createAssignment(finalAssign);
    alert(`Successfully published "${finalAssign.title}" with Official Question PDF to the Student Assignment Panel! Students can now download the PDF and upload their solutions.`);
  };

  // --- 3. AI CODE TEST GENERATION HANDLER ---
  const handleLoadCodeSample = () => {
    setCodeTestForm({
      topic: 'Dynamic Programming: Longest Increasing Subsequence. Provide starter Python function. Must include 3 test cases, boundary checks (empty array, strictly decreasing), and O(N log N) patience sorting requirement.',
      numQuestions: 2,
      timeLimit: 30,
      totalMarks: 30,
      testType: 'coding',
      referenceDoc: {
        id: 'sample-code-doc',
        name: 'DP_Optimization_Techniques.py',
        size: '42 KB',
      },
    });
  };

  const handleGenerateCodeTest = async (e) => {
    e.preventDefault();
    if (!codeTestForm.topic.trim()) {
      alert('Coding Test Topic & Instructions Prompt is mandatory.');
      return;
    }
    setIsGeneratingCodeTest(true);
    try {
      const codeResult = await generateAICodingTest({
        topic: codeTestForm.topic.trim(),
        testType: codeTestForm.testType,
        rules: codeTestForm.topic.trim(),
        timeLimit: codeTestForm.timeLimit,
        totalMarks: codeTestForm.totalMarks,
        department: attendanceDept,
        referenceText: codeTestForm.referenceDoc?.name || '',
      });

      setGeneratedCodeTest({ ...codeResult, _generatedAt: Date.now() });

      saveBotHistoryItem({
        panel: 'Test Generator',
        title: codeResult.title,
        details: `${codeTestForm.testType === 'coding' ? 'Python Algorithm Coding Exam' : 'Typing Speed Challenge'} • ${codeTestForm.timeLimit} mins • Total Marks: ${codeResult.totalMarks}`,
        data: codeResult,
      });
    } catch (err) {
      console.error('Code Test Generation Error:', err);
      alert('Error generating code test. Please try again.');
    } finally {
      setIsGeneratingCodeTest(false);
    }
  };

  const publishCodeTestToPortal = () => {
    if (!generatedCodeTest) return;
    createTest(generatedCodeTest);
    alert(`Successfully published "${generatedCodeTest.title}" to Student Test Panel with interactive Terminal code runner!`);
  };

  // --- 4. AI NOTES GENERATION HANDLER ---
  const handleLoadNotesSample = () => {
    setNotesGenForm({
      topic: 'Relational Normalization (1NF, 2NF, 3NF, BCNF) & Dependency Theory',
      subject: 'Relational Database Management Systems',
      focusArea: 'Comprehensive academic lecture notes: Explain update/delete anomalies, Armstrong axioms for functional dependencies, step-by-step normal form reduction from 1NF to BCNF with concrete violations and schema decompositions, SQL DDL schema, and high-yield viva-voce questions.',
      referenceDoc: {
        id: 'sample-notes-doc',
        name: 'Database_Normalization_Syllabus.pdf',
        size: '1.8 MB',
      },
    });
  };

  const handleGenerateNotes = async (e) => {
    e.preventDefault();
    if (!notesGenForm.topic.trim()) {
      alert('Topic / Chapter Name is mandatory.');
      return;
    }
    setIsGeneratingNotes(true);
    try {
      const notesResult = await generateAINotes({
        topic: notesGenForm.topic.trim(),
        subject: notesGenForm.subject?.trim() || '',
        focusArea: notesGenForm.focusArea?.trim() || '',
        department: attendanceDept,
        referenceText: notesGenForm.referenceDoc?.name || '',
      });

      const enriched = { ...notesResult, _generatedAt: Date.now() };
      setGeneratedNotes(enriched);
      setEditableNotesTitle(enriched.title);
      setEditableNotesSubject(enriched.subject);
      setEditableNotesSummary(enriched.summary || enriched.description || '');
      setEditableNotesContent(enriched.content || '');
      setIsEditingNotes(false);

      saveBotHistoryItem({
        panel: 'Notes Generator',
        title: enriched.title,
        details: `Study notes on "${notesGenForm.topic}" for ${notesGenForm.subject}`,
        data: enriched,
      });
    } catch (err) {
      console.error('Notes Generation Error:', err);
      alert('Error generating notes. Please try again.');
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const handleSaveEditedNotes = () => {
    if (!generatedNotes) return;
    const updated = {
      ...generatedNotes,
      title: editableNotesTitle.trim() || generatedNotes.title,
      subject: editableNotesSubject.trim() || generatedNotes.subject,
      summary: editableNotesSummary.trim() || generatedNotes.summary,
      description: editableNotesSummary.trim() || generatedNotes.description,
      content: editableNotesContent.trim() || generatedNotes.content,
    };
    setGeneratedNotes(updated);
    setIsEditingNotes(false);
  };

  const handleDownloadNotesPdf = () => {
    if (!generatedNotes) return;
    const activeNote = isEditingNotes
      ? {
          ...generatedNotes,
          title: editableNotesTitle.trim() || generatedNotes.title,
          subject: editableNotesSubject.trim() || generatedNotes.subject,
          summary: editableNotesSummary.trim() || generatedNotes.summary,
          description: editableNotesSummary.trim() || generatedNotes.description,
          content: editableNotesContent.trim() || generatedNotes.content,
        }
      : generatedNotes;
    downloadNotesPdf(activeNote);
  };

  const publishNotesToPortal = () => {
    if (!generatedNotes) return;
    const activeNote = isEditingNotes
      ? {
          ...generatedNotes,
          title: editableNotesTitle.trim() || generatedNotes.title,
          subject: editableNotesSubject.trim() || generatedNotes.subject,
          summary: editableNotesSummary.trim() || generatedNotes.summary,
          description: editableNotesSummary.trim() || generatedNotes.description,
          content: editableNotesContent.trim() || generatedNotes.content,
        }
      : generatedNotes;

    const pdfAttachment = generateNotesPdf(activeNote);

    addNote({
      title: activeNote.title,
      subject: activeNote.subject,
      summary: activeNote.summary || activeNote.description,
      description: activeNote.description || activeNote.summary,
      content: activeNote.content,
      tags: activeNote.tags || [activeNote.subject, 'Lecture Notes'],
      fileSize: pdfAttachment?.size || activeNote.fileSize || '1.8 MB',
      fileName: pdfAttachment?.name || `${(activeNote.title || 'Notes').replace(/\s+/g, '_')}.pdf`,
      attachment: pdfAttachment,
      date: new Date().toISOString().split('T')[0],
      department: attendanceDept,
      keyTakeaways: activeNote.keyTakeaways || [],
      author: 'Prof. Sarita Byagar (HOD - AIML)',
    });

    setGeneratedNotes(activeNote);
    setIsEditingNotes(false);
    alert(`Published "${activeNote.title}" with downloadable official PDF Handout to Student Notes Workstore!`);
  };

  // --- 5. AI PPT SLIDES GENERATOR ---
  const handleLoadPptSample = () => {
    setPptForm({
      topic: 'Convolutional Neural Networks: Convolutions, Pooling & Feature Maps',
      numSlides: 5,
      theme: 'midnight',
      audience: 'SY.B.Sc AIML Undergraduates',
      rules: 'Include architectural layer diagrams description, stride/padding formulas, mathematical intuition, and practical PyTorch code hints.',
      referenceDoc: {
        id: 'sample-ppt-doc',
        name: 'CNN_Architecture_Paper.pdf',
        size: '3.4 MB',
      },
    });
  };

  const handleGeneratePpt = async (e) => {
    e.preventDefault();
    if (!pptForm.topic.trim()) {
      alert('Slide Deck Topic is mandatory.');
      return;
    }
    setIsGeneratingPpt(true);
    setCurrentSlideIndex(0);

    // Realistic pedagogical synthesis progress steps
    setPptThinkingStage('Analyzing curriculum topic & pedagogical structure...');
    await new Promise((r) => setTimeout(r, 450));
    setPptThinkingStage('Synthesizing technical diagrams, formulas & code cards...');
    await new Promise((r) => setTimeout(r, 500));
    setPptThinkingStage('Drafting professor speaker remarks & discussion prompts...');
    await new Promise((r) => setTimeout(r, 450));
    setPptThinkingStage('Polishing high-impact 16:9 visual themes & styling...');

    try {
      const pptResult = await generateAIPpt({
        topic: pptForm.topic.trim(),
        numSlides: pptForm.numSlides,
        audience: pptForm.audience.trim(),
        rules: pptForm.rules?.trim() || '',
        referenceText: pptForm.referenceDoc?.name || '',
      });

      setGeneratedPpt({ ...pptResult, _generatedAt: Date.now() });
      setActivePptTheme(pptForm.theme || 'midnight');

      saveBotHistoryItem({
        panel: 'PPT Generator',
        title: pptResult.title,
        details: `${pptResult.slides.length} Slides generated for ${pptForm.audience}`,
        data: pptResult,
      });
    } catch (err) {
      console.error('PPT Generation Error:', err);
      alert('Error generating presentation. Please try again.');
    } finally {
      setIsGeneratingPpt(false);
      setPptThinkingStage('');
    }
  };

  const handleDownloadPresentationPdf = () => {
    if (!generatedPpt) return;
    downloadPresentationPdf(generatedPpt, activePptTheme);
  };

  const handleExportHtmlDeck = () => {
    if (!generatedPpt) return;
    exportPresentationHtml(generatedPpt, activePptTheme);
  };

  // --- 6. AI SUBMISSIONS ANALYZER HANDLER ---
  const handleRunAnalyzer = async () => {
    if (!analyzerPrompt.trim()) {
      alert('Mandatory requirement: You must provide instructions on how AI should evaluate the answers!');
      return;
    }
    const currentAssign = assignments.find((a) => a.id === analyzerTargetAssign);
    if (!currentAssign || !currentAssign.submissions || currentAssign.submissions.length === 0) {
      alert('No student submissions found to analyze for this assignment.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const evaluated = await Promise.all(
        currentAssign.submissions.map(async (sub) => {
          const evalRes = await evaluateSubmissionWithAI({
            assignmentTitle: currentAssign.title,
            maxMarks: currentAssign.maxMarks || 20,
            criteria: analyzerPrompt.trim(),
            submissionText: sub.file || sub.text || 'Standard solution submission with implementation steps and logic walkthrough.',
            studentName: sub.studentName,
          });

          gradeAssignment(currentAssign.id, sub.studentId, evalRes.awardedScore, evalRes.feedback);

          return {
            studentName: sub.studentName,
            rollNo: sub.rollNo,
            file: sub.file,
            awardedScore: evalRes.awardedScore,
            maxMarks: currentAssign.maxMarks || 20,
            feedback: evalRes.feedback,
          };
        })
      );

      setAnalyzedResults(evaluated);

      saveBotHistoryItem({
        panel: 'Submissions Analyzer',
        title: `AI Analysis for ${currentAssign.title}`,
        details: `${evaluated.length} submissions analyzed with criteria: "${analyzerPrompt.slice(0, 30)}..."`,
        data: evaluated,
      });

      alert(`AI Submissions Analyzer finished! Evaluated ${evaluated.length} student submissions and updated gradebooks.`);
    } catch (err) {
      console.error('Analyzer error:', err);
      alert('Error running AI submission analyzer. Please check your network or try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- 7. ATTENDANCE TAKING & WEEKLY REGISTER ---
  const handleSaveAttendance = () => {
    if (approvedDeptStudents.length === 0) {
      alert('No students found in this department to take attendance.');
      return;
    }

    // Build complete student snapshot sorted by roll number
    const snapshot = approvedDeptStudents.map((s) => ({
      rollNo: s.rollNo,
      name: s.name,
      isPresent: Boolean(attendanceChecks[s.rollNo]),
    }));

    const presentCount = snapshot.filter((s) => s.isPresent).length;
    const totalCount = snapshot.length;

    recordAttendance({
      subject: attendanceSubject,
      date: attendanceDate,
      day: attendanceDay,
      department: attendanceDept,
      faculty: currentUser?.name || 'Prof. Divya C',
      attendanceMap: attendanceChecks,
      studentsSnapshot: snapshot,
    });

    alert(
      `Attendance Saved & Synced!\nSubject: ${attendanceSubject}\nDepartment: ${attendanceDept}\nDate: ${attendanceDate}\nPresent: ${presentCount}/${totalCount} (${Math.round((presentCount / totalCount) * 100)}%)\n\nAutomatically redirected to Attendance History.`
    );

    // Switch to Attendance History view immediately
    setAttendanceSubTab('history');
  };

  const toggleAllAttendance = (present) => {
    const updated = {};
    approvedDeptStudents.forEach((s) => {
      updated[s.rollNo] = present;
    });
    setAttendanceChecks(updated);
  };

  // History filtering
  const filteredAttendanceRecords = useMemo(() => {
    return (attendance.records || []).filter((rec) => {
      if (historyDeptFilter !== 'all' && rec.department !== historyDeptFilter) {
        return false;
      }
      if (historySubjectFilter !== 'all' && rec.subject !== historySubjectFilter) {
        return false;
      }
      if (historyDateFilter && rec.date !== historyDateFilter) {
        return false;
      }
      return true;
    });
  }, [attendance.records, historyDeptFilter, historySubjectFilter, historyDateFilter]);

  // Attendance History Multi-select deletion
  const handleToggleSelectHistory = (id) => {
    setSelectedHistoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllHistory = () => {
    if (selectedHistoryIds.length === filteredAttendanceRecords.length) {
      setSelectedHistoryIds([]);
    } else {
      setSelectedHistoryIds(filteredAttendanceRecords.map((r) => r.id));
    }
  };

  const handleDeleteSelectedHistory = () => {
    if (selectedHistoryIds.length === 0) return;
    showConfirm({
      title: 'Delete Selected Attendance Records?',
      message: `Are you sure you want to delete ${selectedHistoryIds.length} selected attendance record(s)?`,
      confirmText: 'Delete Records',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: () => {
        deleteSelectedAttendanceRecords(selectedHistoryIds);
        setSelectedHistoryIds([]);
        showAlert('Selected attendance records deleted', 'success');
      },
    });
  };

  const handleClearAllHistory = () => {
    showConfirm({
      title: 'Delete All Attendance History?',
      message: 'Are you sure you want to delete ALL attendance history records? This cannot be undone.',
      confirmText: 'Delete All Records',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: () => {
        clearAllAttendanceHistory(historyDeptFilter === 'all' ? 'ALL' : historyDeptFilter);
        setSelectedHistoryIds([]);
        showAlert('All attendance records cleared', 'success');
      },
    });
  };

  // Filter Bot History
  const filteredBotHistory = useMemo(() => {
    return (botHistory || []).filter((item) => {
      // Panel filter
      if (historyFilter !== 'all') {
        const pLower = item.panel?.toLowerCase() || '';
        const fLower = historyFilter.toLowerCase();
        if (!pLower.includes(fLower)) return false;
      }
      // Search query
      if (historySearchQuery.trim()) {
        const query = historySearchQuery.toLowerCase();
        const text = `${item.title || ''} ${item.details || ''} ${item.panel || ''} ${item.studentName || ''} ${item.rollNo || ''} ${item.department || ''}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      return true;
    });
  }, [botHistory, historyFilter, historySearchQuery]);

  // Coding Test submissions logged in BotHistory
  const codingSubmissionsInHistory = useMemo(() => {
    return (botHistory || []).filter(
      (b) => b.panel === 'Coding Test Submissions' || b.data?.code || b.data?.terminalOutput
    );
  }, [botHistory]);

  return (
    <div className="space-y-6">
      {/* BotMarket Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                AI Automation Suite
              </span>
              <span className="text-xs text-purple-300 font-mono">Faculty Superpowers</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                NVIDIA NIM • LLaMA 3.3 Active
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2.5">
              <Bot className="w-8 h-8 text-purple-400" />
              A Teacher Co-Pilot (AI Assistant for Teachers)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Teacher Co-Pilot: Generate custom quizzes, coursework assignments with Bloom's taxonomy rubrics, coding tests with live student terminal, 16:9 widescreen presentation slide decks, and publication-grade lecture notes.
            </p>
          </div>

        </div>
      </div>

      {/* Sub-Panel Tabs Navigation */}
      <div className="bg-slate-900/90 rounded-2xl p-2 border border-slate-800 flex flex-wrap items-center gap-1.5 shadow-lg overflow-x-auto">
        {[
          { id: 'quizGen', label: '1. AI Quiz Gen', icon: HelpCircle },
          { id: 'assignGen', label: '2. AI Assignment Gen', icon: FileText },
          { id: 'codeTestGen', label: '3. AI Code Test & Terminal', icon: Code },
          { id: 'notesGen', label: '4. AI Notes Gen', icon: FileText },
          { id: 'pptGen', label: '5. AI Presentation Slides', icon: Presentation },
          { id: 'analyzer', label: '6. AI Submissions Analyzer', icon: Award, badge: 'Smart' },
          { id: 'attendanceRegister', label: '7. Attendance Register & History', icon: Calendar, badge: 'Dynamic' },
          { id: 'history', label: '8. Bot History Tracker', icon: Clock, count: botHistory.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubPanel === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubPanel(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200 text-[9px] font-bold">
                  {tab.badge}
                </span>
              )}
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* --- PANEL 1: AI QUIZ GENERATOR --- */}
      {/* ========================================================= */}
      {activeSubPanel === 'quizGen' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-400" />
                AI Automated Quiz & MCQ Generator
              </h3>
              <p className="text-xs text-slate-400">
                Generate high-standard university quizzes with customizable marks per question, attach syllabus files, and publish directly to the Student Portal Test System.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLoadQuizSample}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition self-start"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto-Fill Sample Topic
            </button>
          </div>

          <form onSubmit={handleGenerateQuiz} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Topic & Instructions Prompt (Mandatory) */}
            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-300 mb-1">
                Quiz Topic & Instructions Prompt <span className="text-rose-400 font-bold">* (Mandatory)</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Mention what you want and how you want it — specify topics, difficulty level, rules, or exact focus areas (e.g. Binary Search Trees & AVL Rotations: cover LL/RR cases, balance factor calculations, tricky edge cases, university college level)..."
                value={quizForm.topic}
                onChange={(e) => setQuizForm({ ...quizForm, topic: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Number of Questions <span className="text-rose-400 font-bold">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={25}
                required
                value={quizForm.numQuestions}
                onChange={(e) => setQuizForm({ ...quizForm, numQuestions: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Number of Options */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Options per Question
              </label>
              <select
                value={quizForm.numOptions}
                onChange={(e) => setQuizForm({ ...quizForm, numOptions: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value={2}>2 Options (True / False)</option>
                <option value={4}>4 Options (Standard A, B, C, D)</option>
                <option value={5}>5 Options (Advanced)</option>
              </select>
            </div>

            {/* Time Limit */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Time Limit (Minutes)
              </label>
              <input
                type="number"
                placeholder="e.g. 15 minutes"
                value={quizForm.timeLimit}
                onChange={(e) => setQuizForm({ ...quizForm, timeLimit: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* File Upload Option */}
            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-300 mb-1">
                Upload Reference Syllabus / PDF / Handout (Optional)
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-semibold flex items-center gap-1.5 transition">
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  <span>Choose File...</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setQuizForm)}
                  />
                </label>
                {quizForm.referenceDoc ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-200">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{quizForm.referenceDoc.name}</span>
                    <span className="text-[10px] text-slate-400">({quizForm.referenceDoc.size})</span>
                    <button
                      type="button"
                      onClick={() => setQuizForm((prev) => ({ ...prev, referenceDoc: null }))}
                      className="text-rose-400 hover:text-rose-300 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-500">No file chosen (optional)</span>
                )}
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end pt-2">
              <button
                type="submit"
                disabled={isGeneratingQuiz}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2"
              >
                {isGeneratingQuiz ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>NVIDIA LLaMA 3.3 Generating Quiz...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Quiz</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Generated Quiz Preview */}
          {generatedQuiz && (
            <div className="mt-6 p-6 rounded-3xl bg-slate-950/80 border border-purple-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    {generatedQuiz.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {generatedQuiz.questions.length} Questions • {generatedQuiz.durationMins} Mins Duration
                  </p>
                </div>

                <button
                  onClick={publishQuizToTests}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Quiz to Student Portal Test System</span>
                </button>
              </div>

              <div className="space-y-3">
                {generatedQuiz.questions.map((q, idx) => (
                  <div key={`quiz-q-${q.id || idx}-${generatedQuiz._generatedAt || idx}`} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white">Q{idx + 1}: {q.question}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={`quiz-opt-${generatedQuiz._generatedAt || ''}-${idx}-${oIdx}-${String(opt).slice(0, 15)}`}
                          className={`p-2 rounded-xl border text-xs ${
                            oIdx === q.correctIndex
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <span className="font-mono text-[10px] mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                          {opt}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="mt-2 text-[11px] text-slate-400 italic">
                        Explanation: {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* --- PANEL 2: AI ASSIGNMENT GENERATOR --- */}
      {/* ========================================================= */}
      {activeSubPanel === 'assignGen' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                AI Assignment Problem Set Generator
              </h3>
              <p className="text-xs text-slate-400">
                Generate rigorous coursework problem sets with deadlines, attach reference materials, and dispatch to Student Assignments.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLoadAssignSample}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition self-start"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto-Fill Sample Assignment
            </button>
          </div>

          <form onSubmit={handleGenerateAssignment} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Unified Topic & Instructions Prompt */}
            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-300 mb-1">
                Assignment Topic & Instructions Prompt <span className="text-rose-400 font-bold">* (Mandatory)</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe your assignment topic, criteria, rules, and constraints (e.g. 'Python modules fundamental assignment with step-by-step package setup, circular import debugging, and runtime analysis. Require docstrings and unit tests.')"
                value={assignGenForm.topic}
                onChange={(e) => setAssignGenForm({ ...assignGenForm, topic: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed resize-y"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Number of Problems <span className="text-rose-400 font-bold">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={assignGenForm.numQuestions}
                onChange={(e) => setAssignGenForm({ ...assignGenForm, numQuestions: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">
                Strict Submission Deadline (Cutoff Lock)
              </label>
              <input
                type="datetime-local"
                required
                value={assignGenForm.deadline}
                onChange={(e) => setAssignGenForm({ ...assignGenForm, deadline: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* File Upload */}
            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-300 mb-1">
                Upload Reference Handout / Syllabus File (Optional)
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-semibold flex items-center gap-1.5 transition">
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  <span>Choose File...</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setAssignGenForm)}
                  />
                </label>
                {assignGenForm.referenceDoc ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-200">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{assignGenForm.referenceDoc.name}</span>
                    <span className="text-[10px] text-slate-400">({assignGenForm.referenceDoc.size})</span>
                    <button
                      type="button"
                      onClick={() => setAssignGenForm((prev) => ({ ...prev, referenceDoc: null }))}
                      className="text-rose-400 hover:text-rose-300 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-500">No file chosen (optional)</span>
                )}
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end pt-2">
              <button
                type="submit"
                disabled={isGeneratingAssign}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2"
              >
                {isGeneratingAssign ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Assignment Problems...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Assignment</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Generated Assignment Preview */}
          {generatedAssignment && (
            <div className="mt-6 p-6 rounded-3xl bg-slate-950/80 border border-purple-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{generatedAssignment.title}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Deadline: {generatedAssignment.deadline ? new Date(generatedAssignment.deadline).toLocaleString() : 'N/A'} • {generatedAssignment.questions?.length || 0} Problems • {generatedAssignment.totalMarks || 45} Marks
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => downloadAssignmentPdf(generatedAssignment)}
                    className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 text-xs font-bold shadow-md flex items-center gap-1.5 transition"
                    title="Download Official Indira University Coursework Brief PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Assignment PDF</span>
                  </button>

                  <button
                    onClick={publishAssignmentToPortal}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish to Student Assignment Panel</span>
                  </button>
                </div>
              </div>

              {/* Generated PDF Attachment Badge */}
              {generatedAssignment.attachment && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 shrink-0">
                      <FileText className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate flex items-center gap-2">
                        <span className="truncate">{generatedAssignment.attachment.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/30 font-mono shrink-0">
                          PDF Attached
                        </span>
                      </p>
                      <p className="text-[11px] text-purple-300/80 font-mono">
                        Official Academic Question Brief ({generatedAssignment.attachment.size}) • Automatically dispatched to students upon publishing
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadAssignmentPdf(generatedAssignment)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/50 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 shrink-0 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-3 leading-relaxed">
                <div>
                  <p className="font-semibold text-white">Problem Statement & Instructions:</p>
                  <p className="mt-1 text-slate-300">{generatedAssignment.description}</p>
                </div>

                {generatedAssignment.questions && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <p className="font-semibold text-purple-300">Assignment Problems:</p>
                    {generatedAssignment.questions.map((q, idx) => (
                      <div
                        key={`assign-q-${generatedAssignment._generatedAt || ''}-${idx}-${(q.title || '').slice(0, 15)}`}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800"
                      >
                        <p className="font-bold text-white">Problem #{idx + 1}: {q.title || `Task ${idx + 1}`}</p>
                        <p className="text-slate-300 mt-1 leading-relaxed">{q.problem || q.description || q}</p>
                        {q.deliverables && (
                          <p className="text-indigo-400 text-[11px] mt-1.5 font-mono">
                            Deliverables: {q.deliverables}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <p className="pt-2 text-indigo-300 font-mono text-[11px]">
                  Evaluation Rubric: {generatedAssignment.rubric}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* --- PANEL 3: AI CODE / TYPING TEST GENERATOR & TERMINAL --- */}
      {/* ========================================================= */}
      {activeSubPanel === 'codeTestGen' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-400" />
                AI Coding Assessment & Terminal Runner
              </h3>
              <p className="text-xs text-slate-400">
                Generate programming problems with automated test cases. Students solve in their terminal editor, and their code & terminal outputs are recorded below.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLoadCodeSample}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition self-start"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto-Fill Sample Coding Problem
            </button>
          </div>

          <form onSubmit={handleGenerateCodeTest} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Unified Coding Test Topic & Instructions Prompt */}
            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-300 mb-1">
                Coding Test Topic & Instructions Prompt <span className="text-rose-400 font-bold">* (Mandatory)</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe your programming test topic, constraints, and test requirements (e.g. 'Python modules and functions test: Implement a function that imports math and calculates Euclidean distance with 3 test cases. Edge case: zero distance.')"
                value={codeTestForm.topic}
                onChange={(e) => setCodeTestForm({ ...codeTestForm, topic: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed resize-y"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Assessment Format
              </label>
              <select
                value={codeTestForm.testType}
                onChange={(e) => setCodeTestForm({ ...codeTestForm, testType: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="coding">Python Code Editor with Interactive Terminal</option>
                <option value="typing">Technical Typing Speed Test (WPM)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Time Limit (Minutes) <span className="text-rose-400 font-bold">*</span>
              </label>
              <input
                type="number"
                min={5}
                max={180}
                required
                value={codeTestForm.timeLimit}
                onChange={(e) => setCodeTestForm({ ...codeTestForm, timeLimit: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Total Marks
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={codeTestForm.totalMarks}
                onChange={(e) => setCodeTestForm({ ...codeTestForm, totalMarks: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* File Upload */}
            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-300 mb-1">
                Upload Problem Specification / Starter Script (Optional)
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-semibold flex items-center gap-1.5 transition">
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  <span>Choose File...</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setCodeTestForm)}
                  />
                </label>
                {codeTestForm.referenceDoc ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-200">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{codeTestForm.referenceDoc.name}</span>
                    <span className="text-[10px] text-slate-400">({codeTestForm.referenceDoc.size})</span>
                    <button
                      type="button"
                      onClick={() => setCodeTestForm((prev) => ({ ...prev, referenceDoc: null }))}
                      className="text-rose-400 hover:text-rose-300 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-500">No file chosen (optional)</span>
                )}
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end pt-2">
              <button
                type="submit"
                disabled={isGeneratingCodeTest}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2"
              >
                {isGeneratingCodeTest ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Compiling Assessment & Terminal Invariants...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Coding Assessment</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Generated Code Test Preview */}
          {generatedCodeTest && (
            <div
              key={`code-test-${generatedCodeTest._generatedAt || ''}`}
              className="mt-6 p-6 rounded-3xl bg-slate-950/80 border border-purple-500/30 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{generatedCodeTest.title}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Duration: {generatedCodeTest.durationMins || generatedCodeTest.timeLimit} mins • Total Marks: {generatedCodeTest.totalMarks || 30} • Department: {generatedCodeTest.department || 'AIML'}
                  </p>
                </div>

                <button
                  onClick={publishCodeTestToPortal}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish to Student Terminal Assessment Panel</span>
                </button>
              </div>

              {generatedCodeTest.type === 'coding' || generatedCodeTest.type === 'code' ? (() => {
                const challenge = generatedCodeTest.challenges?.[0] || generatedCodeTest.problems?.[0] || {};
                const pyStarter =
                  typeof challenge.starterCode === 'object'
                    ? challenge.starterCode?.python
                    : challenge.starterCode;

                return (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white text-sm">{challenge.title || generatedCodeTest.title}</p>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        {challenge.difficulty || 'Medium'}
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed">{challenge.description}</p>

                    <div>
                      <span className="text-[11px] text-purple-300 font-semibold block mb-1">
                        Python Starter Template & Function Signature:
                      </span>
                      <pre className="p-3 bg-slate-950 rounded-xl font-mono text-emerald-300 overflow-x-auto text-[11px] border border-slate-800/80 leading-relaxed">
                        {pyStarter || '# Python solution template'}
                      </pre>
                    </div>

                    {challenge.testCases && challenge.testCases.length > 0 && (
                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                          Automated Terminal Test Cases ({challenge.testCases.length}):
                        </span>
                        <div className="space-y-1.5">
                          {challenge.testCases.map((tc, tcIdx) => (
                            <div key={tcIdx} className="p-2 rounded-lg bg-slate-950 border border-slate-800/60 font-mono text-[11px] flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="text-purple-400 mr-2">Case {tcIdx + 1}:</span>
                                <span className="text-slate-300">Input: <code className="text-indigo-300">{tc.input}</code></span>
                              </div>
                              <span className="text-emerald-400">Expected: {tc.expectedOutput || tc.expected}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })() : (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
                  {generatedCodeTest.passage}
                </div>
              )}
            </div>
          )}

          {/* REAL-TIME STUDENT CODE & TERMINAL SUBMISSIONS LOG */}
          <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Live Student Code Submissions & Terminal Tracker
                </h4>
                <p className="text-xs text-slate-400">
                  Recorded terminal runs and code executions from student portals, organized by department and roll number.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
                {codingSubmissionsInHistory.length} Submissions Logged
              </span>
            </div>

            {codingSubmissionsInHistory.length > 0 ? (
              <div className="space-y-3">
                {codingSubmissionsInHistory.map((sub) => {
                  const isExpanded = selectedCodingSubmission === sub.id;
                  const data = sub.data || {};

                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition space-y-3 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono font-bold text-xs">
                            {sub.rollNo || data.rollNo || '15'}
                          </span>
                          <div>
                            <p className="font-bold text-white">
                              {sub.studentName || data.studentName || 'Student'} • {sub.title}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              Dept: {sub.department || data.department || 'AIML'} • Recorded at {new Date(sub.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Submitted &amp; Synced</span>
                          </span>
                          <button
                            onClick={() => setSelectedCodingSubmission(isExpanded ? null : sub.id)}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                          >
                            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{isExpanded ? 'Hide Console' : 'View Terminal Log'}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Terminal & Code Viewer */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-slate-800 space-y-3">
                          {data.code && (
                            <div>
                              <p className="text-[11px] font-semibold text-slate-300 mb-1">
                                Student Submitted Python Source Code:
                              </p>
                              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-emerald-300 text-xs overflow-x-auto">
                                {data.code}
                              </pre>
                            </div>
                          )}

                          {data.terminalOutput && (
                            <div>
                              <p className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                                <Terminal className="w-3 h-3 text-emerald-400" />
                                Interactive Terminal Execution Log:
                              </p>
                              <pre className="p-3 rounded-xl bg-black border border-slate-800 font-mono text-slate-300 text-xs overflow-x-auto whitespace-pre-wrap">
                                {data.terminalOutput}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                No student terminal runs recorded yet. When students run code in their interactive IDE, output logs will stream here.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* --- PANEL 4: AI STUDY NOTES GENERATOR --- */}
      {/* ========================================================= */}
      {activeSubPanel === 'notesGen' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                AI Lecture Study Notes Generator
              </h3>
              <p className="text-xs text-slate-400">
                Generate structured, high-yield study handouts with memory diagrams, theorems, and publish directly to Student Notes Workstore.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLoadNotesSample}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition self-start"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto-Fill Sample Notes
            </button>
          </div>

          <form onSubmit={handleGenerateNotes} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Topic / Chapter / Unit Name <span className="text-rose-400 font-bold">* (Mandatory)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Relational Normalization (1NF, 2NF, 3NF, BCNF) & Dependency Theory"
                  value={notesGenForm.topic}
                  onChange={(e) => setNotesGenForm({ ...notesGenForm, topic: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Target Course / Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Relational Database Management Systems"
                  value={notesGenForm.subject}
                  onChange={(e) => setNotesGenForm({ ...notesGenForm, subject: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">
                  Pedagogical & Formatting Instructions Prompt
                </label>
                <span className="text-[11px] text-slate-400">Click a preset to insert instructions</span>
              </div>

              <textarea
                rows={3}
                placeholder="Specify your desired note style, structure, depth, formulas, derivations, code blocks, or exam focus points..."
                value={notesGenForm.focusArea}
                onChange={(e) => setNotesGenForm({ ...notesGenForm, focusArea: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed"
              />

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {[
                  {
                    label: 'Theory & Mathematical Derivations',
                    prompt: 'Emphasize formal mathematical theory, Armstrong axioms, invariants, step-by-step normal form reduction, and rigorous complexity bounds.',
                  },
                  {
                    label: 'Code & Algorithmic Implementation',
                    prompt: 'Provide complete Python/SQL reference implementation, data structures, state machines, and practical engineering trade-offs.',
                  },
                  {
                    label: 'High-Yield Exam & Viva Checklist',
                    prompt: 'Include a comprehensive summary, key definitions, 5 high-yield exam questions with model answers, and viva-voce talking points.',
                  },
                  {
                    label: 'Concise Lecture Handout',
                    prompt: 'Create clean bullet points with bold keywords, comparison tables, visual architectural flow, and real-world system use cases.',
                  },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setNotesGenForm((prev) => ({
                        ...prev,
                        focusArea: prev.focusArea ? `${prev.focusArea}\n${preset.prompt}` : preset.prompt,
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-[11px] text-slate-300 hover:text-white transition"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Upload Reference Handout or Chapter Syllabus (Optional)
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-semibold flex items-center gap-1.5 transition">
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  <span>Choose File...</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setNotesGenForm)}
                  />
                </label>
                {notesGenForm.referenceDoc ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-200">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{notesGenForm.referenceDoc.name}</span>
                    <span className="text-[10px] text-slate-400">({notesGenForm.referenceDoc.size})</span>
                    <button
                      type="button"
                      onClick={() => setNotesGenForm((prev) => ({ ...prev, referenceDoc: null }))}
                      className="text-rose-400 hover:text-rose-300 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-500">No file chosen (optional)</span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isGeneratingNotes}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition"
              >
                {isGeneratingNotes ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Academic Notes...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Academic Notes</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* GENERATED NOTES DISPLAY & EDIT PANEL */}
          {generatedNotes && (
            <div
              key={`notes-${generatedNotes._generatedAt || ''}`}
              className="mt-6 p-6 rounded-3xl bg-slate-950/90 border border-purple-500/40 shadow-2xl space-y-5"
            >
              {/* Header Action Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                      Verified Lecture Handout
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/80 text-[10px] text-slate-400">
                      Prof. Sarita Byagar (HOD - AIML)
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">
                    {isEditingNotes ? editableNotesTitle || generatedNotes.title : generatedNotes.title}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Subject: {isEditingNotes ? editableNotesSubject || generatedNotes.subject : generatedNotes.subject} • Est. Read Time: {generatedNotes.readTime || '12-15 mins'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Edit Toggle */}
                  <button
                    onClick={() => {
                      if (isEditingNotes) {
                        handleSaveEditedNotes();
                      } else {
                        setIsEditingNotes(true);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                      isEditingNotes
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    {isEditingNotes ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Edit Notes Content</span>
                      </>
                    )}
                  </button>

                  {/* Download PDF Handout */}
                  <button
                    onClick={handleDownloadNotesPdf}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold shadow-md flex items-center gap-1.5 transition"
                    title="Download Official PDF Study Handout"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>

                  {/* Publish to Student Notes Portal */}
                  <button
                    onClick={publishNotesToPortal}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish to Student Notes Portal</span>
                  </button>
                </div>
              </div>

              {/* EDIT MODE */}
              {isEditingNotes ? (
                <div className="space-y-4 p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-white flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-purple-400" />
                      Teacher Live Content Editor (Make changes before publishing or downloading)
                    </span>
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Cancel Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Handout Title</label>
                      <input
                        type="text"
                        value={editableNotesTitle}
                        onChange={(e) => setEditableNotesTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Subject / Course</label>
                      <input
                        type="text"
                        value={editableNotesSubject}
                        onChange={(e) => setEditableNotesSubject(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Executive Summary / Learning Objectives</label>
                    <textarea
                      rows={2}
                      value={editableNotesSummary}
                      onChange={(e) => setEditableNotesSummary(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-300">Complete Lecture Notes Content (Markdown)</label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditableNotesContent((prev) => `${prev}\n\n### New Section Heading\nDetailed explanation...`)}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px]"
                        >
                          + Heading
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditableNotesContent((prev) => `${prev}\n- Key bullet point concept`)}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px]"
                        >
                          + Bullet
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditableNotesContent((prev) => `${prev}\n\n\`\`\`python\n# Code snippet\ndef example():\n    return True\n\`\`\``)}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px]"
                        >
                          + Code
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditableNotesContent((prev) => `${prev}\n\n### Exam Review Question\n1. **Q: Question text?**\n   - *Model Answer*: Answer details.`)}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px]"
                        >
                          + Exam Question
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={16}
                      value={editableNotesContent}
                      onChange={(e) => setEditableNotesContent(e.target.value)}
                      className="w-full bg-slate-950 font-mono text-xs text-emerald-300 p-4 rounded-2xl border border-slate-700 focus:outline-none focus:border-purple-500 shadow-inner leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingNotes(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditedNotes}
                      className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                    >
                      Save Changes & Return to Preview
                    </button>
                  </div>
                </div>
              ) : (
                /* CLEAN FORMATTED PREVIEW */
                <div className="space-y-4">
                  {/* Executive Overview Box */}
                  {(generatedNotes.summary || generatedNotes.description) && (
                    <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-1.5">
                      <span className="font-bold text-indigo-300 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                        <BookOpen className="w-3.5 h-3.5" />
                        Executive Overview & Learning Objectives
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {generatedNotes.summary || generatedNotes.description}
                      </p>
                    </div>
                  )}

                  {/* High-Yield Exam Checklist Box */}
                  {generatedNotes.keyTakeaways && generatedNotes.keyTakeaways.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                        <Award className="w-3.5 h-3.5" />
                        High-Yield Exam Review & Viva-Voce Checklist
                      </span>
                      <ul className="space-y-1">
                        {generatedNotes.keyTakeaways.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Formatted Notes Body */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-4 leading-relaxed font-sans select-text">
                    {generatedNotes.content ? (
                      <div className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed">
                        {generatedNotes.content}
                      </div>
                    ) : (
                      <p className="text-slate-500">No content available.</p>
                    )}
                  </div>

                  {/* Bottom Footer Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                    <span className="text-xs text-slate-400">
                      All modifications will be permanently retained in the downloadable PDF and student workstore.
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownloadNotesPdf}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                      <button
                        onClick={publishNotesToPortal}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish to Student Notes Portal</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* --- PANEL 5: AI PPT SLIDES GENERATOR --- */}
      {/* ========================================================= */}
      {activeSubPanel === 'pptGen' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Presentation className="w-5 h-5 text-purple-400" />
                AI PowerPoint Presentation Slide Generator
              </h3>
              <p className="text-xs text-slate-400">
                Generate structured slide outlines, core bullet points, and speaker lecture notes with interactive presentation preview.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLoadPptSample}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition self-start"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto-Fill Sample Presentation
            </button>
          </div>

          <form onSubmit={handleGeneratePpt} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">
                Slide Deck Topic <span className="text-rose-400 font-bold">* (Mandatory)</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Convolutional Neural Networks: Architecture, Kernels & Pooling"
                value={pptForm.topic}
                onChange={(e) => setPptForm({ ...pptForm, topic: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Visual Theme
              </label>
              <select
                value={pptForm.theme || 'midnight'}
                onChange={(e) => {
                  setPptForm({ ...pptForm, theme: e.target.value });
                  setActivePptTheme(e.target.value);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-purple-500"
              >
                {Object.keys(PPT_THEMES).map((tId) => (
                  <option key={tId} value={tId}>
                    {PPT_THEMES[tId].name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Number of Slides
              </label>
              <input
                type="number"
                min={3}
                max={10}
                value={pptForm.numSlides}
                onChange={(e) => setPptForm({ ...pptForm, numSlides: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block font-semibold text-slate-300 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                placeholder="e.g. SY.B.Sc AIML Undergraduates • Division A"
                value={pptForm.audience}
                onChange={(e) => setPptForm({ ...pptForm, audience: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="md:col-span-4">
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">
                  Presentation Style & Pedagogical Criteria
                </label>
                <span className="text-[11px] text-slate-400">Click a preset to insert slide instructions</span>
              </div>
              <textarea
                rows={2}
                placeholder="Specify desired slide breakdown, technical depth, diagrams, math formulas, code examples, or exam focus..."
                value={pptForm.rules || ''}
                onChange={(e) => setPptForm({ ...pptForm, rules: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed"
              />

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {[
                  {
                    label: 'Architecture & Diagrams',
                    prompt: 'Include system architecture breakdown, memory layout description, and multi-component block diagrams.',
                  },
                  {
                    label: 'Code Walkthrough & Syntax',
                    prompt: 'Provide complete Python implementation snippets, function signatures, and step-by-step execution walkthrough.',
                  },
                  {
                    label: 'Mathematical Derivations',
                    prompt: 'Derive mathematical formulas, stride/padding calculations, output dimensions, and formal invariant bounds.',
                  },
                  {
                    label: 'High-Yield Viva Checklist',
                    prompt: 'Include a dedicated oral viva review slide with common examiner questions, model answers, and student traps.',
                  },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setPptForm((prev) => ({
                        ...prev,
                        rules: prev.rules ? `${prev.rules}\n${preset.prompt}` : preset.prompt,
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-[11px] text-slate-300 hover:text-white transition"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div className="md:col-span-4">
              <label className="block font-semibold text-slate-300 mb-1">
                Upload Reference Slide Outline / Lecture Document (Optional)
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-semibold flex items-center gap-1.5 transition">
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  <span>Choose File...</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setPptForm)}
                  />
                </label>
                {pptForm.referenceDoc ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-200">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{pptForm.referenceDoc.name}</span>
                    <span className="text-[10px] text-slate-400">({pptForm.referenceDoc.size})</span>
                    <button
                      type="button"
                      onClick={() => setPptForm((prev) => ({ ...prev, referenceDoc: null }))}
                      className="text-rose-400 hover:text-rose-300 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-500">No file chosen (optional)</span>
                )}
              </div>
            </div>

            <div className="md:col-span-4 flex justify-end pt-2">
              <button
                type="submit"
                disabled={isGeneratingPpt}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition"
              >
                {isGeneratingPpt ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Academic Presentation...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Presentation Slides</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* DELIBERATE THINKING & PROGRESS BANNER */}
          {isGeneratingPpt && (
            <div className="p-5 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 space-y-3 animate-pulse">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                  AI Cognitive Reasoning & Presentation Design in Progress...
                </span>
                <span className="font-mono text-purple-300">Active Thought Process</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full w-3/4 animate-pulse transition-all duration-500"></div>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                {pptThinkingStage || 'Synthesizing technical slides, diagrams, and code snippets...'}
              </p>
            </div>
          )}

          {/* INTERACTIVE SLIDES PREVIEW & EXPORT ACTIONS */}
          {generatedPpt && (
            <div className="mt-6 p-6 rounded-3xl bg-slate-950/90 border border-purple-500/30 shadow-2xl space-y-5">
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                      16:9 Academic Presentation Deck
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/80 text-[10px] text-slate-400">
                      {generatedPpt.slides.length} Widescreen Slides
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">{generatedPpt.title}</h4>
                  <p className="text-xs text-slate-400">
                    Topic: {generatedPpt.topic} • Target Audience: {pptForm.audience}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Theme Switcher */}
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-xl text-xs">
                    <Palette className="w-3.5 h-3.5 text-purple-400" />
                    <select
                      value={activePptTheme}
                      onChange={(e) => setActivePptTheme(e.target.value)}
                      className="bg-transparent text-white text-xs font-semibold focus:outline-none"
                    >
                      {Object.keys(PPT_THEMES).map((tId) => (
                        <option key={tId} value={tId} className="bg-slate-900 text-white">
                          {PPT_THEMES[tId].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Present Fullscreen */}
                  <button
                    onClick={() => setIsFullscreenPpt(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition"
                    title="Launch Fullscreen Presentation Mode"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Present</span>
                  </button>

                  {/* Download 16:9 PDF */}
                  <button
                    onClick={handleDownloadPresentationPdf}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition"
                    title="Download Official 16:9 Widescreen Presentation PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download 16:9 PDF</span>
                  </button>

                  {/* Export Interactive HTML */}
                  <button
                    onClick={handleExportHtmlDeck}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5 transition"
                    title="Export Standalone Web Presentation (.html)"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Export Web Deck</span>
                  </button>
                </div>
              </div>

              {/* 16:9 Carousel Slide Canvas */}
              {generatedPpt.slides[currentSlideIndex] && (() => {
                const s = generatedPpt.slides[currentSlideIndex];
                const theme = PPT_THEMES[activePptTheme] || PPT_THEMES.midnight;

                return (
                  <div
                    className="p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 transition-all duration-300"
                    style={{
                      backgroundColor: `rgb(${theme.cardBg.join(',')})`,
                      borderColor: `rgb(${theme.cardBorder.join(',')})`,
                    }}
                  >
                    {/* Slide Top Bar */}
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow"
                          style={{ backgroundColor: `rgb(${theme.primary.join(',')})` }}
                        >
                          {s.category || `MODULE 0${currentSlideIndex + 1}`}
                        </span>
                        {s.highlightPill && (
                          <span
                            className="px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold"
                            style={{
                              borderColor: `rgb(${theme.cardBorder.join(',')})`,
                              color: `rgb(${theme.accent.join(',')})`,
                            }}
                          >
                            {s.highlightPill}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        Slide {currentSlideIndex + 1} of {generatedPpt.slides.length}
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h3
                        className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight"
                        style={{ color: `rgb(${theme.textPrimary.join(',')})` }}
                      >
                        {s.title}
                      </h3>
                      {s.subtitle && (
                        <p
                          className="text-xs sm:text-sm mt-1"
                          style={{ color: `rgb(${theme.textSecondary.join(',')})` }}
                        >
                          {s.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Dual-Column Card Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                      {/* Left: Core Technical Concepts */}
                      <div className="p-4 rounded-2xl bg-black/25 border border-slate-700/60 space-y-3">
                        <span
                          className="text-[11px] font-bold tracking-wider uppercase block"
                          style={{ color: `rgb(${theme.primary.join(',')})` }}
                        >
                          Core Technical Concepts
                        </span>
                        <ul className="space-y-2.5 text-xs leading-relaxed">
                          {(s.bullets || s.bulletPoints || []).map((b, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2 text-slate-300">
                              <span
                                className="font-bold text-sm leading-none"
                                style={{ color: `rgb(${theme.primary.join(',')})` }}
                              >
                                •
                              </span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Right: Code Block OR Architecture Insights */}
                      <div className="p-4 rounded-2xl bg-black/25 border border-slate-700/60 space-y-3">
                        {s.codeSnippet ? (
                          <>
                            <div className="flex items-center justify-between">
                              <span
                                className="text-[11px] font-bold tracking-wider uppercase"
                                style={{ color: `rgb(${theme.accent.join(',')})` }}
                              >
                                Reference Implementation
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                              </div>
                            </div>
                            <pre
                              className="p-3 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800"
                              style={{
                                backgroundColor: `rgb(${theme.codeBg.join(',')})`,
                                color: `rgb(${theme.codeText.join(',')})`,
                              }}
                            >
                              {s.codeSnippet}
                            </pre>
                          </>
                        ) : (
                          <>
                            <span
                              className="text-[11px] font-bold tracking-wider uppercase block"
                              style={{ color: `rgb(${theme.accent.join(',')})` }}
                            >
                              Architecture & Insights
                            </span>
                            <ul className="space-y-2.5 text-xs leading-relaxed">
                              {(s.insights || [
                                'High throughput, deterministic memory layout.',
                                'Invariant Guarantee: Pre-condition checks enforced prior to state mutations.',
                                'Exam Focus: Justify asymptotic bounds during faculty oral examinations.',
                              ]).map((ins, insIdx) => (
                                <li key={insIdx} className="flex items-start gap-2 text-slate-300">
                                  <span
                                    className="font-bold text-sm leading-none"
                                    style={{ color: `rgb(${theme.accent.join(',')})` }}
                                  >
                                    •
                                  </span>
                                  <span>{ins}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Professor Speaker Remarks */}
                    {s.speakerNotes && (
                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/70 text-xs text-indigo-300 font-mono space-y-1">
                        <strong className="text-purple-300 font-bold block text-[11px] uppercase tracking-wider">
                          Professor Lecture Remarks:
                        </strong>
                        <p className="text-slate-300 font-sans leading-relaxed text-xs">
                          {s.speakerNotes}
                        </p>
                      </div>
                    )}

                    {/* Navigation Carousel Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/60">
                      <button
                        disabled={currentSlideIndex === 0}
                        onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 text-xs font-semibold transition"
                      >
                        ← Previous Slide
                      </button>

                      <div className="flex items-center gap-1.5">
                        {generatedPpt.slides.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentSlideIndex(idx)}
                            className={`h-2.5 rounded-full transition-all ${
                              idx === currentSlideIndex
                                ? 'bg-purple-400 w-6'
                                : 'bg-slate-700 hover:bg-slate-500 w-2.5'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        disabled={currentSlideIndex === generatedPpt.slides.length - 1}
                        onClick={() =>
                          setCurrentSlideIndex((prev) =>
                            Math.min(generatedPpt.slides.length - 1, prev + 1)
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 text-xs font-semibold transition"
                      >
                        Next Slide →
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* FULLSCREEN PRESENTATION MODAL OVERLAY */}
              {isFullscreenPpt && generatedPpt && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-6 animate-fadeIn">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
                    <span className="font-bold text-white text-sm">
                      {generatedPpt.title} • {generatedPpt.slides[currentSlideIndex]?.category}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-purple-400 text-xs font-bold">
                        Slide {currentSlideIndex + 1} / {generatedPpt.slides.length}
                      </span>
                      <button
                        onClick={() => setIsFullscreenPpt(false)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1"
                      >
                        <Minimize2 className="w-3.5 h-3.5" />
                        <span>Exit (Esc)</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Slide Content Canvas */}
                  <div className="max-w-5xl mx-auto w-full my-auto space-y-6">
                    <div className="space-y-2">
                      <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-bold tracking-wider uppercase inline-block">
                        {generatedPpt.slides[currentSlideIndex]?.category || 'LECTURE'}
                      </span>
                      <h2 className="text-3xl sm:text-4xl font-black text-white">
                        {generatedPpt.slides[currentSlideIndex]?.title}
                      </h2>
                      <p className="text-base text-slate-300">
                        {generatedPpt.slides[currentSlideIndex]?.subtitle}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                          Key Technical Points
                        </h4>
                        <ul className="space-y-3 text-sm text-slate-200 leading-relaxed">
                          {(
                            generatedPpt.slides[currentSlideIndex]?.bullets ||
                            generatedPpt.slides[currentSlideIndex]?.bulletPoints ||
                            []
                          ).map((b, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="text-purple-400 font-bold">•</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                        {generatedPpt.slides[currentSlideIndex]?.codeSnippet ? (
                          <>
                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                              Code Walkthrough
                            </h4>
                            <pre className="p-4 rounded-2xl bg-black font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed border border-slate-800">
                              {generatedPpt.slides[currentSlideIndex]?.codeSnippet}
                            </pre>
                          </>
                        ) : (
                          <>
                            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                              Architecture Insights
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              {generatedPpt.slides[currentSlideIndex]?.speakerNotes ||
                                'Demonstrate the theoretical principles and practical applications live to the classroom.'}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fullscreen Navigation Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 max-w-5xl mx-auto w-full">
                    <button
                      disabled={currentSlideIndex === 0}
                      onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold disabled:opacity-30 transition"
                    >
                      ← Previous
                    </button>

                    <div className="flex items-center gap-2">
                      {generatedPpt.slides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`h-2.5 rounded-full transition-all ${
                            idx === currentSlideIndex
                              ? 'bg-purple-400 w-8'
                              : 'bg-slate-700 hover:bg-slate-500 w-2.5'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      disabled={currentSlideIndex === generatedPpt.slides.length - 1}
                      onClick={() =>
                        setCurrentSlideIndex((prev) =>
                          Math.min(generatedPpt.slides.length - 1, prev + 1)
                        )
                      }
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold disabled:opacity-30 transition"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* --- PANEL 6: AI SUBMISSIONS ANALYZER --- */}
      {/* ========================================================= */}
      {activeSubPanel === 'analyzer' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              AI Student Submissions Analyzer & Auto-Grader
            </h3>
            <p className="text-xs text-slate-400">
              Analyze student answers one-by-one or in bulk. You must specify your custom evaluation criteria so the AI checks exactly how you want.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Select Coursework / Assignment
              </label>
              <select
                value={analyzerTargetAssign}
                onChange={(e) => setAnalyzerTargetAssign(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.submissions?.length || 0} Turned in)
                  </option>
                ))}
              </select>
            </div>

            {/* Mandatory evaluation prompt */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">
                How should AI check the submissions? <span className="text-rose-400 font-bold">* (Mandatory Custom Prompt)</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Tell the analyzer how you want AI to check (e.g. Check for Dijkstra queue correctness, edge cases like negative weights, verify proper comments and runtime proofs)..."
                value={analyzerPrompt}
                onChange={(e) => setAnalyzerPrompt(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRunAnalyzer}
              disabled={isAnalyzing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI is Analyzing Submissions...</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" />
                  <span>Run AI Evaluation & Sync Grades</span>
                </>
              )}
            </button>
          </div>

          {/* Results Table */}
          {analyzedResults.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Evaluation Results Applied
              </h4>
              <div className="space-y-2">
                {analyzedResults.map((res, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs">
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{res.studentName} (Roll #{res.rollNo})</span>
                      <span className="text-emerald-400 font-mono text-sm">
                        Score: {res.awardedScore} / {res.maxMarks}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-1">{res.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* --- PANEL 7: ATTENDANCE TAKING REGISTER & WEEKLY HISTORY --- */}
      {/* ========================================================= */}
      {activeSubPanel === 'attendanceRegister' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Department Attendance Registry & History
              </h3>
              <p className="text-xs text-slate-400">
                Registered students dynamically append by Roll No & Department. Mark attendance, save directly to history, and manage records.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setAttendanceSubTab('take')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  attendanceSubTab === 'take' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Take Roll-Call
              </button>
              <button
                onClick={() => setAttendanceSubTab('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  attendanceSubTab === 'history' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Attendance History ({attendance.records?.length || 0})
              </button>
            </div>
          </div>

          {attendanceSubTab === 'take' ? (
            /* TAKE ATTENDANCE VIEW */
            <div className="space-y-4">
              {/* Controls bar: Department, Subject, Date, Day */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Department Registry</label>
                  <select
                    value={attendanceDept}
                    onChange={(e) => setAttendanceDept(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500 font-semibold"
                  >
                    {availableDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Course Subject</label>
                  <select
                    value={attendanceSubject}
                    onChange={(e) => setAttendanceSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500 font-semibold"
                  >
                    <option value="DS">Data Structures (DS)</option>
                    <option value="RDBMS">Relational DBMS (RDBMS)</option>
                    <option value="SE">Software Engineering (SE)</option>
                    <option value="Python">Python Programming</option>
                    <option value="AIML">Artificial Intelligence & ML</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Day of Week</label>
                  <select
                    value={attendanceDay}
                    onChange={(e) => setAttendanceDay(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Auto-Append Info & Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pt-1 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-semibold">
                    {approvedDeptStudents.length} Students in {attendanceDept}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono">
                    Auto-Appended & Sorted by Roll No
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAllAttendance(true)}
                    className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Mark All Present
                  </button>
                  <button
                    onClick={() => toggleAllAttendance(false)}
                    className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-xs font-semibold border border-rose-500/30 flex items-center gap-1"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Mark All Absent
                  </button>
                </div>
              </div>

              {/* Roster Table */}
              <div className="divide-y divide-slate-800 bg-slate-950/40 rounded-2xl border border-slate-800 overflow-hidden">
                {approvedDeptStudents.length > 0 ? (
                  approvedDeptStudents.map((stud) => {
                    const isPresent = Boolean(attendanceChecks[stud.rollNo]);

                    return (
                      <div
                        key={stud.id}
                        className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-purple-300 shadow-sm border border-slate-700">
                            {stud.rollNo}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-white flex items-center gap-2">
                              {stud.name}
                              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 text-[9px] font-mono">
                                {stud.department}
                              </span>
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Batch {stud.batch || 'A'} • {stud.email}
                            </p>
                          </div>
                        </div>

                        {/* Tick / Cross Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setAttendanceChecks({ ...attendanceChecks, [stud.rollNo]: true })
                            }
                            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 text-xs font-bold ${
                              isPresent
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                            title="Mark Present"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setAttendanceChecks({ ...attendanceChecks, [stud.rollNo]: false })
                            }
                            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 text-xs font-bold ${
                              !isPresent
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                            title="Mark Absent"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No approved students registered in this department yet. As soon as a student registers, they will appear here automatically!
                  </div>
                )}
              </div>

              {/* Save Attendance Button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400 font-mono">
                  Present: {approvedDeptStudents.filter((s) => attendanceChecks[s.rollNo]).length} / {approvedDeptStudents.length} Students
                </span>

                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Attendance to History & Sync Student Portals</span>
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* ATTENDANCE HISTORY VIEW (Well-Organized & Delete Support) */
            /* ========================================================= */
            <div className="space-y-4">
              {/* History Filters & Delete Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-0.5">Filter Dept</label>
                    <select
                      value={historyDeptFilter}
                      onChange={(e) => setHistoryDeptFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                    >
                      <option value="all">All Departments</option>
                      {availableDepartments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-0.5">Filter Subject</label>
                    <select
                      value={historySubjectFilter}
                      onChange={(e) => setHistorySubjectFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                    >
                      <option value="all">All Subjects</option>
                      <option value="DS">DS</option>
                      <option value="RDBMS">RDBMS</option>
                      <option value="SE">SE</option>
                      <option value="Python">Python</option>
                      <option value="AIML">AIML</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-0.5">Filter Date</label>
                    <input
                      type="date"
                      value={historyDateFilter}
                      onChange={(e) => setHistoryDateFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                    />
                  </div>

                  {historyDateFilter && (
                    <button
                      onClick={() => setHistoryDateFilter('')}
                      className="self-end px-2 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                    >
                      Clear Date
                    </button>
                  )}
                </div>

                {/* Bulk Delete Buttons */}
                <div className="flex items-center gap-2 self-start sm:self-end">
                  {selectedHistoryIds.length > 0 && (
                    <button
                      onClick={handleDeleteSelectedHistory}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Selected ({selectedHistoryIds.length})</span>
                    </button>
                  )}

                  <button
                    onClick={handleClearAllHistory}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-rose-300 border border-slate-700 font-semibold transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Clear All History</span>
                  </button>
                </div>
              </div>

              {/* Table Header with Select All */}
              {filteredAttendanceRecords.length > 0 && (
                <div className="flex items-center justify-between px-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSelectAllHistory}
                      className="flex items-center gap-1 text-slate-300 hover:text-white"
                    >
                      {selectedHistoryIds.length === filteredAttendanceRecords.length &&
                      filteredAttendanceRecords.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                      <span>Select All ({filteredAttendanceRecords.length})</span>
                    </button>
                  </div>
                  <span>Showing {filteredAttendanceRecords.length} records</span>
                </div>
              )}

              {/* Attendance Records Cards List */}
              <div className="space-y-3">
                {filteredAttendanceRecords.length > 0 ? (
                  filteredAttendanceRecords.map((rec) => {
                    const isSelected = selectedHistoryIds.includes(rec.id);
                    const isExpanded = expandedRecordId === rec.id;

                    const presentCount =
                      rec.presentCount !== undefined
                        ? rec.presentCount
                        : Object.values(rec.attendance || {}).filter(Boolean).length;
                    const totalCount =
                      rec.totalCount !== undefined
                        ? rec.totalCount
                        : Object.keys(rec.attendance || {}).length;
                    const pct = totalCount ? Math.round((presentCount / totalCount) * 100) : 0;

                    // Student snapshot sorted by roll number
                    const studentRoster = (
                      rec.studentsSnapshot && rec.studentsSnapshot.length > 0
                        ? rec.studentsSnapshot
                        : Object.entries(rec.attendance || {}).map(([roll, pres]) => ({
                            rollNo: roll,
                            name: `Student Roll #${roll}`,
                            isPresent: Boolean(pres),
                          }))
                    ).sort((a, b) => (parseInt(a.rollNo, 10) || 0) - (parseInt(b.rollNo, 10) || 0));

                    return (
                      <div
                        key={rec.id}
                        className={`p-4 rounded-2xl border transition text-xs space-y-3 ${
                          isSelected
                            ? 'bg-purple-950/20 border-purple-500/50'
                            : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggleSelectHistory(rec.id)}
                              className="mt-0.5 text-slate-400 hover:text-white"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-purple-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-500" />
                              )}
                            </button>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">{rec.subject}</span>
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                                  {rec.date} ({rec.day})
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px]">
                                  {rec.department || 'Information Technology (AIML)'}
                                </span>
                              </div>
                              <p className="text-slate-400 mt-1">
                                Faculty: {rec.faculty} • Recorded at: {rec.recordedAt || 'Class Hour'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="font-mono font-bold text-emerald-400 text-sm block">
                                {presentCount}/{totalCount} Present ({pct}%)
                              </span>
                              <div className="w-28 h-1.5 bg-slate-700 rounded-full overflow-hidden mt-1 ml-auto">
                                <div
                                  className={`h-full ${pct >= 75 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>

                            <button
                              onClick={() => setExpandedRecordId(isExpanded ? null : rec.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                              title="Toggle Student Details"
                            >
                              <span>{isExpanded ? 'Hide' : 'Roster'}</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>

                            <button
                              onClick={() => {
                                showConfirm({
                                  title: 'Delete Attendance Record?',
                                  message: `Are you sure you want to delete the attendance record for ${rec.subject} on ${rec.date}?`,
                                  confirmText: 'Delete Record',
                                  cancelText: 'Cancel',
                                  type: 'danger',
                                  onConfirm: () => {
                                    deleteAttendanceRecord(rec.id);
                                    showAlert('Attendance record deleted', 'info');
                                  },
                                });
                              }}
                              className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-700/50 transition"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expandable Roster Snapshot Sorted by Roll No */}
                        {isExpanded && (
                          <div className="pt-3 border-t border-slate-700/50 space-y-2">
                            <p className="text-[11px] font-semibold text-slate-300">
                              Student Attendance Roster (Sorted by Roll Number):
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                              {studentRoster.map((s, idx) => (
                                <div
                                  key={idx}
                                  className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                                    s.isPresent
                                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                                      : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center font-mono font-bold text-[10px]">
                                      {s.rollNo}
                                    </span>
                                    <span className="font-semibold text-white truncate max-w-[120px]">{s.name}</span>
                                  </div>
                                  <span className="font-bold text-[10px] uppercase">
                                    {s.isPresent ? 'Present' : 'Absent'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
                    No attendance records found matching the current filters.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* --- PANEL 8: BOTMARKET HISTORY & RECORD TRACKER --- */}
      {/* ========================================================= */}
      {activeSubPanel === 'history' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                BotMarket History & Student Submissions Tracker
              </h3>
              <p className="text-xs text-slate-400">
                Sorted log of all AI generations, assessments, quizzes, assignments, and student terminal submissions with delete controls.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search history, roll no, title..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 w-48 sm:w-56"
                />
              </div>

              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="all">All Panels</option>
                <option value="Quiz">Quizzes</option>
                <option value="Assignment">Assignments</option>
                <option value="Test">Tests & Coding</option>
                <option value="Coding Test Submissions">Coding Submissions</option>
                <option value="Notes">Notes</option>
                <option value="PPT">Presentation Slides</option>
                <option value="Analyzer">Analyzer</option>
              </select>

              <button
                onClick={() => {
                  showConfirm({
                    title: 'Clear All BotMarket History Logs?',
                    message: 'Are you sure you want to delete all saved generator and prompt history records?',
                    confirmText: 'Clear Logs',
                    cancelText: 'Cancel',
                    type: 'danger',
                    onConfirm: () => {
                      clearBotHistory('all');
                      showAlert('BotMarket history logs cleared', 'info');
                    },
                  });
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-rose-300 border border-slate-700 text-xs font-semibold transition"
              >
                Delete All
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {filteredBotHistory.length > 0 ? (
              filteredBotHistory.map((item) => {
                const isExpanded = expandedBotHistId === item.id;
                const hasCodeOrConsole = item.data?.code || item.data?.terminalOutput;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                            {item.panel}
                          </span>
                          <span className="font-bold text-white text-sm">{item.title}</span>
                          {item.rollNo && (
                            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-purple-300 text-[10px] font-mono">
                              Roll #{item.rollNo}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 mt-1">{item.details}</p>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">
                          Timestamp: {new Date(item.timestamp).toLocaleString()} • Creator: {item.creator}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasCodeOrConsole && (
                          <button
                            onClick={() => setExpandedBotHistId(isExpanded ? null : item.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                          >
                            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{isExpanded ? 'Hide' : 'View Code'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => deleteBotHistoryItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-700/50 transition"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Code & Terminal Details */}
                    {isExpanded && hasCodeOrConsole && (
                      <div className="pt-3 border-t border-slate-700/60 space-y-2">
                        {item.data?.code && (
                          <div>
                            <p className="text-[11px] font-semibold text-slate-300 mb-1">Source Code:</p>
                            <pre className="p-3 rounded-xl bg-slate-950 font-mono text-emerald-300 text-xs overflow-x-auto">
                              {item.data.code}
                            </pre>
                          </div>
                        )}
                        {item.data?.terminalOutput && (
                          <div>
                            <p className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                              <Terminal className="w-3 h-3 text-emerald-400" />
                              Terminal Logs:
                            </p>
                            <pre className="p-3 rounded-xl bg-black font-mono text-slate-300 text-xs overflow-x-auto whitespace-pre-wrap">
                              {item.data.terminalOutput}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-950/20 rounded-2xl border border-dashed border-slate-800">
                No history records found matching this filter or search query.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
