import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  GraduationCap,
  Bell,
  UserCheck,
  Repeat,
  LogOut,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  BookOpen,
  Trash2,
  Clock,
  CheckSquare,
  Square,
  Check,
  Video,
} from 'lucide-react';

export default function Navbar({ onOpenAuth }) {
  const {
    currentUser,
    userRole,
    switchRole,
    notifications,
    students,
    logout,
    deleteNotification,
    deleteSelectedNotifications,
    clearAllNotifications,
    deleteNotifications24Hours,
    openMeetingDirectly,
  } = useCollege();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedNotifIds, setSelectedNotifIds] = useState([]);

  // Count pending student registration requests
  const pendingRequestsCount = students.filter((s) => s.status === 'PENDING').length;

  const toggleSelectNotif = (id) => {
    setSelectedNotifIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllNotifs = () => {
    if (selectedNotifIds.length === notifications.length) {
      setSelectedNotifIds([]);
    } else {
      setSelectedNotifIds(notifications.map((n) => n.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedNotifIds.length === 0) return;
    deleteSelectedNotifications(selectedNotifIds);
    setSelectedNotifIds([]);
  };

  const handleClearAll = () => {
    if (confirm('Delete all campus notifications?')) {
      clearAllNotifications();
      setSelectedNotifIds([]);
    }
  };

  const handleDelete24Hours = (mode = 'older') => {
    deleteNotifications24Hours(mode);
    setSelectedNotifIds([]);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                INDIRA UNIVERSITY
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 shadow-xs">
                <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                Teacher Co-Pilot
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              A Teacher Co-Pilot (AI Assistant for Teachers) • School of IT (AIML)
            </p>
          </div>
        </div>

        {/* Center Role Badge (Read-only, matches logged in account) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold">
            {userRole === 'student' ? (
              <span className="flex items-center gap-1.5 text-indigo-300">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                Student Portal
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-purple-300">
                <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                Teacher Portal
                {pendingRequestsCount > 0 && (
                  <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white font-bold">
                    {pendingRequestsCount}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition border border-slate-700/50"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] text-white font-bold">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-[420px] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <h4 className="font-bold text-sm text-white">Campus Notifications</h4>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-semibold">
                      {notifications.length}
                    </span>
                  </div>

                  {notifications.length > 0 && (
                    <button
                      onClick={handleSelectAllNotifs}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
                    >
                      {selectedNotifIds.length === notifications.length && notifications.length > 0 ? (
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span>Select All</span>
                    </button>
                  )}
                </div>

                {/* 3 Notification Actions: Select Delete, Delete All, Delete 24h */}
                {notifications.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                    {/* 1. Select Delete */}
                    <button
                      onClick={handleDeleteSelected}
                      disabled={selectedNotifIds.length === 0}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 disabled:opacity-40 disabled:hover:bg-rose-600/20 disabled:hover:text-rose-300 font-semibold transition flex items-center gap-1"
                      title="Delete checked notifications"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Selected {selectedNotifIds.length > 0 ? `(${selectedNotifIds.length})` : ''}</span>
                    </button>

                    {/* 2. Delete 24 Hours */}
                    <button
                      onClick={() => handleDelete24Hours('older')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold transition flex items-center gap-1"
                      title="Purge notifications older than 24 hours"
                    >
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>Delete &gt;24h Old</span>
                    </button>

                    {/* 3. Delete All */}
                    <button
                      onClick={handleClearAll}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 font-semibold transition flex items-center gap-1 ml-auto"
                      title="Clear all campus notifications"
                    >
                      <Trash2 className="w-3 h-3 text-rose-400" />
                      <span>Delete All</span>
                    </button>
                  </div>
                )}

                {/* Notification Items Stream */}
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {notifications.length > 0 ? (
                    notifications.map((item) => {
                      const isSelected = selectedNotifIds.includes(item.id);

                      return (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-2xl border text-xs transition flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-indigo-950/40 border-indigo-500/50'
                              : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/40'
                          }`}
                        >
                          <button
                            onClick={() => toggleSelectNotif(item.id)}
                            className="mt-0.5 text-slate-400 hover:text-white flex-shrink-0"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </button>

                          <div
                            onClick={() => {
                              if (item.type === 'meeting' || item.link?.includes('meeting') || item.title?.includes('Lecture') || item.title?.includes('LIVE')) {
                                openMeetingDirectly(item.roomId || 'EDU-303-ZOOM');
                                setShowNotifications(false);
                              }
                            }}
                            className={`flex-1 min-w-0 ${
                              item.type === 'meeting' || item.link?.includes('meeting') || item.title?.includes('Lecture')
                                ? 'cursor-pointer hover:opacity-95'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold text-slate-200">
                              <span className="truncate pr-1 flex items-center gap-1.5">
                                {(item.type === 'meeting' || item.title?.includes('Lecture')) && (
                                  <Video className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                )}
                                {item.title}
                              </span>
                              <span className="text-[10px] font-normal text-slate-400 font-mono flex-shrink-0">
                                {item.timestamp}
                              </span>
                            </div>
                            <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                              {item.message}
                            </p>
                            {(item.type === 'meeting' || item.link?.includes('meeting') || item.title?.includes('Lecture')) && (
                              <span className="inline-block mt-1 text-[10px] font-bold text-rose-400 hover:text-rose-300">
                                🚀 Click to Join Live Meeting →
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => deleteNotification(item.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-700/50 transition flex-shrink-0"
                            title="Delete this notification"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications right now. You're all caught up!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account Pill */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 transition text-left"
            >
              <img
                src={currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Indira'}
                alt={currentUser?.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-400/40"
              />
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-white leading-tight">
                  {currentUser?.name || 'User'}
                </p>
                <p className="text-[10px] text-indigo-400 font-mono leading-tight">
                  {userRole === 'student'
                    ? `Roll ${currentUser?.rollNo || '15'} • Batch ${currentUser?.batch || 'A'}`
                    : currentUser?.facultyNo || 'Faculty'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-semibold text-white">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {userRole === 'student' ? 'Student Account' : 'Faculty Member'}
                  </span>
                </div>

                <div className="p-1 space-y-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenAuth();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                    Account Settings
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-300 hover:text-white hover:bg-rose-900/40 transition border-t border-slate-800/80 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    Sign Out to Login Page
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Sign Out Button */}
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700/50 transition hidden sm:flex items-center gap-1.5 text-xs font-semibold"
            title="Sign out to Login screen"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
