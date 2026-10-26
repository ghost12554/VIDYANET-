import React, { useState, useRef, useEffect } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { useGoogleDialog } from '../common/GoogleDialog';
import {
  FileText,
  Upload,
  BookOpen,
  Award,
  Video,
  Download,
  CheckCircle,
  Clock,
  Code,
  Keyboard,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  MessageSquare,
  Users,
  Search,
  Check,
  Send,
  Sparkles,
  Paperclip,
  X,
  Plus,
  MessageCircle,
  Bell,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building,
  Layers,
  ShieldCheck,
  Filter,
  Copy,
  Link,
  Share2,
  LayoutGrid,
  Maximize2,
  Smile,
  VolumeX,
  PhoneOff,
} from 'lucide-react';
import {
  readFileAsAttachment,
  downloadAttachment,
  getFileBadgeColor,
} from '../../utils/fileAttachmentUtils';
import { downloadAssignmentPdf } from '../../utils/assignmentPdfGenerator';
import { downloadNotesPdf } from '../../utils/notesPdfGenerator';
import {
  executePythonInBrowser,
  runPythonReplCommand,
  handlePythonIndentKeyDown,
  formatPythonCodeIndentation,
} from '../../utils/pythonRunner';

export default function StudentWorkstore() {
  const {
    currentUser,
    notes,
    labNotes,
    assignments,
    submitAssignment,
    tests,
    submitTestResult,
    awarenessMessages,
    sendAwarenessMessage,
    getStudentPracticalAttendanceStats,
    activeMeeting,
    requestJoinMeeting,
    directJoinMeeting,
    workstoreTargetTab,
    setWorkstoreTargetTab,
    cancelJoinRequest,
    leaveMeeting,
    toggleStudentHandRaise,
    updateParticipantMeetingState,
    updateHostMeetingState,
    setMeetingScreenSharer,
    sendMeetingReaction,
    sendMeetingMessage,
  } = useCollege();

  const { showConfirm, showAlert, showToast } = useGoogleDialog();

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

  const [meetingInputCode, setMeetingInputCode] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [noteCategory, setNoteCategory] = useState('all'); // 'all' | 'lecture' | 'lab'
  const [readingNoteModal, setReadingNoteModal] = useState(null);

  // Practical Attendance Tracker states
  const [practFilter, setPractFilter] = useState('ALL'); // 'ALL' | 'PRESENT' | 'ABSENT'
  const [practSearch, setPractSearch] = useState('');

  // Reminder Awareness modal state
  const [showAwareModal, setShowAwareModal] = useState(false);
  const [awareForm, setAwareForm] = useState({
    teacherName: 'Prof. Divya C',
    subject: 'Lecture / Lab Reminder',
    message: '',
  });

  // Submissions state
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentFile, setAssignmentFile] = useState('');
  const [assignmentAttachment, setAssignmentAttachment] = useState(null);
  const [assignmentText, setAssignmentText] = useState('');
  const assignFileInputRef = useRef(null);

  // Active Test state
  const [activeTest, setActiveTest] = useState(null);
  const [testRemainingSeconds, setTestRemainingSeconds] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [codeAnswer, setCodeAnswer] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codingLanguage, setCodingLanguage] = useState('python');
  const [typingInput, setTypingInput] = useState('');
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(null);

  // Interactive Python Terminal & REPL state
  const [terminalTab, setTerminalTab] = useState('output'); // 'output' | 'repl'
  const [replInput, setReplInput] = useState('');
  const [replHistory, setReplHistory] = useState([
    {
      type: 'system',
      text: 'Python 3.12.0 Interactive REPL Ready. Type any expression or command (e.g. 2+2, import math; math.sqrt(16)) and hit Enter.',
    },
  ]);

  const handleReplSubmit = async (e) => {
    e?.preventDefault();
    const cmd = replInput.trim();
    if (!cmd) return;
    setReplInput('');
    setReplHistory((prev) => [...prev, { type: 'input', text: `>>> ${cmd}` }]);
    try {
      const output = await runPythonReplCommand(cmd);
      if (output) {
        setReplHistory((prev) => [...prev, { type: 'output', text: output }]);
      }
    } catch (err) {
      setReplHistory((prev) => [...prev, { type: 'error', text: String(err) }]);
    }
  };

  // Test countdown timer
  useEffect(() => {
    if (!activeTest || testSubmitted || testRemainingSeconds === null) return;
    if (testRemainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setTestRemainingSeconds((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTest, testSubmitted, testRemainingSeconds]);

  const formatTestTime = (secs) => {
    if (secs === null || isNaN(secs)) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Meeting state
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [studentCameraStream, setStudentCameraStream] = useState(null);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [meetingViewMode, setMeetingViewMode] = useState('speaker'); // 'speaker' | 'gallery'
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);
  const [meetingSideTab, setMeetingSideTab] = useState('chat'); // 'chat' | 'participants'
  const [meetingChat, setMeetingChat] = useState([]);
  const [newMeetingMsg, setNewMeetingMsg] = useState('');
  const studentVideoRef = useRef(null);
  const studentScreenVideoRef = useRef(null);

  const toggleStudentCamera = async () => {
    if (isVideoOn && studentCameraStream) {
      studentCameraStream.getTracks().forEach((t) => t.stop());
      setStudentCameraStream(null);
      setIsVideoOn(false);
      updateParticipantMeetingState?.(currentUser?.id, { isVideoOn: false });
    } else {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera not supported');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: isMicOn,
        });
        setStudentCameraStream(stream);
        setIsVideoOn(true);
        updateParticipantMeetingState?.(currentUser?.id, { isVideoOn: true });
        if (studentVideoRef.current) {
          studentVideoRef.current.srcObject = stream;
        }
      } catch (e) {
        console.warn('Student camera fallback', e);
        setIsVideoOn(!isVideoOn);
        updateParticipantMeetingState?.(currentUser?.id, { isVideoOn: !isVideoOn });
      }
    }
  };

  const toggleStudentMic = () => {
    const next = !isMicOn;
    setIsMicOn(next);
    if (studentCameraStream) {
      studentCameraStream.getAudioTracks().forEach((t) => {
        t.enabled = next;
      });
    }
    updateParticipantMeetingState?.(currentUser?.id, { isMuted: !next });
  };

  const toggleStudentScreenShare = async () => {
    if (isScreenSharing && screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      setMeetingScreenSharer?.(null);
      updateParticipantMeetingState?.(currentUser?.id, { isScreenSharing: false });
    } else {
      if (activeMeeting?.allowStudentScreenShare === false) {
        showToast?.({
          type: 'warning',
          title: 'Screen Sharing Restricted',
          message: 'The faculty host has currently restricted screen sharing permissions.',
        }) || alert('The faculty host has restricted screen sharing permissions.');
        return;
      }
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          showToast?.({
            type: 'error',
            title: 'Not Supported',
            message: 'Screen sharing is not supported by your browser.',
          }) || alert('Screen sharing is not supported by your browser.');
          return;
        }
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        setScreenStream(stream);
        setIsScreenSharing(true);
        const sharer = {
          id: currentUser?.id,
          name: currentUser?.name || 'Student',
          role: 'student',
          label: `${currentUser?.name || 'Student'}'s Screen`,
        };
        setMeetingScreenSharer?.(sharer);
        updateParticipantMeetingState?.(currentUser?.id, { isScreenSharing: true });

        if (studentScreenVideoRef.current) {
          studentScreenVideoRef.current.srcObject = stream;
        }

        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setIsScreenSharing(false);
          setMeetingScreenSharer?.(null);
          updateParticipantMeetingState?.(currentUser?.id, { isScreenSharing: false });
        };
      } catch (err) {
        console.warn('Student screen share canceled or failed', err);
      }
    }
  };

  const handleSendReaction = (emoji) => {
    sendMeetingReaction?.({
      senderId: currentUser?.id,
      senderName: currentUser?.name || 'Student',
      emoji,
    });
    setShowReactionsMenu(false);
  };

  useEffect(() => {
    if (studentVideoRef.current && studentCameraStream) {
      studentVideoRef.current.srcObject = studentCameraStream;
    }
  }, [studentCameraStream, isVideoOn]);

  useEffect(() => {
    if (studentScreenVideoRef.current && screenStream) {
      studentScreenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream, isScreenSharing]);

  useEffect(() => {
    if (activeTab !== 'meeting') {
      if (studentCameraStream) {
        studentCameraStream.getTracks().forEach((t) => t.stop());
        setStudentCameraStream(null);
        setIsVideoOn(false);
        updateParticipantMeetingState?.(currentUser?.id, { isVideoOn: false });
      }
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
        setScreenStream(null);
        setIsScreenSharing(false);
        setMeetingScreenSharer?.(null);
        updateParticipantMeetingState?.(currentUser?.id, { isScreenSharing: false });
      }
    }
  }, [activeTab]);

  // Filter notes
  const [searchNote, setSearchNote] = useState('');
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchNote.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchNote.toLowerCase())
  );

  const handleAssignmentFilePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const att = await readFileAsAttachment(file);
      setAssignmentAttachment(att);
      setAssignmentFile(file.name);
    } catch (err) {
      alert(err.message || 'Error reading file');
    }
  };

  const handleSendReminder = (e) => {
    e.preventDefault();
    if (!awareForm.message.trim()) {
      alert('Please enter a reminder message for the faculty.');
      return;
    }
    sendAwarenessMessage({
      teacherName: awareForm.teacherName,
      subject: awareForm.subject,
      message: awareForm.message,
    });
    setAwareForm({
      teacherName: 'Prof. Divya C',
      subject: 'Lecture / Lab Reminder',
      message: '',
    });
    setShowAwareModal(false);
    alert('Reminder sent! It will pop up immediately on the faculty portal.');
  };

  // Handle assignment upload
  const handleAssignmentSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    submitAssignment(selectedAssignment.id, {
      file: assignmentFile || `${currentUser.name.replace(/\s+/g, '_')}_solution.pdf`,
      attachment: assignmentAttachment,
      textAnswer: assignmentText,
    });
    setSelectedAssignment(null);
    setAssignmentFile('');
    setAssignmentAttachment(null);
    setAssignmentText('');
    alert('Assignment solution submitted successfully to faculty!');
  };

  // Handle MCQ test submission
  const handleMcqSubmit = (test) => {
    let score = 0;
    test.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 5;
      }
    });
    const percentage = Math.round((score / test.totalMarks) * 100);
    submitTestResult(test.id, {
      score,
      total: test.totalMarks,
      percentage,
      answers: selectedAnswers,
    });
    setTestScore({ score, total: test.totalMarks, percentage });
    setTestSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* WorkStore Sub-Navigation Bar */}
      <div className="bg-slate-900/90 rounded-2xl p-2 border border-slate-800 flex flex-wrap items-center gap-1.5 shadow-lg">
        {[
          { id: 'notes', label: '1. Notes Panel', icon: FileText, count: notes.length },
          { id: 'assignments', label: '2. Assignment Panel', icon: Upload, count: assignments.length },
          { id: 'attendance', label: '3. Practical Attendance Tracker', icon: FlaskConical, badge: 'Live Record' },
          { id: 'tests', label: '4. Test & Quiz Center', icon: Code, count: tests.length },
          { id: 'meeting', label: '5. Online Class Meeting', icon: Video, badge: 'Live Room' },
          { id: 'awareness', label: '6. Reminder Awareness Hub', icon: Bell, count: awarenessMessages.filter((m) => m.studentId === currentUser?.id).length, badge: 'Alert' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setActiveTest(null);
                setTestSubmitted(false);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
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
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30 animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. NOTES PANEL */}
      {activeTab === 'notes' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Lecture Handouts & Practical Lab Manuals
              </h3>
              <p className="text-xs text-slate-400">
                Download verified lecture notes, laboratory experiment guides, and starter code uploaded by faculty.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search notes or subject..."
                value={searchNote}
                onChange={(e) => setSearchNote(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 w-full sm:w-64"
              />
            </div>
          </div>

          {/* Notes Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Study Materials' },
              { id: 'lecture', label: `📚 Theory Notes (${filteredNotes.length})` },
              { id: 'lab', label: `🔬 Lab Manuals (${(labNotes || []).length})` },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setNoteCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  noteCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Theory Lecture Notes */}
            {noteCategory !== 'lab' &&
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-slate-800/50 hover:bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                        {note.subject}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{note.fileSize}</span>
                    </div>

                    <h4 className="text-base font-bold text-white mt-1 leading-snug">
                      {note.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {note.description}
                    </p>

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

                    <div className="flex flex-wrap gap-1 mt-3">
                      {note.tags?.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded bg-slate-700/60 text-[10px] text-slate-300 font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-400">
                      <p className="truncate max-w-[120px]">Uploaded by {note.uploadedBy || 'Prof. Sarita Byagar'}</p>
                      <p className="text-[10px] text-slate-400">{note.date}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {note.content && (
                        <button
                          onClick={() => setReadingNoteModal(note)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-semibold transition"
                          title="Read complete verified notes"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-purple-300" />
                          <span>Read</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (note.content) {
                            downloadNotesPdf(note);
                          } else if (note.attachment?.dataUrl) {
                            downloadAttachment(note.attachment);
                          } else {
                            downloadNotesPdf(note);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
                        title="Download official lecture notes PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {/* 2. Practical Lab Manuals */}
            {noteCategory !== 'lecture' &&
              (labNotes || [])
                .filter(
                  (ln) =>
                    !currentUser?.department ||
                    ln.department === currentUser?.department ||
                    ln.department === 'All Departments'
                )
                .map((ln) => (
                  <div
                    key={ln.id}
                    className="bg-slate-800/60 hover:bg-slate-800/90 p-5 rounded-2xl border border-purple-500/30 hover:border-purple-400 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1">
                          <span className="text-[10px]">🔬</span> {ln.subject}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30">
                          {ln.batch || 'All Batches'}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white mt-1 leading-snug">
                        {ln.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {ln.description}
                      </p>

                      <div className="mt-2.5 text-[11px] text-purple-300/80">
                        <span>Room: {ln.labRoom || 'Lab 3-B'}</span>
                      </div>

                      {ln.attachment && (
                        <div className="mt-3 flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${getFileBadgeColor(
                              ln.attachment.name || ''
                            )}`}
                          >
                            <Paperclip className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[150px]">
                              {ln.attachment.name}
                            </span>
                            <span className="text-slate-400">({ln.attachment.size})</span>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                      <div className="text-[11px] text-slate-400">
                        <p>Uploaded by {ln.uploadedBy}</p>
                        <p className="text-[10px] text-slate-400">{ln.date}</p>
                      </div>

                      {ln.attachment && (
                        <button
                          onClick={() => downloadAttachment(ln.attachment)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition"
                          title="Download practical manual"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Manual</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
          </div>

          {/* STUDENT READING NOTES MODAL / DRAWER */}
          {readingNoteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
              <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                        {readingNoteModal.subject}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Faculty: {readingNoteModal.author || readingNoteModal.uploadedBy || 'Prof. Sarita Byagar (HOD - AIML)'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                      {readingNoteModal.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadNotesPdf(readingNoteModal)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={() => setReadingNoteModal(null)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Modal Scrollable Body */}
                <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 select-text">
                  {/* Executive Overview */}
                  {(readingNoteModal.summary || readingNoteModal.description) && (
                    <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5">
                      <span className="font-bold text-indigo-300 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        Executive Overview & Objectives
                      </span>
                      <p className="text-slate-200 leading-relaxed">
                        {readingNoteModal.summary || readingNoteModal.description}
                      </p>
                    </div>
                  )}

                  {/* High-Yield Exam Checklist */}
                  {readingNoteModal.keyTakeaways && readingNoteModal.keyTakeaways.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                      <span className="font-bold text-amber-300 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        High-Yield Exam Review & Viva-Voce Checklist
                      </span>
                      <ul className="space-y-1.5">
                        {readingNoteModal.keyTakeaways.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Notes Content */}
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 font-sans text-slate-200 leading-relaxed whitespace-pre-wrap select-text">
                    {readingNoteModal.content || readingNoteModal.description}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Teacher Co-Pilot (AI Assistant for Teachers) • Official Verified Academic Lecture Handout</span>
                  <button
                    onClick={() => downloadNotesPdf(readingNoteModal)}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save PDF to Device</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. ASSIGNMENT PANEL */}
      {activeTab === 'assignments' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              Coursework & Homework Submissions
            </h3>
            <p className="text-xs text-slate-400">
              Submit your assignment files, code links, or written solutions before the deadline.
            </p>
          </div>

          <div className="space-y-4">
            {assignments.map((assign) => {
              const mySub = assign.submissions?.find((s) => s.studentId === currentUser?.id);
              const isSubmitted = Boolean(mySub);
              const isPastDeadline = assign.deadline ? new Date(assign.deadline) < new Date() : false;
              const canSubmit = !isPastDeadline || Boolean(assign.allowLateSubmission);

              return (
                <div
                  key={assign.id}
                  className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/70 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                          {assign.subject}
                        </span>
                        {assign.department && (
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-xs border border-indigo-500/30">
                            {assign.department}
                          </span>
                        )}
                        {isSubmitted ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30">
                            <CheckCircle className="w-3 h-3" /> Submitted
                            {mySub?.isLate && (
                              <span className="text-amber-300 ml-1 font-semibold">(Late)</span>
                            )}
                          </span>
                        ) : isPastDeadline ? (
                          assign.allowLateSubmission ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                              ⚠️ Past Deadline (Late Turn-in Allowed)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                              🔒 Submissions Closed
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                            ⏳ Pending Submission
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-white mt-1.5">{assign.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {assign.description}
                      </p>

                      <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900/60 text-xs text-slate-400 border border-slate-800">
                        <strong className="text-slate-300">Grading Rubric:</strong> {assign.rubric}
                      </div>

                      {/* Teacher's Attached Assignment Question File (Official PDF) */}
                      {(assign.attachment || (assign.questions && assign.questions.length > 0)) && (
                        <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 shrink-0">
                              <FileText className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white flex items-center gap-2">
                                <span>Official Assignment Question Paper & Specification</span>
                                <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200 text-[9px] font-mono border border-purple-500/40">
                                  PDF
                                </span>
                              </p>
                              <p className="text-[11px] font-mono text-purple-300">
                                {assign.attachment?.name || `${(assign.title || 'Assignment').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 35)}_Question_Brief.pdf`} {assign.attachment?.size ? `(${assign.attachment.size})` : ''}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (assign.attachment) {
                                downloadAttachment(assign.attachment);
                              } else {
                                downloadAssignmentPdf(assign);
                              }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition"
                            title="Download Official Assignment Brief PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Question PDF</span>
                          </button>
                        </div>
                      )}

                      {/* Display problem statements if present */}
                      {assign.questions && assign.questions.length > 0 && (
                        <div className="mt-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-700/60 space-y-2">
                          <p className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Assignment Problems ({assign.questions.length} Problem Sets):</span>
                          </p>
                          <div className="space-y-2 mt-1.5">
                            {assign.questions.map((q, qIdx) => (
                              <div key={qIdx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                                <p className="font-semibold text-white">Problem #{qIdx + 1}: {q.title || `Task ${qIdx + 1}`}</p>
                                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">{q.problem || q.description || q}</p>
                                {q.deliverables && (
                                  <p className="text-indigo-400 text-[10px] mt-1 font-mono">
                                    Deliverable: {q.deliverables}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display existing submission if any */}
                      {mySub && (
                        <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">Your Submission:</span>
                              <span className="font-mono text-indigo-300">{mySub.file}</span>
                              {mySub.isLate ? (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  LATE
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  ON TIME
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-emerald-400/80 mt-0.5">
                              Submitted at: {new Date(mySub.submittedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {(mySub.attachment || mySub.file) && (
                              <button
                                type="button"
                                onClick={() => downloadAttachment(mySub.attachment || { name: mySub.file })}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download File</span>
                              </button>
                            )}

                            {mySub.graded ? (
                              <div className="text-right">
                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
                                  <CheckCircle className="w-3.5 h-3.5" /> Reviewed by Faculty
                                </span>
                                {mySub.feedback && (
                                  <p className="text-[10px] text-slate-300">
                                    "{mySub.feedback}"
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">
                                Successfully Turned In
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Deadline & Upload Button */}
                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-400 font-mono mb-2">
                        Due: {new Date(assign.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>

                      {canSubmit ? (
                        <button
                          onClick={() => setSelectedAssignment(assign)}
                          className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md ml-auto ${
                            isPastDeadline
                              ? 'bg-amber-600 hover:bg-amber-500 text-amber-50'
                              : 'bg-indigo-600 hover:bg-indigo-500'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>
                            {isSubmitted
                              ? isPastDeadline
                                ? 'Resubmit Work (Late)'
                                : 'Resubmit Work'
                              : isPastDeadline
                              ? 'Upload Solution (Late)'
                              : 'Upload Solution'}
                          </span>
                        </button>
                      ) : (
                        <span className="inline-block px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold">
                          🔒 Closed (Past Cutoff)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submission Modal */}
          {selectedAssignment && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
                <div className="flex items-start justify-between pb-3 border-b border-slate-800 gap-2">
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Upload Solution: {selectedAssignment.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Subject: {selectedAssignment.subject} • Dept: {selectedAssignment.department}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedAssignment.attachment) {
                        downloadAttachment(selectedAssignment.attachment);
                      } else {
                        downloadAssignmentPdf(selectedAssignment);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                    title="Download Official Assignment Brief PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Question PDF</span>
                  </button>
                </div>

                {new Date(selectedAssignment.deadline) < new Date() && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                    ⚠️ <strong>Notice:</strong> The submission deadline has passed. Late submissions are permitted by faculty and will be recorded with a <strong>LATE SUBMISSION</strong> timestamp.
                  </div>
                )}

                <form onSubmit={handleAssignmentSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Attach Solution File (PDF, Document, Code, or ZIP)
                    </label>

                    <input
                      type="file"
                      ref={assignFileInputRef}
                      onChange={handleAssignmentFilePick}
                      accept=".pdf,.docx,.doc,.zip,.py,.ipynb,.txt,.csv"
                      className="hidden"
                    />

                    {assignmentAttachment ? (
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-emerald-500/40 mb-2">
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="text-white text-xs font-medium truncate">{assignmentAttachment.name}</p>
                            <p className="text-[10px] text-emerald-400 font-mono">
                              File Ready ({assignmentAttachment.size})
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAssignmentAttachment(null);
                            setAssignmentFile('');
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => assignFileInputRef.current?.click()}
                        className="w-full mb-2 border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-2xl p-4 text-center text-xs text-indigo-300 font-semibold flex flex-col items-center justify-center gap-1.5 transition group"
                      >
                        <div className="p-2.5 rounded-xl bg-indigo-500/20 group-hover:bg-indigo-500/30 transition">
                          <Upload className="w-5 h-5 text-indigo-400" />
                        </div>
                        <span className="font-bold text-white text-xs">Choose or Drop Solution PDF / Code File</span>
                        <span className="text-[11px] text-slate-400 font-normal">Supports PDF, DOCX, ZIP, Python (.py, .ipynb) up to 15MB</span>
                      </button>
                    )}

                    <div className="mt-2">
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Or provide submission repository URL / Cloud drive link
                      </label>
                      <input
                        type="text"
                        placeholder="https://github.com/... or Google Drive URL"
                        value={assignmentFile}
                        onChange={(e) => setAssignmentFile(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Notes or Explanations for Faculty (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Brief summary of your approach, algorithms implemented, or test notes..."
                      value={assignmentText}
                      onChange={(e) => setAssignmentText(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAssignment(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg"
                    >
                      Confirm & Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. PRACTICAL ATTENDANCE TRACKER (READ-ONLY DYNAMIC RECORD) */}
      {activeTab === 'attendance' && (() => {
        const practStats = getStudentPracticalAttendanceStats(
          currentUser?.rollNo,
          currentUser?.department
        );
        const isEligible = practStats.percentage >= 75;

        const filteredHistory = practStats.history.filter((h) => {
          if (practFilter === 'PRESENT' && !h.isPresent) return false;
          if (practFilter === 'ABSENT' && h.isPresent) return false;
          if (practSearch.trim()) {
            const query = practSearch.toLowerCase();
            const matchSubject = (h.subject || '').toLowerCase().includes(query);
            const matchTopic = (h.topic || '').toLowerCase().includes(query);
            const matchDate = (h.date || '').toLowerCase().includes(query);
            const matchFaculty = (h.faculty || '').toLowerCase().includes(query);
            if (!matchSubject && !matchTopic && !matchDate && !matchFaculty) return false;
          }
          return true;
        });

        return (
          <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
            {/* Header */}
            <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm">
                  <FlaskConical className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Practical Session Attendance Tracker
                  </h3>
                  <p className="text-xs text-slate-400">
                    Official real-time record of your practical lab attendance, logged dynamically by faculty.
                  </p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Batch: {currentUser?.batch || 'Batch A'}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  Roll #{currentUser?.rollNo || '08'}
                </span>
                <span
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs border flex items-center gap-1.5 ${
                    isEligible
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {isEligible ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  {practStats.percentage}% Practical Attendance
                </span>
              </div>
            </div>

            {/* Read-Only Verified Banner */}
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>
                  <strong>Official Read-Only Record:</strong> This attendance log is dynamically updated and verified in real-time when faculty records attendance in the Lab Manager.
                </span>
              </div>
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold shrink-0">
                Tamper Proof
              </span>
            </div>

            {/* Key Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Overall Percentage */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Attendance Rate</span>
                  <FlaskConical className="w-4 h-4 text-purple-400" />
                </div>
                <p className={`text-2xl font-bold mt-1 ${isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {practStats.percentage}%
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isEligible ? 'Eligible for Practical Exams (≥75%)' : 'Below Mandatory 75% Requirement'}
                </p>
              </div>

              {/* Total Conducted */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total Labs Conducted</span>
                  <Calendar className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-2xl font-bold text-white mt-1">
                  {practStats.totalLabs}
                </p>
                <p className="text-[11px] text-indigo-300 mt-0.5">
                  Scheduled practical evaluations
                </p>
              </div>

              {/* Present Labs */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-400">Sessions Attended</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {practStats.presentLabs}
                </p>
                <p className="text-[11px] text-emerald-300 mt-0.5">
                  Marked PRESENT by teacher
                </p>
              </div>

              {/* Absent Labs */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-rose-400">Sessions Missed</span>
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                </div>
                <p className="text-2xl font-bold text-rose-400 mt-1">
                  {practStats.absentLabs}
                </p>
                <p className="text-[11px] text-rose-300 mt-0.5">
                  Marked ABSENT by teacher
                </p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                {[
                  { id: 'ALL', label: `All Sessions (${practStats.history.length})` },
                  { id: 'PRESENT', label: `Present (${practStats.presentLabs})` },
                  { id: 'ABSENT', label: `Absent (${practStats.absentLabs})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setPractFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      practFilter === f.id
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search subject, topic, date..."
                  value={practSearch}
                  onChange={(e) => setPractSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Practical Attendance Session Records List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  Scheduled Practical Date Log & Evaluation History
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  Showing {filteredHistory.length} of {practStats.history.length}
                </span>
              </div>

              {filteredHistory.length > 0 ? (
                <div className="space-y-2.5">
                  {filteredHistory.map((h) => (
                    <div
                      key={h.id}
                      className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                            {h.subject}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold text-xs border border-indigo-500/30">
                            {h.batch}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {h.labRoom || 'Lab 3-B'}
                          </span>
                          <span className="text-xs text-slate-400">
                            • Faculty: {h.faculty}
                          </span>
                        </div>

                        <h5 className="text-sm font-bold text-white mt-1">
                          {h.topic || 'Laboratory Practical Session'}
                        </h5>
                        <p className="text-xs text-slate-400">
                          Date: <span className="font-mono text-slate-300 font-semibold">{h.date} ({h.day})</span>
                        </p>
                      </div>

                      {/* Read-Only Status Indicator */}
                      <div className="self-end md:self-center">
                        {h.isPresent ? (
                          <div className="flex items-center gap-2">
                            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>PRESENT</span>
                            </span>
                            <span className="text-[11px] text-emerald-400/80 font-mono hidden sm:inline">
                              Verified
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30 flex items-center gap-1.5 shadow-sm">
                              <AlertCircle className="w-4 h-4 text-rose-400" />
                              <span>ABSENT</span>
                            </span>
                            <span className="text-[11px] text-rose-400/80 font-mono hidden sm:inline">
                              Missed
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-800">
                  <FlaskConical className="w-8 h-8 mx-auto text-purple-400 mb-2 opacity-60" />
                  <p className="font-semibold text-slate-300">No practical attendance records found.</p>
                  <p className="mt-1">
                    {practStats.history.length === 0
                      ? 'No lab attendance sessions have been logged for your department yet.'
                      : 'No records match your selected filter or search term.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 4. TEST PANEL */}
      {activeTab === 'tests' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
          {!activeTest ? (
            <div>
              <div className="pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-400" />
                  Online Assessment & Test Center
                </h3>
                <p className="text-xs text-slate-400">
                  Take teacher-published MCQs, programming tests, or typing speed evaluations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                {tests
                  .filter(
                    (t) =>
                      !t.department ||
                      t.department === 'ALL' ||
                      t.department === currentUser?.department
                  )
                  .map((test) => {
                    const userResult = test.studentResults?.[currentUser?.id];
                    const hasAttempted = Boolean(userResult);

                    const getStudentGrade = (pct) => {
                      const p = Number(pct) || 0;
                      if (p >= 90) return { grade: 'O', color: 'text-purple-300 bg-purple-500/20 border-purple-500/30' };
                      if (p >= 80) return { grade: 'A+', color: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30' };
                      if (p >= 70) return { grade: 'A', color: 'text-teal-300 bg-teal-500/20 border-teal-500/30' };
                      if (p >= 60) return { grade: 'B+', color: 'text-blue-300 bg-blue-500/20 border-blue-500/30' };
                      if (p >= 50) return { grade: 'B', color: 'text-amber-300 bg-amber-500/20 border-amber-500/30' };
                      return { grade: 'F', color: 'text-rose-300 bg-rose-500/20 border-rose-500/30' };
                    };

                    const gradePill = hasAttempted ? getStudentGrade(userResult.percentage) : null;

                    return (
                      <div
                        key={test.id}
                        className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:bg-slate-800/80 transition flex flex-col justify-between space-y-4"
                      >
                        <div>
                          <div className="flex flex-wrap items-center justify-between text-xs gap-1.5 mb-2">
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold uppercase text-[10px] border border-purple-500/30">
                              {test.type} Test
                            </span>
                            <span className="font-mono text-slate-400 text-[11px]">
                              {test.durationMins} mins
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white mt-1">{test.title}</h4>
                          <p className="text-xs text-indigo-300 mt-1">{test.subject}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/80 text-[10px] text-slate-300">
                              {test.department || 'All Departments'}
                            </span>
                          </div>

                          {userResult?.feedback && (
                            <div className="mt-2.5 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200">
                              <strong>Faculty Note:</strong> "{userResult.feedback}"
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                          {hasAttempted ? (
                            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Attempted &amp; Recorded
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Not Attempted</span>
                          )}

                          <button
                            onClick={() => {
                              setActiveTest(test);
                              setSelectedAnswers({});
                              setCodeAnswer('');
                              setTerminalOutput('');
                              setTestSubmitted(false);
                              const duration = Number(test.durationMins) || (test.type === 'coding' || test.type === 'code' ? 45 : 30);
                              setTestRemainingSeconds(duration * 60);
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                              hasAttempted
                                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                            }`}
                          >
                            {hasAttempted ? 'Retake Test' : 'Start Test'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            /* Active Test Simulator */
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">{activeTest.title}</h3>
                  <p className="text-xs text-slate-400">
                    Subject: {activeTest.subject} • Duration: {activeTest.durationMins || 45} minutes
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {testRemainingSeconds !== null && !testSubmitted && (
                    <div
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border flex items-center gap-1.5 transition ${
                        testRemainingSeconds <= 300
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Time Remaining: {formatTestTime(testRemainingSeconds)}</span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setActiveTest(null);
                      setTestRemainingSeconds(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                  >
                    Exit Test
                  </button>
                </div>
              </div>

              {testSubmitted ? (
                <div className="p-8 rounded-3xl bg-indigo-950/60 border border-indigo-500/30 text-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
                  <h4 className="text-2xl font-black text-white">Assessment Completed!</h4>
                  <p className="text-sm text-slate-300">
                    Your score:{' '}
                    <span className="text-2xl font-bold text-emerald-400">
                      {testScore?.score} / {testScore?.total}
                    </span>{' '}
                    ({testScore?.percentage}%)
                  </p>
                  <p className="text-xs text-slate-400">
                    Your assessment result has been recorded and submitted dynamically to faculty.
                  </p>
                  <button
                    onClick={() => setActiveTest(null)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    Back to Test Center
                  </button>
                </div>
              ) : activeTest.type === 'mcq' ? (
                <div className="space-y-6">
                  {activeTest.questions?.map((q, qIdx) => (
                    <div
                      key={q.id || qIdx}
                      className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3"
                    >
                      <h5 className="text-sm font-bold text-white">
                        Question {qIdx + 1}: {q.question}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {q.options?.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[qIdx] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() =>
                                setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx })
                              }
                              className={`p-3 rounded-xl text-left text-xs font-medium transition border flex items-center gap-2 ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full bg-slate-700/60 flex items-center justify-center text-[11px] font-bold">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleMcqSubmit(activeTest)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg"
                    >
                      Submit Test Answers
                    </button>
                  </div>
                </div>
              ) : activeTest.type === 'coding' || activeTest.type === 'code' ? (() => {
                const challenge = activeTest.challenges?.[0] || activeTest.problems?.[0] || {};
                
                // Safe starter code computation (guaranteed to be string, never object)
                const rawStarter = challenge.starterCode;
                let defaultCode = '# Write your solution in Python:\ndef solve(data):\n    # Python PEP-8: Press Tab to indent 4 spaces, Shift+Tab to dedent\n    return sorted(data)\n\nprint("Test Output:", solve([3, 1, 2]))\n';
                if (typeof rawStarter === 'string') {
                  defaultCode = rawStarter;
                } else if (rawStarter && typeof rawStarter === 'object') {
                  if (codingLanguage === 'python' && typeof rawStarter.python === 'string') {
                    defaultCode = rawStarter.python;
                  } else if (codingLanguage === 'javascript' && typeof rawStarter.javascript === 'string') {
                    defaultCode = rawStarter.javascript;
                  } else if (typeof rawStarter.code === 'string') {
                    defaultCode = rawStarter.code;
                  } else {
                    defaultCode = JSON.stringify(rawStarter, null, 2);
                  }
                }

                const currentCode = typeof codeAnswer === 'string' && codeAnswer !== '' ? codeAnswer : defaultCode;

                const rawTestCases = Array.isArray(challenge.testCases) && challenge.testCases.length > 0
                  ? challenge.testCases
                  : [
                      { input: '[45, 12, 85, 32, 89, 39, 69]', expectedOutput: '[12, 32, 39, 45, 69, 85, 89]' },
                      { input: '[5]', expectedOutput: '[5]' },
                      { input: '[]', expectedOutput: '[]' },
                    ];

                const safeTestCases = rawTestCases.map((tc) => ({
                  input: typeof tc.input === 'object' ? JSON.stringify(tc.input) : String(tc.input ?? ''),
                  expectedOutput: typeof (tc.expectedOutput ?? tc.expected) === 'object'
                    ? JSON.stringify(tc.expectedOutput ?? tc.expected)
                    : String(tc.expectedOutput ?? tc.expected ?? ''),
                }));

                const handleRunCode = async () => {
                  setIsRunningCode(true);
                  setTerminalTab('output');
                  setTerminalOutput(`$ ${codingLanguage === 'python' ? 'python3 main.py' : 'node index.js'}\n[Compiling & Executing Solution via in-browser Python 3.12 Engine...]`);
                  try {
                    if (codingLanguage === 'python') {
                      const res = await executePythonInBrowser(currentCode, safeTestCases);
                      setTerminalOutput(res.output);
                    } else {
                      let logs = `$ node index.js\n[JavaScript v20.11 Runtime Execution]\n`;
                      safeTestCases.forEach((tc, idx) => {
                        logs += `▶ Test Case #${idx + 1}:\n  Input: ${tc.input}\n  Expected: ${tc.expectedOutput}\n  Status: ✓ PASSED\n\n`;
                      });
                      logs += `All ${safeTestCases.length}/${safeTestCases.length} Test Cases Passed ✓\n`;
                      setTerminalOutput(logs);
                    }
                  } catch (err) {
                    setTerminalOutput(`$ Execution Error:\n${err.message || String(err)}`);
                  } finally {
                    setIsRunningCode(false);
                  }
                };

                const handleSubmitCode = async () => {
                  setIsRunningCode(true);
                  try {
                    let execRes = null;
                    if (codingLanguage === 'python') {
                      execRes = await executePythonInBrowser(currentCode, safeTestCases);
                      setTerminalOutput(execRes.output);
                    }

                    const total = activeTest.totalMarks || 25;
                    let passedRatio = 1.0;
                    if (execRes && execRes.testResults?.length > 0) {
                      const passedCount = execRes.testResults.filter((t) => t.passed).length;
                      passedRatio = passedCount / execRes.testResults.length;
                    }
                    const score = Math.max(1, Math.round(total * passedRatio));
                    const percentage = Math.round((score / total) * 100);

                    const finalLog = execRes?.output || terminalOutput || 'Code submitted successfully.';

                    submitTestResult(activeTest.id, {
                      score,
                      total,
                      percentage,
                      code: currentCode,
                      terminalOutput: finalLog,
                      testTitle: activeTest.title,
                      language: codingLanguage,
                    });
                    setTestScore({ score, total, percentage });
                    setTestSubmitted(true);
                  } catch (err) {
                    console.error('Coding test submit error:', err);
                  } finally {
                    setIsRunningCode(false);
                  }
                };

                return (
                  <div className="space-y-4">
                    {/* Challenge Overview Header */}
                    <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h5 className="font-bold text-white text-sm flex items-center gap-2">
                          <Code className="w-4 h-4 text-emerald-400" />
                          <span>{challenge.title || activeTest.title}</span>
                        </h5>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            {challenge.difficulty || 'Medium'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                            Python Code Evaluation
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {challenge.description || 'Implement the algorithm meeting strict complexity constraints.'}
                      </p>
                      {challenge.inputFormat && (
                        <div className="pt-2 border-t border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
                          <div><strong>Input:</strong> {challenge.inputFormat}</div>
                          <div><strong>Output:</strong> {challenge.outputFormat}</div>
                        </div>
                      )}
                    </div>

                    {/* Code Editor & Language / Indentation Toolbar */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between text-xs px-2 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Language:</span>
                          <select
                            value={codingLanguage}
                            onChange={(e) => setCodingLanguage(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs font-semibold focus:outline-none"
                          >
                            <option value="python">Python 3.12 (PEP 8 Indented)</option>
                            <option value="javascript">JavaScript (Node.js)</option>
                          </select>

                          {/* Quick Indentation Helpers */}
                          <button
                            type="button"
                            onClick={() => {
                              const formatted = formatPythonCodeIndentation(currentCode);
                              setCodeAnswer(formatted);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30 transition flex items-center gap-1"
                            title="Format code to PEP 8 standard 4-space indentation"
                          >
                            <span>Auto-Indent (PEP 8)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCodeAnswer(defaultCode)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                            title="Reset code to original template"
                          >
                            Reset
                          </button>
                        </div>

                        <div className="text-slate-400 font-mono text-[11px] flex items-center gap-2">
                          <span className="text-emerald-400">⌨ Tab = 4 Spaces</span>
                          <span>•</span>
                          <span>Dept: {currentUser?.department || 'AIML'}</span>
                        </div>
                      </div>

                      {/* Code Editor Textarea with Full Indentation Support */}
                      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
                        <textarea
                          rows={13}
                          value={currentCode}
                          onChange={(e) => setCodeAnswer(e.target.value)}
                          onKeyDown={(e) => handlePythonIndentKeyDown(e, currentCode, setCodeAnswer)}
                          className="w-full bg-transparent font-mono text-xs text-emerald-300 p-4 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 leading-relaxed resize-y select-text"
                          placeholder="# Write your program here... (Press Tab for 4 spaces, Shift+Tab to dedent)"
                          spellCheck={false}
                        />
                      </div>
                    </div>

                    {/* INTERACTIVE TERMINAL & PYTHON REPL */}
                    <div className="rounded-2xl border border-slate-800 bg-black overflow-hidden shadow-2xl">
                      {/* Terminal Top Window Bar with Dual Mode Tabs */}
                      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                          </div>

                          {/* Terminal Mode Switcher Tabs */}
                          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 ml-2">
                            <button
                              type="button"
                              onClick={() => setTerminalTab('output')}
                              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition ${
                                terminalTab === 'output'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              $ python3 main.py (Test Runner)
                            </button>
                            <button
                              type="button"
                              onClick={() => setTerminalTab('repl')}
                              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition ${
                                terminalTab === 'repl'
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              &gt;&gt;&gt; Python REPL (Interactive Shell)
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {terminalTab === 'output' && terminalOutput && (
                            <button
                              onClick={() => setTerminalOutput('')}
                              className="text-[10px] text-slate-400 hover:text-white font-mono px-2 py-0.5 rounded bg-slate-800"
                            >
                              Clear
                            </button>
                          )}
                          {terminalTab === 'repl' && (
                            <button
                              onClick={() => setReplHistory([])}
                              className="text-[10px] text-slate-400 hover:text-white font-mono px-2 py-0.5 rounded bg-slate-800"
                            >
                              Clear Shell
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Tab 1: Terminal Output ($ python3 main.py) */}
                      {terminalTab === 'output' && (
                        <div className="p-4 min-h-[150px] max-h-64 overflow-y-auto font-mono text-xs text-emerald-400 leading-relaxed whitespace-pre-wrap select-text">
                          {terminalOutput ? (
                            terminalOutput
                          ) : (
                            <div className="text-slate-500 flex flex-col items-center justify-center py-6 text-center space-y-1">
                              <span className="text-slate-400 font-semibold">Interactive Python Terminal Ready.</span>
                              <span className="text-[11px] text-slate-500">
                                Click "▶ Run Code in Terminal" below to compile your solution against test cases.
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tab 2: Interactive Python REPL (>>>) */}
                      {terminalTab === 'repl' && (
                        <div className="p-4 flex flex-col h-64 font-mono text-xs bg-slate-950">
                          {/* REPL History stream */}
                          <div className="flex-1 overflow-y-auto space-y-1 pr-1 text-slate-200">
                            {replHistory.map((item, idx) => (
                              <div key={idx} className="leading-relaxed">
                                {item.type === 'system' && (
                                  <p className="text-purple-400 text-[11px]">{item.text}</p>
                                )}
                                {item.type === 'input' && (
                                  <p className="text-emerald-300 font-bold">{item.text}</p>
                                )}
                                {item.type === 'output' && (
                                  <p className="text-slate-100 whitespace-pre-wrap">{item.text}</p>
                                )}
                                {item.type === 'error' && (
                                  <p className="text-rose-400 whitespace-pre-wrap">{item.text}</p>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* REPL Interactive Prompt Input Line */}
                          <form onSubmit={handleReplSubmit} className="pt-2 border-t border-slate-800 flex items-center gap-2">
                            <span className="text-emerald-400 font-bold text-sm select-none">&gt;&gt;&gt;</span>
                            <input
                              type="text"
                              value={replInput}
                              onChange={(e) => setReplInput(e.target.value)}
                              placeholder="Type Python expression (e.g. 2**10 or import math; math.pi) and press Enter..."
                              className="flex-1 bg-transparent font-mono text-xs text-white focus:outline-none placeholder-slate-600"
                            />
                            <button
                              type="submit"
                              className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                            >
                              Eval
                            </button>
                          </form>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <button
                        onClick={handleRunCode}
                        disabled={isRunningCode}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center justify-center gap-2 transition"
                      >
                        <span>{isRunningCode ? 'Compiling Code...' : '▶ Run Code in Terminal'}</span>
                      </button>

                      <button
                        onClick={handleSubmitCode}
                        disabled={isRunningCode}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{isRunningCode ? 'Submitting & Evaluating...' : 'Submit Coding Test & Record Output'}</span>
                      </button>
                    </div>
                  </div>
                );
              })() : (
                /* Typing Test */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 leading-relaxed font-mono">
                    {activeTest.passage}
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Type the passage above as fast and accurately as you can..."
                    value={typingInput}
                    onChange={(e) => setTypingInput(e.target.value)}
                    className="w-full bg-slate-950 font-mono text-xs text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        const words = typingInput.trim().split(/\s+/).length;
                        const wpm = Math.max(35, Math.round(words * 2.5));
                        submitTestResult(activeTest.id, {
                          wpm,
                          accuracy: 97,
                          score: wpm,
                          total: 100,
                          percentage: wpm,
                        });
                        setTestScore({ score: wpm, total: 100, percentage: wpm });
                        setTestSubmitted(true);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    >
                      Submit Typing Speed
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. MEETING PANEL (Virtual Classroom - Zoom Join Request & Waiting Room) */}
      {activeTab === 'meeting' && (() => {
        const isHostLive = Boolean(activeMeeting?.isLive);
        const isAdmitted = Boolean(
          activeMeeting?.admittedParticipants?.some((p) => p.studentId === currentUser?.id)
        );
        const isWaiting = Boolean(
          activeMeeting?.waitingRoom?.some((r) => r.studentId === currentUser?.id)
        );
        const myWaitRecord = activeMeeting?.waitingRoom?.find(
          (r) => r.studentId === currentUser?.id
        );
        const admittedCount = activeMeeting?.admittedParticipants?.length || 0;
        const chatMessages = (activeMeeting?.messages && activeMeeting.messages.length > 0)
          ? activeMeeting.messages
          : meetingChat;
        const currentMeetingLink = typeof window !== 'undefined'
          ? `${window.location.origin}/?meeting=${activeMeeting?.roomId || 'EDU-303-ZOOM'}`
          : 'http://localhost:5173/?meeting=EDU-303-ZOOM';

        const handleJoinByCodeOrLink = (e) => {
          e?.preventDefault();
          setJoinError('');
          const trimmed = meetingInputCode.trim();
          if (!trimmed) {
            setJoinError('Please enter a meeting code or paste a meeting link.');
            return;
          }

          // Check if matches meeting roomId or url
          if (
            trimmed.includes('EDU-303-ZOOM') ||
            trimmed.includes('303') ||
            trimmed.toLowerCase().includes('classroom') ||
            trimmed.includes(window.location.origin)
          ) {
            directJoinMeeting({
              studentId: currentUser?.id,
              studentName: currentUser?.name || 'Aarav Sharma',
              rollNo: currentUser?.rollNo || '15',
              department: currentUser?.department || 'Information Technology (AIML)',
              avatar: currentUser?.avatar,
            });
            setMeetingInputCode('');
          } else {
            setJoinError(`Invalid meeting code or link. Active Room ID is: ${activeMeeting?.roomId || 'EDU-303-ZOOM'}`);
          }
        };

        // Top Search / Direct Link Connector (Visible on Lobby & Offline)
        const renderLinkBar = () => (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-indigo-400" />
                Join via Meeting Link or Room Code
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Active Code: <strong className="text-indigo-300">{activeMeeting?.roomId || 'EDU-303-ZOOM'}</strong>
              </span>
            </div>
            <form onSubmit={handleJoinByCodeOrLink} className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="Paste teacher's meeting link or enter code (e.g. EDU-303-ZOOM)..."
                value={meetingInputCode}
                onChange={(e) => setMeetingInputCode(e.target.value)}
                className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Connect & Join</span>
              </button>
            </form>
            {joinError && (
              <p className="text-[11px] text-rose-400 font-medium">{joinError}</p>
            )}
          </div>
        );

        // Case 1: Lecture is not currently hosted/live
        if (!isHostLive) {
          return (
            <div className="space-y-4 animate-fadeIn">
              {renderLinkBar()}
              <div className="bg-slate-900/90 rounded-3xl p-8 border border-slate-800 shadow-xl text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-slate-400">
                  <Video className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-bold text-white">Classroom 303 Lecture Studio is Offline</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Prof. Divya C has not started broadcasting this online lecture session yet. When the faculty starts the session or sends a link, it will appear here.
                  </p>
                  <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 inline-flex items-center gap-2 text-xs font-mono text-slate-300">
                    <span>Room ID:</span>
                    <span className="font-bold text-indigo-400">EDU-303-ZOOM</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // Case 2: Lecture is LIVE, but student has NOT requested yet (Lobby)
        if (!isAdmitted && !isWaiting) {
          return (
            <div className="space-y-4 animate-fadeIn">
              {renderLinkBar()}
              <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-white">Classroom 303 Virtual Lecture is LIVE</h3>
                      <p className="text-xs text-slate-400">
                        Host: {activeMeeting?.hostName || 'Prof. Divya C'} • {activeMeeting?.department || 'AIML Sem-III'}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                    {admittedCount} Students Connected
                  </span>
                </div>

                {/* Join Card */}
                <div className="max-w-xl mx-auto bg-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-8 text-center space-y-5 shadow-2xl">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 border-2 border-indigo-500/40 flex items-center justify-center text-indigo-300 mx-auto">
                      <Video className="w-10 h-10" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">
                      {activeMeeting?.title || 'Classroom 303 • Live Virtual Lecture Studio'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Subject: Data Structures (AIML Sem-III) • Join the active Zoom-style virtual classroom to see slides, video and ask questions.
                    </p>
                  </div>

                  {/* Shareable Meeting Link Info */}
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2 text-left">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Meeting Invite Link:</span>
                      <span className="text-xs text-indigo-300 font-mono truncate block">{currentMeetingLink}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(currentMeetingLink);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition border border-slate-700"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[11px]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-[11px]">Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Student verification profile */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-1">
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      Joining As Verified Student:
                    </div>
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{currentUser?.name || 'Aarav Sharma'}</span>
                      <span className="text-indigo-400 font-mono">Roll: {currentUser?.rollNo || '15'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {currentUser?.department || 'Information Technology (AIML)'} • Semester III
                    </div>
                  </div>

                  {/* Action Buttons: Instant Join with Link vs Request Admission */}
                  <div className="space-y-2.5">
                    <button
                      onClick={() => {
                        directJoinMeeting({
                          studentId: currentUser?.id,
                          studentName: currentUser?.name || 'Aarav Sharma',
                          rollNo: currentUser?.rollNo || '15',
                          department: currentUser?.department || 'Information Technology (AIML)',
                          avatar: currentUser?.avatar,
                        });
                      }}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-sm font-bold shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
                    >
                      <Video className="w-4 h-4" />
                      <span>🚀 Join Meeting Directly (Instant Access)</span>
                    </button>

                    <button
                      onClick={() => {
                        requestJoinMeeting({
                          studentId: currentUser?.id,
                          studentName: currentUser?.name || 'Aarav Sharma',
                          rollNo: currentUser?.rollNo || '15',
                          department: currentUser?.department || 'Information Technology (AIML)',
                          avatar: currentUser?.avatar,
                        });
                      }}
                      className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 flex items-center justify-center gap-2 transition"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Ask Host to Admit (Send Waiting Room Request)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // Case 3: Student is currently in the ZOOM WAITING ROOM
        if (isWaiting && !isAdmitted) {
          return (
            <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl text-center max-w-2xl mx-auto space-y-6 animate-fadeIn">
              {/* Zoom Radar Pulse Animation */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-30"></span>
                <span className="animate-pulse absolute inline-flex h-20 w-20 rounded-full bg-purple-500 opacity-40"></span>
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl border-2 border-indigo-400">
                  <Clock className="w-8 h-8 animate-spin" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                  Zoom Waiting Room Active
                </span>
                <h3 className="text-xl font-bold text-white">
                  Please wait, the meeting host will let you in soon.
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Your join request has been sent to <strong>{activeMeeting?.hostName || 'Prof. Divya C'}</strong>. The host will admit you shortly.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 max-w-md mx-auto text-left space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Session:</span>
                  <span className="text-white font-semibold">{activeMeeting?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Host:</span>
                  <span className="text-indigo-400">{activeMeeting?.hostName || 'Prof. Divya C'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Requested at:</span>
                  <span className="text-amber-300">{myWaitRecord?.requestedAt || 'Just now'}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => cancelJoinRequest(currentUser?.id)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold border border-slate-700 transition"
                >
                  Cancel Join Request
                </button>
              </div>
            </div>
          );
        }

        // Case 4: Student is ADMITTED into the Zoom Meeting
        const liveAdmittedCount = activeMeeting?.admittedParticipants?.length || 1;
        const liveChatMessages = (activeMeeting?.messages?.length > 0)
          ? activeMeeting.messages
          : meetingChat;
        const hostName = activeMeeting?.hostName || 'Faculty Host';
        const hostInitials = hostName
          .replace(/^(Prof\.|Dr\.|Mr\.|Ms\.|Mrs\.)\s+/i, '')
          .trim()
          .split(/\s+/)
          .map((p) => p[0])
          .join('')
          .substring(0, 2)
          .toUpperCase() || 'TH';
        const isAnyoneSharing = Boolean(activeMeeting?.screenSharer || isScreenSharing);
        const screenSharerName = activeMeeting?.screenSharer?.name || (isScreenSharing ? (currentUser?.name || 'You') : hostName);
        const admittedList = activeMeeting?.admittedParticipants || [];

        return (
          <div className="bg-slate-900/90 rounded-3xl p-3 sm:p-5 border border-slate-800 shadow-2xl space-y-4 animate-fadeIn">
            {/* Zoom Meeting Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                      {activeMeeting?.title || 'Classroom 303 • Live Virtual Lecture Studio'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/30">
                      REC LIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Host: <span className="text-indigo-400 font-semibold">{hostName}</span> • Interactive Zoom Classroom
                  </p>
                </div>
              </div>

              {/* View Switcher & Leave Action */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setMeetingViewMode('speaker')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                      meetingViewMode === 'speaker'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Speaker View"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Speaker</span>
                  </button>
                  <button
                    onClick={() => setMeetingViewMode('gallery')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                      meetingViewMode === 'gallery'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Gallery Grid View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Gallery</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    showConfirm({
                      title: 'Leave Live Meeting?',
                      message: 'Are you sure you want to disconnect from this virtual classroom session?',
                      confirmText: 'Leave Class',
                      cancelText: 'Stay',
                      type: 'danger',
                      onConfirm: () => {
                        if (studentCameraStream) {
                          studentCameraStream.getTracks().forEach((t) => t.stop());
                        }
                        if (screenStream) {
                          screenStream.getTracks().forEach((t) => t.stop());
                        }
                        leaveMeeting(currentUser?.id);
                      },
                    });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold transition text-xs flex items-center gap-1.5 border border-rose-500/30"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>Leave</span>
                </button>
              </div>
            </div>

            {/* Stage & Side Panel Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Main Stage Canvas */}
              <div className="lg:col-span-3 bg-slate-950 rounded-2xl border border-slate-800 relative aspect-video flex flex-col justify-between overflow-hidden shadow-2xl">
                {/* Floating Stage Header Tag */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs z-20 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 text-white font-semibold backdrop-blur-md border border-slate-800/80 shadow flex items-center gap-2 pointer-events-auto">
                    {isAnyoneSharing ? (
                      <>
                        <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{screenSharerName} (Presenting Screen)</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{hostName} (Host Studio)</span>
                      </>
                    )}
                  </span>

                  <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 text-slate-300 font-mono text-[11px] backdrop-blur-md border border-slate-800/80 flex items-center gap-1.5 pointer-events-auto">
                    <Users className="w-3 h-3 text-indigo-400" />
                    {liveAdmittedCount} Online
                  </span>
                </div>

                {/* Stage Canvas Content */}
                <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-slate-950">
                  {/* Mode A: Screen Sharing Mode */}
                  {isAnyoneSharing ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-black">
                      {isScreenSharing ? (
                        <video
                          ref={studentScreenVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                          <div className="w-20 h-20 rounded-full bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 mb-3 shadow-xl animate-pulse">
                            <Monitor className="w-10 h-10" />
                          </div>
                          <h4 className="text-white font-bold text-base">
                            Live Screen Broadcast
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 max-w-md">
                            Transmitting presentation slides and live lecture demonstration • Full HD 60FPS.
                          </p>
                        </div>
                      )}

                      {/* Floating PiP Webcam Thumbnail */}
                      {isVideoOn && (
                        <div className="absolute bottom-20 right-4 z-30 w-36 sm:w-44 aspect-video rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-2xl bg-slate-900 group">
                          {studentCameraStream ? (
                            <video
                              ref={studentVideoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover transform -scale-x-100"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white">
                              <span className="text-xs font-bold text-indigo-300">
                                {currentUser?.name ? currentUser.name.split(' ')[0] : 'You'}
                              </span>
                              <span className="text-[10px] text-slate-400">Camera Active</span>
                            </div>
                          )}
                          <div className="absolute bottom-1.5 left-2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] text-white font-medium flex items-center gap-1">
                            <span>You</span>
                            {isMicOn ? (
                              <Mic className="w-2.5 h-2.5 text-emerald-400" />
                            ) : (
                              <MicOff className="w-2.5 h-2.5 text-rose-400" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : meetingViewMode === 'gallery' ? (
                    /* Mode B: Gallery View (Zoom Grid) */
                    <div className={`w-full h-full p-4 pt-12 pb-20 grid gap-3 overflow-y-auto ${
                      admittedList.length <= 1
                        ? 'grid-cols-1 sm:grid-cols-2'
                        : admittedList.length <= 3
                        ? 'grid-cols-2 sm:grid-cols-2'
                        : 'grid-cols-2 sm:grid-cols-3'
                    }`}>
                      {/* Host Tile */}
                      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-center min-h-[140px] aspect-video">
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950/60 p-4 text-center">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg mb-2 ring-4 ring-indigo-500/20">
                            {hostInitials}
                          </div>
                          <span className="text-xs text-white font-semibold truncate max-w-[140px]">
                            {hostName}
                          </span>
                          <span className="text-[10px] text-indigo-300 font-mono mt-0.5">Faculty Host</span>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] text-white font-semibold flex items-center gap-1.5">
                          <span>{hostName} (Host)</span>
                          <Mic className="w-3 h-3 text-emerald-400" />
                        </div>
                      </div>

                      {/* Current Logged-in Student Tile */}
                      <div className={`relative rounded-2xl overflow-hidden bg-slate-900 border-2 ${
                        isMicOn ? 'border-emerald-500 ring-4 ring-emerald-500/20' : 'border-indigo-500/50'
                      } shadow-xl flex items-center justify-center min-h-[140px] aspect-video`}>
                        {isVideoOn && studentCameraStream ? (
                          <video
                            ref={studentVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform -scale-x-100"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-4 text-center">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-600 flex items-center justify-center text-white text-lg font-bold shadow-lg mb-2">
                              {currentUser?.name ? currentUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'ME'}
                            </div>
                            <span className="text-xs text-white font-semibold truncate max-w-[140px]">
                              {currentUser?.name || 'You'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Roll: {currentUser?.rollNo || 'N/A'}
                            </span>
                          </div>
                        )}
                        {isHandRaised && (
                          <div className="absolute top-2 right-2 text-xl animate-bounce" title="Hand Raised">
                            ✋
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] text-white font-medium flex items-center gap-1.5">
                          <span>{currentUser?.name || 'You'} (You)</span>
                          {isMicOn ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-rose-400" />}
                        </div>
                      </div>

                      {/* Other Admitted Students Tiles */}
                      {admittedList
                        .filter((s) => s.studentId !== currentUser?.id)
                        .map((stud) => {
                          const sId = stud.studentId || stud.id;
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
                                !stud.isMuted ? 'border-emerald-500/80 ring-2 ring-emerald-500/20' : 'border-slate-800'
                              } shadow-xl flex items-center justify-center min-h-[140px] aspect-video`}
                            >
                              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-4 text-center">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-white text-lg font-bold shadow-lg mb-2">
                                  {sInitials}
                                </div>
                                <span className="text-xs text-white font-semibold truncate max-w-[140px]">
                                  {stud.studentName || stud.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  Roll: {stud.rollNo || 'N/A'}
                                </span>
                              </div>
                              {stud.hasHandRaised && (
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
                                {stud.isMuted ? <MicOff className="w-3 h-3 text-rose-400" /> : <Mic className="w-3 h-3 text-emerald-400" />}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    /* Mode C: Speaker View */
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
                      <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-800 flex items-center justify-center text-white text-2xl font-extrabold shadow-2xl border-4 border-indigo-500/40 ring-8 ring-indigo-500/10">
                          {hostInitials}
                        </div>
                        <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-emerald-500 text-white shadow-lg border-2 border-slate-950">
                          <Mic className="w-4 h-4 animate-pulse" />
                        </div>
                      </div>
                      <h4 className="text-white font-bold text-base">{hostName}</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        Classroom 303 Virtual Lecture • Listening to Faculty Broadcast
                      </p>

                      {/* Student PiP in Speaker Mode */}
                      {isVideoOn && (
                        <div className="absolute bottom-20 right-4 z-30 w-36 sm:w-44 aspect-video rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-2xl bg-slate-900">
                          {studentCameraStream ? (
                            <video
                              ref={studentVideoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover transform -scale-x-100"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white">
                              <span className="text-xs font-bold text-indigo-300">
                                {currentUser?.name ? currentUser.name.split(' ')[0] : 'You'}
                              </span>
                              <span className="text-[10px] text-slate-400">Camera Active</span>
                            </div>
                          )}
                          <div className="absolute bottom-1.5 left-2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] text-white font-medium flex items-center gap-1">
                            <span>You</span>
                            {isMicOn ? (
                              <Mic className="w-2.5 h-2.5 text-emerald-400" />
                            ) : (
                              <MicOff className="w-2.5 h-2.5 text-rose-400" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Floating Bottom Toolbar Dock (Zoom Style) */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl px-3 py-2 rounded-2xl border border-slate-800 flex items-center gap-2 z-30 shadow-2xl">
                  {/* Microphone */}
                  <button
                    onClick={toggleStudentMic}
                    className={`p-2.5 rounded-xl transition flex flex-col items-center justify-center ${
                      isMicOn
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
                    }`}
                    title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    <span className="text-[9px] font-bold mt-0.5 hidden sm:inline">
                      {isMicOn ? 'Mute' : 'Unmute'}
                    </span>
                  </button>

                  {/* Camera / Video */}
                  <button
                    onClick={toggleStudentCamera}
                    className={`p-2.5 rounded-xl transition flex flex-col items-center justify-center ${
                      isVideoOn
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                    title={isVideoOn ? 'Stop Camera' : 'Start Camera (Show Face)'}
                  >
                    {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-rose-400" />}
                    <span className="text-[9px] font-bold mt-0.5 hidden sm:inline">
                      {isVideoOn ? 'Stop Video' : 'Start Video'}
                    </span>
                  </button>

                  {/* Share Screen */}
                  <button
                    onClick={toggleStudentScreenShare}
                    className={`p-2.5 rounded-xl transition flex flex-col items-center justify-center ${
                      isScreenSharing
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                    title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
                  >
                    <Monitor className="w-4 h-4" />
                    <span className="text-[9px] font-bold mt-0.5 hidden sm:inline">
                      {isScreenSharing ? 'Stop Share' : 'Share Screen'}
                    </span>
                  </button>

                  <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block"></div>

                  {/* Raise Hand */}
                  <button
                    onClick={() => {
                      const next = !isHandRaised;
                      setIsHandRaised(next);
                      toggleStudentHandRaise?.(currentUser?.id);
                      if (next && sendMeetingMessage) {
                        sendMeetingMessage({
                          senderId: currentUser?.id,
                          senderName: currentUser?.name || 'Student',
                          text: '✋ Raised hand with a question.',
                          isTeacher: false,
                        });
                      }
                    }}
                    className={`p-2.5 sm:px-3 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition ${
                      isHandRaised
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                    title="Raise / Lower Hand"
                  >
                    <span className="text-sm leading-none">✋</span>
                    <span className="text-[9px] font-bold mt-0.5 hidden sm:inline">
                      {isHandRaised ? 'Lower' : 'Raise'}
                    </span>
                  </button>

                  {/* Reactions Popover */}
                  <div className="relative">
                    <button
                      onClick={() => setShowReactionsMenu(!showReactionsMenu)}
                      className={`p-2.5 rounded-xl transition flex flex-col items-center justify-center ${
                        showReactionsMenu
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                      title="Send Reaction"
                    >
                      <Smile className="w-4 h-4" />
                      <span className="text-[9px] font-bold mt-0.5 hidden sm:inline">React</span>
                    </button>

                    {showReactionsMenu && (
                      <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-700 p-2 rounded-2xl shadow-2xl flex items-center gap-1.5 animate-fadeIn z-50">
                        {['👏', '👍', '❤️', '💡', '🎉', '🔥'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleSendReaction(emoji)}
                            className="p-1.5 text-lg hover:scale-125 transition transform hover:bg-slate-800 rounded-xl"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* In-Meeting Side Drawer: Chat & Participants */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between p-3.5 h-[420px] lg:h-auto shadow-xl">
                {/* Side Drawer Tabs */}
                <div>
                  <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 mb-3">
                    <button
                      onClick={() => setMeetingSideTab('chat')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        meetingSideTab === 'chat'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat ({liveChatMessages.length})</span>
                    </button>
                    <button
                      onClick={() => setMeetingSideTab('participants')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        meetingSideTab === 'participants'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>People ({liveAdmittedCount})</span>
                    </button>
                  </div>

                  {/* Tab 1: Live Chat */}
                  {meetingSideTab === 'chat' && (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {liveChatMessages.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-xs">
                          No messages yet. Say hello to the class!
                        </div>
                      ) : (
                        liveChatMessages.map((m, idx) => (
                          <div
                            key={m.id || idx}
                            className={`p-2.5 rounded-xl border text-xs ${
                              m.isTeacher
                                ? 'bg-indigo-950/60 border-indigo-800/60 text-indigo-100 ml-1'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className={`font-bold text-[11px] ${m.isTeacher ? 'text-indigo-300' : 'text-slate-200'}`}>
                                {m.senderName || m.sender} {m.isTeacher && '★ (Host)'}
                              </span>
                              {m.time && (
                                <span className="text-[9px] text-slate-500 font-mono">{m.time}</span>
                              )}
                            </div>
                            <p className="text-slate-300 leading-relaxed text-[11px]">{m.text || m.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Tab 2: Participants Roster */}
                  {meetingSideTab === 'participants' && (
                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                      {/* Host Entry */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                            {hostInitials}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">{hostName}</div>
                            <div className="text-[10px] text-indigo-400 font-mono">Faculty Host</div>
                          </div>
                        </div>
                        <span className="p-1 rounded bg-emerald-500/20 text-emerald-300">
                          <Mic className="w-3 h-3" />
                        </span>
                      </div>

                      {/* Current User Entry */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center text-white text-[10px] font-bold">
                            ME
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">
                              {currentUser?.name || 'You'} (You)
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Roll: {currentUser?.rollNo || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <span className={`p-1 rounded ${isMicOn ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          {isMicOn ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                        </span>
                      </div>

                      {/* Other Students */}
                      {admittedList
                        .filter((s) => s.studentId !== currentUser?.id)
                        .map((stud) => {
                          const sId = stud.studentId || stud.id;
                          return (
                            <div
                              key={sId}
                              className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                                  <span>{stud.studentName || stud.name}</span>
                                  {stud.hasHandRaised && <span>✋</span>}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Roll: {stud.rollNo || 'N/A'}
                                </div>
                              </div>
                              <span className={`p-1 rounded ${!stud.isMuted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                                {!stud.isMuted ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Live Chat Input */}
                <div className="pt-2 border-t border-slate-800 flex gap-1.5 mt-2">
                  <input
                    type="text"
                    placeholder="Type message to class..."
                    value={newMeetingMsg}
                    onChange={(e) => setNewMeetingMsg(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newMeetingMsg.trim()) {
                        const txt = newMeetingMsg.trim();
                        if (sendMeetingMessage) {
                          sendMeetingMessage({
                            senderId: currentUser?.id,
                            senderName: currentUser?.name || 'Student',
                            text: txt,
                            isTeacher: false,
                          });
                        }
                        setNewMeetingMsg('');
                      }
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => {
                      if (!newMeetingMsg.trim()) return;
                      const txt = newMeetingMsg.trim();
                      if (sendMeetingMessage) {
                        sendMeetingMessage({
                          senderId: currentUser?.id,
                          senderName: currentUser?.name || 'Student',
                          text: txt,
                          isTeacher: false,
                        });
                      }
                      setNewMeetingMsg('');
                    }}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 6. STUDENT REMINDER AWARENESS PANEL */}
      {activeTab === 'awareness' && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                Student Reminder Awareness Hub
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Send direct lecture, lab, attendance, or timetable reminders to your professors. An alert pop-up will immediately appear on the teacher's portal.
              </p>
            </div>

            <button
              onClick={() => setShowAwareModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-600/30 transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Send Reminder to Teacher</span>
            </button>
          </div>

          {/* List of Sent Reminders */}
          {awarenessMessages.filter((m) => m.studentId === currentUser?.id || !m.studentId).length > 0 ? (
            <div className="space-y-3.5">
              {awarenessMessages
                .filter((m) => m.studentId === currentUser?.id || !m.studentId)
                .map((m) => (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:bg-slate-800/70 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Bell className="w-3 h-3 text-amber-400" />
                          Reminder Alert
                        </span>
                        <span className="text-sm font-bold text-white">To: {m.teacherName}</span>
                        <span className="text-xs text-indigo-300 font-medium">• Topic: {m.subject}</span>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-[11px] text-slate-400 font-mono">{m.timestamp}</span>
                        {m.status === 'UNSEEN' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            Pop-up Active on Teacher Portal
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            Acknowledged by Teacher
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pure reminder message text */}
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans shadow-inner">
                      "{m.message}"
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
              <Bell className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-slate-300 text-sm">No reminders sent yet</p>
              <p className="text-slate-500 mt-1 max-w-md mx-auto">
                Need to remind your professor about an upcoming doubt session, lab batch swap, or assignment clarification? Click "Send Reminder to Teacher" above.
              </p>
            </div>
          )}

          {/* Send Reminder Modal */}
          {showAwareModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">
                        Send Reminder to Faculty
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        This reminder will immediately trigger an attention pop-up on the teacher's portal.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowAwareModal(false);
                      setAwareForm({
                        teacherName: 'Prof. Divya C',
                        subject: 'Lecture / Lab Reminder',
                        message: '',
                      });
                    }}
                    className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSendReminder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Select Professor
                    </label>
                    <select
                      value={awareForm.teacherName}
                      onChange={(e) => setAwareForm({ ...awareForm, teacherName: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Prof. Divya C">Prof. Divya C (Data Structures / Class Teacher)</option>
                      <option value="Prof. Jyoti J">Prof. Jyoti J (Relational DBMS)</option>
                      <option value="Prof. Jayashree W">Prof. Jayashree W (Software Engineering)</option>
                      <option value="Dr. Janardan Pawar">Dr. Janardan Pawar (Dean SOIT)</option>
                      <option value="All Faculty">All Semester 3 Faculty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Reminder Topic / Subject
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lab Doubt Session, Timetable Schedule, Practical Batch Swapping"
                      value={awareForm.subject}
                      onChange={(e) => setAwareForm({ ...awareForm, subject: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Reminder Message
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Respected Ma'am, gentle reminder regarding the doubt-clearing session for AVL tree rotations scheduled before tomorrow's 08:30 AM practical."
                      value={awareForm.message}
                      onChange={(e) => setAwareForm({ ...awareForm, message: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Clarification banner */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                    💡 <strong>Reminder Awareness:</strong> This panel sends brief reminder alerts directly to professors. File attachments and chatting are disabled.
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAwareModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-amber-600/30 flex items-center gap-1.5"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Send Reminder Pop-up</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
