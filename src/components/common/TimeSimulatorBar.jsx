import React from 'react';
import { useCollege } from '../../context/CollegeContext';
import { Clock, Calendar, Sparkles, Radio, Zap } from 'lucide-react';

export default function TimeSimulatorBar() {
  const { simulatedTime, setSimulatedTime, getIndianTime } = useCollege();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const presetTimes = [
    { label: '08:50 AM (Period 1)', hour: 8, minute: 50 },
    { label: '09:45 AM (Period 2)', hour: 9, minute: 45 },
    { label: '10:20 AM (Recess/Break)', hour: 10, minute: 20 },
    { label: '10:45 AM (Period 3)', hour: 10, minute: 45 },
    { label: '01:15 PM (Practical Labs)', hour: 13, minute: 15 },
    { label: '03:30 PM (Evening/Off)', hour: 15, minute: 30 },
  ];

  const toggleLiveIST = () => {
    if (simulatedTime.isLiveTime) {
      // Switch to manual simulator mode
      setSimulatedTime((prev) => ({ ...prev, isLiveTime: false }));
    } else {
      // Sync back to Real Live Indian Standard Time (IST)
      const ist = getIndianTime();
      setSimulatedTime({ ...ist, isLiveTime: true });
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-indigo-500/20 px-3 sm:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
      {/* Indian Time Display & Mode Pill */}
      <div className="flex items-center gap-2.5">
        <span className="flex h-2.5 w-2.5 relative">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${simulatedTime.isLiveTime ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${simulatedTime.isLiveTime ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </span>

        <span className="font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
          <span>🇮🇳</span>
          <span className="hidden sm:inline">Indian Standard Time:</span>
        </span>

        {/* Live Clock Badge */}
        <span className="bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-lg border border-indigo-500/30 font-mono font-bold flex items-center gap-1">
          <Clock className="w-3 h-3 text-indigo-400" />
          <span>{simulatedTime.day},</span>
          <span>
            {String(simulatedTime.hour > 12 ? simulatedTime.hour - 12 : simulatedTime.hour || 12).padStart(2, '0')}:
            {String(simulatedTime.minute).padStart(2, '0')}
            {simulatedTime.second !== undefined && `:${String(simulatedTime.second).padStart(2, '0')}`}{' '}
            {simulatedTime.hour >= 12 ? 'PM' : 'AM'} IST
          </span>
        </span>

        {/* Mode Toggle Button */}
        <button
          onClick={toggleLiveIST}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1 shadow-sm ${
            simulatedTime.isLiveTime
              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
          }`}
          title="Toggle between Real Live Indian Standard Time and Manual Simulator"
        >
          {simulatedTime.isLiveTime ? (
            <>
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Live IST Active</span>
            </>
          ) : (
            <>
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Time Warp Mode (Click for Live IST)</span>
            </>
          )}
        </button>
      </div>

      {/* Simulator Controls (Available when user wants to test slots) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Day selector */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
          <Calendar className="w-3 h-3 text-slate-400 ml-1.5" />
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSimulatedTime((prev) => ({ ...prev, day: d, isLiveTime: false }))}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                simulatedTime.day === d
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Preset time quick buttons */}
        <div className="hidden lg:flex items-center gap-1">
          <span className="text-slate-400 text-[11px]">Test Period:</span>
          {presetTimes.map((preset) => {
            const isMatch =
              !simulatedTime.isLiveTime &&
              simulatedTime.hour === preset.hour &&
              simulatedTime.minute === preset.minute;
            return (
              <button
                key={preset.label}
                onClick={() =>
                  setSimulatedTime((prev) => ({
                    ...prev,
                    hour: preset.hour,
                    minute: preset.minute,
                    second: 0,
                    isLiveTime: false,
                  }))
                }
                className={`px-2 py-0.5 rounded text-[11px] transition ${
                  isMatch
                    ? 'bg-purple-600 text-white font-semibold shadow-sm ring-1 ring-purple-400'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
