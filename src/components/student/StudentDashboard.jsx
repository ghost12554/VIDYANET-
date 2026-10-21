import React, { useState, useRef } from 'react';
import { useCollege } from '../../context/CollegeContext';
import LectureTrackerCard from '../lectureTracker/LectureTrackerCard';
import IndiraTimetable from '../timetable/IndiraTimetable';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Bell,
  Upload,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Paperclip,
  Download,
  FileText,
  X,
  Check,
  RefreshCw,
  MessageSquare,
  Trash2,
  CheckSquare,
  Square,
  Video,
} from 'lucide-react';
import {
  readFileAsAttachment,
  downloadAttachment,
  getFileBadgeColor,
} from '../../utils/fileAttachmentUtils';

export default function StudentDashboard() {
  const {
    currentUser,
    tasks,
    submitStudentTask,
    notifications,
    getStudentAttendanceStats,
    setActiveMode,
    deleteNotification,
    deleteSelectedNotifications,
    clearAllNotifications,
    deleteNotifications24Hours,
    activeMeeting,
    directJoinMeeting,
    openMeetingDirectly,
  } = useCollege();

  const [activeTaskTab, setActiveTaskTab] = useState('ALL'); // 'ALL' | 'DONE' | 'REMAINING' | 'UNDONE'
  const [submittingTaskId, setSubmittingTaskId] = useState(null);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionNote, setSubmissionNote] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [selectedNotifIds, setSelectedNotifIds] = useState([]);
  const fileInputRef = useRef(null);

  const attendanceStats = getStudentAttendanceStats(currentUser?.rollNo || '15');

  // Categorize tasks for current student
  const studentTasks = tasks.map((task) => {
    const studentSub = task.submissions?.[currentUser?.id];
    let status = 'REMAINING';
    if (studentSub?.status === 'DONE') {
      status = 'DONE';
    } else if (new Date(task.dueDate) < new Date()) {
      status = 'UNDONE';
    }
    return {
      ...task,
      studentStatus: status,
      submission: studentSub,
    };
  });

  const doneCount = studentTasks.filter((t) => t.studentStatus === 'DONE').length;
  const undoneCount = studentTasks.filter((t) => t.studentStatus === 'UNDONE').length;
  const remainingCount = studentTasks.filter((t) => t.studentStatus === 'REMAINING').length;

  const filteredTasks = studentTasks.filter((t) => {
    if (activeTaskTab === 'ALL') return true;
    return t.studentStatus === activeTaskTab;
  });

  const handleOpenSubmit = (task) => {
    setSubmittingTaskId(task.id);
    const existing = task.submissions?.[currentUser?.id];
    if (existing) {
      setSubmissionFile(existing.attachment || null);
      setSubmissionLink(existing.link || '');
      setSubmissionNote(existing.note || '');
    } else {
      setSubmissionFile(null);
      setSubmissionLink('');
      setSubmissionNote('');
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsReadingFile(true);
      const attachment = await readFileAsAttachment(file);
      setSubmissionFile(attachment);
    } catch (err) {
      alert(err.message || 'Error attaching file');
    } finally {
      setIsReadingFile(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    try {
      setIsReadingFile(true);
      const attachment = await readFileAsAttachment(file);
      setSubmissionFile(attachment);
    } catch (err) {
      alert(err.message || 'Error attaching file');
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleTaskSubmit = (taskId) => {
    if (!submissionFile && !submissionLink.trim()) {
      alert('Please attach a file or provide a link for your task submission.');
      return;
    }
    submitStudentTask(taskId, currentUser.id, {
      attachment: submissionFile,
      link: submissionLink.trim(),
      note: submissionNote.trim() || 'Submitted via Student Portal',
    });
    setSubmittingTaskId(null);
    setSubmissionFile(null);
    setSubmissionLink('');
    setSubmissionNote('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Dynamic Welcome Page / Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-indigo-400/50 shadow-lg shadow-indigo-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider">
                  Active Student Portal
                </span>
                <span className="text-xs text-indigo-300 font-mono">
                  Roll #{currentUser?.rollNo || '15'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Welcome back, {currentUser?.name}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {currentUser?.department || 'Information Technology (AIML)'} • Div-A • {currentUser?.batch ? `Batch ${currentUser.batch}` : 'Batch A'}
              </p>
            </div>
          </div>

          {/* Quick metric chips */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-indigo-500/30 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Overall Attendance
              </span>
              <p
                className={`text-2xl font-black ${
                  attendanceStats.percentage >= 75 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {attendanceStats.percentage}%
              </p>
              <span className="text-[10px] text-slate-400">
                {attendanceStats.presentClasses}/{attendanceStats.totalClasses} classes
              </span>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-purple-500/30 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Pending Tasks
              </span>
              <p className="text-2xl font-black text-purple-400">{remainingCount}</p>
              <span className="text-[10px] text-slate-400">{doneCount} Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Virtual Lecture Banner */}
      {activeMeeting?.isLive && (
        <div className="bg-gradient-to-r from-rose-950/60 via-purple-950/50 to-slate-900 rounded-2xl p-4 border border-rose-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
              <Video className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/30">
                  🔴 LIVE VIRTUAL CLASS
                </span>
                <span className="text-xs font-bold text-white">
                  Classroom 303 • Live Virtual Lecture Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Host: <strong className="text-white">{activeMeeting.hostName || 'Prof. Divya C'}</strong> • Join via direct link or click button below!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              directJoinMeeting({
                studentId: currentUser?.id,
                studentName: currentUser?.name,
                rollNo: currentUser?.rollNo,
                department: currentUser?.department,
              });
              openMeetingDirectly('EDU-303-ZOOM');
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition shrink-0"
          >
            <Video className="w-4 h-4" />
            <span>Join Live Lecture Now</span>
          </button>
        </div>
      )}

      {/* 2. Dynamic Lecture Tracker */}
      <LectureTrackerCard />

      {/* Student Reminder Awareness Quick Strip */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 rounded-2xl p-4 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              Student Reminder Awareness Hub
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                Pops Up on Teacher Portal
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Send direct reminders regarding lecture schedules, lab doubts, or attendance. Faculty receives an instant attention pop-up.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveMode('workstore')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/30 shrink-0 self-start sm:self-auto transition"
        >
          <span>Open Reminder Hub</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3 & 4. Dual Grid: Attendance Tracker & Task Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Tracker Panel */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Dynamic Attendance Tracker
                  </h3>
                  <p className="text-xs text-slate-400">
                    Auto-updated when faculty records attendance
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-xl font-extrabold ${
                    attendanceStats.percentage >= 75 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {attendanceStats.percentage}%
                </span>
                <span className="block text-[10px] text-slate-400 font-mono">
                  {attendanceStats.percentage >= 75 ? 'Eligibility Met' : 'Warning: Below 75%'}
                </span>
              </div>
            </div>

            {/* Attendance Progress Bar */}
            <div className="mt-4">
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    attendanceStats.percentage >= 75
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-amber-500 to-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, attendanceStats.percentage)}%` }}
                />
              </div>
            </div>

            {/* Subject breakdown */}
            <div className="mt-5 space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Subject-Wise Breakdown
              </h4>
              {Object.keys(attendanceStats.subjectBreakdown).length > 0 ? (
                Object.entries(attendanceStats.subjectBreakdown).map(([subj, stats]) => {
                  const pct = Math.round((stats.present / (stats.total || 1)) * 100);
                  return (
                    <div
                      key={subj}
                      className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{subj}</span>
                        <span className="text-slate-400 ml-2">
                          ({stats.present}/{stats.total} sessions)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pct >= 75 ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-200">{pct}%</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">
                  Full semester attendance will populate as faculty marks sessions.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Minimum required by Indira University: 75%</span>
            <span className="text-emerald-400 font-semibold">Live dynamic sync</span>
          </div>
        </div>

        {/* 5. Task Tracking Panel (Done, Undone, Remaining) */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Task Tracking
                  </h3>
                  <p className="text-xs text-slate-400">
                    Homework & tasks assigned by faculty
                  </p>
                </div>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1 bg-slate-800/70 p-1 rounded-xl border border-slate-700/50">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'REMAINING', label: `Remaining (${remainingCount})` },
                  { id: 'DONE', label: `Done (${doneCount})` },
                  { id: 'UNDONE', label: `Undone (${undoneCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTaskTab(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      activeTaskTab === tab.id
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Task List */}
            <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/80 transition space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{t.title}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            t.studentStatus === 'DONE'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : t.studentStatus === 'UNDONE'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {t.studentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-300">
                        {t.subject} • By {t.assignedBy}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        {t.description}
                      </p>
                    </div>

                    <div className="text-right whitespace-nowrap flex-shrink-0">
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Due: {t.dueDate}
                      </span>
                      {t.studentStatus !== 'DONE' ? (
                        <button
                          onClick={() => handleOpenSubmit(t)}
                          className="mt-2 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold flex items-center gap-1 shadow-sm ml-auto"
                        >
                          <Paperclip className="w-3 h-3" /> Attach & Submit
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenSubmit(t)}
                          className="mt-2 px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-[10px] font-medium flex items-center gap-1 shadow-sm ml-auto"
                          title="Replace or update your submission"
                        >
                          <RefreshCw className="w-2.5 h-2.5" /> Resubmit
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Faculty Attached Materials */}
                  {t.attachments && t.attachments.length > 0 && (
                    <div className="pt-2 border-t border-slate-700/60 flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <Paperclip className="w-3 h-3 text-indigo-400" />
                        Faculty Materials:
                      </span>
                      {t.attachments.map((att, idx) => (
                        <button
                          key={att.id || idx}
                          onClick={() => downloadAttachment(att)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border hover:brightness-125 transition ${getFileBadgeColor(att.name)}`}
                          title="Click to download attachment"
                        >
                          <FileText className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{att.name}</span>
                          {att.size && <span className="opacity-70 font-mono text-[9px]">({att.size})</span>}
                          <Download className="w-2.5 h-2.5 ml-0.5 opacity-80" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Student Submitted Solution Details (When DONE) */}
                  {t.studentStatus === 'DONE' && t.submission && submittingTaskId !== t.id && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1 uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Turned In:
                        </span>

                        {t.submission.attachment && (
                          <button
                            onClick={() => downloadAttachment(t.submission.attachment)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border hover:brightness-125 transition ${getFileBadgeColor(t.submission.attachment.name)}`}
                            title="Download your submitted file"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span className="font-mono">{t.submission.attachment.name}</span>
                            {t.submission.attachment.size && (
                              <span className="opacity-70 text-[9px]">({t.submission.attachment.size})</span>
                            )}
                            <Download className="w-2.5 h-2.5 text-emerald-400 ml-1" />
                          </button>
                        )}

                        {t.submission.link && (
                          <a
                            href={t.submission.link.startsWith('http') ? t.submission.link : `https://${t.submission.link}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-indigo-300 hover:text-indigo-200 underline"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[150px]">{t.submission.link}</span>
                          </a>
                        )}

                        {t.submission.note && (
                          <span className="text-[10px] text-slate-400 italic">
                            "{t.submission.note}"
                          </span>
                        )}
                      </div>

                      <span className="text-[9px] text-slate-400 font-mono ml-auto">
                        {t.submission.submittedAt
                          ? new Date(t.submission.submittedAt).toLocaleDateString()
                          : 'Recorded'}
                      </span>
                    </div>
                  )}

                  {/* Submission Form when clicked */}
                  {submittingTaskId === t.id && (
                    <div className="mt-3 pt-3 border-t border-slate-700 space-y-3 bg-slate-900/60 p-3 rounded-xl border border-indigo-500/30 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-indigo-400" />
                          Attach & Submit Your Solution
                        </span>
                        <span className="text-[10px] text-slate-400">Accepts any file type (.pdf, .doc, .zip, .py, code, images, etc.)</span>
                      </div>

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      {/* Drag & Drop File Attachment Dropzone */}
                      {submissionFile ? (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-emerald-500/50 shadow-inner">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-white truncate">{submissionFile.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{submissionFile.size} • Ready to turn in</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSubmissionFile(null)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
                            title="Remove attachment"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleFileDrop}
                          className="border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-xl p-3.5 text-center cursor-pointer transition"
                        >
                          <Paperclip className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
                          <p className="text-xs font-bold text-white">
                            {isReadingFile ? 'Attaching file...' : 'Click to Browse or Drag & Drop File Here'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Any file format: PDF, DOCX, ZIP, Python, C++, Java, Excel, Images
                          </p>
                        </div>
                      )}

                      {/* Optional Cloud Link / Note */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Optional: GitHub / Google Drive link"
                          value={submissionLink}
                          onChange={(e) => setSubmissionLink(e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                        />
                        <input
                          type="text"
                          placeholder="Optional note / comment for teacher"
                          value={submissionNote}
                          onChange={(e) => setSubmissionNote(e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSubmittingTaskId(null);
                            setSubmissionFile(null);
                            setSubmissionLink('');
                            setSubmissionNote('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={!submissionFile && !submissionLink.trim()}
                          onClick={() => handleTaskSubmit(t.id)}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition ${
                            submissionFile || submissionLink.trim()
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-emerald-600/30'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Turn In Task</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Tracks homework, practical slips & coding exercises</span>
            <button
              onClick={() => setActiveMode('workstore')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              Open WorkStore <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. College Timetable (Indira University Read-Only) */}
      <div>
        <IndiraTimetable isEditable={false} />
      </div>

      {/* 6. Notifications Stream with 3 Delete Actions */}
      <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Campus Notification Feed
              </h3>
              <p className="text-xs text-slate-400">
                All changes, test announcements, and uploads broadcasted here
              </p>
            </div>
          </div>

          {/* Action Controls: 3 Delete Options */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={() => {
                    if (selectedNotifIds.length === notifications.length) {
                      setSelectedNotifIds([]);
                    } else {
                      setSelectedNotifIds(notifications.map((n) => n.id));
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700 flex items-center gap-1.5 transition"
                >
                  {selectedNotifIds.length === notifications.length && notifications.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>Select All</span>
                </button>

                {/* 1. Select Delete */}
                <button
                  onClick={() => {
                    if (selectedNotifIds.length === 0) return;
                    deleteSelectedNotifications(selectedNotifIds);
                    setSelectedNotifIds([]);
                  }}
                  disabled={selectedNotifIds.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 disabled:opacity-40 disabled:hover:bg-rose-600/20 disabled:hover:text-rose-300 font-semibold transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected {selectedNotifIds.length > 0 ? `(${selectedNotifIds.length})` : ''}</span>
                </button>

                {/* 2. Delete 24 Hours */}
                <button
                  onClick={() => {
                    deleteNotifications24Hours('older');
                    setSelectedNotifIds([]);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold transition flex items-center gap-1.5"
                  title="Purge notifications older than 24 hours"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Delete &gt;24h Old</span>
                </button>

                {/* 3. Delete All */}
                <button
                  onClick={() => {
                    if (confirm('Clear all campus notifications?')) {
                      clearAllNotifications();
                      setSelectedNotifIds([]);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 font-semibold transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete All</span>
                </button>
              </>
            )}

            <span className="text-xs text-indigo-400 font-mono ml-auto">
              {notifications.length} Active Alerts
            </span>
          </div>
        </div>

        {notifications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {notifications.map((item) => {
              const isSelected = selectedNotifIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition relative group ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/50'
                      : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between text-xs font-semibold text-white gap-2">
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() =>
                          setSelectedNotifIds((prev) =>
                            prev.includes(item.id)
                              ? prev.filter((i) => i !== item.id)
                              : [...prev, item.id]
                          )
                        }
                        className="mt-0.5 text-slate-400 hover:text-white"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </button>
                      <span className="truncate">{item.title}</span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[10px] text-slate-400 font-normal whitespace-nowrap">
                        {item.timestamp}
                      </span>
                      <button
                        onClick={() => deleteNotification(item.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-700/60 opacity-60 group-hover:opacity-100 transition"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed pl-5.5">{item.message}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No active alerts. All campus notifications have been cleared!
          </div>
        )}
      </div>
    </div>
  );
}
