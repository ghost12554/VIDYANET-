import React from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquareCode,
  Share2,
  Bot,
  User,
  Sparkles,
  Inbox,
  Flame,
} from 'lucide-react';

export default function Sidebar() {
  const { activeMode, setActiveMode, userRole, students, chats } = useCollege();

  const pendingRequestsCount = students.filter((s) => s.status === 'PENDING').length;

  const studentModes = [
    {
      id: 'dashboard',
      label: '1. Dashboard',
      subtitle: 'Tracker, Timetable & Stats',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'workstore',
      label: '2. WorkStore',
      subtitle: 'Notes, Tests & Meetings',
      icon: FolderKanban,
      badge: 'Active',
    },
    {
      id: 'chitchat',
      label: '3. ChitChat',
      subtitle: 'WhatsApp Style Channels',
      icon: MessageSquareCode,
      badge: null,
    },
    {
      id: 'socialfreak',
      label: '4. Social Freak',
      subtitle: 'Campus X / Twitter Feed',
      icon: Flame,
      badge: 'Hot',
    },
    {
      id: 'profile',
      label: '5. Profile & Drive',
      subtitle: 'ID Card & Emergency Vault',
      icon: User,
      badge: null,
    },
  ];

  const teacherModes = [
    {
      id: 'dashboard',
      label: '1. Dashboard',
      subtitle: 'Master Timetable & Requests',
      icon: LayoutDashboard,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} Pending` : null,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'workstore',
      label: '2. WorkStore',
      subtitle: 'Upload Notes & Grading',
      icon: FolderKanban,
      badge: null,
    },
    {
      id: 'chitchat',
      label: '3. ChitChat',
      subtitle: 'Student & Faculty Groups',
      icon: MessageSquareCode,
      badge: null,
    },
    {
      id: 'botmarket',
      label: '4. BotMarket (AI)',
      subtitle: 'AI Automation & Analytics',
      icon: Bot,
      badge: 'AI Suite',
      badgeColor: 'bg-gradient-to-r from-purple-500 to-indigo-500',
    },
    {
      id: 'profile',
      label: '5. Profile & Drive',
      subtitle: 'Faculty ID & Secure Files',
      icon: User,
      badge: null,
    },
  ];

  const currentModes = userRole === 'student' ? studentModes : teacherModes;

  return (
    <aside className="w-full lg:w-64 bg-slate-900/60 lg:min-h-[calc(100vh-6rem)] border-b lg:border-b-0 lg:border-r border-slate-800 p-3 lg:p-4 flex flex-row lg:flex-col justify-between overflow-x-auto lg:overflow-visible">
      <div className="flex flex-row lg:flex-col gap-1.5 w-full">
        <div className="hidden lg:block px-3 py-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {userRole === 'student' ? 'Student Modes (5 Panels)' : 'Teacher Modes (5 Panels)'}
          </span>
        </div>

        {currentModes.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition relative group flex-1 lg:flex-initial whitespace-nowrap lg:whitespace-normal ${
                isActive
                  ? userRole === 'student'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-400/30'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25 ring-1 ring-purple-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div
                className={`p-2 rounded-xl transition ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold tracking-wide truncate">
                    {mode.label}
                  </span>
                  {mode.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${
                        mode.badgeColor || 'bg-indigo-500'
                      }`}
                    >
                      {mode.badge}
                    </span>
                  )}
                </div>
                <p
                  className={`text-[10px] truncate hidden sm:block ${
                    isActive ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  {mode.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="hidden lg:block mt-6 p-3 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700/60 text-slate-300 text-xs">
        <div className="flex items-center gap-2 mb-1 text-indigo-400 font-semibold text-[11px]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Indira SOIT AIML</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          Connected UMS Platform. Changes made in Teacher Portal sync dynamically with Student Portal.
        </p>
      </div>
    </aside>
  );
}
