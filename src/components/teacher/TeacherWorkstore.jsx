import React, { useState, useRef, useEffect } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { useGoogleDialog } from '../common/GoogleDialog';
import {
  FileText,
  Upload,
  BookOpen,
  Award,
  Video,
  Plus,
  Trash2,
  CheckCircle,
  Eye,
  Check,
  Code,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Users,
  MessageSquare,
  Send,
  Lock,
  Paperclip,
  Download,
  ExternalLink,
  Clock,
  Sparkles,
  X,
  Bell,
  MessageCircle,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building,
  Search,
  FlaskConical,
  Calendar,
  UserCheck,
  UserX,
  Sliders,
  Layers,
  Cpu,
  History,
  Edit3,
  Save,
  CheckSquare,
  Square,
  ChevronRight,
  ShieldCheck,
  Volume2,
  VolumeX,
  PhoneOff,
  Radio,
  Share2,
  Copy,
  Link,
  LayoutGrid,
  Maximize2,
  Smile,
} from 'lucide-react';
import {
  readFileAsAttachment,
  downloadAttachment,
  getFileBadgeColor,
} from '../../utils/fileAttachmentUtils';

export default function TeacherWorkstore() {
  const {
    currentUser,
    students,
    notes,
    addNote,
    deleteNote,
    assignments,
    createAssignment,
    deleteAssignment,
    gradeAssignment,
    tests,
    createTest,
    deleteTest,
    updateTestScore,
    awarenessMessages,
    acknowledgeReminder,
    deleteAwarenessMessage,
    practicalAttendance,
    departmentBatches,
    labNotes,
    recordPracticalAttendance,
    updatePracticalAttendanceRecord,
    deletePracticalAttendanceRecord,
    getStudentPracticalAttendanceStats,
    updateDepartmentBatchRange,
    createDepartmentBatch,
    deleteDepartmentBatch,
    addLabNote,
    deleteLabNote,
    activeMeeting,
    startHostMeeting,
    endHostMeeting,
    admitStudentToMeeting,
    denyStudentFromMeeting,
    admitAllWaitingStudents,
    toggleMeetingStudentMute,
    updateParticipantMeetingState,
    updateHostMeetingState,
    setMeetingScreenSharer,
    toggleAllowStudentScreenShare,
    sendMeetingReaction,
    sendMeetingMessage,
    broadcastMeetingInvite,
    workstoreTargetTab,
    setWorkstoreTargetTab,
  } = useCollege();

  const { showConfirm, showAlert, showToast } = useGoogleDialog();

  const [meetingViewMode, setMeetingViewMode] = useState('speaker'); // 'speaker' | 'gallery'
  const [showHostReactionsMenu, setShowHostReactionsMenu] = useState(false);

  const [activeTab, setActiveTab] = useState(() => {
    if (workstoreTargetTab) return workstoreTargetTab;
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('meeting') || p.get('joinMeeting')) return 'meeting';
    }
    return 'notes';
  });

  useEffect(() => {
    if (workstoreTargetTab) {
      setActiveTab(workstoreTargetTab);
      setWorkstoreTargetTab(null);
    }
  }, [workstoreTargetTab]);

  const [copiedMeetingLink, setCopiedMeetingLink] = useState(false);
  const [broadcastToast, setBroadcastToast] = useState('');
  const [showWaitingRoomModal, setShowWaitingRoomModal] = useState(false);

  // Lab Manager States
  const [labManagerSubView, setLabManagerSubView] = useState('attendance'); // 'attendance' | 'batches' | 'profiles' | 'notes'
  const [labDeptFilter, setLabDeptFilter] = useState('Information Technology (AIML)');

  // 1. Practical Attendance Taking state
  const [practAttForm, setPractAttForm] = useState({
    department: 'Information Technology (AIML)',
    batch: 'Batch A',
    subject: 'Data Structures Lab (DS Lab)',
    date: new Date().toISOString().split('T')[0],
    labRoom: 'Lab 3-B',
    topic: '',
  });
  const [practAttStudentMap, setPractAttStudentMap] = useState({});
  const [selectedPractSession, setSelectedPractSession] = useState(null);

  // 2. Batch Management state
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [batchRangeInput, setBatchRangeInput] = useState({ start: 1, end: 10 });
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [newBatchForm, setNewBatchForm] = useState({
    name: 'Batch D',
    startRoll: 1,
    endRoll: 15,
    department: 'Information Technology (AIML)',
  });

  // 3. Student Practical Attendance Profile state
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState(null);
  const [profileSearchQuery, setProfileSearchQuery] = useState('');

  // 4. Lab Notes state
  const [showUploadLabNote, setShowUploadLabNote] = useState(false);
  const [labNoteAttachment, setLabNoteAttachment] = useState(null);
  const [isAttachingLabNote, setIsAttachingLabNote] = useState(false);
  const labNoteFileInputRef = useRef(null);
  const [labNoteForm, setLabNoteForm] = useState({
    title: '',
    subject: 'Data Structures Lab (DS Lab)',
    department: 'Information Technology (AIML)',
    batch: 'All Batches',
    labRoom: 'Lab 3-B',
    description: '',
  });

  // Upload note modal
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteAttachment, setNoteAttachment] = useState(null);
  const [isAttachingNote, setIsAttachingNote] = useState(false);
  const noteFileInputRef = useRef(null);

  const [noteForm, setNoteForm] = useState({
    title: '',
    subject: 'Data Structures',
    description: '',
    tags: 'Trees, Algorithms',
  });

  // Awareness replies state
  const [replyTextMap, setReplyTextMap] = useState({});

  // Assignment Hub: Department sorting & filtering
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL'); // 'ALL' | 'Information Technology (AIML)' | etc.
  const [sortOrder, setSortOrder] = useState('deadline-asc'); // 'deadline-asc' | 'deadline-desc' | 'title'

  // Assignment Hub: Roster & Attendance Tracking modal
  const [selectedAssignForRoster, setSelectedAssignForRoster] = useState(null);
  const [rosterTab, setRosterTab] = useState('submitted'); // 'submitted' | 'notSubmitted'
  const [rosterSearch, setRosterSearch] = useState('');

  // Create assignment modal & attachment in ANY format
  const [showAddAssign, setShowAddAssign] = useState(false);
  const [assignAttachment, setAssignAttachment] = useState(null);
  const [isAttachingAssignFile, setIsAttachingAssignFile] = useState(false);
  const assignFileInputRef = useRef(null);

  const [assignForm, setAssignForm] = useState({
    title: '',
    subject: 'Data Structures',
    department: 'Information Technology (AIML)',
    deadline: '2026-10-28T23:59',
    allowLateSubmission: true,
    maxMarks: 50,
    description: '',
    rubric: 'Correctness (60%), Complexity (20%), Style (20%)',
  });

  // Helper to cross-reference enrolled students in attendance system against assignment submissions
  const getAssignmentStudentsRoster = (assign, deptFilter = 'ALL') => {
    // Approved students registered in the college attendance system
    const approved = (students || []).filter((s) => s.status === 'APPROVED');

    // Students belonging to this assignment's department
    let eligible = approved;
    if (assign.department && assign.department !== 'All Departments') {
      eligible = approved.filter((s) => s.department === assign.department);
    }

    // If an outer department filter is applied on top:
    if (deptFilter !== 'ALL') {
      eligible = eligible.filter((s) => s.department === deptFilter);
    }

    // Submissions for this assignment
    const submissions = assign.submissions || [];

    // Cross-reference:
    // Submitted: eligible students whose ID or roll number matches a submission
    const submitted = eligible
      .map((stud) => {
        const sub = submissions.find(
          (s) => s.studentId === stud.id || String(s.rollNo).trim() === String(stud.rollNo).trim()
        );
        return sub ? { ...stud, submission: sub, isSubmitted: true } : null;
      })
      .filter(Boolean);

    // Also include any submissions whose student might not be matched above
    submissions.forEach((sub) => {
      if (!submitted.some((s) => s.submission?.studentId === sub.studentId || s.rollNo === sub.rollNo)) {
        if (deptFilter === 'ALL' || sub.department === deptFilter) {
          submitted.push({
            id: sub.studentId,
            name: sub.studentName,
            rollNo: sub.rollNo,
            department: sub.department || assign.department || 'N/A',
            submission: sub,
            isSubmitted: true,
          });
        }
      }
    });

    // Not Submitted: eligible department students who have NOT submitted
    const notSubmitted = eligible.filter((stud) => {
      return !submissions.some(
        (s) => s.studentId === stud.id || String(s.rollNo).trim() === String(stud.rollNo).trim()
      );
    });

    return {
      total: eligible.length,
      submitted,
      notSubmitted,
      submittedCount: submitted.length,
      notSubmittedCount: notSubmitted.length,
    };
  };

  // File upload for assignment problem attachments (ANY format)
  const handleAssignFilePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsAttachingAssignFile(true);
      const att = await readFileAsAttachment(file);
      setAssignAttachment(att);
      if (!assignForm.title.trim()) {
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setAssignForm((prev) => ({
          ...prev,
          title: cleanName.replace(/[-_]/g, ' '),
        }));
      }
    } catch (err) {
      alert(err.message || 'Error attaching assignment file');
    } finally {
      setIsAttachingAssignFile(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAssignFileDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    try {
      setIsAttachingAssignFile(true);
      const att = await readFileAsAttachment(file);
      setAssignAttachment(att);
      if (!assignForm.title.trim()) {
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setAssignForm((prev) => ({
          ...prev,
          title: cleanName.replace(/[-_]/g, ' '),
        }));
      }
    } catch (err) {
      alert(err.message || 'Error attaching assignment file');
    } finally {
      setIsAttachingAssignFile(false);
    }
  };

  // Assignment submission grading state (used in Track Roster modal)
  const [gradingScores, setGradingScores] = useState({});
  const [gradingFeedbacks, setGradingFeedbacks] = useState({});

  // Test Manager States
  const [testDeptFilter, setTestDeptFilter] = useState('ALL');
  const [testTypeFilter, setTestTypeFilter] = useState('ALL');
  const [testSearchQuery, setTestSearchQuery] = useState('');
  const [selectedTestForRoster, setSelectedTestForRoster] = useState(null);
  const [testRosterTab, setTestRosterTab] = useState('submitted'); // 'submitted' | 'pending'
  const [testRosterSearch, setTestRosterSearch] = useState('');
  const [editingTestScores, setEditingTestScores] = useState({});
  const [editingTestFeedbacks, setEditingTestFeedbacks] = useState({});

  // Create Test Modal state
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [newTestForm, setNewTestForm] = useState({
    title: '',
    subject: '',
    department: 'Information Technology (AIML)',
    type: 'mcq',
    durationMins: 20,
    totalMarks: 20,
    passingMarks: 10,
    deadline: '',
    questions: [
      {
        id: 'q1',
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
      },
    ],
    problemTitle: '',
    problemDifficulty: 'Medium',
    problemDesc: '',
    starterCode: '',
    passage: '',
  });

  const getGradeDetails = (score, total) => {
    const s = Number(score);
    const t = Number(total);
    if (isNaN(s) || isNaN(t) || t <= 0) {
      return { grade: 'N/A', label: 'Unscored', pct: 0, color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
    const pct = Math.round((s / t) * 100);
    if (pct >= 90) return { grade: 'O', label: 'Outstanding (90%+)', pct, color: 'text-purple-300 bg-purple-500/20 border-purple-500/30' };
    if (pct >= 80) return { grade: 'A+', label: 'Distinction (80-89%)', pct, color: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30' };
    if (pct >= 70) return { grade: 'A', label: 'First Class (70-79%)', pct, color: 'text-teal-300 bg-teal-500/20 border-teal-500/30' };
    if (pct >= 60) return { grade: 'B+', label: 'Higher Second (60-69%)', pct, color: 'text-blue-300 bg-blue-500/20 border-blue-500/30' };
    if (pct >= 50) return { grade: 'B', label: 'Pass Class (50-59%)', pct, color: 'text-amber-300 bg-amber-500/20 border-amber-500/30' };
    return { grade: 'F', label: 'Fail / Needs Improvement (<50%)', pct, color: 'text-rose-300 bg-rose-500/20 border-rose-500/30' };
  };

  const getTestStats = (test) => {
    if (!test) return { deptStudents: [], submitted: [], pending: [], rate: 0, avg: 0, top: 0 };
    const deptStudents = (students || []).filter(
      (s) => s.status === 'APPROVED' && (test.department === 'ALL' || !test.department || s.department === test.department)
    );
    const submitted = deptStudents.filter((s) => Boolean(test.studentResults?.[s.id]));
    const pending = deptStudents.filter((s) => !test.studentResults?.[s.id]);
    const rate = deptStudents.length > 0 ? Math.round((submitted.length / deptStudents.length) * 100) : 0;

    const scores = submitted.map((s) => Number(test.studentResults[s.id].score) || 0);
    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;
    const top = scores.length > 0 ? Math.max(...scores) : 0;

    return {
      deptStudents,
      submitted,
      pending,
      rate,
      avg,
      top,
    };
  };

  const handlePublishTest = (e) => {
    e.preventDefault();
    if (!newTestForm.title.trim() || !newTestForm.subject.trim()) {
      alert('Please provide a test title and course subject.');
      return;
    }

    let payload = {
      title: newTestForm.title.trim(),
      subject: newTestForm.subject.trim(),
      department: newTestForm.department,
      type: newTestForm.type,
      durationMins: Number(newTestForm.durationMins) || 20,
      totalMarks: Number(newTestForm.totalMarks) || 20,
      passingMarks: Number(newTestForm.passingMarks) || 10,
      deadline: newTestForm.deadline || '',
    };

    if (newTestForm.type === 'mcq') {
      const validQuestions = (newTestForm.questions || []).filter((q) => q.question.trim());
      if (validQuestions.length === 0) {
        alert('Please add at least one question for the MCQ quiz.');
        return;
      }
      payload.questions = validQuestions;
    } else if (newTestForm.type === 'coding') {
      payload.problems = [
        {
          id: `p-${Date.now()}`,
          title: newTestForm.problemTitle || newTestForm.title,
          difficulty: newTestForm.problemDifficulty || 'Medium',
          description: newTestForm.problemDesc || 'Implement the required algorithm.',
          starterCode: newTestForm.starterCode || '# Write your code here\n',
        },
      ];
    } else if (newTestForm.type === 'typing') {
      payload.passage = newTestForm.passage || 'Data structures and algorithms form the backbone of modern computing systems.';
    }

    createTest(payload);
    setShowCreateTestModal(false);
    setNewTestForm({
      title: '',
      subject: '',
      department: 'Information Technology (AIML)',
      type: 'mcq',
      durationMins: 20,
      totalMarks: 20,
      passingMarks: 10,
      deadline: '',
      questions: [
        {
          id: 'q1',
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0,
          explanation: '',
        },
      ],
      problemTitle: '',
      problemDifficulty: 'Medium',
      problemDesc: '',
      starterCode: '',
      passage: '',
    });
    alert(`Assessment "${payload.title}" created successfully for ${payload.department}!`);
  };

  const handleUpdateStudentScore = (testId, studentId) => {
    const newScore = editingTestScores[studentId];
    const newFeedback = editingTestFeedbacks[studentId];
    if (newScore === undefined || newScore === '') {
      alert('Please enter a valid numeric score.');
      return;
    }
    updateTestScore(testId, studentId, {
      score: newScore,
      feedback: newFeedback,
    });
    alert('Student test score and grade updated successfully!');
  };

  // Meeting host controls & WebRTC MediaStream states
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [allMuted, setAllMuted] = useState(false);
  const [roomLocked, setRoomLocked] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [mediaError, setMediaError] = useState(null);
  const [meetingTargetDept, setMeetingTargetDept] = useState('Information Technology (AIML)');
  const [meetingSideTab, setMeetingSideTab] = useState('roster'); // 'roster' | 'chat'
  const [meetingDuration, setMeetingDuration] = useState(1455); // 24m 15s
  const [meetingMessages, setMeetingMessages] = useState([
    { id: 1, sender: 'Prof. Divya C', text: 'Welcome everyone! Today we cover AVL Tree rotations and height balancing.', time: '10:02 AM', isTeacher: true },
    { id: 2, sender: 'Aarav Sharma (Roll 15)', text: 'Good morning Ma\'am! Audio and video are crystal clear.', time: '10:03 AM', isTeacher: false },
    { id: 3, sender: 'Kabir Mehta (Roll 08)', text: 'Please show the double rotation diagram once more.', time: '10:05 AM', isTeacher: false },
  ]);
  const [newChatMsg, setNewChatMsg] = useState('');
  const [mutedStudents, setMutedStudents] = useState({});

  const cameraVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const pipCameraRef = useRef(null);

  // Start / Stop Real Webcam (WebRTC)
  const startCamera = async () => {
    try {
      setMediaError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam media API is not supported in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: isMicOn,
      });
      setCameraStream(stream);
      setIsVideoOn(true);
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
      if (pipCameraRef.current) {
        pipCameraRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access issue:', err);
      setMediaError('Could not access real webcam. Enabling virtual presenter camera mode.');
      setIsVideoOn(true);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsVideoOn(false);
  };

  const toggleCamera = () => {
    if (isVideoOn && cameraStream) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Start / Stop Real Screen Sharing (Zoom-style)
  const startScreenShare = async () => {
    try {
      setMediaError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen sharing is not supported by your browser.');
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: true,
      });

      setScreenStream(stream);
      setIsScreenSharing(true);

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }

      // Automatically handle when user clicks "Stop Sharing" on browser's native bar
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          stopScreenShare();
        };
      }
    } catch (err) {
      console.warn('Screen share cancelled/failed:', err);
      if (err.name !== 'NotAllowedError') {
        setMediaError('Screen sharing was cancelled or unavailable.');
      }
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
    setIsScreenSharing(false);
  };

  const toggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  // Toggle Microphone (Real WebRTC audio track enable/disable)
  const toggleMic = () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    if (cameraStream) {
      cameraStream.getAudioTracks().forEach((t) => {
        t.enabled = nextState;
      });
    }
  };

  // Connect video streams to video elements whenever refs or streams change
  useEffect(() => {
    if (cameraVideoRef.current && cameraStream) {
      cameraVideoRef.current.srcObject = cameraStream;
    }
    if (pipCameraRef.current && cameraStream) {
      pipCameraRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, isScreenSharing, isVideoOn]);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream, isScreenSharing]);

  // Clean up media streams if leaving the meeting tab
  useEffect(() => {
    if (activeTab !== 'meeting') {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
        setCameraStream(null);
        setIsVideoOn(false);
      }
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
        setScreenStream(null);
        setIsScreenSharing(false);
      }
    }
  }, [activeTab]);

  // Meeting timer
  useEffect(() => {
    let timer = null;
    if (activeTab === 'meeting') {
      timer = setInterval(() => {
        setMeetingDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTab]);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSendMeetingChat = (e) => {
    e.preventDefault();
    if (!newChatMsg.trim()) return;
    const text = newChatMsg.trim();
    if (sendMeetingMessage) {
      sendMeetingMessage({
        senderId: currentUser?.id,
        senderName: currentUser?.name || 'Prof. Divya C',
        text,
        isTeacher: true,
      });
    }
    const msg = {
      id: Date.now(),
      sender: currentUser?.name || 'Prof. Divya C',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isTeacher: true,
    };
    setMeetingMessages((prev) => [...prev, msg]);
    setNewChatMsg('');
  };

  const handleNoteFilePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsAttachingNote(true);
      const att = await readFileAsAttachment(file);
      setNoteAttachment(att);
      // Auto-populate note title if empty
      if (!noteForm.title.trim()) {
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setNoteForm((prev) => ({
          ...prev,
          title: cleanName.replace(/[-_]/g, ' '),
        }));
      }
    } catch (err) {
      alert(err.message || 'Error attaching note file');
    } finally {
      setIsAttachingNote(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleNoteFileDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    try {
      setIsAttachingNote(true);
      const att = await readFileAsAttachment(file);
      setNoteAttachment(att);
      if (!noteForm.title.trim()) {
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setNoteForm((prev) => ({
          ...prev,
          title: cleanName.replace(/[-_]/g, ' '),
        }));
      }
    } catch (err) {
      alert(err.message || 'Error attaching note file');
    } finally {
      setIsAttachingNote(false);
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteForm.title.trim()) return;
    addNote({
      ...noteForm,
      attachment: noteAttachment,
      tags: noteForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setNoteForm({ title: '', subject: 'Data Structures', description: '', tags: '' });
    setNoteAttachment(null);
    setShowAddNote(false);
  };

  const handleReplyAwareness = (msgId) => {
    const text = replyTextMap[msgId];
    if (!text || !text.trim()) {
      alert('Please enter a response message.');
      return;
    }
    replyAwarenessMessage(msgId, text.trim());
    setReplyTextMap((prev) => ({ ...prev, [msgId]: '' }));
  };

  const handleAddAssign = (e) => {
    e.preventDefault();
    if (!assignForm.title.trim()) return;
    createAssignment({
      ...assignForm,
      attachment: assignAttachment,
    });
    setAssignForm({
      title: '',
      subject: 'Data Structures',
      department: 'Information Technology (AIML)',
      deadline: '2026-10-28T23:59',
      allowLateSubmission: true,
      maxMarks: 50,
      description: '',
      rubric: 'Correctness (60%), Complexity (20%), Style (20%)',
    });
    setAssignAttachment(null);
    setShowAddAssign(false);
  };

  const handleGradeSubmit = (assignId, studentId) => {
    const score = gradingScores[studentId];
    const feedback = gradingFeedbacks[studentId] || 'Good effort!';
    if (score === undefined || score === '') {
      alert('Please enter a numerical score.');
      return;
    }
    gradeAssignment(assignId, studentId, score, feedback);
    alert('Student submission graded successfully! Updated on student portal.');
  };

  // Lab Manager Handlers
  const handleLabNoteFilePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsAttachingLabNote(true);
      const att = await readFileAsAttachment(file);
      setLabNoteAttachment(att);
      if (!labNoteForm.title.trim()) {
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setLabNoteForm((prev) => ({
          ...prev,
          title: cleanName.replace(/[-_]/g, ' '),
        }));
      }
    } catch (err) {
      alert(err.message || 'Error reading lab note file');
    } finally {
      setIsAttachingLabNote(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleLabNoteFileDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    try {
      setIsAttachingLabNote(true);
      const att = await readFileAsAttachment(file);
      setLabNoteAttachment(att);
      if (!labNoteForm.title.trim()) {
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setLabNoteForm((prev) => ({
          ...prev,
          title: cleanName.replace(/[-_]/g, ' '),
        }));
      }
    } catch (err) {
      alert(err.message || 'Error reading lab note file');
    } finally {
      setIsAttachingLabNote(false);
    }
  };

  const handleUploadLabNoteSubmit = (e) => {
    e.preventDefault();
    if (!labNoteForm.title.trim()) return;
    addLabNote({
      ...labNoteForm,
      attachment: labNoteAttachment,
    });
    setLabNoteForm({
      title: '',
      subject: 'Data Structures Lab (DS Lab)',
      department: labDeptFilter === 'ALL' ? 'Information Technology (AIML)' : labDeptFilter,
      batch: 'All Batches',
      labRoom: 'Lab 3-B',
      description: '',
    });
    setLabNoteAttachment(null);
    setShowUploadLabNote(false);
    alert('Practical lab notes uploaded successfully!');
  };

  const handleSavePracticalAttendance = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const batchStudents = (students || []).filter(
      (s) =>
        s.status === 'APPROVED' &&
        s.department === practAttForm.department &&
        s.batch === practAttForm.batch
    );

    if (batchStudents.length === 0) {
      alert(`No students found in ${practAttForm.batch} (${practAttForm.department}) to record attendance.`);
      return;
    }

    const finalMap = {};
    batchStudents.forEach((stud) => {
      finalMap[stud.rollNo] = practAttStudentMap[stud.rollNo] !== false;
    });

    const presCount = Object.values(finalMap).filter(Boolean).length;
    const absCount = batchStudents.length - presCount;

    recordPracticalAttendance({
      department: practAttForm.department,
      batch: practAttForm.batch,
      subject: practAttForm.subject,
      date: practAttForm.date,
      labRoom: practAttForm.labRoom,
      topic: practAttForm.topic || 'Practical Lab Session',
      attendanceMap: finalMap,
    });

    alert(`Practical attendance for ${practAttForm.batch} (${practAttForm.subject}) on ${practAttForm.date} saved successfully!\nPresent: ${presCount} | Absent: ${absCount}`);
  };

  const handleApplyBatchRange = (dept, batch, startVal, endVal) => {
    const start = Number(startVal);
    const end = Number(endVal);
    if (isNaN(start) || isNaN(end) || start > end) {
      alert('Please enter a valid numeric roll number range (Start <= End).');
      return;
    }
    updateDepartmentBatchRange(dept, batch.id, {
      name: batch.name,
      startRoll: start,
      endRoll: end,
    });
    setEditingBatchId(null);
    alert(`✅ Batch ${batch.name} updated: Roll numbers ${start} to ${end} in ${dept} have been dynamically assigned!`);
  };

  const handleCreateNewBatch = (e) => {
    e.preventDefault();
    if (!newBatchForm.name.trim()) return;
    createDepartmentBatch(newBatchForm.department, {
      name: newBatchForm.name.trim(),
      startRoll: Number(newBatchForm.startRoll),
      endRoll: Number(newBatchForm.endRoll),
    });
    setShowAddBatchModal(false);
    alert(`✅ ${newBatchForm.name} created for ${newBatchForm.department}! Students in Roll range ${newBatchForm.startRoll} to ${newBatchForm.endRoll} assigned dynamically.`);
  };

  const getStudentsInRollRange = (dept, startRoll, endRoll) => {
    const s = Number(startRoll);
    const e = Number(endRoll);
    if (isNaN(s) || isNaN(e)) return [];
    return (students || [])
      .filter((stud) => stud.department === dept && stud.status === 'APPROVED')
      .filter((stud) => {
        const r = Number(stud.rollNo);
        return !isNaN(r) && r >= s && r <= e;
      });
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Bar */}
      <div className="bg-slate-900/90 rounded-2xl p-2 border border-slate-800 flex flex-wrap items-center gap-1.5 shadow-lg">
        {[
          { id: 'notes', label: '1. Note Management', icon: FileText, count: notes.length },
          { id: 'assignments', label: '2. Assignment Hub', icon: Upload, count: assignments.length },
          { id: 'lab', label: '3. Lab Manager', icon: FlaskConical, badge: 'Practicals' },
          { id: 'tests', label: '4. Test Manager', icon: Code, count: tests.length },
          { id: 'meeting', label: '5. Host Online Class', icon: Video, badge: 'Host Powers' },
          { id: 'awareness', label: '6. Student Reminder Awareness', icon: Bell, count: awarenessMessages.filter((m) => m.status === 'UNSEEN').length, badge: 'Alerts' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-500/30">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. NOTES MANAGEMENT */}
      {activeTab === 'notes' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Lecture Study Notes Repository
              </h3>
              <p className="text-xs text-slate-400">
                Upload handouts, Word docs, Excel spreadsheets, PowerPoint presentations, and PDFs for students to download.
              </p>
            </div>

            <button
              onClick={() => setShowAddNote(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Upload New Note
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between hover:bg-slate-800/70 transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                      {note.subject}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{note.fileSize}</span>
                  </div>

                  <h4 className="text-base font-bold text-white leading-snug">{note.title}</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{note.description}</p>

                  {/* Attached File Pill */}
                  {(note.attachment?.name || note.fileName) && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${getFileBadgeColor(
                          note.attachment?.name || note.fileName || ''
                        )}`}
                      >
                        <Paperclip className="w-2.5 h-2.5" />
                        <span className="truncate max-w-[150px]">
                          {note.attachment?.name || note.fileName}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Published: {note.date}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        downloadAttachment(
                          note.attachment || {
                            name: note.fileName || `${note.title.replace(/\s+/g, '_')}.pdf`,
                            size: note.fileSize,
                            type: note.fileType || 'application/pdf',
                          }
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-[11px] font-semibold flex items-center gap-1 transition"
                      title="Download or preview note file"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-700/50 transition"
                      title="Remove note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Note Modal */}
          {showAddNote && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-purple-400" />
                      Upload Lecture Study Material
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Upload Word, Excel, PowerPoint, PDF, code, or slides for your students.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddNote(false);
                      setNoteAttachment(null);
                    }}
                    className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddNote} className="mt-4 space-y-4">
                  {/* File Upload Dropzone */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-purple-400" />
                        Attach File (Word, Excel, PPT, PDF, etc.)
                      </span>
                      <span className="text-[10px] text-purple-300 font-semibold">Recommended</span>
                    </label>

                    <input
                      type="file"
                      ref={noteFileInputRef}
                      onChange={handleNoteFilePick}
                      className="hidden"
                    />

                    {noteAttachment ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-purple-500/50 shadow-inner">
                        <div className="flex items-center gap-2 truncate">
                          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-white truncate">{noteAttachment.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {noteAttachment.size} • Ready to publish
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNoteAttachment(null)}
                          className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => noteFileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleNoteFileDrop}
                        className="border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-500/5 hover:bg-purple-500/10 rounded-xl p-3.5 text-center cursor-pointer transition"
                      >
                        <Upload className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                        <p className="text-xs font-bold text-white">
                          {isAttachingNote ? 'Attaching file...' : 'Click to Browse or Drag & Drop File'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Word (.docx, .doc), Excel (.xlsx, .xls), PowerPoint (.pptx, .ppt), PDF, Code, Images
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Note Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Unit 3: Graph Traversal & Shortest Path"
                      value={noteForm.title}
                      onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Subject
                      </label>
                      <select
                        value={noteForm.subject}
                        onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="Data Structures">Data Structures</option>
                        <option value="Relational DBMS">Relational DBMS</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Python Programming">Python Programming</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="Graphs, BFS, Dijkstra"
                        value={noteForm.tags}
                        onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Note Summary / Description
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Summary of lecture notes, key formulas, or slide topics..."
                      value={noteForm.description}
                      onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddNote(false);
                        setNoteAttachment(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg"
                    >
                      Publish Note
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. ASSIGNMENT HUB */}
      {activeTab === 'assignments' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
          {/* Header & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-400" />
                Assignment & Project Management
              </h3>
              <p className="text-xs text-slate-400">
                Upload assignment files in any format, configure cutoff deadlines, and track department turn-in rosters.
              </p>
            </div>

            <button
              onClick={() => setShowAddAssign(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Create Assignment
            </button>
          </div>

          {/* Department Sorting & Filtering Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-purple-400" />
                Department Filter:
              </span>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="bg-slate-900 border border-purple-500/40 rounded-xl px-3 py-1.5 text-xs text-purple-200 font-semibold focus:outline-none focus:border-purple-400"
              >
                <option value="ALL">All Departments (Show All)</option>
                <option value="Information Technology (AIML)">Information Technology (AIML)</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Data Science & Analytics">Data Science & Analytics</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Sort:
              </span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="deadline-asc">Deadline (Earliest First)</option>
                <option value="deadline-desc">Deadline (Latest First)</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Assignment Cards List */}
          <div className="space-y-4 pt-1">
            {assignments
              .filter((assign) => {
                if (selectedDeptFilter === 'ALL') return true;
                return assign.department === selectedDeptFilter || assign.department === 'All Departments';
              })
              .sort((a, b) => {
                if (sortOrder === 'deadline-asc') {
                  return new Date(a.deadline) - new Date(b.deadline);
                }
                if (sortOrder === 'deadline-desc') {
                  return new Date(b.deadline) - new Date(a.deadline);
                }
                return a.title.localeCompare(b.title);
              })
              .map((assign) => {
                const roster = getAssignmentStudentsRoster(assign, selectedDeptFilter);
                const isPastDeadline = assign.deadline ? new Date(assign.deadline) < new Date() : false;
                const turninPercent = roster.total > 0 ? Math.round((roster.submittedCount / roster.total) * 100) : 0;

                return (
                  <div
                    key={assign.id}
                    className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition flex flex-col gap-4 shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Assignment Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                            {assign.subject}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-xs border border-indigo-500/30 flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {assign.department || 'Information Technology (AIML)'}
                          </span>
                          {assign.allowLateSubmission ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                              Late Turn-in Allowed
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 text-[10px] font-semibold border border-rose-500/30">
                              Strict Cutoff
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-white">{assign.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{assign.description}</p>
                        <p className="text-[11px] text-slate-400">
                          <span className="text-slate-300 font-semibold">Rubric:</span> {assign.rubric}
                        </p>

                        {/* Teacher's Attached Assignment Question File */}
                        {assign.attachment && (
                          <div className="pt-2 flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-medium">Assignment Brief:</span>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-purple-500/30 text-xs">
                              <Paperclip className="w-3.5 h-3.5 text-purple-400" />
                              <span className="font-mono text-purple-200 font-medium truncate max-w-[220px]">
                                {assign.attachment.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({assign.attachment.size})
                              </span>
                              <button
                                type="button"
                                onClick={() => downloadAttachment(assign.attachment)}
                                className="p-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white transition"
                                title="Download Problem Sheet"
                              >
                                <Download className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Counters & Roster Actions */}
                      <div className="md:w-80 shrink-0 flex flex-col justify-between items-start md:items-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700/60">
                        <div className="text-left md:text-right">
                          <div className="text-xs font-mono text-slate-400">
                            Deadline:{' '}
                            {assign.deadline
                              ? new Date(assign.deadline).toLocaleString([], {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })
                              : 'No deadline'}
                          </div>
                          {isPastDeadline ? (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Deadline Expired
                            </span>
                          ) : (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Active
                            </span>
                          )}
                        </div>

                        {/* Dynamic Live Turn-in Counters */}
                        <div className="w-full bg-slate-900/90 rounded-2xl p-3 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="flex items-center gap-1.5 text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Submitted: {roster.submittedCount}
                            </span>
                            <span className="flex items-center gap-1.5 text-rose-400">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                              Not Submitted: {roster.notSubmittedCount}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full transition-all duration-300"
                              style={{ width: `${turninPercent}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>{turninPercent}% submitted</span>
                            <span>{roster.total} roster students</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2 w-full justify-start md:justify-end">
                          <button
                            onClick={() => {
                              setSelectedAssignForRoster(assign);
                              setRosterTab('submitted');
                              setRosterSearch('');
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-semibold transition border border-purple-500/40 flex items-center gap-1.5 shadow-sm"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Track Submissions & Roster</span>
                          </button>
                          <button
                            onClick={() => {
                              showConfirm({
                                title: 'Delete Assignment?',
                                message: `Are you sure you want to delete assignment "${assign.title}"? This cannot be undone.`,
                                confirmText: 'Delete Assignment',
                                cancelText: 'Cancel',
                                type: 'danger',
                                onConfirm: () => {
                                  deleteAssignment(assign.id);
                                  showAlert(`Assignment "${assign.title}" deleted`, 'info');
                                },
                              });
                            }}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                            title="Delete Assignment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* SUBMISSION ROSTER BREAKDOWN MODAL */}
          {selectedAssignForRoster && (() => {
            const roster = getAssignmentStudentsRoster(selectedAssignForRoster, selectedDeptFilter);
            const filteredSubmitted = roster.submitted.filter(
              (s) =>
                !rosterSearch.trim() ||
                s.name?.toLowerCase().includes(rosterSearch.toLowerCase()) ||
                String(s.rollNo).includes(rosterSearch)
            );
            const filteredNotSubmitted = roster.notSubmitted.filter(
              (s) =>
                !rosterSearch.trim() ||
                s.name?.toLowerCase().includes(rosterSearch.toLowerCase()) ||
                String(s.rollNo).includes(rosterSearch)
            );

            return (
              <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
                  {/* Modal Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                          {selectedAssignForRoster.subject}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-xs border border-indigo-500/30">
                          {selectedAssignForRoster.department}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {selectedAssignForRoster.title}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Attendance Register & Assignment Turn-In Tracking System
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedAssignForRoster(null)}
                      className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Badges & Search Toolbar */}
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRosterTab('submitted')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          rosterTab === 'submitted'
                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submitted ({roster.submittedCount})</span>
                      </button>

                      <button
                        onClick={() => setRosterTab('notSubmitted')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          rosterTab === 'notSubmitted'
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Not Submitted ({roster.notSubmittedCount})</span>
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search student or roll..."
                        value={rosterSearch}
                        onChange={(e) => setRosterSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 w-full sm:w-56"
                      />
                    </div>
                  </div>

                  {/* Roster List Content */}
                  <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
                    {rosterTab === 'submitted' ? (
                      filteredSubmitted.length > 0 ? (
                        filteredSubmitted.map((item) => {
                          const sub = item.submission;
                          return (
                            <div
                              key={item.id || sub?.studentId}
                              className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                                  {item.rollNo}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-xs">{item.name}</span>
                                    <span className="text-[10px] font-mono text-purple-400">Roll #{item.rollNo}</span>
                                    {sub?.isLate ? (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        LATE SUBMISSION
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        ON TIME
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    Solution file: <span className="font-mono text-slate-300">{sub?.file || 'submission_file'}</span>
                                    {sub?.submittedAt && ` • ${new Date(sub.submittedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                {(sub?.attachment || sub?.file) && (
                                  <button
                                    type="button"
                                    onClick={() => downloadAttachment(sub.attachment || { name: sub.file })}
                                    className="px-2.5 py-1 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                                    title="Download student solution"
                                  >
                                    <Download className="w-3.5 h-3.5 text-purple-400" />
                                    <span>Download</span>
                                  </button>
                                )}
                                {sub?.graded ? (
                                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Verified</span>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleGradeSubmit(selectedAssignForRoster.id, sub.studentId)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Mark Verified</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-slate-400 text-xs">
                          No submissions recorded yet for this selection.
                        </div>
                      )
                    ) : (
                      filteredNotSubmitted.length > 0 ? (
                        <div className="space-y-2">
                          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                            ⚠️ The following {filteredNotSubmitted.length} students are registered in the Attendance Register for <strong>{selectedAssignForRoster.department}</strong> but have not submitted this assignment.
                          </div>
                          {filteredNotSubmitted.map((student) => (
                            <div
                              key={student.id}
                              className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs border border-rose-500/30">
                                  {student.rollNo}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-xs">{student.name}</span>
                                    <span className="text-[10px] font-mono text-purple-400">Roll #{student.rollNo}</span>
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                      NOT SUBMITTED
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    {student.department} • Batch {student.batch || 'A'} • {student.email}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                                  Pending Turn-in
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-emerald-400 text-xs font-semibold">
                          🎉 Excellent! All enrolled students in this department have submitted their work!
                        </div>
                      )
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => setSelectedAssignForRoster(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                    >
                      Close Roster
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* CREATE ASSIGNMENT MODAL */}
          {showAddAssign && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-purple-400" />
                  Publish New Assignment
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Upload assignment files in any format, set submission cutoffs and late turn-in policies.
                </p>

                <form onSubmit={handleAddAssign} className="mt-4 space-y-4">
                  {/* File Upload Dropzone (Any Format) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Assignment Brief / Problem File (Any Format: Word, Excel, PPT, PDF, Zip, Code)
                    </label>

                    <input
                      type="file"
                      ref={assignFileInputRef}
                      onChange={handleAssignFilePick}
                      className="hidden"
                    />

                    {assignAttachment ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-purple-500/40">
                        <div className="flex items-center gap-2 truncate">
                          <Paperclip className="w-4 h-4 text-purple-400 shrink-0" />
                          <span className="text-white text-xs font-medium truncate">
                            {assignAttachment.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({assignAttachment.size})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAssignAttachment(null)}
                          className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => assignFileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleAssignFileDrop}
                        className="border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-500/5 hover:bg-purple-500/10 rounded-xl p-3.5 text-center cursor-pointer transition"
                      >
                        <Upload className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                        <p className="text-xs font-bold text-white">
                          {isAttachingAssignFile ? 'Reading file...' : 'Click to Browse or Drag & Drop File'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Word (.docx, .doc), Excel (.xlsx, .xls), PPT (.pptx), PDF, Zip, Python, C++, etc.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Assignment Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Assignment 4: Binary Trees & Traversals"
                      value={assignForm.title}
                      onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Department
                      </label>
                      <select
                        value={assignForm.department}
                        onChange={(e) => setAssignForm({ ...assignForm, department: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="Information Technology (AIML)">Information Technology (AIML)</option>
                        <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                        <option value="Data Science & Analytics">Data Science & Analytics</option>
                        <option value="All Departments">All Departments</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        required
                        value={assignForm.subject}
                        onChange={(e) => setAssignForm({ ...assignForm, subject: e.target.value })}
                        placeholder="e.g. Data Structures"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Submission Deadline
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={assignForm.deadline}
                      onChange={(e) => setAssignForm({ ...assignForm, deadline: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Late Submission Toggle */}
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignForm.allowLateSubmission}
                        onChange={(e) =>
                          setAssignForm({ ...assignForm, allowLateSubmission: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700"
                      />
                      <span className="text-xs font-bold text-white">
                        Allow Submissions After Deadline
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-400 pl-6">
                      {assignForm.allowLateSubmission
                        ? 'Students can still submit their work after the deadline. Late uploads will be clearly flagged with a "LATE SUBMISSION" tag.'
                        : 'Strict Cutoff: The submission portal will lock automatically when the deadline expires.'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Problem Instructions & Rubrics
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Detailed instructions for student solutions..."
                      value={assignForm.description}
                      onChange={(e) => setAssignForm({ ...assignForm, description: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Grading Rubric
                    </label>
                    <input
                      type="text"
                      value={assignForm.rubric}
                      onChange={(e) => setAssignForm({ ...assignForm, rubric: e.target.value })}
                      placeholder="e.g. Correctness (60%), Complexity (20%), Style (20%)"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddAssign(false);
                        setAssignAttachment(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg"
                    >
                      Publish Assignment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. LAB MANAGER (Practical Session Attendance, Dynamic Batch Roll Ranges, Individual Student Profiles, Lab Manuals) */}
      {activeTab === 'lab' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
          {/* Main Lab Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm">
                <FlaskConical className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Lab & Practical Session Manager
                </h3>
                <p className="text-xs text-slate-400">
                  Manage practical session attendance with live tick/untick roster, dynamic batch roll ranges, student profiles & lab manuals.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setLabManagerSubView('attendance');
                }}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-600/30"
              >
                <CheckSquare className="w-4 h-4" /> Take Practical Attendance
              </button>

              <button
                onClick={() => {
                  setLabNoteForm((prev) => ({
                    ...prev,
                    department:
                      labDeptFilter === 'ALL' ? 'Information Technology (AIML)' : labDeptFilter,
                  }));
                  setShowUploadLabNote(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-purple-500/30 shadow-sm"
              >
                <Upload className="w-4 h-4 text-purple-400" /> Upload Lab Notes
              </button>
            </div>
          </div>

          {/* Department Filter & Sub-View Pills */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            {/* Department Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-purple-400" />
                Department:
              </span>
              <select
                value={labDeptFilter}
                onChange={(e) => {
                  const newDept = e.target.value;
                  setLabDeptFilter(newDept);
                  if (newDept !== 'ALL') {
                    const avail = departmentBatches?.[newDept] || [];
                    const newBatch = avail[0]?.name || 'Batch A';
                    setPractAttForm((prev) => ({
                      ...prev,
                      department: newDept,
                      batch: newBatch,
                    }));
                  }
                }}
                className="bg-slate-900 border border-purple-500/40 rounded-xl px-3 py-1.5 text-xs text-purple-200 font-semibold focus:outline-none focus:border-purple-400"
              >
                <option value="ALL">All Departments</option>
                <option value="Information Technology (AIML)">Information Technology (AIML)</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Data Science & Analytics">Data Science & Analytics</option>
              </select>
            </div>

            {/* Sub-View Navigation Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              {[
                { id: 'attendance', label: '✓ Take Practical Attendance' },
                { id: 'batches', label: '🏷️ Batch Management (Roll Range)' },
                { id: 'profiles', label: '👤 Student Attendance Profiles' },
                { id: 'notes', label: '📑 Lab Notes Upload' },
              ].map((sub) => {
                const isCurrent = labManagerSubView === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setLabManagerSubView(sub.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isCurrent
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================
              SUB-VIEW 1: LIVE ON-PAGE PRACTICAL ATTENDANCE TAKER & SESSIONS LOG
              ======================================================== */}
          {labManagerSubView === 'attendance' && (() => {
            const currentBatchStudents = (students || [])
              .filter(
                (s) =>
                  s.status === 'APPROVED' &&
                  s.department === practAttForm.department &&
                  s.batch === practAttForm.batch
              )
              .sort((a, b) => {
                const numA = parseInt(a.rollNo, 10);
                const numB = parseInt(b.rollNo, 10);
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                return (a.rollNo || '').localeCompare(b.rollNo || '');
              });

            const presentCount = currentBatchStudents.filter(
              (s) => practAttStudentMap[s.rollNo] !== false
            ).length;
            const absentCount = currentBatchStudents.length - presentCount;
            const attendancePct = currentBatchStudents.length > 0
              ? Math.round((presentCount / currentBatchStudents.length) * 100)
              : 0;

            return (
              <div className="space-y-6 pt-1">
                {/* 1. ON-PAGE LIVE ATTENDANCE TAKER CARD */}
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-800/60 border border-purple-500/40 shadow-2xl space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-700/60 gap-3">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-purple-400" />
                        Take Practical Attendance (Tick / Untick Roster)
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Select Department & Batch to view students sorted by Roll Number. Tick to mark Present, untick for Absent.
                      </p>
                    </div>

                    {/* Live Counter Badges */}
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Present: {presentCount} / {currentBatchStudents.length} ({attendancePct}%)
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        Absent: {absentCount}
                      </span>
                    </div>
                  </div>

                  {/* Department & Batch Selector Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-purple-400" />
                        Select Department:
                      </label>
                      <select
                        value={practAttForm.department}
                        onChange={(e) => {
                          const newDept = e.target.value;
                          const avail = departmentBatches?.[newDept] || [];
                          const newBatch = avail[0]?.name || 'Batch A';
                          setPractAttForm((prev) => ({ ...prev, department: newDept, batch: newBatch }));
                          setLabDeptFilter(newDept);
                        }}
                        className="w-full bg-slate-800 border border-purple-500/40 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-purple-400"
                      >
                        <option value="Information Technology (AIML)">Information Technology (AIML)</option>
                        <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                        <option value="Data Science & Analytics">Data Science & Analytics</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        Select Practical Batch:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(departmentBatches?.[practAttForm.department] || [
                          { id: '1', name: 'Batch A', startRoll: 1, endRoll: 10 },
                          { id: '2', name: 'Batch B', startRoll: 11, endRoll: 20 },
                          { id: '3', name: 'Batch C', startRoll: 21, endRoll: 30 },
                        ]).map((b) => {
                          const isSelected = practAttForm.batch === b.name;
                          return (
                            <button
                              key={b.id || b.name}
                              type="button"
                              onClick={() => {
                                setPractAttForm((prev) => ({ ...prev, batch: b.name }));
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 ring-2 ring-purple-400'
                                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
                              }`}
                            >
                              <span>{b.name}</span>
                              <span className="text-[10px] opacity-80 font-mono">
                                (Roll {b.startRoll}-{b.endRoll})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Session Details Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Lab Subject</label>
                      <input
                        type="text"
                        value={practAttForm.subject}
                        onChange={(e) => setPractAttForm((prev) => ({ ...prev, subject: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                        placeholder="e.g. Data Structures Lab"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Session Date</label>
                      <input
                        type="date"
                        value={practAttForm.date}
                        onChange={(e) => setPractAttForm((prev) => ({ ...prev, date: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Lab Room / Venue</label>
                      <input
                        type="text"
                        value={practAttForm.labRoom}
                        onChange={(e) => setPractAttForm((prev) => ({ ...prev, labRoom: e.target.value }))}
                        placeholder="e.g. Lab 3-B"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Practical Experiment / Topic</label>
                      <input
                        type="text"
                        value={practAttForm.topic}
                        onChange={(e) => setPractAttForm((prev) => ({ ...prev, topic: e.target.value }))}
                        placeholder="e.g. Exp 4: AVL Trees & Rotations"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Interactive Student Attendance Roster (Tick / Untick Table) */}
                  <div className="pt-3 border-t border-slate-700/60 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          Enrolled Roster: <span className="text-purple-300">{practAttForm.batch}</span> ({currentBatchStudents.length} Students)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          • Sorted numerically by Roll Number
                        </span>
                      </div>

                      {/* Bulk Tick / Untick Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const m = { ...practAttStudentMap };
                            currentBatchStudents.forEach((s) => {
                              m[s.rollNo] = true;
                            });
                            setPractAttStudentMap(m);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 transition shadow-sm"
                        >
                          <CheckSquare className="w-4 h-4" /> Tick All (Present)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const m = { ...practAttStudentMap };
                            currentBatchStudents.forEach((s) => {
                              m[s.rollNo] = false;
                            });
                            setPractAttStudentMap(m);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1.5 transition shadow-sm"
                        >
                          <Square className="w-4 h-4" /> Untick All (Absent)
                        </button>
                      </div>
                    </div>

                    {/* Student Cards Grid */}
                    {currentBatchStudents.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
                        <FlaskConical className="w-8 h-8 mx-auto text-purple-400 mb-2 opacity-60" />
                        <p className="font-semibold text-slate-300">
                          No students currently assigned to {practAttForm.batch} in {practAttForm.department}.
                        </p>
                        <p className="mt-1">
                          Use <button onClick={() => setLabManagerSubView('batches')} className="text-purple-400 underline font-semibold">Batch Management</button> to configure roll number ranges (e.g. Roll 1 to 10).
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
                        {currentBatchStudents.map((stud) => {
                          const isPresent = practAttStudentMap[stud.rollNo] !== false;
                          return (
                            <div
                              key={stud.id}
                              onClick={() => {
                                setPractAttStudentMap((prev) => ({
                                  ...prev,
                                  [stud.rollNo]: !isPresent,
                                }));
                              }}
                              className={`p-3 rounded-2xl cursor-pointer transition flex items-center justify-between border ${
                                isPresent
                                  ? 'bg-slate-800/80 border-emerald-500/40 hover:border-emerald-400 shadow-sm'
                                  : 'bg-slate-900/60 border-rose-500/30 hover:border-rose-400/50 opacity-80'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Large Checkbox icon */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPractAttStudentMap((prev) => ({
                                      ...prev,
                                      [stud.rollNo]: !isPresent,
                                    }));
                                  }}
                                  className={`p-1.5 rounded-xl transition ${
                                    isPresent
                                      ? 'text-emerald-400 bg-emerald-500/10'
                                      : 'text-slate-500 bg-slate-800'
                                  }`}
                                  title={isPresent ? 'Click to mark Absent' : 'Click to mark Present'}
                                >
                                  {isPresent ? (
                                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                                  ) : (
                                    <Square className="w-5 h-5 text-slate-400" />
                                  )}
                                </button>

                                {/* Roll Number Monospace Badge */}
                                <span className="w-9 h-9 rounded-xl bg-slate-900 text-purple-300 font-mono font-bold text-xs flex items-center justify-center border border-slate-700 shadow-inner">
                                  #{stud.rollNo}
                                </span>

                                {/* Student Name & Info */}
                                <div>
                                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                    {stud.name}
                                    <span className="text-[10px] text-slate-400 font-normal">
                                      ({stud.batch})
                                    </span>
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    Roll #{stud.rollNo} • {stud.department?.split(' ')[0]}
                                  </p>
                                </div>
                              </div>

                              {/* Status Toggle Pill */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPractAttStudentMap((prev) => ({
                                    ...prev,
                                    [stud.rollNo]: !isPresent,
                                  }));
                                }}
                                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                                  isPresent
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                }`}
                              >
                                {isPresent ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>PRESENT</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>ABSENT</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Submit Bar */}
                    {currentBatchStudents.length > 0 && (
                      <div className="pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-xs text-slate-400">
                          Ready to record: <span className="text-emerald-400 font-bold">{presentCount} Present</span> and <span className="text-rose-400 font-bold">{absentCount} Absent</span> for {practAttForm.batch}.
                        </p>
                        <button
                          type="button"
                          onClick={handleSavePracticalAttendance}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save & Submit Practical Attendance</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Total Lab Sessions</span>
                      <Calendar className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-xl font-bold text-white mt-1">
                      {(practicalAttendance?.records || []).filter(
                        (r) => labDeptFilter === 'ALL' || r.department === labDeptFilter
                      ).length}
                    </p>
                    <p className="text-[11px] text-purple-300 mt-0.5">Practical evaluations</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Enrolled Practical Students</span>
                      <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xl font-bold text-white mt-1">
                      {(students || []).filter(
                        (s) =>
                          s.status === 'APPROVED' &&
                          (labDeptFilter === 'ALL' || s.department === labDeptFilter)
                      ).length}
                    </p>
                    <p className="text-[11px] text-emerald-300 mt-0.5">Active across batches</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Target Department</span>
                      <Building className="w-4 h-4 text-indigo-400" />
                    </div>
                    <p className="text-sm font-bold text-white mt-1 truncate">
                      {labDeptFilter === 'ALL' ? 'All Departments' : labDeptFilter}
                    </p>
                    <p className="text-[11px] text-indigo-300 mt-0.5">Practical Roster</p>
                  </div>
                </div>

                {/* 3. RECORDED PRACTICAL SESSIONS HISTORY */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-purple-400" />
                      Recorded Practical Attendance Sessions History
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">
                      Separate practical session log
                    </span>
                  </div>

                  {(() => {
                    const records = (practicalAttendance?.records || []).filter(
                      (r) => labDeptFilter === 'ALL' || r.department === labDeptFilter
                    );

                    if (records.length === 0) {
                      return (
                        <div className="text-center py-12 rounded-2xl bg-slate-800/30 border border-slate-800 text-xs text-slate-400">
                          <FlaskConical className="w-8 h-8 mx-auto text-purple-400 mb-2 opacity-60" />
                          <p className="font-semibold text-slate-300">No practical sessions recorded yet for this department.</p>
                          <p className="mt-1">Use the on-page attendance taker above to record practical attendance.</p>
                        </div>
                      );
                    }

                    return records.map((rec) => {
                      const recPresentCount = Object.values(rec.attendance || {}).filter(Boolean).length;
                      const recTotal = Object.keys(rec.attendance || {}).length;
                      const percent = recTotal > 0 ? Math.round((recPresentCount / recTotal) * 100) : 0;

                      return (
                        <div
                          key={rec.id}
                          className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                                {rec.subject}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold text-xs border border-indigo-500/30">
                                {rec.batch}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">
                                {rec.labRoom || 'Lab 3-B'}
                              </span>
                              <span className="text-xs text-slate-400">
                                • Faculty: {rec.faculty}
                              </span>
                            </div>

                            <h5 className="text-sm font-bold text-white mt-1">
                              {rec.topic || 'Practical Session'}
                            </h5>
                            <p className="text-xs text-slate-400">
                              Department: <span className="text-slate-300">{rec.department}</span> • Date: <span className="text-slate-300 font-mono">{rec.date} ({rec.day})</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-3 self-end md:self-center">
                            <div className="text-right">
                              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 block">
                                {recPresentCount}/{recTotal} Present ({percent}%)
                              </span>
                            </div>

                            <button
                              onClick={() => setSelectedPractSession(rec)}
                              className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-semibold transition border border-purple-500/40"
                            >
                              View Roster
                            </button>

                            <button
                              onClick={() => {
                                showConfirm({
                                  title: 'Delete Practical Attendance Record?',
                                  message: `Are you sure you want to delete the practical attendance record for ${rec.date} (${rec.department || 'Lab'})?`,
                                  confirmText: 'Delete Record',
                                  cancelText: 'Cancel',
                                  type: 'danger',
                                  onConfirm: () => {
                                    deletePracticalAttendanceRecord(rec.id);
                                    showAlert('Practical attendance record deleted', 'info');
                                  },
                                });
                              }}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                              title="Delete practical record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            );
          })()}

          {/* ========================================================
              SUB-VIEW 2: BATCH MANAGEMENT & DYNAMIC ROLL RANGE
              ======================================================== */}
          {activeTab === 'lab' && labManagerSubView === 'batches' && (
            <div className="space-y-5 pt-1">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    Dynamic Roll Number Range Batch Assignment
                  </p>
                  <p className="text-slate-300">
                    Specify a roll number range (e.g. Roll 1 to 10) to dynamically assign all matching students in that department to that batch in real-time.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const targetDept =
                      labDeptFilter === 'ALL' ? 'Information Technology (AIML)' : labDeptFilter;
                    setNewBatchForm({
                      name: 'Batch D',
                      startRoll: 1,
                      endRoll: 10,
                      department: targetDept,
                    });
                    setShowAddBatchModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Batch
                </button>
              </div>

              {/* Department Batches List */}
              <div className="space-y-4">
                {(() => {
                  const targetDept =
                    labDeptFilter === 'ALL' ? 'Information Technology (AIML)' : labDeptFilter;
                  const currentBatches = departmentBatches?.[targetDept] || [];

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Building className="w-4 h-4 text-purple-400" />
                          Configured Batches for: <span className="text-purple-300">{targetDept}</span>
                        </h4>
                        <span className="text-xs text-slate-400">
                          {currentBatches.length} Active Batches
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentBatches.map((b) => {
                          const isEditing = editingBatchId === b.id;
                          const startVal = isEditing ? batchRangeInput.start : b.startRoll;
                          const endVal = isEditing ? batchRangeInput.end : b.endRoll;
                          const matching = getStudentsInRollRange(targetDept, startVal, endVal);

                          return (
                            <div
                              key={b.id}
                              className={`p-4 rounded-2xl border transition space-y-3 ${
                                isEditing
                                  ? 'bg-slate-800/90 border-purple-500 shadow-lg'
                                  : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                                    {b.name}
                                  </span>
                                  <span className="text-xs text-slate-400 font-mono">
                                    Roll {b.startRoll} to {b.endRoll}
                                  </span>
                                </div>

                                {!isEditing ? (
                                  <button
                                    onClick={() => {
                                      setEditingBatchId(b.id);
                                      setBatchRangeInput({ start: b.startRoll, end: b.endRoll });
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs transition"
                                    title="Edit Roll Number Range"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setEditingBatchId(null)}
                                    className="p-1 rounded-lg bg-slate-700 text-slate-400 hover:text-white"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* Roll Range Editor or Display */}
                              {isEditing ? (
                                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                                  <p className="text-[11px] font-semibold text-slate-300">
                                    Edit Roll Range for {b.name}:
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                      <label className="text-[10px] text-slate-400 block mb-0.5">
                                        From Roll
                                      </label>
                                      <input
                                        type="number"
                                        value={batchRangeInput.start}
                                        onChange={(e) =>
                                          setBatchRangeInput({
                                            ...batchRangeInput,
                                            start: e.target.value,
                                          })
                                        }
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                                      />
                                    </div>
                                    <span className="text-slate-500 pt-3">to</span>
                                    <div className="flex-1">
                                      <label className="text-[10px] text-slate-400 block mb-0.5">
                                        To Roll
                                      </label>
                                      <input
                                        type="number"
                                        value={batchRangeInput.end}
                                        onChange={(e) =>
                                          setBatchRangeInput({
                                            ...batchRangeInput,
                                            end: e.target.value,
                                          })
                                        }
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                                      />
                                    </div>
                                  </div>

                                  <button
                                    onClick={() =>
                                      handleApplyBatchRange(
                                        targetDept,
                                        b,
                                        batchRangeInput.start,
                                        batchRangeInput.end
                                      )
                                    }
                                    className="w-full mt-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-md"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Save & Assign Students</span>
                                  </button>
                                </div>
                              ) : (
                                <p className="text-xs text-slate-300">
                                  Target Range: <span className="font-semibold text-white">Roll #{b.startRoll} to #{b.endRoll}</span>
                                </p>
                              )}

                              {/* Dynamic Matching Students Preview */}
                              <div className="pt-2 border-t border-slate-700/60">
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                  <span className="text-slate-400">Assigned Students:</span>
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                                    {matching.length} Students
                                  </span>
                                </div>

                                {matching.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                                    {matching.map((s) => (
                                      <span
                                        key={s.id}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[10px] text-slate-200"
                                      >
                                        <span className="text-purple-400 font-mono font-bold">
                                          #{s.rollNo}
                                        </span>
                                        <span className="truncate max-w-[90px]">{s.name}</span>
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-slate-500 italic">
                                    No students currently registered in this roll range.
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Full Department Student Batch Allocation Register */}
                      <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                        <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Department Student Allocation Register ({targetDept})
                        </h5>

                        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700">
                              <tr>
                                <th className="px-4 py-2.5">Roll No</th>
                                <th className="px-4 py-2.5">Student Name</th>
                                <th className="px-4 py-2.5">Assigned Batch</th>
                                <th className="px-4 py-2.5">Department</th>
                                <th className="px-4 py-2.5">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {(students || [])
                                .filter(
                                  (s) => s.department === targetDept && s.status === 'APPROVED'
                                )
                                .sort((a, b) => Number(a.rollNo) - Number(b.rollNo))
                                .map((s) => (
                                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                                    <td className="px-4 py-2 font-mono font-bold text-purple-400">
                                      #{s.rollNo}
                                    </td>
                                    <td className="px-4 py-2 text-white font-medium">{s.name}</td>
                                    <td className="px-4 py-2">
                                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                                        {s.batch || 'Batch A'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-slate-400">{s.department}</td>
                                    <td className="px-4 py-2">
                                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Enrolled
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ========================================================
              SUB-VIEW 3: INDIVIDUAL STUDENT PRACTICAL ATTENDANCE PROFILES
              ======================================================== */}
          {activeTab === 'lab' && labManagerSubView === 'profiles' && (
            <div className="space-y-4 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    Individual Student Practical Attendance Profiles
                  </h4>
                  <p className="text-xs text-slate-400">
                    Track individual student attendance presence across lab sessions, calculate practical % and review dates.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by student or roll..."
                    value={profileSearchQuery}
                    onChange={(e) => setProfileSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 w-full sm:w-60"
                  />
                </div>
              </div>

              {/* Student Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {(students || [])
                  .filter(
                    (s) =>
                      s.status === 'APPROVED' &&
                      (labDeptFilter === 'ALL' || s.department === labDeptFilter) &&
                      (!profileSearchQuery.trim() ||
                        s.name.toLowerCase().includes(profileSearchQuery.toLowerCase()) ||
                        String(s.rollNo).includes(profileSearchQuery))
                  )
                  .sort((a, b) => Number(a.rollNo) - Number(b.rollNo))
                  .map((student) => {
                    const stats = getStudentPracticalAttendanceStats(student.rollNo, student.department);
                    const isGood = stats.percentage >= 75;
                    const isWarning = stats.percentage >= 60 && stats.percentage < 75;

                    return (
                      <div
                        key={student.id}
                        className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition flex flex-col justify-between gap-3 shadow-sm"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-900 text-purple-400 border border-slate-700">
                              Roll #{student.rollNo}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-[10px] border border-indigo-500/30">
                              {student.batch || 'Batch A'}
                            </span>
                          </div>

                          <h5 className="text-sm font-bold text-white mt-2">{student.name}</h5>
                          <p className="text-[11px] text-slate-400 truncate">{student.department}</p>

                          {/* Attendance Metrics */}
                          <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-semibold">Practical Rate</p>
                              <span
                                className={`text-base font-bold ${
                                  isGood
                                    ? 'text-emerald-400'
                                    : isWarning
                                    ? 'text-amber-400'
                                    : 'text-rose-400'
                                }`}
                              >
                                {stats.percentage}%
                              </span>
                            </div>
                            <div className="text-right text-[11px]">
                              <p className="text-emerald-400 font-semibold">{stats.presentLabs} Attended</p>
                              <p className="text-rose-400 font-semibold">{stats.absentLabs} Missed</p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedStudentForProfile(student)}
                          className="w-full py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-semibold transition border border-purple-500/40 flex items-center justify-center gap-1.5"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>View Full Profile & Date Log</span>
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ========================================================
              SUB-VIEW 4: LAB NOTES & PRACTICAL MANUALS REPOSITORY
              ======================================================== */}
          {activeTab === 'lab' && labManagerSubView === 'notes' && (
            <div className="space-y-4 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    Practical Lab Manuals & Notes Repository
                  </h4>
                  <p className="text-xs text-slate-400">
                    Handouts, starter code (.py, .cpp, .ipynb), and experiment problem sheets for laboratory sessions.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setLabNoteForm((prev) => ({
                      ...prev,
                      department:
                        labDeptFilter === 'ALL' ? 'Information Technology (AIML)' : labDeptFilter,
                    }));
                    setShowUploadLabNote(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Upload Lab Notes
                </button>
              </div>

              {/* Lab Notes List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const notesList = (labNotes || []).filter(
                    (n) => labDeptFilter === 'ALL' || n.department === labDeptFilter
                  );

                  if (notesList.length === 0) {
                    return (
                      <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-800">
                        <FileText className="w-8 h-8 text-purple-400 mx-auto mb-2 opacity-50" />
                        <p className="font-semibold text-slate-300">No lab notes uploaded for this department yet.</p>
                        <p className="mt-1">Click "Upload Lab Notes" to upload manuals or code sheets in any format.</p>
                      </div>
                    );
                  }

                  return notesList.map((note) => (
                    <div
                      key={note.id}
                      className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                            {note.subject}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30">
                            {note.batch || 'All Batches'}
                          </span>
                        </div>

                        <h5 className="text-sm font-bold text-white">{note.title}</h5>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {note.description}
                        </p>

                        <div className="mt-3 text-[11px] text-slate-400">
                          <p>Department: <span className="text-slate-300">{note.department}</span></p>
                          <p>Lab Room: <span className="text-slate-300">{note.labRoom || 'Lab 3-B'}</span></p>
                        </div>

                        {note.attachment && (
                          <div className="mt-3 p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center gap-2">
                            <Paperclip className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="text-xs text-slate-200 truncate flex-1 font-mono">
                              {note.attachment.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({note.attachment.size})
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[10px]">{note.date}</span>

                        <div className="flex items-center gap-2">
                          {note.attachment && (
                            <button
                              onClick={() => downloadAttachment(note.attachment)}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              showConfirm({
                                title: 'Delete Lab Manual?',
                                message: `Are you sure you want to delete lab manual "${note.title}"?`,
                                confirmText: 'Delete Manual',
                                cancelText: 'Cancel',
                                type: 'danger',
                                onConfirm: () => {
                                  deleteLabNote(note.id);
                                  showAlert(`Lab manual "${note.title}" deleted`, 'info');
                                },
                              });
                            }}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                            title="Delete Lab Note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}



          {/* ========================================================
              MODAL 2: VIEW SPECIFIC PRACTICAL SESSION ROSTER
              ======================================================== */}
          {selectedPractSession && (
            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
                <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                      {selectedPractSession.subject}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1">
                      {selectedPractSession.batch} Practical Attendance Log
                    </h4>
                    <p className="text-xs text-slate-400">
                      {selectedPractSession.date} ({selectedPractSession.day}) • {selectedPractSession.labRoom}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPractSession(null)}
                    className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="py-3 space-y-2 max-h-72 overflow-y-auto">
                  {Object.entries(selectedPractSession.attendance || {}).map(([rollNo, isPresent]) => {
                    const student = (students || []).find((s) => String(s.rollNo) === String(rollNo));
                    return (
                      <div
                        key={rollNo}
                        className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-slate-900 text-purple-400 font-mono font-bold text-xs flex items-center justify-center">
                            #{rollNo}
                          </span>
                          <span className="text-xs font-semibold text-white">
                            {student?.name || `Student Roll ${rollNo}`}
                          </span>
                        </div>

                        {isPresent ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> PRESENT
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> ABSENT
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setSelectedPractSession(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              MODAL 3: ADD NEW BATCH
              ======================================================== */}
          {showAddBatchModal && (
            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
                <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Plus className="w-5 h-5 text-purple-400" />
                      Create New Department Batch
                    </h4>
                    <p className="text-xs text-slate-400">
                      Define batch name and initial roll number range.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddBatchModal(false)}
                    className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateNewBatch} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                    <select
                      value={newBatchForm.department}
                      onChange={(e) => setNewBatchForm({ ...newBatchForm, department: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Information Technology (AIML)">Information Technology (AIML)</option>
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Data Science & Analytics">Data Science & Analytics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Batch Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Batch D or Practical Group 2"
                      value={newBatchForm.name}
                      onChange={(e) => setNewBatchForm({ ...newBatchForm, name: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Start Roll No</label>
                      <input
                        type="number"
                        required
                        value={newBatchForm.startRoll}
                        onChange={(e) => setNewBatchForm({ ...newBatchForm, startRoll: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">End Roll No</label>
                      <input
                        type="number"
                        required
                        value={newBatchForm.endRoll}
                        onChange={(e) => setNewBatchForm({ ...newBatchForm, endRoll: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddBatchModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg"
                    >
                      Create Batch & Assign
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================
              MODAL 4: INDIVIDUAL STUDENT PRACTICAL ATTENDANCE PROFILE & DATE LOG
              ======================================================== */}
          {selectedStudentForProfile && (() => {
            const stats = getStudentPracticalAttendanceStats(
              selectedStudentForProfile.rollNo,
              selectedStudentForProfile.department
            );
            const isGood = stats.percentage >= 75;

            return (
              <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
                  {/* Modal Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 font-bold text-sm flex items-center justify-center border border-purple-500/30">
                        #{selectedStudentForProfile.rollNo}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">
                            {selectedStudentForProfile.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                            {selectedStudentForProfile.batch || 'Batch A'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {selectedStudentForProfile.department} • {selectedStudentForProfile.email}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedStudentForProfile(null)}
                      className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="py-3 grid grid-cols-4 gap-2 border-b border-slate-800/80 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-800/50">
                      <p className="text-[10px] text-slate-400 font-semibold">Total Labs</p>
                      <p className="text-base font-bold text-white mt-0.5">{stats.totalLabs}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-[10px] text-emerald-400 font-semibold">Attended</p>
                      <p className="text-base font-bold text-emerald-300 mt-0.5">{stats.presentLabs}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <p className="text-[10px] text-rose-400 font-semibold">Missed</p>
                      <p className="text-base font-bold text-rose-300 mt-0.5">{stats.absentLabs}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <p className="text-[10px] text-purple-400 font-semibold">Rate</p>
                      <p className={`text-base font-bold mt-0.5 ${isGood ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {stats.percentage}%
                      </p>
                    </div>
                  </div>

                  {/* Date-by-Date Attendance Timeline Log */}
                  <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-purple-400" />
                      Scheduled Lab Attendance Date Log
                    </h5>

                    {stats.history.length > 0 ? (
                      stats.history.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{item.subject}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({item.labRoom || 'Lab 3-B'})
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-0.5">
                              {item.topic || 'Laboratory Practical Session'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Faculty: {item.faculty} • Date: <span className="text-slate-200 font-mono">{item.date} ({item.day})</span>
                            </p>
                          </div>

                          <div>
                            {item.isPresent ? (
                              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> PRESENT
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/40 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" /> ABSENT
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-xs text-slate-400">
                        No practical sessions recorded yet for this student's department & batch.
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => setSelectedStudentForProfile(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Close Profile
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ========================================================
              MODAL 5: UPLOAD LAB NOTES
              ======================================================== */}
          {showUploadLabNote && (
            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
                <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Upload className="w-5 h-5 text-purple-400" />
                      Upload Practical Lab Notes & Manuals
                    </h4>
                    <p className="text-xs text-slate-400">
                      Upload lab manuals, experiment briefs, or starter code in any format.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUploadLabNote(false);
                      setLabNoteAttachment(null);
                    }}
                    className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleUploadLabNoteSubmit} className="mt-4 space-y-4">
                  {/* File Dropzone */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Practical File / Code (Any format: .pdf, .docx, .xlsx, .ipynb, .cpp, .py, .zip)
                    </label>

                    <input
                      type="file"
                      ref={labNoteFileInputRef}
                      onChange={handleLabNoteFilePick}
                      className="hidden"
                    />

                    {labNoteAttachment ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-purple-500/40">
                        <div className="flex items-center gap-2 truncate">
                          <Paperclip className="w-4 h-4 text-purple-400 shrink-0" />
                          <span className="text-white text-xs font-medium truncate">
                            {labNoteAttachment.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({labNoteAttachment.size})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLabNoteAttachment(null)}
                          className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => labNoteFileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleLabNoteFileDrop}
                        className="border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-500/5 hover:bg-purple-500/10 rounded-xl p-3.5 text-center cursor-pointer transition"
                      >
                        <Upload className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                        <p className="text-xs font-bold text-white">
                          {isAttachingLabNote ? 'Reading file...' : 'Click to Browse or Drag & Drop File'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          PDF, Word, Excel, Jupyter (.ipynb), Python (.py), C++, Zip
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Manual / Notes Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lab Manual 4: Dijkstra & Graph Traversal"
                      value={labNoteForm.title}
                      onChange={(e) => setLabNoteForm({ ...labNoteForm, title: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                      <select
                        value={labNoteForm.department}
                        onChange={(e) => setLabNoteForm({ ...labNoteForm, department: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="Information Technology (AIML)">Information Technology (AIML)</option>
                        <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                        <option value="Data Science & Analytics">Data Science & Analytics</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Target Batch</label>
                      <select
                        value={labNoteForm.batch}
                        onChange={(e) => setLabNoteForm({ ...labNoteForm, batch: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="All Batches">All Batches</option>
                        <option value="Batch A">Batch A</option>
                        <option value="Batch B">Batch B</option>
                        <option value="Batch C">Batch C</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Lab Subject</label>
                      <input
                        type="text"
                        required
                        value={labNoteForm.subject}
                        onChange={(e) => setLabNoteForm({ ...labNoteForm, subject: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Lab Room</label>
                      <input
                        type="text"
                        value={labNoteForm.labRoom}
                        onChange={(e) => setLabNoteForm({ ...labNoteForm, labRoom: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Instructions / Description</label>
                    <textarea
                      rows={2}
                      value={labNoteForm.description}
                      onChange={(e) => setLabNoteForm({ ...labNoteForm, description: e.target.value })}
                      placeholder="Brief details or prerequisites for this experiment..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUploadLabNote(false);
                        setLabNoteAttachment(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg"
                    >
                      Publish Lab Notes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. TEST MANAGER */}
      {activeTab === 'tests' && (() => {
        const filteredTests = tests.filter((t) => {
          if (testDeptFilter !== 'ALL' && t.department && t.department !== 'ALL' && t.department !== testDeptFilter) {
            return false;
          }
          if (testTypeFilter !== 'ALL' && t.type !== testTypeFilter) {
            return false;
          }
          if (testSearchQuery.trim()) {
            const q = testSearchQuery.toLowerCase();
            const matchTitle = (t.title || '').toLowerCase().includes(q);
            const matchSub = (t.subject || '').toLowerCase().includes(q);
            const matchDept = (t.department || '').toLowerCase().includes(q);
            if (!matchTitle && !matchSub && !matchDept) return false;
          }
          return true;
        });

        const targetDeptStudents = (students || []).filter(
          (s) => s.status === 'APPROVED' && (testDeptFilter === 'ALL' || s.department === testDeptFilter)
        );
        const totalAttemptsCount = filteredTests.reduce(
          (acc, t) => acc + Object.keys(t.studentResults || {}).length,
          0
        );

        return (
          <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
            {/* Main Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm">
                  <Code className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Test & Quiz Assessment Manager
                  </h3>
                  <p className="text-xs text-slate-400">
                    Manage quizzes and tests according to department, track who gave the test vs who did not, and evaluate individual student scores and grades.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateTestModal(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-600/30 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Test / Quiz</span>
              </button>
            </div>

            {/* Department Filter & Search Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <div className="flex flex-wrap items-center gap-3">
                {/* Department Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-purple-400" />
                    Department:
                  </span>
                  <select
                    value={testDeptFilter}
                    onChange={(e) => setTestDeptFilter(e.target.value)}
                    className="bg-slate-900 border border-purple-500/40 rounded-xl px-3 py-1.5 text-xs text-purple-200 font-semibold focus:outline-none focus:border-purple-400"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="Information Technology (AIML)">Information Technology (AIML)</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Data Science & Analytics">Data Science & Analytics</option>
                  </select>
                </div>

                {/* Format Pills */}
                <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                  {[
                    { id: 'ALL', label: 'All Formats' },
                    { id: 'mcq', label: 'MCQ Quiz' },
                    { id: 'coding', label: 'Coding Test' },
                    { id: 'typing', label: 'Typing Test' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setTestTypeFilter(fmt.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        testTypeFilter === fmt.id
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Box */}
              <div className="relative w-full lg:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search assessment title, subject..."
                  value={testSearchQuery}
                  onChange={(e) => setTestSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total Assessments</span>
                  <Code className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white mt-1">{filteredTests.length}</p>
                <p className="text-[11px] text-purple-300 mt-0.5">
                  Filtered by department & format
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Enrolled Dept Students</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-white mt-1">{targetDeptStudents.length}</p>
                <p className="text-[11px] text-emerald-300 mt-0.5">
                  Eligible test candidates
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total Submissions Recorded</span>
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-2xl font-bold text-white mt-1">{totalAttemptsCount}</p>
                <p className="text-[11px] text-indigo-300 mt-0.5">
                  Evaluated across active tests
                </p>
              </div>
            </div>

            {/* Assessments Cards Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  Active Department Assessments & Submission Counters
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  Showing {filteredTests.length} Assessments
                </span>
              </div>

              {filteredTests.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-slate-800/30 border border-slate-800 text-xs text-slate-400">
                  <Code className="w-8 h-8 mx-auto text-purple-400 mb-2 opacity-60" />
                  <p className="font-semibold text-slate-300">No assessments found matching the criteria.</p>
                  <p className="mt-1">Click "Create New Test / Quiz" to publish an evaluation for students.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTests.map((test) => {
                    const stats = getTestStats(test);

                    return (
                      <div
                        key={test.id}
                        className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-purple-500/40 transition flex flex-col justify-between space-y-4 shadow-sm"
                      >
                        <div className="space-y-2.5">
                          {/* Badges row */}
                          <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold uppercase text-[10px] border border-purple-500/30">
                              {test.type === 'mcq' ? 'MCQ Quiz' : test.type === 'coding' ? 'Coding Test' : 'Speed Typing'}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                              {test.durationMins} mins
                            </span>
                          </div>

                          {/* Title & Subject */}
                          <div>
                            <h4 className="text-base font-bold text-white leading-tight">{test.title}</h4>
                            <p className="text-xs font-semibold text-purple-300 mt-1">{test.subject}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              Target: <span className="text-slate-300">{test.department || 'All Departments'}</span>
                            </p>
                          </div>

                          {/* SUBMISSION COUNTER (Like Assignment Hub) */}
                          <div className="pt-2 border-t border-slate-700/50 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-300 font-medium">Participation Rate:</span>
                              <span className="font-bold text-emerald-400 font-mono">{stats.rate}%</span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${stats.rate}%` }}
                              />
                            </div>

                            {/* Counter badges */}
                            <div className="flex items-center justify-between gap-1.5 pt-0.5">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Gave Test: {stats.submitted.length}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-rose-400" />
                                Not Given: {stats.pending.length}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTestForRoster(test);
                              setTestRosterTab('submitted');
                              setTestRosterSearch('');
                            }}
                            className="flex-1 px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-bold transition border border-purple-500/40 flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Track Student Submissions</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              showConfirm({
                                title: 'Delete Assessment?',
                                message: `Are you sure you want to delete assessment "${test.title}"? All student submission records for this test will be removed.`,
                                confirmText: 'Delete Assessment',
                                cancelText: 'Cancel',
                                type: 'danger',
                                onConfirm: () => {
                                  deleteTest(test.id);
                                  showAlert(`Assessment "${test.title}" deleted`, 'info');
                                },
                              });
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                            title="Delete Assessment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ========================================================
                MODAL 1: TRACK SUBMISSIONS & GRADE ROSTER
                ======================================================== */}
            {selectedTestForRoster && (() => {
              const rosterStats = getTestStats(selectedTestForRoster);

              const filteredSubmitted = rosterStats.submitted.filter((s) => {
                if (!testRosterSearch.trim()) return true;
                const q = testRosterSearch.toLowerCase();
                return (
                  s.name.toLowerCase().includes(q) ||
                  String(s.rollNo).toLowerCase().includes(q)
                );
              });

              const filteredPending = rosterStats.pending.filter((s) => {
                if (!testRosterSearch.trim()) return true;
                const q = testRosterSearch.toLowerCase();
                return (
                  s.name.toLowerCase().includes(q) ||
                  String(s.rollNo).toLowerCase().includes(q)
                );
              });

              return (
                <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
                    {/* Modal Header */}
                    <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30 uppercase">
                            {selectedTestForRoster.type}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30">
                            {selectedTestForRoster.department || 'All Departments'}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            Max Marks: {selectedTestForRoster.totalMarks}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
                          {selectedTestForRoster.title}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Course: <span className="text-purple-300 font-semibold">{selectedTestForRoster.subject}</span> • Duration: {selectedTestForRoster.durationMins} mins
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedTestForRoster(null)}
                        className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Summary Counters Pill Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 border-b border-slate-800 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Candidates</span>
                        <span className="text-base font-bold text-white font-mono">{rosterStats.deptStudents.length}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[10px] text-emerald-400 block uppercase font-semibold">Gave Test</span>
                        <span className="text-base font-bold text-emerald-300 font-mono">
                          {rosterStats.submitted.length} ({rosterStats.rate}%)
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <span className="text-[10px] text-rose-400 block uppercase font-semibold">Did Not Give</span>
                        <span className="text-base font-bold text-rose-300 font-mono">{rosterStats.pending.length}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <span className="text-[10px] text-purple-400 block uppercase font-semibold">Class Avg Score</span>
                        <span className="text-base font-bold text-purple-300 font-mono">
                          {rosterStats.avg} / {selectedTestForRoster.totalMarks}
                        </span>
                      </div>
                    </div>

                    {/* Sub-tabs & Search Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 pb-2">
                      <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setTestRosterTab('submitted')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            testRosterTab === 'submitted'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Gave Test ({rosterStats.submitted.length})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTestRosterTab('pending')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            testRosterTab === 'pending'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Did Not Give ({rosterStats.pending.length})</span>
                        </button>
                      </div>

                      <div className="relative w-full sm:w-60">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search student or roll #..."
                          value={testRosterSearch}
                          onChange={(e) => setTestRosterSearch(e.target.value)}
                          className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Sub-tab 1: GAVE TEST (GRADE TRACKER & INDIVIDUAL SCORES) */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 pt-2">
                      {testRosterTab === 'submitted' ? (
                        filteredSubmitted.length > 0 ? (
                          filteredSubmitted.map((student) => {
                            const result = selectedTestForRoster.studentResults[student.id];
                            const gradeInfo = getGradeDetails(result.score, selectedTestForRoster.totalMarks);

                            return (
                              <div
                                key={student.id}
                                className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3 hover:border-slate-600 transition"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  {/* Student Info */}
                                  <div className="flex items-center gap-3">
                                    <span className="w-9 h-9 rounded-xl bg-slate-900 text-purple-300 font-mono font-bold text-xs flex items-center justify-center border border-slate-700 shadow-inner">
                                      #{student.rollNo}
                                    </span>
                                    <div>
                                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                        {student.name}
                                        <span className="text-[10px] text-slate-400 font-normal">
                                          ({student.batch || 'Batch A'})
                                        </span>
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-mono">
                                        Roll #{student.rollNo} • {student.department?.split(' ')[0]}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Submission Badge */}
                                  <div className="flex items-center gap-2 self-end sm:self-center">
                                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Attempted & Submitted</span>
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {result.completedAt
                                        ? new Date(result.completedAt).toLocaleDateString()
                                        : 'Completed'}
                                    </span>
                                  </div>
                                </div>

                                {/* Feedback Controls */}
                                <div className="pt-2 border-t border-slate-700/50 flex flex-col sm:flex-row items-center gap-2">
                                  <div className="flex-1 w-full">
                                    <input
                                      type="text"
                                      placeholder="Faculty remarks / feedback on student performance..."
                                      defaultValue={result.feedback || ''}
                                      onChange={(e) =>
                                        setEditingTestFeedbacks({
                                          ...editingTestFeedbacks,
                                          [student.id]: e.target.value,
                                        })
                                      }
                                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStudentScore(selectedTestForRoster.id, student.id)}
                                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shrink-0 shadow-md transition"
                                  >
                                    Save Remarks
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-12 text-center text-xs text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-800">
                            <Code className="w-8 h-8 mx-auto text-purple-400 mb-2 opacity-60" />
                            <p className="font-semibold text-slate-300">No student submissions recorded yet.</p>
                            <p className="mt-1">Students enrolled in this department have not taken this test yet.</p>
                          </div>
                        )
                      ) : (
                        /* Sub-tab 2: DID NOT GIVE TEST (PENDING / ABSENT) */
                        filteredPending.length > 0 ? (
                          <div className="space-y-2.5">
                            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                              <span>
                                The following {filteredPending.length} students enrolled in <strong>{selectedTestForRoster.department}</strong> have not attempted or submitted this assessment.
                              </span>
                            </div>

                            {filteredPending.map((student) => (
                              <div
                                key={student.id}
                                className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 font-mono font-bold text-xs flex items-center justify-center border border-rose-500/20">
                                    #{student.rollNo}
                                  </span>
                                  <div>
                                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                      {student.name}
                                      <span className="text-[10px] text-slate-400 font-normal">
                                        ({student.batch || 'Batch A'})
                                      </span>
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-mono">
                                      {student.email} • {student.phone || '+91 98765 43210'}
                                    </p>
                                  </div>
                                </div>

                                <div className="self-end sm:self-center">
                                  <span className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                                    <span>TEST NOT ATTEMPTED</span>
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-12 text-center text-xs text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-800">
                            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-60" />
                            <p className="font-semibold text-emerald-300">100% Participation!</p>
                            <p className="mt-1">Every student registered in this department has completed this assessment.</p>
                          </div>
                        )
                      )}
                    </div>

                    {/* Modal Footer */}
                    <div className="pt-3 border-t border-slate-800 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedTestForRoster(null)}
                        className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
                      >
                        Close Roster
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ========================================================
                MODAL 2: CREATE NEW TEST / ASSESSMENT
                ======================================================== */}
            {showCreateTestModal && (
              <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <Plus className="w-5 h-5 text-purple-400" />
                        Create Department Assessment / Quiz
                      </h4>
                      <p className="text-xs text-slate-400">
                        Target assessment to a specific department and define questions or coding tasks.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCreateTestModal(false)}
                      className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handlePublishTest} className="mt-4 space-y-4 flex-1 overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Assessment Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Data Structures Unit 3 Quiz"
                          value={newTestForm.title}
                          onChange={(e) => setNewTestForm({ ...newTestForm, title: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Course / Subject *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Data Structures (DS)"
                          value={newTestForm.subject}
                          onChange={(e) => setNewTestForm({ ...newTestForm, subject: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Target Department *</label>
                        <select
                          value={newTestForm.department}
                          onChange={(e) => setNewTestForm({ ...newTestForm, department: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="Information Technology (AIML)">Information Technology (AIML)</option>
                          <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                          <option value="Data Science & Analytics">Data Science & Analytics</option>
                          <option value="ALL">All Departments (General)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Assessment Format *</label>
                        <select
                          value={newTestForm.type}
                          onChange={(e) => setNewTestForm({ ...newTestForm, type: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="mcq">Multiple Choice Quiz (MCQ)</option>
                          <option value="coding">Programming Code Assessment</option>
                          <option value="typing">Speed Typing Assessment</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Duration (Mins)</label>
                        <input
                          type="number"
                          value={newTestForm.durationMins}
                          onChange={(e) => setNewTestForm({ ...newTestForm, durationMins: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Submission Deadline (Optional)</label>
                        <input
                          type="date"
                          value={newTestForm.deadline}
                          onChange={(e) => setNewTestForm({ ...newTestForm, deadline: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Format-Specific Question Builder */}
                    {newTestForm.type === 'mcq' && (
                      <div className="pt-2 border-t border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-white">MCQ Questions ({newTestForm.questions.length})</label>
                          <button
                            type="button"
                            onClick={() =>
                              setNewTestForm({
                                ...newTestForm,
                                questions: [
                                  ...newTestForm.questions,
                                  {
                                    id: `q${newTestForm.questions.length + 1}`,
                                    question: '',
                                    options: ['', '', '', ''],
                                    correctIndex: 0,
                                    explanation: '',
                                  },
                                ],
                              })
                            }
                            className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Question
                          </button>
                        </div>

                        {newTestForm.questions.map((q, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-purple-300">Question #{idx + 1}</span>
                              {newTestForm.questions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setNewTestForm({
                                      ...newTestForm,
                                      questions: newTestForm.questions.filter((_, qIdx) => qIdx !== idx),
                                    })
                                  }
                                  className="text-slate-400 hover:text-rose-400 text-xs"
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            <input
                              type="text"
                              placeholder="Enter question text..."
                              value={q.question}
                              onChange={(e) => {
                                const updated = [...newTestForm.questions];
                                updated[idx].question = e.target.value;
                                setNewTestForm({ ...newTestForm, questions: updated });
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                            />

                            <div className="grid grid-cols-2 gap-2">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-1.5">
                                  <input
                                    type="radio"
                                    name={`correct-${idx}`}
                                    checked={q.correctIndex === optIdx}
                                    onChange={() => {
                                      const updated = [...newTestForm.questions];
                                      updated[idx].correctIndex = optIdx;
                                      setNewTestForm({ ...newTestForm, questions: updated });
                                    }}
                                  />
                                  <input
                                    type="text"
                                    placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                    value={opt}
                                    onChange={(e) => {
                                      const updated = [...newTestForm.questions];
                                      updated[idx].options[optIdx] = e.target.value;
                                      setNewTestForm({ ...newTestForm, questions: updated });
                                    }}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white"
                                  />
                                </div>
                              ))}
                            </div>

                            <input
                              type="text"
                              placeholder="Brief explanation of the correct option (optional)"
                              value={q.explanation}
                              onChange={(e) => {
                                const updated = [...newTestForm.questions];
                                updated[idx].explanation = e.target.value;
                                setNewTestForm({ ...newTestForm, questions: updated });
                              }}
                              className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-1 text-[11px] text-slate-300"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {newTestForm.type === 'coding' && (
                      <div className="pt-2 border-t border-slate-800 space-y-3">
                        <label className="text-xs font-bold text-white block">Coding Problem Details</label>
                        <input
                          type="text"
                          placeholder="Problem Title (e.g. Balanced Parentheses Checker)"
                          value={newTestForm.problemTitle}
                          onChange={(e) => setNewTestForm({ ...newTestForm, problemTitle: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        />
                        <textarea
                          placeholder="Problem description, constraints & sample input/output..."
                          rows={3}
                          value={newTestForm.problemDesc}
                          onChange={(e) => setNewTestForm({ ...newTestForm, problemDesc: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white"
                        />
                        <textarea
                          placeholder="Starter Code boilerplate..."
                          rows={3}
                          value={newTestForm.starterCode}
                          onChange={(e) => setNewTestForm({ ...newTestForm, starterCode: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono"
                        />
                      </div>
                    )}

                    {newTestForm.type === 'typing' && (
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <label className="text-xs font-bold text-white block">Typing Speed Passage</label>
                        <textarea
                          placeholder="Type or paste the passage students will type..."
                          rows={4}
                          value={newTestForm.passage}
                          onChange={(e) => setNewTestForm({ ...newTestForm, passage: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white"
                        />
                      </div>
                    )}

                    <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowCreateTestModal(false)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg"
                      >
                        Publish Assessment
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 5. MEETING HOST CONTROLS - ZOOM / GOOGLE MEET STYLE */}
      {activeTab === 'meeting' && (() => {
        // Resolve admitted attendees strictly from activeMeeting (starts empty until teacher admits students)
        const currentAttendees = activeMeeting?.admittedParticipants || [];
        const hostDisplayName = currentUser?.name || 'Prof. Divya C';
        const hostInitials = hostDisplayName
          .replace(/^(Prof\.|Dr\.|Mr\.|Ms\.|Mrs\.)\s+/i, '')
          .trim()
          .split(/\s+/)
          .map((p) => p[0])
          .join('')
          .substring(0, 2)
          .toUpperCase() || 'TH';

        return (
          <div className="bg-slate-900/90 rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-2xl space-y-4 animate-fadeIn">
            {/* Meeting Top Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                      Classroom 303 • Live Virtual Lecture Studio
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/30">
                      REC {formatTimer(meetingDuration)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Interactive Zoom-Style Classroom • Camera, Audio & Screen Broadcast
                  </p>
                </div>
              </div>

              {/* Department Target Selector & Room Info */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <Building className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs text-slate-400">Class:</span>
                  <select
                    value={meetingTargetDept}
                    onChange={(e) => setMeetingTargetDept(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Information Technology (AIML)" className="bg-slate-900 text-white">
                      AIML (Sem III)
                    </option>
                    <option value="Computer Science & Engineering (CSE)" className="bg-slate-900 text-white">
                      CSE (Sem III)
                    </option>
                    <option value="Data Science (DS)" className="bg-slate-900 text-white">
                      Data Science (Sem III)
                    </option>
                    <option value="ALL" className="bg-slate-900 text-white">
                      All Connected Departments
                    </option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 text-xs font-semibold border border-purple-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Host: {currentUser?.name || 'Prof. Divya C'}</span>
                </div>

                <div className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 text-slate-300 text-xs font-mono border border-slate-700">
                  Room ID: <span className="text-white font-bold">EDU-303-ZOOM</span>
                </div>

                {/* Zoom View Switcher */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setMeetingViewMode('speaker')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                      meetingViewMode === 'speaker'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Speaker View"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Speaker</span>
                  </button>
                  <button
                    onClick={() => setMeetingViewMode('gallery')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                      meetingViewMode === 'gallery'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Gallery Grid View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Gallery</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Shareable Meeting Link & Broadcast Bar */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                  <Link className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-200 block">Class Meeting Direct Link</span>
                  <div className="text-xs text-purple-300 font-mono truncate max-w-xs sm:max-w-md">
                    {typeof window !== 'undefined' ? `${window.location.origin}/?meeting=EDU-303-ZOOM` : 'http://localhost:5173/?meeting=EDU-303-ZOOM'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const link = `${window.location.origin}/?meeting=EDU-303-ZOOM`;
                    navigator.clipboard?.writeText(link);
                    setCopiedMeetingLink(true);
                    setTimeout(() => setCopiedMeetingLink(false), 2500);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition border border-slate-700 flex items-center gap-1.5 shadow-sm"
                >
                  {copiedMeetingLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-purple-400" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    broadcastMeetingInvite({
                      roomId: 'EDU-303-ZOOM',
                      title: 'Classroom 303 • Data Structures Lecture',
                      department: meetingTargetDept || 'Information Technology (AIML)',
                    });
                    setBroadcastToast('Meeting link broadcasted to Students & ChitChat!');
                    setTimeout(() => setBroadcastToast(''), 3500);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-600/30"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Send Link to Students & ChitChat</span>
                </button>
              </div>
            </div>

            {broadcastToast && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{broadcastToast}</span>
              </div>
            )}

            {/* Error / Permission Banner */}
            {mediaError && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{mediaError}</span>
                </div>
                <button
                  onClick={() => setMediaError(null)}
                  className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[11px]"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Real-Time Zoom Waiting Room Join Request Notification */}
            {activeMeeting?.waitingRoom?.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-indigo-500/20 border border-amber-500/40 text-amber-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl animate-fadeIn">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3.5 w-3.5 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white tracking-wide">
                        Zoom Waiting Room:
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 font-mono text-[10px] font-bold">
                        {activeMeeting.waitingRoom.length} Waiting
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      <strong className="text-amber-300">{activeMeeting.waitingRoom[0].studentName}</strong> (Roll {activeMeeting.waitingRoom[0].rollNo})
                      {activeMeeting.waitingRoom.length > 1 && ` and ${activeMeeting.waitingRoom.length - 1} other student(s)`} requested to join Classroom 303.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => admitAllWaitingStudents()}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Admit All</span>
                  </button>
                  <button
                    onClick={() => setShowWaitingRoomModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                  >
                    Manage ({activeMeeting.waitingRoom.length})
                  </button>
                </div>
              </div>
            )}

            {/* Stage & Side Panel Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Main Presentation Stage */}
              <div className="lg:col-span-3 bg-slate-950 rounded-3xl border border-slate-800 relative aspect-video flex flex-col justify-between overflow-hidden shadow-2xl">
                {/* Stage Header Info Banner */}
                <div className="flex items-center justify-between p-3.5 z-20 bg-gradient-to-b from-slate-950/90 to-transparent">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold border border-slate-700 flex items-center gap-2">
                      {isScreenSharing ? (
                        <>
                          <Monitor className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>Broadcasting Screen (Full Class Display)</span>
                        </>
                      ) : isVideoOn ? (
                        <>
                          <Video className="w-3.5 h-3.5 text-purple-400" />
                          <span>Host Camera Feed (HD 720p)</span>
                        </>
                      ) : (
                        <>
                          <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                          <span>Audio Presentation Mode</span>
                        </>
                      )}
                    </span>

                    {roomLocked && (
                      <span className="px-2 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md text-slate-300 border border-slate-800 font-mono text-[11px] flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-purple-400" />
                      {currentAttendees.length} Connected
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                      HD 60FPS
                    </span>
                  </div>
                </div>

                {/* Video Stage Display Area */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                  {/* Mode 0: Student is Sharing Screen */}
                  {activeMeeting?.screenSharer && activeMeeting.screenSharer.role === 'student' ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-black">
                      <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-purple-600/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                          <Monitor className="w-3.5 h-3.5 text-cyan-300" />
                          Student Presentation: {activeMeeting.screenSharer.name} is Sharing Screen
                        </span>
                        <button
                          onClick={() => setMeetingScreenSharer(null)}
                          className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold transition shadow"
                        >
                          Stop Student Share
                        </button>
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                        <div className="w-20 h-20 rounded-full bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 mb-3 shadow-xl animate-pulse">
                          <Monitor className="w-10 h-10" />
                        </div>
                        <h4 className="text-white font-bold text-base">
                          {activeMeeting.screenSharer.name}'s Screen Broadcast Live
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-md">
                          High-resolution student screen stream transmitted to Classroom 303.
                        </p>
                      </div>

                      {/* Floating Host PiP Thumbnail */}
                      {isVideoOn && (
                        <div className="absolute bottom-20 right-4 z-30 w-36 sm:w-48 aspect-video rounded-2xl overflow-hidden border-2 border-purple-500 shadow-2xl bg-slate-900 group">
                          {cameraStream ? (
                            <video
                              ref={pipCameraRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover transform -scale-x-100"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/60 to-slate-900 text-white">
                              <span className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                                {hostInitials}
                              </span>
                              <span className="text-[10px] text-slate-300 mt-1">Virtual Feed</span>
                            </div>
                          )}
                          <div className="absolute bottom-1.5 left-2 bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] text-white font-medium">
                            {hostDisplayName} (You)
                          </div>
                        </div>
                      )}
                    </div>
                  ) : meetingViewMode === 'gallery' ? (
                    /* Zoom Gallery Grid */
                    <div className={`w-full h-full p-4 pt-12 pb-20 grid gap-3 overflow-y-auto ${
                      currentAttendees.length === 0
                        ? 'grid-cols-1'
                        : currentAttendees.length === 1
                        ? 'grid-cols-1 sm:grid-cols-2'
                        : currentAttendees.length <= 3
                        ? 'grid-cols-2 sm:grid-cols-2'
                        : 'grid-cols-2 sm:grid-cols-3'
                    }`}>
                      {/* Host Tile */}
                      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-purple-500 shadow-xl flex items-center justify-center min-h-[140px] aspect-video">
                        {isVideoOn && cameraStream ? (
                          <video
                            ref={cameraVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform -scale-x-100"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-purple-950/70 p-4 text-center">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg mb-2 ring-4 ring-purple-500/20">
                              {hostInitials}
                            </div>
                            <span className="text-xs text-white font-semibold truncate max-w-[140px]">
                              {hostDisplayName}
                            </span>
                            <span className="text-[10px] text-purple-300 font-mono mt-0.5">Faculty Host</span>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] text-white font-semibold flex items-center gap-1.5">
                          <span>{hostDisplayName} (Host)</span>
                          {isMicOn ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-rose-400" />}
                        </div>
                      </div>

                      {/* Student Tiles */}
                      {currentAttendees.map((stud) => {
                        const sId = stud.studentId || stud.id;
                        const isStudentMuted = stud.isMuted !== undefined ? stud.isMuted : (mutedStudents[sId] ?? allMuted);
                        const hasHand = Boolean(stud.hasHandRaised);
                        const isSharing = Boolean(stud.isScreenSharing);
                        const sInitials = (stud.studentName || stud.name || 'ST')
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase();

                        return (
                          <div
                            key={sId}
                            className={`relative rounded-2xl overflow-hidden bg-slate-900 border ${
                              !isStudentMuted ? 'border-emerald-500/80 ring-2 ring-emerald-500/20' : 'border-slate-800'
                            } shadow-xl flex items-center justify-center min-h-[140px] aspect-video group`}
                          >
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-4 text-center">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-700 to-slate-800 flex items-center justify-center text-white text-lg font-bold shadow-lg mb-2">
                                {sInitials}
                              </div>
                              <span className="text-xs text-white font-semibold truncate max-w-[140px]">
                                {stud.studentName || stud.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Roll: {stud.rollNo || 'N/A'} • {stud.department ? stud.department.split(' ')[0] : 'AIML'}
                              </span>
                              {isSharing && (
                                <span className="mt-1 px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold border border-cyan-500/30">
                                  Sharing Screen
                                </span>
                              )}
                            </div>

                            {hasHand && (
                              <div className="absolute top-2 right-2 text-xl animate-bounce" title="Hand Raised">
                                ✋
                              </div>
                            )}

                            {stud.reaction && (
                              <div className="absolute top-2 right-2 text-2xl animate-bounce">
                                {stud.reaction}
                              </div>
                            )}

                            <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] text-white font-medium flex items-center gap-1.5">
                              <span className="truncate max-w-[110px]">{stud.studentName || stud.name}</span>
                              {isStudentMuted ? <MicOff className="w-3 h-3 text-rose-400" /> : <Mic className="w-3 h-3 text-emerald-400" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : isScreenSharing ? (
                    /* Mode 1: Real Screen Sharing Video */
                    <div className="w-full h-full relative flex items-center justify-center bg-black">
                      <video
                        ref={screenVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                      />
                      {/* Floating PiP Webcam Thumbnail */}
                      {isVideoOn && (
                        <div className="absolute bottom-20 right-4 z-20 w-36 sm:w-48 aspect-video rounded-2xl overflow-hidden border-2 border-purple-500 shadow-2xl bg-slate-900 group">
                          {cameraStream ? (
                            <video
                              ref={pipCameraRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover transform -scale-x-100"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/60 to-slate-900 text-white">
                              <span className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                                {hostInitials}
                              </span>
                              <span className="text-[10px] text-slate-300 mt-1">Virtual Feed</span>
                            </div>
                          )}
                          <div className="absolute bottom-1.5 left-2 bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] text-white font-medium">
                            {hostDisplayName} (You)
                          </div>
                        </div>
                      )}
                    </div>
                  ) : isVideoOn ? (
                    /* Mode 2: Real Webcam Video */
                    <div className="w-full h-full relative flex items-center justify-center bg-black">
                      {cameraStream ? (
                        <video
                          ref={cameraVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover transform -scale-x-100"
                        />
                      ) : (
                        /* Graceful Fallback if physical webcam is inaccessible */
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 text-center p-6">
                          <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl border-4 border-purple-400/40">
                              {hostInitials}
                            </div>
                            {isMicOn && (
                              <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-500 border-2 border-slate-950 text-white animate-pulse">
                                <Mic className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          <h4 className="text-white font-bold text-base">{hostDisplayName} (Host)</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Virtual Presenter Video Active • Camera Feed Connected
                          </p>
                        </div>
                      )}

                      {/* Host Nameplate overlay */}
                      <div className="absolute bottom-20 left-4 z-20 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-white font-semibold flex items-center gap-2">
                        <span>{hostDisplayName} (Host)</span>
                        {isMicOn ? (
                          <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            AUDIO LIVE
                          </span>
                        ) : (
                          <span className="text-rose-400 text-[10px]">MUTED</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Mode 3: Camera Off / Studio Avatar Mode */
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
                      <div className="relative mb-4">
                        <div className={`w-28 h-28 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-800 flex items-center justify-center text-white text-3xl font-extrabold shadow-2xl border-4 ${
                          isMicOn ? 'border-emerald-400 ring-8 ring-emerald-500/20' : 'border-purple-500/30'
                        }`}>
                          {hostInitials}
                        </div>
                        {isMicOn ? (
                          <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-emerald-500 text-white shadow-lg border-2 border-slate-950">
                            <Mic className="w-4 h-4 animate-pulse" />
                          </div>
                        ) : (
                          <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-rose-600 text-white shadow-lg border-2 border-slate-950">
                            <MicOff className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <h4 className="text-white font-bold text-lg">{hostDisplayName} (Host)</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        Broadcasting to {meetingTargetDept === 'ALL' ? 'All Classes' : meetingTargetDept}
                      </p>

                      {/* Audio waveform visualization when mic is on */}
                      {isMicOn && (
                        <div className="flex items-center gap-1 mt-4 h-6">
                          <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-4"></span>
                          <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-6 delay-75"></span>
                          <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3 delay-150"></span>
                          <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-5 delay-100"></span>
                          <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2 delay-200"></span>
                          <span className="text-[11px] text-emerald-400 font-semibold ml-2">Microphone Transmitting</span>
                        </div>
                      )}

                      {/* Quick launch helpers */}
                      <div className="flex items-center gap-3 mt-5">
                        <button
                          onClick={toggleCamera}
                          className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold border border-purple-500/40 flex items-center gap-1.5 transition"
                        >
                          <Video className="w-3.5 h-3.5" /> Start Webcam
                        </button>
                        <button
                          onClick={toggleScreenShare}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-semibold border border-indigo-500/40 flex items-center gap-1.5 transition"
                        >
                          <Monitor className="w-3.5 h-3.5" /> Share Screen
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ZOOM-STYLE FLOATING CONTROL DOCK */}
                <div className="relative z-30 pb-4 pt-2 flex justify-center">
                  <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl flex items-center gap-2 sm:gap-3 shadow-2xl">
                    {/* 1. Mute / Unmute Button */}
                    <button
                      onClick={toggleMic}
                      className={`flex flex-col items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl transition duration-150 ${
                        isMicOn
                          ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                          : 'bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/30'
                      }`}
                      title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                    >
                      {isMicOn ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                      <span className="text-[10px] font-semibold mt-0.5 hidden sm:inline">
                        {isMicOn ? 'Mute' : 'Unmute'}
                      </span>
                    </button>

                    {/* 2. Start / Stop Video (Webcam) Button */}
                    <button
                      onClick={toggleCamera}
                      className={`flex flex-col items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl transition duration-150 ${
                        isVideoOn
                          ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/30'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                      title={isVideoOn ? 'Stop Camera' : 'Start Camera'}
                    >
                      {isVideoOn ? <Video className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />}
                      <span className="text-[10px] font-semibold mt-0.5 hidden sm:inline">
                        {isVideoOn ? 'Stop Video' : 'Start Video'}
                      </span>
                    </button>

                    {/* 3. Screen Sharing Button */}
                    <button
                      onClick={toggleScreenShare}
                      className={`flex flex-col items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl transition duration-150 ${
                        isScreenSharing
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                      title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen / App Window'}
                    >
                      <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[10px] font-semibold mt-0.5 hidden sm:inline">
                        {isScreenSharing ? 'Stop Share' : 'Share Screen'}
                      </span>
                    </button>

                    <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block"></div>

                    {/* 4. Mute All Students */}
                    <button
                      onClick={() => {
                        const next = !allMuted;
                        setAllMuted(next);
                        // Also sync individual student states
                        const newMutes = {};
                        currentAttendees.forEach((s) => {
                          const sid = s.studentId || s.id;
                          newMutes[sid] = next;
                        });
                        setMutedStudents(newMutes);
                      }}
                      className={`flex flex-col items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl transition duration-150 ${
                        allMuted
                          ? 'bg-amber-600 text-white hover:bg-amber-500'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                      title={allMuted ? 'Allow Students to Unmute' : 'Mute All Connected Students'}
                    >
                      <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[10px] font-semibold mt-0.5 hidden sm:inline">
                        {allMuted ? 'All Muted' : 'Mute All'}
                      </span>
                    </button>

                    {/* 5. Lock Room Toggle */}
                    <button
                      onClick={() => setRoomLocked(!roomLocked)}
                      className={`flex flex-col items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl transition duration-150 ${
                        roomLocked
                          ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                      title="Lock Room (Prevent new student entries)"
                    >
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[10px] font-semibold mt-0.5 hidden sm:inline">
                        {roomLocked ? 'Locked' : 'Lock Room'}
                      </span>
                    </button>

                    {/* 5b. Zoom Waiting Room Trigger (If students waiting) */}
                    {activeMeeting?.waitingRoom?.length > 0 && (
                      <button
                        onClick={() => setShowWaitingRoomModal(true)}
                        className="relative flex flex-col items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition duration-150 animate-pulse"
                        title="Manage Waiting Room (Join Requests)"
                      >
                        <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-[10px] font-bold mt-0.5 hidden sm:inline">
                          Waiting Room
                        </span>
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center shadow">
                          {activeMeeting.waitingRoom.length}
                        </span>
                      </button>
                    )}

                    {/* 5c. Screen Share Permission Toggle */}
                    <button
                      onClick={toggleAllowStudentScreenShare}
                      className={`flex flex-col items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl transition duration-150 ${
                        activeMeeting?.allowStudentScreenShare !== false
                          ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 hover:bg-purple-600/50'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title={activeMeeting?.allowStudentScreenShare !== false ? 'Students Allowed to Share Screen (Click to Restrict)' : 'Student Screen Share Restricted (Click to Allow)'}
                    >
                      <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                      <span className="text-[10px] font-semibold mt-0.5 hidden sm:inline">
                        {activeMeeting?.allowStudentScreenShare !== false ? 'Share: Allowed' : 'Share: Blocked'}
                      </span>
                    </button>

                    {/* 5d. Reactions */}
                    <div className="relative">
                      <button
                        onClick={() => setShowHostReactionsMenu(!showHostReactionsMenu)}
                        className={`flex flex-col items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl transition duration-150 ${
                          showHostReactionsMenu ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                        title="Send Emoji Reaction to Class"
                      >
                        <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-[10px] font-semibold mt-0.5 hidden sm:inline">React</span>
                      </button>
                      {showHostReactionsMenu && (
                        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-700 p-2 rounded-2xl shadow-2xl flex items-center gap-1.5 animate-fadeIn z-50">
                          {['👏', '👍', '❤️', '💡', '🎉', '🔥'].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                sendMeetingReaction?.({
                                  senderId: currentUser?.id,
                                  senderName: hostDisplayName,
                                  emoji,
                                });
                                setShowHostReactionsMenu(false);
                              }}
                              className="p-1.5 text-lg hover:scale-125 transition transform hover:bg-slate-800 rounded-xl"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 6. Switch Side Tab (Roster / Chat) */}
                    <button
                      onClick={() => setMeetingSideTab(meetingSideTab === 'roster' ? 'chat' : 'roster')}
                      className={`flex flex-col items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl transition duration-150 ${
                        meetingSideTab === 'chat'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                      title="Toggle Roster / In-Class Chat"
                    >
                      {meetingSideTab === 'chat' ? (
                        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                      <span className="text-[10px] font-semibold mt-0.5 hidden sm:inline">
                        {meetingSideTab === 'chat' ? 'Chat' : 'Roster'}
                      </span>
                    </button>

                    <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block"></div>

                    {/* 7. End Meeting Button */}
                    <button
                      onClick={() => {
                        showConfirm({
                          title: 'End Live Class Lecture?',
                          message: 'Do you want to terminate this online lecture session for all participants? Attendance data will be preserved.',
                          confirmText: 'End Class',
                          cancelText: 'Stay in Class',
                          type: 'danger',
                          onConfirm: () => {
                            stopCamera();
                            stopScreenShare();
                            if (endHostMeeting) endHostMeeting();
                            showAlert('Class lecture session ended. Meeting closed.', 'info');
                          },
                        });
                      }}
                      className="flex flex-col items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white transition duration-150 shadow-md"
                      title="End Online Meeting"
                    >
                      <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[10px] font-semibold mt-0.5 hidden sm:inline">
                        End Class
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Side Panel: Attendees Roster & In-Class Chat */}
              <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 flex flex-col justify-between shadow-xl min-h-[420px]">
                {(() => {
                  const activeChatList = (activeMeeting?.messages?.length > 0)
                    ? activeMeeting.messages
                    : meetingMessages;

                  return (
                    <div>
                      {/* Side Panel Tabs */}
                      <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800 mb-3">
                        <button
                          onClick={() => setMeetingSideTab('roster')}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            meetingSideTab === 'roster'
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Attendees ({currentAttendees.length})</span>
                        </button>
                        <button
                          onClick={() => setMeetingSideTab('chat')}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            meetingSideTab === 'chat'
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat ({activeChatList.length})</span>
                        </button>
                      </div>

                      {/* Panel Content: ATTENDEES ROSTER */}
                      {meetingSideTab === 'roster' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
                            <span>Student Participant</span>
                            <span>Microphone</span>
                          </div>
                          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                            {currentAttendees.length === 0 ? (
                              <div className="py-8 px-4 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800/80 my-2">
                                <div className="w-10 h-10 mx-auto mb-2.5 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400">
                                  <Users className="w-5 h-5 text-slate-400" />
                                </div>
                                <p className="text-xs font-semibold text-slate-300">No students admitted yet</p>
                                <p className="text-[11px] text-slate-500 mt-1 max-w-[210px] mx-auto">
                                  Students will appear here once they join and you admit them from the Waiting Room.
                                </p>
                              </div>
                            ) : (
                              currentAttendees.map((stud) => {
                                const sId = stud.studentId || stud.id;
                                const isStudentMuted = stud.isMuted !== undefined ? stud.isMuted : (mutedStudents[sId] ?? allMuted);
                                const hasHand = Boolean(stud.hasHandRaised);

                                return (
                                  <div
                                    key={sId}
                                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition"
                                  >
                                    <div className="min-w-0 pr-2">
                                      <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                                        <span>{stud.studentName || stud.name}</span>
                                        {hasHand && (
                                          <span title="Hand Raised" className="text-xs animate-bounce">✋</span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-mono">
                                        Roll: {stud.rollNo || 'N/A'} • {stud.department ? stud.department.split(' ')[0] : 'AIML'}
                                      </div>
                                    </div>

                                    <button
                                      onClick={() => {
                                        if (toggleMeetingStudentMute && stud.studentId) {
                                          toggleMeetingStudentMute(stud.studentId);
                                        }
                                        setMutedStudents((prev) => ({
                                          ...prev,
                                          [sId]: !isStudentMuted,
                                        }));
                                      }}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition flex items-center gap-1 ${
                                        isStudentMuted
                                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                                      }`}
                                      title={isStudentMuted ? 'Click to Unmute' : 'Click to Mute'}
                                    >
                                      {isStudentMuted ? (
                                        <>
                                          <MicOff className="w-3 h-3" /> Muted
                                        </>
                                      ) : (
                                        <>
                                          <Mic className="w-3 h-3" /> Live
                                        </>
                                      )}
                                    </button>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}

                      {/* Panel Content: LIVE IN-CLASS CHAT */}
                      {meetingSideTab === 'chat' && (
                        <div className="flex flex-col h-[300px]">
                          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                            {activeChatList.map((msg) => (
                              <div
                                key={msg.id}
                                className={`p-2.5 rounded-xl text-xs ${
                                  msg.isTeacher
                                    ? 'bg-purple-950/60 border border-purple-800/60 text-purple-100 ml-2'
                                    : 'bg-slate-900 border border-slate-800 text-slate-300 mr-2'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-[11px] font-bold ${msg.isTeacher ? 'text-purple-300' : 'text-slate-200'}`}>
                                    {msg.senderName || msg.sender} {msg.isTeacher && '★ (Host)'}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-mono">{msg.time}</span>
                                </div>
                                <p className="text-slate-300 leading-relaxed text-[11px]">{msg.text}</p>
                              </div>
                            ))}
                          </div>

                          {/* Chat Input */}
                          <form onSubmit={handleSendMeetingChat} className="mt-2 pt-2 border-t border-slate-800 flex gap-1.5">
                            <input
                              type="text"
                              value={newChatMsg}
                              onChange={(e) => setNewChatMsg(e.target.value)}
                              placeholder="Type message to class..."
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                            <button
                              type="submit"
                              disabled={!newChatMsg.trim()}
                              className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Sync Class Attendance Button */}
                <div className="pt-3 border-t border-slate-800 mt-2">
                  <button
                    onClick={() => {
                      if (currentAttendees.length === 0) {
                        showToast?.({
                          type: 'warning',
                          title: 'No Attendees Connected',
                          message: 'There are currently no admitted students in this live lecture to sync attendance for.',
                        }) || alert('There are currently no admitted students in this live lecture to sync.');
                        return;
                      }
                      const count = currentAttendees.length;
                      showToast?.({
                        type: 'success',
                        title: 'Attendance Synced',
                        message: `Successfully synced ${count} online participant(s) to today's Attendance Register (${meetingTargetDept === 'ALL' ? 'All Classes' : meetingTargetDept})!`,
                      }) || alert(`Successfully synced ${count} online participant(s) to today's Attendance Register!`);
                    }}
                    disabled={currentAttendees.length === 0}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition ${
                      currentAttendees.length === 0
                        ? 'bg-slate-800/70 text-slate-500 cursor-not-allowed border border-slate-700/50'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Sync Class Attendance ({currentAttendees.length})
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal: Zoom Waiting Room Management */}
            {showWaitingRoomModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">Zoom Waiting Room</h4>
                        <p className="text-xs text-slate-400">Admit students individually or all at once</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowWaitingRoomModal(false)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {(activeMeeting?.waitingRoom || []).length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">
                        No students currently in waiting room.
                      </p>
                    ) : (
                      (activeMeeting?.waitingRoom || []).map((req) => (
                        <div
                          key={req.id || req.studentId}
                          className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={req.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(req.studentName)}`}
                              alt={req.studentName}
                              className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                            />
                            <div>
                              <h5 className="text-xs font-bold text-white">{req.studentName}</h5>
                              <p className="text-[10px] text-slate-400 font-mono">
                                Roll: {req.rollNo} • {req.department}
                              </p>
                              <span className="text-[9px] text-amber-400/80 font-mono">
                                Waiting since {req.requestedAt}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => admitStudentToMeeting(req.studentId)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Admit</span>
                            </button>
                            <button
                              onClick={() => denyStudentFromMeeting(req.studentId)}
                              className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600/30 text-rose-400 hover:text-rose-200 text-xs font-semibold border border-slate-700 hover:border-rose-500/50 transition"
                              title="Deny Access"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <span className="text-xs text-slate-400 font-mono">
                      {(activeMeeting?.waitingRoom || []).length} student(s) in queue
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowWaitingRoomModal(false)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                      >
                        Close
                      </button>
                      {(activeMeeting?.waitingRoom || []).length > 0 && (
                        <button
                          onClick={() => {
                            admitAllWaitingStudents();
                            setShowWaitingRoomModal(false);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition"
                        >
                          Admit All
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 6. STUDENT REMINDER AWARENESS HUB */}
      {activeTab === 'awareness' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                Student Reminder Awareness Hub
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review lecture, lab, attendance, and timetable schedule reminders sent by students. Reminders pop up automatically on your portal.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>{awarenessMessages.filter((m) => m.status === 'UNSEEN').length} Unseen Pop-up Alerts</span>
            </span>
          </div>

          {awarenessMessages.length > 0 ? (
            <div className="space-y-3.5">
              {awarenessMessages.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:bg-slate-800/70 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold flex items-center justify-center text-sm flex-shrink-0 shadow-sm">
                        {m.studentName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{m.studentName}</span>
                          <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                            Roll {m.studentRoll}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Bell className="w-3 h-3 text-amber-400" />
                            Reminder
                          </span>
                        </div>
                        <p className="text-xs text-indigo-300 mt-0.5">
                          For: <strong className="text-white">{m.teacherName}</strong> • Topic:{' '}
                          <span className="text-slate-300">{m.subject}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-[11px] text-slate-400 font-mono">{m.timestamp}</span>
                      {m.status === 'UNSEEN' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                          Unseen Pop-up
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          Acknowledged
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Clean Reminder Message Body */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans shadow-inner">
                    "{m.message}"
                  </div>

                  {/* Acknowledge Control Button */}
                  <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      Reminder awareness notification
                    </span>

                    {m.status === 'UNSEEN' ? (
                      <button
                        onClick={() => acknowledgeReminder(m.id)}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/30 transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Acknowledge & Mark Seen</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Seen & Acknowledged</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
              <Bell className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-slate-300 text-sm">No student reminders pending</p>
              <p className="text-slate-500 mt-1 max-w-md mx-auto">
                When students send lecture, lab, or timetable reminders, they will automatically pop up on your screen and be logged here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
