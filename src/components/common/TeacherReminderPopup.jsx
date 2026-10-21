import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { Bell, CheckCircle, X, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';

export default function TeacherReminderPopup() {
  const { userRole, currentUser, awarenessMessages, acknowledgeReminder } = useCollege();

  // Find all unseen reminders for this teacher (or all faculty)
  const unseenReminders = (awarenessMessages || []).filter((m) => {
    if (m.status !== 'UNSEEN') return false;
    if (!m.teacherName || m.teacherName === 'All Faculty') return true;
    if (currentUser?.name && m.teacherName.toLowerCase().includes(currentUser.name.toLowerCase())) return true;
    return true; // Show to active teacher
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  if (userRole !== 'teacher' || unseenReminders.length === 0 || isDismissed) {
    return null;
  }

  const activeReminder = unseenReminders[currentIndex] || unseenReminders[0];

  const handleAcknowledge = () => {
    acknowledgeReminder(activeReminder.id);
    if (currentIndex >= unseenReminders.length - 1) {
      setCurrentIndex(Math.max(0, unseenReminders.length - 2));
    }
  };

  const handleAcknowledgeAll = () => {
    unseenReminders.forEach((r) => acknowledgeReminder(r.id));
    setIsDismissed(true);
  };

  return (
    <aside
      aria-label="Student reminder alerts"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full p-4 pointer-events-none animate-slideUp"
    >
      <div className="pointer-events-auto bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-5 shadow-2xl shadow-amber-950/50 backdrop-blur-xl relative overflow-hidden ring-1 ring-amber-400/30">
        {/* Glowing Accent Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 animate-pulse" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-wide">
                  Student Reminder Alert
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  New
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Reminder awareness sent from student portal
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reminder Content */}
        <div className="mt-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{activeReminder.studentName}</span>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Roll {activeReminder.studentRoll}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {activeReminder.timestamp}
            </span>
          </div>

          <div className="text-[11px] text-indigo-300 font-medium">
            For: <strong className="text-white">{activeReminder.teacherName}</strong> • Topic:{' '}
            <span className="text-slate-300">{activeReminder.subject}</span>
          </div>

          {/* Clean Reminder Message Body (Pure text message) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans shadow-inner">
            "{activeReminder.message}"
          </div>
        </div>

        {/* Multiple Reminders Carousel Controls & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          {unseenReminders.length > 1 ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span>
                {currentIndex + 1} of {unseenReminders.length}
              </span>
              <button
                disabled={currentIndex >= unseenReminders.length - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(unseenReminders.length - 1, prev + 1))}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-amber-400">
              <AlertCircle className="w-3 h-3" />
              <span>Pending Attention</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {unseenReminders.length > 1 && (
              <button
                onClick={handleAcknowledgeAll}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Seen All
              </button>
            )}
            <button
              onClick={handleAcknowledge}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/30 transition"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Acknowledge Reminder</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
