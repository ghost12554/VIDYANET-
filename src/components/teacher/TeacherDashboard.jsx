import React, { useState, useRef } from 'react';
import { useCollege } from '../../context/CollegeContext';
import LectureTrackerCard from '../lectureTracker/LectureTrackerCard';
import IndiraTimetable from '../timetable/IndiraTimetable';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  UserCheck,
  UserX,
  ShieldCheck,
  Plus,
  Send,
  Bell,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  AlertCircle,
  Award,
  Paperclip,
  Download,
  Trash2,
  Eye,
  X,
  ExternalLink,
  Upload,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  readFileAsAttachment,
  downloadAttachment,
  getFileBadgeColor,
} from '../../utils/fileAttachmentUtils';

export default function TeacherDashboard() {
  const {
    currentUser,
    students,
    approveStudent,
    rejectStudent,
    tasks,
    createTask,
    deleteTask,
    notifications,
    deleteNotification,
    deleteSelectedNotifications,
    clearAllNotifications,
    deleteNotifications24Hours,
  } = useCollege();

  // Notification Selection State
  const [selectedNotifIds, setSelectedNotifIds] = useState([]);

  // New task form state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedTaskSubmissions, setSelectedTaskSubmissions] = useState(null);
  const [isAttachingFile, setIsAttachingFile] = useState(false);
  const teacherFileInputRef = useRef(null);

  const [taskForm, setTaskForm] = useState({
    title: '',
    subject: 'Data Structures (DS)',
    dueDate: '2026-10-25',
    priority: 'High',
    description: '',
    attachments: [],
  });

  // Filter pending student registration requests
  const pendingStudents = students.filter((s) => s.status === 'PENDING');
  const approvedStudents = students.filter((s) => s.status === 'APPROVED');

  const handleApprove = (student) => {
    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    approveStudent(student.id);
  };

  const handleTeacherFileAttach = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setIsAttachingFile(true);
      const newAttachments = [];
      for (const file of files) {
        const att = await readFileAsAttachment(file);
        newAttachments.push(att);
      }
      setTaskForm((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...newAttachments],
      }));
    } catch (err) {
      alert(err.message || 'Error attaching file');
    } finally {
      setIsAttachingFile(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveTeacherAttachment = (idxToRemove) => {
    setTaskForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, idx) => idx !== idxToRemove),
    }));
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    createTask(taskForm);
    setTaskForm({
      title: '',
      subject: 'Data Structures (DS)',
      dueDate: '2026-10-25',
      priority: 'High',
      description: '',
      attachments: [],
    });
    setShowNewTaskModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Dynamic Teacher Welcome Page */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-purple-400/50 shadow-lg shadow-purple-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold uppercase tracking-wider">
                  Teacher & Faculty Portal
                </span>
                <span className="text-xs text-indigo-300 font-mono">
                  {currentUser?.facultyNo || 'FAC-303'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                {currentUser?.name || 'Prof. Divya C'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Class Teacher: Div-A • {currentUser?.department || 'Information Technology'} • Classroom 303
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-rose-500/30 text-center min-w-[140px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Pending Requests
              </span>
              <p className="text-2xl font-black text-rose-400">{pendingStudents.length}</p>
              <span className="text-[10px] text-slate-400">Requires Approval</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dynamic Lecture Tracker */}
      <LectureTrackerCard />

      {/* 3. GAME-LIKE STUDENT REGISTRATION REQUEST PANEL */}
      <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Student Admission Request Queue
                {pendingStudents.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                    {pendingStudents.length} Action Needed
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Newly registered students appear here like game quests. Only upon teacher approval can students log in!
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {pendingStudents.length} Pending • {approvedStudents.length} Active
          </span>
        </div>

        {/* Quest Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {pendingStudents.length > 0 ? (
            pendingStudents.map((stud) => (
              <div
                key={stud.id}
                className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 p-5 rounded-2xl border-2 border-dashed border-purple-500/40 hover:border-purple-500 transition shadow-lg relative group"
              >
                {/* Gamified Quest Badge */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                    Student Admission Request
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Roll #{stud.rollNo}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={stud.avatar}
                    alt={stud.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-400/40"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{stud.name}</h4>
                    <p className="text-[11px] text-slate-300 truncate">{stud.email}</p>
                    <p className="text-[10px] text-indigo-400 font-medium">
                      Batch {stud.batch} • {stud.department}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleApprove(stud)}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Accept & Allow Login</span>
                  </button>

                  <button
                    onClick={() => rejectStudent(stud.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 transition"
                    title="Decline request"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800/80">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-300">
                All student admission requests have been reviewed!
              </p>
              <p className="text-slate-500 mt-1">
                When a new student registers on the portal, their card will instantly appear here for your verification.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Task Management Panel */}
      <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Task Assignments
              </h3>
              <p className="text-xs text-slate-400">Assign coursework & homework to all students</p>
            </div>
          </div>

          <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" /> New Task
          </button>
        </div>

        {/* Existing Tasks Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tasks.map((t) => {
            const subCount = Object.keys(t.submissions || {}).length;

            return (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between space-y-2.5 hover:bg-slate-800/80 transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white truncate max-w-[180px]">{t.title}</span>
                    <span className="text-[10px] font-mono text-purple-300">Due {t.dueDate}</span>
                  </div>
                  <p className="text-xs text-indigo-300">{t.subject}</p>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>

                  {/* Attached Files from Teacher */}
                  {t.attachments && t.attachments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <Paperclip className="w-2.5 h-2.5 text-indigo-400" /> Files:
                      </span>
                      {t.attachments.map((att, aIdx) => (
                        <button
                          key={att.id || aIdx}
                          onClick={() => downloadAttachment(att)}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border hover:brightness-125 transition ${getFileBadgeColor(att.name)}`}
                          title="Click to download attachment"
                        >
                          <FileText className="w-2.5 h-2.5" />
                          <span className="truncate max-w-[100px]">{att.name}</span>
                          <Download className="w-2 h-2 ml-0.5 opacity-80" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-emerald-400 font-semibold">{subCount} turned in</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedTaskSubmissions(t)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-[11px] font-semibold flex items-center gap-1 transition"
                    >
                      <Eye className="w-3 h-3" /> Submissions
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete task "${t.title}"?`)) {
                          deleteTask(t.id);
                        }
                      }}
                      className="p-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Master College Timetable (Full-View Master) */}
      <IndiraTimetable isEditable={true} />

      {/* View Task Submissions Modal */}
      {selectedTaskSubmissions && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Student Submissions: {selectedTaskSubmissions.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Subject: {selectedTaskSubmissions.subject} • Due: {selectedTaskSubmissions.dueDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedTaskSubmissions(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submissions List */}
            {Object.keys(selectedTaskSubmissions.submissions || {}).length > 0 ? (
              <div className="space-y-2.5">
                {Object.entries(selectedTaskSubmissions.submissions).map(([studId, sub]) => {
                  const studentInfo = students.find((s) => s.id === studId) || {
                    name: `Student (${studId})`,
                    rollNo: '—',
                  };

                  return (
                    <div
                      key={studId}
                      className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center text-xs">
                          {studentInfo.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{studentInfo.name}</span>
                            <span className="text-[10px] font-mono text-purple-300">Roll: {studentInfo.rollNo}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Turned in: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'Done'}
                          </p>
                          {sub.note && (
                            <p className="text-[11px] text-slate-300 italic mt-1">"{sub.note}"</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        {sub.attachment && (
                          <button
                            onClick={() => downloadAttachment(sub.attachment)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border shadow-sm hover:brightness-125 transition ${getFileBadgeColor(sub.attachment.name)}`}
                            title="Download student's attached file"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            <span className="font-mono text-xs">{sub.attachment.name}</span>
                            {sub.attachment.size && (
                              <span className="opacity-70 text-[10px]">({sub.attachment.size})</span>
                            )}
                            <Download className="w-3 h-3 ml-1 text-emerald-400" />
                          </button>
                        )}

                        {sub.link && (
                          <a
                            href={sub.link.startsWith('http') ? sub.link : `https://${sub.link}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-mono transition"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Open Link</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
                <Clock className="w-7 h-7 text-amber-400 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-slate-300">No student submissions received yet</p>
                <p className="text-slate-500 mt-1">
                  When students attach and turn in their work, their solutions and files will be listed here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications & Faculty Alerts Section with 3 Delete Actions */}
      <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Campus Notifications & Faculty Alerts
              </h3>
              <p className="text-xs text-slate-400">
                Live alerts for admissions, student attendance, reminders, and academic submissions
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
                    <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
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

            <span className="text-xs text-purple-400 font-mono ml-auto">
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
                      ? 'bg-purple-950/40 border-purple-500/50'
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
                          <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
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

      {/* New Task Creation Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Assign New Student Task
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Attach assignment documents and specify problem requirements for students.
            </p>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement AVL Tree Rotations in Python"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={taskForm.subject}
                    onChange={(e) => setTaskForm({ ...taskForm, subject: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Data Structures (DS)">Data Structures (DS)</option>
                    <option value="Relational DBMS (RDBMS)">Relational DBMS (RDBMS)</option>
                    <option value="Software Engineering (SE)">Software Engineering (SE)</option>
                    <option value="Python Programming">Python Programming</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Task Description & Submission Instructions
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide problem specifications, test cases, or expected format..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Attach Reference / Assignment Files */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                    Attach Reference / Question Paper Files
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </label>

                <input
                  type="file"
                  multiple
                  ref={teacherFileInputRef}
                  onChange={handleTeacherFileAttach}
                  className="hidden"
                />

                <div
                  onClick={() => teacherFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-400 bg-slate-800/40 hover:bg-indigo-500/10 rounded-xl p-3 text-center cursor-pointer transition"
                >
                  <Upload className="w-4 h-4 mx-auto mb-1 text-indigo-400" />
                  <p className="text-xs font-semibold text-white">
                    {isAttachingFile ? 'Attaching file(s)...' : 'Click to Attach Reference Files'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Attach PDF, DOCX, Python, C++, ZIP, Excel question sheets
                  </p>
                </div>

                {/* Attached File List */}
                {taskForm.attachments?.length > 0 && (
                  <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto">
                    {taskForm.attachments.map((att, idx) => (
                      <div
                        key={att.id || idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Paperclip className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                          <span className="text-white truncate font-medium">{att.name}</span>
                          <span className="text-slate-400 font-mono text-[10px]">({att.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTeacherAttachment(idx)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg"
                >
                  Publish Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
