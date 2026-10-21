import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  Clock,
  MapPin,
  User,
  Radio,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Coffee,
  Calendar,
  Zap,
  Activity,
  AlertTriangle,
  Info,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

export default function LectureTrackerCard() {
  const { timetable, simulatedTime, setSimulatedTime, getIndianTime, userRole, currentUser } = useCollege();
  const [showExplainer, setShowExplainer] = useState(false);

  const currentDay = simulatedTime.day;
  const currentTotalMins = simulatedTime.hour * 60 + simulatedTime.minute;

  // Check if timetable is cleared or empty
  const isTimetableEmpty = !timetable || !timetable.theorySlots || timetable.theorySlots.length === 0;

  const dayTheory = (!isTimetableEmpty && timetable.theorySchedule?.[currentDay]) || [];

  // Determine current active slot
  let activeLecture = null;
  let nextLecture = null;
  let isBreakNow = false;

  if (!isTimetableEmpty) {
    // Check theory slots
    timetable.theorySlots.forEach((slot, idx) => {
      const startMins = slot.startHour * 60 + slot.startMin;
      const endMins = slot.endHour * 60 + slot.endMin;
      const item = dayTheory[idx] || {};

      if (currentTotalMins >= startMins && currentTotalMins < endMins) {
        if (slot.isBreak || item.isBreak) {
          isBreakNow = true;
          activeLecture = {
            title: 'Morning Recess / Break',
            time: slot.time,
            isBreak: true,
            remainingMins: endMins - currentTotalMins,
            progress: Math.round(((currentTotalMins - startMins) / (endMins - startMins)) * 100),
          };
        } else {
          activeLecture = {
            title: item.subject || 'Independent Study',
            faculty: item.faculty || 'Faculty in charge',
            room: item.room || '303',
            time: slot.time,
            remainingMins: endMins - currentTotalMins,
            progress: Math.round(((currentTotalMins - startMins) / (endMins - startMins)) * 100),
            isTheory: true,
          };
        }
      } else if (currentTotalMins < startMins && !nextLecture) {
        nextLecture = {
          title: item.isBreak ? 'Break' : item.subject || 'Free Period',
          faculty: item.faculty,
          time: slot.time,
          startsInMins: startMins - currentTotalMins,
          room: item.room || '303',
        };
      }
    });

    // Check practical slot dynamically from timetable configuration
    const pracStartMins = (timetable.practicalSlots?.startHour ?? 12) * 60 + (timetable.practicalSlots?.startMin ?? 30);
    const pracEndMins = (timetable.practicalSlots?.endHour ?? 15) * 60 + (timetable.practicalSlots?.endMin ?? 0);
    if (currentTotalMins >= pracStartMins && currentTotalMins < pracEndMins) {
      const practicals = timetable.practicalSlots?.days?.[currentDay] || [];
      const labNames = practicals.map((p) => `${p.lab} (${p.batch})`).join(', ');
      activeLecture = {
        title: 'Practical Lab Session',
        faculty: practicals.map((p) => p.faculty).join(' & ') || 'Lab In-charges',
        room: 'Computer Lab 3-A / 3-B',
        time: timetable.practicalSlots?.time || '12:30 PM to 03:00 PM',
        details: labNames,
        remainingMins: pracEndMins - currentTotalMins,
        progress: Math.round(((currentTotalMins - pracStartMins) / (pracEndMins - pracStartMins)) * 100),
        isPractical: true,
      };
    } else if (currentTotalMins >= 11 * 60 + 15 && currentTotalMins < pracStartMins) {
      // Midday Break / Lunch interval before practicals
      if (!activeLecture) {
        activeLecture = {
          title: 'Midday Lunch Interval',
          time: 'Break before Practicals',
          isBreak: true,
          remainingMins: pracStartMins - currentTotalMins,
          progress: Math.round(((currentTotalMins - 675) / (pracStartMins - 675)) * 100),
        };
        const practicals = timetable.practicalSlots?.days?.[currentDay] || [];
        if (practicals.length > 0) {
          nextLecture = {
            title: `Practical: ${practicals[0].lab}`,
            time: timetable.practicalSlots?.time?.split(' to ')?.[0] || '12:30 PM',
            startsInMins: pracStartMins - currentTotalMins,
            room: 'Lab 3',
          };
        }
      }
    }
  }

  // Teacher specific status
  const isTeacherTakingClass =
    userRole === 'teacher' &&
    activeLecture &&
    activeLecture.faculty &&
    currentUser?.name &&
    activeLecture.faculty.toLowerCase().includes(currentUser.name.toLowerCase().replace('prof. ', ''));

  // Format 12-hour display time
  const displayHour = simulatedTime.hour > 12 ? simulatedTime.hour - 12 : simulatedTime.hour === 0 ? 12 : simulatedTime.hour;
  const ampm = simulatedTime.hour >= 12 ? 'PM' : 'AM';
  const timeFormatted = `${String(displayHour).padStart(2, '0')}:${String(simulatedTime.minute).padStart(2, '0')}${
    simulatedTime.second !== undefined ? `:${String(simulatedTime.second).padStart(2, '0')}` : ''
  } ${ampm}`;

  // Is within college working hours (08:30 AM - 02:45 PM)
  const isCollegeHours = currentTotalMins >= 8 * 60 + 30 && currentTotalMins < 14 * 60 + 45;

  return (
    <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 p-6 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden space-y-5">
      {/* Glow background accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header bar with Live Indian Time & Real-time Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide uppercase flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                Dynamic Lecture Tracker
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                {simulatedTime.isLiveTime ? 'Live IST Stream' : 'Period Test Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Day: <strong className="text-indigo-300">{currentDay}</strong> • Classroom 303 • SY.B.Sc. AIML
            </p>
          </div>
        </div>

        {/* Live IST Clock & Status Pill */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs shadow-inner">
            <Clock className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
            <div>
              <span className="text-[10px] font-mono text-slate-400 block leading-tight">Indian Standard Time (IST)</span>
              <span className="font-mono font-black text-indigo-200 text-sm tracking-wide">
                🇮🇳 {timeFormatted}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowExplainer(!showExplainer)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1 transition"
            title="How do I know lecture tracking is working?"
          >
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline">How It Works</span>
          </button>
        </div>
      </div>

      {/* 2. Educational & Diagnostic Explainer Dropdown */}
      {showExplainer && (
        <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-xs text-slate-300 space-y-2.5 transition animate-fadeIn">
          <div className="flex items-center justify-between font-bold text-white">
            <span className="flex items-center gap-1.5 text-indigo-300">
              <Info className="w-4 h-4 text-indigo-400" />
              How the Dynamic Lecture Tracker Operates:
            </span>
            <button
              onClick={() => setShowExplainer(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Close ✕
            </button>
          </div>
          <p className="text-slate-300 leading-relaxed">
            1. <strong>Real-Life Indian Time Awareness:</strong> VidyaNet continuously checks current Indian Standard Time (Asia/Kolkata). During college hours (08:45 AM - 03:00 PM), it automatically detects the current period and marks it "LIVE NOW" with countdown minutes and a progress bar.
          </p>
          <p className="text-slate-300 leading-relaxed">
            2. <strong>Seamless Period Transitions:</strong> At the exact minute a lecture ends (e.g. 09:30 AM), the tracker dynamically transitions to the next period or break without needing any browser reload.
          </p>
          <p className="text-slate-300 leading-relaxed">
            3. <strong>Instant Verification Anytime:</strong> Because testing often happens outside college hours (e.g. at night), use the <strong>1-Click Period Verification Buttons</strong> below. Clicking any button immediately jumps to that period, letting you confirm both the ongoing session and the upcoming lecture!
          </p>
        </div>
      )}

      {/* 3. Empty State or Active Tracker */}
      {isTimetableEmpty ? (
        <div className="p-8 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-center space-y-3">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
          <h4 className="text-lg font-bold text-white">No Active Timetable Configured</h4>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            {userRole === 'teacher'
              ? 'The master timetable is currently cleared. Upload a new timetable file (Image, PDF, Excel, Word) or add periods below to resume dynamic lecture tracking.'
              : 'Faculty has removed or is currently updating the semester timetable. Dynamic lecture tracking will resume automatically as soon as a new schedule is published.'}
          </p>
          <div className="pt-2">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold">
              Status: Awaiting Faculty Upload
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Current Active Status */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-indigo-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold mb-3">
                <span className="uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  CURRENT ONGOING SESSION
                </span>
                {activeLecture && (
                  <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    {activeLecture.remainingMins} mins left
                  </span>
                )}
              </div>

              {activeLecture ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        {activeLecture.isBreak ? (
                          <Coffee className="w-5 h-5 text-amber-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-indigo-400" />
                        )}
                        {activeLecture.title}
                      </h4>
                      {activeLecture.faculty && (
                        <p className="text-xs text-indigo-300 font-medium mt-1 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          Faculty: <strong>{activeLecture.faculty}</strong>
                        </p>
                      )}
                      {activeLecture.details && (
                        <p className="text-[11px] text-purple-300 mt-1">{activeLecture.details}</p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 font-mono text-xs border border-indigo-500/30 font-bold">
                        {activeLecture.time}
                      </span>
                      {activeLecture.room && (
                        <p className="text-xs text-slate-400 mt-1 flex items-center justify-end gap-1">
                          <MapPin className="w-3 h-3" /> Room {activeLecture.room}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Period Duration Elapsed</span>
                      <span className="font-mono text-indigo-300 font-bold">{activeLecture.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, activeLecture.progress))}%` }}
                      />
                    </div>
                  </div>

                  {/* Teacher notification banner if user is taking this class */}
                  {isTeacherTakingClass && (
                    <div className="mt-2 p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-xs text-purple-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>You are the designated faculty conducting this session!</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-400/70 mx-auto" />
                  <p className="text-base font-bold text-slate-200">
                    Outside College Hours (08:45 AM - 03:00 PM)
                  </p>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                    College is currently closed for the day. Active lecture tracking runs automatically between 08:45 AM and 03:00 PM IST.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>Classroom: <strong>303 (SOIT)</strong></span>
              <span className="text-emerald-400 font-medium">✓ Engine Live & Syncing</span>
            </div>
          </div>

          {/* Up Next & Quick Highlights */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-purple-400 font-semibold mb-3">
                <span className="uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                  UP NEXT ON SCHEDULE
                </span>
                {nextLecture && (
                  <span className="text-indigo-400 font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                    Starts in {nextLecture.startsInMins} mins
                  </span>
                )}
              </div>

              {nextLecture ? (
                <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <p className="text-base font-bold text-white">{nextLecture.title}</p>
                    {nextLecture.faculty && (
                      <p className="text-xs text-slate-300 mt-0.5">Faculty: {nextLecture.faculty}</p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      Classroom / Lab: {nextLecture.room}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-500/30">
                      {nextLecture.time}
                    </span>
                    <p className="text-[10px] text-emerald-400 mt-1.5 font-semibold">Scheduled next</p>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-slate-800/40 text-center text-xs text-slate-400 space-y-1">
                  <p className="text-slate-300 font-semibold">No more lectures scheduled for today</p>
                  <p className="text-slate-500 text-[11px]">Next session will commence tomorrow at 08:45 AM.</p>
                </div>
              )}
            </div>

            {/* Quick Schedule Row */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Active Day: <strong className="text-white">{currentDay}</strong>
              </span>
              <span>AIML Sem-III • Div-A</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}