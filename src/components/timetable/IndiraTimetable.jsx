import React, { useState, useRef } from 'react';
import { useCollege } from '../../context/CollegeContext';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Edit2,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Sparkles,
  Download,
  Award,
  Upload,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Printer,
  Grid,
  X,
  ExternalLink,
  AlertTriangle,
  FileCheck,
  Save,
  Sliders,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { TIMETABLE_AUGUST_3, TIMETABLE_JULY_20, TIMETABLE_JAN_05, TIMETABLE_JAN_10 } from '../../data/initialData';
import {
  parseExcelTimetable,
  parseImageOrDocument,
  createDynamicDefaultTimetable,
  compressImageToDataUrl,
} from '../../utils/timetableParser';
import {
  parseTimetableWithGemini,
  getGeminiApiKey,
  saveGeminiApiKey,
} from '../../services/geminiVisionService';

export default function IndiraTimetable({ isEditable = false }) {
  const {
    timetable,
    importTimetable,
    clearTimetable,
    currentUser,
    userRole,
  } = useCollege();

  // Active view: 'master' (Full-View Master Table) | 'scanned' (Uploaded Image View)
  const [activeTab, setActiveTab] = useState('master');

  // Inline table edit mode for teachers
  const [isEditingGrid, setIsEditingGrid] = useState(false);
  const [editableTimetable, setEditableTimetable] = useState(timetable);

  // Keep editable copy in sync when timetable changes from context
  React.useEffect(() => {
    setEditableTimetable(timetable);
  }, [timetable]);

  // Confirmation modal for removing entire timetable
  const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState(false);

  // Success alert banner when timetable updates
  const [updateSuccessBanner, setUpdateSuccessBanner] = useState(null);

  // Smart Timetable Importer Modal (Image / PDF / Excel / Word)
  const [showImporterModal, setShowImporterModal] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileType, setUploadedFileType] = useState('image');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState(null);
  const [previewImageSrc, setPreviewImageSrc] = useState(timetable?.documentImage || '/timetable_july20.png');
  const [isDragging, setIsDragging] = useState(false);
  const [currentUploadedFile, setCurrentUploadedFile] = useState(null);
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState(() => getGeminiApiKey());
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiErrorMessage, setAiErrorMessage] = useState('');

  const fileInputRef = useRef(null);
  const directFileInputRef = useRef(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Check if timetable is empty or cleared
  const isTimetableEmpty = !timetable || !timetable.theorySlots || timetable.theorySlots.length === 0;

  // Handle direct 1-click loading of predefined schedules
  const handleLoadPreset = (presetKey) => {
    let preset = TIMETABLE_JAN_10;
    if (presetKey === 'jan05') preset = TIMETABLE_JAN_05;
    else if (presetKey === 'july20') preset = TIMETABLE_JULY_20;
    else if (presetKey === 'aug3') preset = TIMETABLE_AUGUST_3;
    executePublish(preset, preset.parsedFrom);
  };

  // Execute timetable update & publish across all student portals
  const executePublish = (newTimetableData, fileName) => {
    importTimetable(newTimetableData);
    setShowImporterModal(false);
    setIsEditingGrid(false);

    // Fire celebratory confetti!
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });

    setUpdateSuccessBanner({
      title: 'Full-View Master Timetable Updated Successfully!',
      fileName: fileName || newTimetableData.parsedFrom || 'Uploaded Schedule',
      effectiveDate: newTimetableData.effectiveDate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setTimeout(() => {
      setUpdateSuccessBanner(null);
    }, 8000);
  };

  // Excel File upload processor: parses any .xlsx, .xls, or .csv spreadsheet dynamically!
  const handleFileUpload = async (file, autoPublish = false) => {
    if (!file) return;
    setUploadedFileName(file.name);

    const isExcel =
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls') ||
      file.name.endsWith('.csv');

    if (!isExcel) {
      alert('Please select an Excel file (.xlsx, .xls, or .csv). As requested, only Excel format is accepted.');
      return;
    }

    setIsParsing(true);
    setUploadedFileType('excel');

    try {
      const parsed = await parseExcelTimetable(file);
      setParsedPreview(parsed);
      setIsParsing(false);
      if (autoPublish) {
        executePublish(parsed, file.name);
      } else {
        setShowImporterModal(true);
      }
    } catch (err) {
      console.error('File parsing error:', err);
      const fallback = createDynamicDefaultTimetable(file.name);
      setParsedPreview(fallback);
      setIsParsing(false);
      setShowImporterModal(true);
    }
  };

  // Inline cell editor handlers on the main master grid
  const handleCellChange = (day, slotIdx, field, val) => {
    setEditableTimetable((prev) => {
      const schedule = { ...prev.theorySchedule };
      const daySlots = [...(schedule[day] || [])];
      daySlots[slotIdx] = { ...daySlots[slotIdx], [field]: val };
      schedule[day] = daySlots;
      return { ...prev, theorySchedule: schedule };
    });
  };

  const handleSlotTimeChange = (slotIdx, val) => {
    setEditableTimetable((prev) => {
      const slots = [...prev.theorySlots];
      slots[slotIdx] = { ...slots[slotIdx], time: val };
      return { ...prev, theorySlots: slots };
    });
  };

  const handleAddSlotToGrid = () => {
    setEditableTimetable((prev) => {
      const slotNum = prev.theorySlots.length + 1;
      const newSlot = {
        time: `11:45 to 12:30`,
        isBreak: false,
        startHour: 11,
        startMin: 45,
        endHour: 12,
        endMin: 30,
      };
      const newSlots = [...prev.theorySlots, newSlot];
      const newSchedule = { ...prev.theorySchedule };
      days.forEach((d) => {
        newSchedule[d] = [
          ...(newSchedule[d] || []),
          { subject: 'New Subject', room: '303', faculty: 'Faculty', isBreak: false },
        ];
      });
      return { ...prev, theorySlots: newSlots, theorySchedule: newSchedule };
    });
  };

  const handleRemoveSlotFromGrid = (slotIdx) => {
    setEditableTimetable((prev) => {
      const newSlots = prev.theorySlots.filter((_, idx) => idx !== slotIdx);
      const newSchedule = { ...prev.theorySchedule };
      days.forEach((d) => {
        newSchedule[d] = (newSchedule[d] || []).filter((_, idx) => idx !== slotIdx);
      });
      return { ...prev, theorySlots: newSlots, theorySchedule: newSchedule };
    });
  };

  const handleSaveGridEdits = () => {
    executePublish(editableTimetable, 'Manually Edited Master Schedule');
  };

  const handleConfirmRemove = () => {
    clearTimetable();
    setShowRemoveConfirmModal(false);
  };

  // Importer modal preview cell editors
  const handleParsedPreviewCellChange = (day, slotIdx, field, val) => {
    setParsedPreview((prev) => {
      if (!prev) return prev;
      const schedule = { ...prev.theorySchedule };
      const daySlots = [...(schedule[day] || [])];
      daySlots[slotIdx] = { ...daySlots[slotIdx], [field]: val };
      schedule[day] = daySlots;
      return { ...prev, theorySchedule: schedule };
    });
  };

  const handleParsedPreviewSlotChange = (slotIdx, field, val) => {
    setParsedPreview((prev) => {
      if (!prev) return prev;
      const slots = [...prev.theorySlots];
      slots[slotIdx] = { ...slots[slotIdx], [field]: val };
      return { ...prev, theorySlots: slots };
    });
  };

  const handleAddSlotToParsedPreview = () => {
    setParsedPreview((prev) => {
      if (!prev) return prev;
      const newSlot = {
        time: '11:45 to 12:30',
        isBreak: false,
        startHour: 11,
        startMin: 45,
        endHour: 12,
        endMin: 30,
      };
      const newSlots = [...prev.theorySlots, newSlot];
      const newSchedule = { ...prev.theorySchedule };
      days.forEach((d) => {
        newSchedule[d] = [
          ...(newSchedule[d] || []),
          { subject: 'Subject', room: '303', faculty: 'Faculty', isBreak: false },
        ];
      });
      return { ...prev, theorySlots: newSlots, theorySchedule: newSchedule };
    });
  };

  const handleRemoveSlotFromParsedPreview = (slotIdx) => {
    setParsedPreview((prev) => {
      if (!prev) return prev;
      const newSlots = prev.theorySlots.filter((_, idx) => idx !== slotIdx);
      const newSchedule = { ...prev.theorySchedule };
      days.forEach((d) => {
        newSchedule[d] = (newSchedule[d] || []).filter((_, idx) => idx !== slotIdx);
      });
      return { ...prev, theorySlots: newSlots, theorySchedule: newSchedule };
    });
  };

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden space-y-0">
      {/* Top Banner on Update */}
      {updateSuccessBanner && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white flex items-center justify-between text-xs font-semibold animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-white animate-bounce shrink-0" />
            <div>
              <p className="font-bold text-sm">{updateSuccessBanner.title}</p>
              <p className="text-emerald-100 text-[11px]">
                Active file: <strong>{updateSuccessBanner.fileName}</strong> • w.e.f. {updateSuccessBanner.effectiveDate} • Published across Student & Teacher Portals at {updateSuccessBanner.time}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setUpdateSuccessBanner(null)}
            className="px-2.5 py-1 rounded-lg bg-emerald-700/60 hover:bg-emerald-700 text-white"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* Official Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center p-2 text-indigo-300 font-bold text-center leading-tight text-xs shadow-inner">
              SOIT
              <br />
              PUNE
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] tracking-widest font-mono text-indigo-400 font-bold uppercase">
                  {timetable.effectiveDate ? `w.e.f. ${timetable.effectiveDate}` : 'Official Master Schedule'}
                </span>
                {timetable.parsedFrom && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                    <FileCheck className="w-3 h-3" />
                    <span>Active Document: {timetable.parsedFrom}</span>
                  </span>
                )}
                {timetable.parsedDate && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    Updated {timetable.parsedDate}
                  </span>
                )}
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight mt-0.5">
                {timetable.institution || 'INDIRA UNIVERSITY, SCHOOL OF INFORMATION TECHNOLOGY'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-300 font-medium">
                <span className="text-purple-300 font-semibold">{timetable.program}</span>
                <span>•</span>
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                  {timetable.division || 'Div-A (Classroom no - 303)'}
                </span>
                <span>•</span>
                <span className="text-slate-400">Class Teacher: {timetable.classTeacher || 'Divya C.'}</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode: Master Table vs Document Scan */}
            <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 text-xs">
              <button
                onClick={() => setActiveTab('master')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeTab === 'master'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Full-View Master Table</span>
              </button>

              <button
                onClick={() => setActiveTab('scanned')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeTab === 'scanned'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Document Scan</span>
              </button>
            </div>

            {/* Hidden direct file input for Excel upload */}
            <input
              type="file"
              ref={directFileInputRef}
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0], false);
                  e.target.value = '';
                }
              }}
            />

            {/* Teacher Management Buttons */}
            {isEditable && (
              <>
                {/* Upload Excel Modal Launcher */}
                <button
                  onClick={() => directFileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition"
                  title="Upload official timetable in Excel format (.xlsx, .xls, .csv)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Upload Excel Timetable</span>
                </button>

                {/* Live Cell Edit Mode Toggle */}
                {activeTab === 'master' && !isTimetableEmpty && (
                  <button
                    onClick={() => {
                      if (isEditingGrid) {
                        handleSaveGridEdits();
                      } else {
                        setIsEditingGrid(true);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-md ${
                      isEditingGrid
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400'
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                    title="Click any cell in the table below to edit subjects and faculty directly"
                  >
                    {isEditingGrid ? (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Cell Changes</span>
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Table Cells</span>
                      </>
                    )}
                  </button>
                )}

                {/* Remove Timetable */}
                <button
                  onClick={() => setShowRemoveConfirmModal(true)}
                  className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 transition"
                  title="Completely remove active timetable"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- EMPTY STATE WHEN TIMETABLE IS REMOVED --- */}
      {isTimetableEmpty ? (
        <div className="p-10 text-center space-y-4 bg-slate-950/40">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Full-View Master Timetable Cleared</h3>
            <p className="text-sm text-slate-400 max-w-lg mx-auto mt-1 leading-relaxed">
              {isEditable
                ? 'The master schedule is cleared. Please upload your timetable spreadsheet in Excel format (.xlsx, .xls, .csv).'
                : 'Faculty has cleared the previous semester timetable and is preparing the new schedule. You will be notified the instant it is published!'}
            </p>
          </div>

          {isEditable && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={() => directFileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Upload Excel Timetable (.xlsx, .xls, .csv)</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* --- 1. FULL-VIEW MASTER TIMETABLE MODE --- */}
          {activeTab === 'master' && (
            <div className="p-6 space-y-8 bg-slate-950/60 print:bg-white print:text-black">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 print:hidden gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Grid className="w-4 h-4 text-purple-400" />
                    Full Weekly Master Schedule (Monday – Saturday)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Complete weekly matrix of theory and practical allocations • w.e.f. {timetable.effectiveDate || '20/07/2026'}.
                    {isEditingGrid && (
                      <span className="ml-2 text-emerald-400 font-bold animate-pulse">
                        ● Direct Edit Mode Active: Type in any cell to change subjects, teachers, or times!
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isEditingGrid && (
                    <>
                      <button
                        onClick={handleAddSlotToGrid}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Slot</span>
                      </button>
                      <button
                        onClick={handleSaveGridEdits}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save & Publish</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / PDF</span>
                  </button>
                </div>
              </div>

              {/* Theory Schedule Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Theory Time Table ({timetable.theorySlots?.[0]?.time?.split(' to ')?.[0] || '08:30'} AM to {timetable.theorySlots?.[timetable.theorySlots.length - 1]?.time?.split(' to ')?.[1] || '11:45'} AM)
                </h4>

                <div className="overflow-x-auto rounded-2xl border border-slate-700 shadow-xl">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold border-b border-slate-700">
                        <th className="p-3 border border-slate-700 w-36 font-mono text-center">Day / Time</th>
                        {days.map((d) => (
                          <th key={d} className="p-3 border border-slate-700 text-center uppercase tracking-wider font-bold">
                            {d}
                          </th>
                        ))}
                        {isEditingGrid && (
                          <th className="p-3 border border-slate-700 text-center w-12 text-rose-400">
                            Action
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {timetable.theorySlots.map((slot, sIdx) => {
                        if (slot.isBreak) {
                          return (
                            <tr key={sIdx} className="bg-amber-500/10 text-center font-bold text-amber-300">
                              <td className="p-2 border border-slate-700 font-mono text-[11px] text-amber-400">
                                {isEditingGrid ? (
                                  <input
                                    type="text"
                                    value={slot.time}
                                    onChange={(e) => handleSlotTimeChange(sIdx, e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-amber-300 text-xs"
                                  />
                                ) : (
                                  slot.time
                                )}
                              </td>
                              <td colSpan={6} className="p-2.5 border border-slate-700 tracking-widest uppercase text-xs">
                                ☕ Break ({slot.time})
                              </td>
                              {isEditingGrid && (
                                <td className="p-2 border border-slate-700 text-center">
                                  <button
                                    onClick={() => handleRemoveSlotFromGrid(sIdx)}
                                    className="p-1 rounded bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        }

                        return (
                          <tr key={sIdx} className="hover:bg-slate-800/40 transition">
                            <td className="p-2.5 border border-slate-700 font-mono font-semibold text-indigo-300 text-[11px] text-center bg-slate-900/60">
                              {isEditingGrid ? (
                                <input
                                  type="text"
                                  value={(isEditingGrid ? editableTimetable : timetable).theorySlots[sIdx]?.time || slot.time}
                                  onChange={(e) => handleSlotTimeChange(sIdx, e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-center text-indigo-300 font-bold text-xs"
                                />
                              ) : (
                                slot.time
                              )}
                            </td>
                            {days.map((day) => {
                              const cell = (isEditingGrid ? editableTimetable : timetable).theorySchedule[day]?.[sIdx] || {};

                              if (isEditingGrid) {
                                return (
                                  <td key={day} className="p-2 border border-slate-700 bg-slate-900/40">
                                    <input
                                      type="text"
                                      value={cell.subject || ''}
                                      onChange={(e) => handleCellChange(day, sIdx, 'subject', e.target.value)}
                                      placeholder="Subject"
                                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-bold text-xs text-center focus:border-indigo-500 focus:outline-none"
                                    />
                                    <input
                                      type="text"
                                      value={cell.faculty || ''}
                                      onChange={(e) => handleCellChange(day, sIdx, 'faculty', e.target.value)}
                                      placeholder="Faculty"
                                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-400 text-[10px] text-center focus:border-indigo-500 focus:outline-none"
                                    />
                                  </td>
                                );
                              }

                              return (
                                <td key={day} className="p-3 border border-slate-700 text-center">
                                  <span className="font-bold text-white block text-sm">{cell.subject || '-'}</span>
                                  {cell.faculty && (
                                    <span className="text-[11px] text-slate-400 block mt-0.5">{cell.faculty}</span>
                                  )}
                                </td>
                              );
                            })}
                            {isEditingGrid && (
                              <td className="p-2 border border-slate-700 text-center">
                                <button
                                  onClick={() => handleRemoveSlotFromGrid(sIdx)}
                                  className="p-1 rounded bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white"
                                  title="Delete this slot row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Practical Schedule Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Practical Time Table ({timetable.practicalSlots?.time || '12:30 PM to 03:00 PM'})
                </h4>

                <div className="overflow-x-auto rounded-2xl border border-slate-700 shadow-xl">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold border-b border-slate-700">
                        <th className="p-2.5 border border-slate-700 w-48 text-center">Subject / Day</th>
                        {days.map((d) => (
                          <th key={d} className="p-2.5 border border-slate-700 text-center uppercase tracking-wider">
                            {d}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {timetable.effectiveDate === '03/08/2026' ? (
                        <>
                          <tr className="hover:bg-slate-800/40">
                            <td className="p-2.5 border border-slate-700 font-bold text-white bg-slate-900/60">DS + SE (Lab 3)-B</td>
                            <td className="p-2.5 border border-slate-700 text-center font-bold text-indigo-300">DC(B)</td>
                            <td className="p-2.5 border border-slate-700 text-center font-bold text-indigo-300">DC(C)</td>
                            <td className="p-2.5 border border-slate-700 text-center font-bold text-indigo-300">DC(A)</td>
                            <td className="p-2.5 border border-slate-700 text-center text-slate-600">-</td>
                            <td className="p-2.5 border border-slate-700 text-center text-slate-600">-</td>
                            <td className="p-2.5 border border-slate-700 text-center text-slate-600">-</td>
                          </tr>
                          <tr className="hover:bg-slate-800/40">
                            <td className="p-2.5 border border-slate-700 font-bold text-white bg-slate-900/60">RDBMS (Lab 3)-B</td>
                            <td className="p-2.5 border border-slate-700 text-center text-slate-600">-</td>
                            <td className="p-2.5 border border-slate-700 text-center text-slate-600">-</td>
                            <td className="p-2.5 border border-slate-700 text-center text-slate-600">-</td>
                            <td className="p-2.5 border border-slate-700 text-center font-bold text-purple-300">DY(B)</td>
                            <td className="p-2.5 border border-slate-700 text-center font-bold text-purple-300">DY(C)</td>
                            <td className="p-2.5 border border-slate-700 text-center font-bold text-purple-300">DY(A)</td>
                          </tr>
                          <tr className="hover:bg-slate-800/40">
                            <td className="p-2.5 border border-slate-700 font-bold text-white bg-slate-900/60">Python (Lab 3)-A</td>
                            <td className="p-2.5 border border-slate-700 text-center font-bold text-emerald-300">AS(C)</td>
                            <td className="p-2.5 border border-slate-700 text-center font-bold text-emerald-300">AS(A)</td>
                            <td className="p-2.5 border border-slate-700 text-center font-bold text-emerald-300">AS(B)</td>
                            <td className="p-2.5 border border-slate-700 text-center text-slate-600">-</td>
                            <td className="p-2.5 border border-slate-700 text-center text-slate-600">-</td>
                            <td className="p-2.5 border border-slate-700 text-center text-slate-600">-</td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr className="hover:bg-slate-800/40">
                            <td className="p-2.5 border border-slate-700 font-bold text-white bg-slate-900/60">DS + SE (Lab 3)-B</td>
                            <td className="p-2.5 border border-slate-700 text-center font-bold text-indigo-300">DC(A)</td>
                            <td className="p-2.5 border border-slate-700 text-center font-bold text-indigo-300">DC(B)</td>
                            <td className="p-2.5 border border-slate-700 text-center font-bold text-indigo-300">DC(C)</td>
                            <td className="p-2.5 border border-slate-700 text-center text-slate-600">-</td>
                            <td className="p-2.5 border border-slate-700 text-center text-slate-600">-</td>
                            <td className="p-2.5 border border-slate-700 text-center text-slate-600">-</td>
                          </tr>
                          <tr className="hover:bg-slate-800/40">
                            <td className="p-2.5 border border-slate-700 font-bold text-white bg-slate-900/60">RDBMS (Lab 3)-B</td>
                            <td className="p-2.5 border border-slate-700 text-center text-slate-600">-</td>
                            <td className="p-2.5 border border-slate-700 text-center text-slate-600">-</td>
                            <td className="p-2.5 border border-slate-700 text-center text-slate-600">-</td>
                            <td className="p-2.5 border border-slate-700 text-center font-bold text-purple-300">DY(A)</td>
                            <td className="p-2.5 border border-slate-700 text-center font-bold text-purple-300">DY(B)</td>
                            <td className="p-2.5 border border-slate-700 text-center font-bold text-purple-300">DY(C)</td>
                          </tr>
                          <tr className="hover:bg-slate-800/40">
                            <td className="p-2.5 border border-slate-700 font-bold text-white bg-slate-900/60">Python (Lab 3)-A</td>
                            <td className="p-2.5 border border-slate-700 text-center font-bold text-emerald-300">AS(B)</td>
                            <td className="p-2.5 border border-slate-700 text-center font-bold text-emerald-300">AS(C)</td>
                            <td className="p-2.5 border border-slate-700 text-center font-bold text-emerald-300">AS(A)</td>
                            <td className="p-2.5 border border-slate-700 text-center text-slate-600">-</td>
                            <td className="p-2.5 border border-slate-700 text-center text-slate-600">-</td>
                            <td className="p-2.5 border border-slate-700 text-center text-slate-600">-</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* --- 2. SCANNED DOCUMENT VIEW MODE --- */}
          {activeTab === 'scanned' && (
            <div className="p-6 space-y-5 bg-slate-950/70">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    Official Scanned Document View
                  </h3>
                  <p className="text-xs text-slate-400">
                    High-resolution scan of the timetable currently active for {timetable.division || 'Classroom 303'}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={timetable.documentImage || '/timetable_july20.png'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Full Image</span>
                  </a>

                  {isEditable && (
                    <button
                      onClick={() => directFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload & Replace Scan</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Scanned Image Display */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-center">
                <img
                  src={timetable.documentImage || '/timetable_july20.png'}
                  alt="Official Indira Timetable Scanned Document"
                  className="max-h-[750px] w-auto rounded-xl shadow-2xl border border-slate-800 object-contain"
                />
              </div>
            </div>
          )}

          {/* --- FOOTER DIRECTORY & SIGNATURE --- */}
          <div className="p-6 pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              {/* Faculty Mapping Table */}
              <div className="lg:col-span-2 bg-slate-950/40 rounded-2xl p-4 border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  Subject & Faculty Directory
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                  {timetable.facultyMapping?.map((map) => (
                    <div key={map.code} className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/40">
                      <span className="font-bold text-indigo-300">{map.code}:</span>
                      <p className="text-slate-300 font-medium truncate">{map.subject}</p>
                      <p className="text-[11px] text-slate-400 truncate">{map.faculty}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Batches & Official Dean Endorsement */}
              <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    Batch & Division Details
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {timetable.batches?.map((b) => (
                      <div
                        key={b.name}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-slate-800/40"
                      >
                        <span className="font-semibold text-white">{b.name}</span>
                        <span className="font-mono text-purple-300">{b.rollRange}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Official Signature Endorsement */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-serif italic text-indigo-300 text-sm">Janardan Pawar</p>
                    <p className="text-[10px] text-slate-400 font-medium">Dean SOIT</p>
                    <p className="text-[9px] text-slate-400">Dr. Janardan Pawar</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-purple-500/40 flex items-center justify-center p-1 text-[8px] font-bold text-purple-400 text-center leading-tight uppercase bg-purple-500/10">
                    INDIRA
                    <br />
                    SOIT
                    <br />
                    SEAL
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- TIMETABLE IMPORTER & DYNAMIC PARSER MODAL --- */}
      {showImporterModal && parsedPreview && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-600/20 border border-emerald-400/30 text-emerald-400">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Excel Timetable Importer & Dynamic Parser
                  </h3>
                  <p className="text-xs text-slate-400">
                    File: <strong className="text-emerald-300">{uploadedFileName}</strong> • Dynamic cell-by-cell spreadsheet extraction
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImporterModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Spreadsheet Card & Metadata Config */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              {/* Document Spreadsheet Card */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <FileSpreadsheet className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-200 break-all">{uploadedFileName}</span>
                <span className="inline-block px-2 py-0.5 mt-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  Excel Spreadsheet (.xlsx / .csv)
                </span>
              </div>

              {/* Editable Metadata Fields */}
              <div className="md:col-span-2 space-y-2.5 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Program & Semester
                  </label>
                  <input
                    type="text"
                    value={parsedPreview.program || ''}
                    onChange={(e) => setParsedPreview({ ...parsedPreview, program: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Division & Classroom
                    </label>
                    <input
                      type="text"
                      value={parsedPreview.division || ''}
                      onChange={(e) => setParsedPreview({ ...parsedPreview, division: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Effective Date (w.e.f.)
                    </label>
                    <input
                      type="text"
                      value={parsedPreview.effectiveDate || ''}
                      onChange={(e) => setParsedPreview({ ...parsedPreview, effectiveDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Extracted Schedule Matrix (Interactive Review) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5" />
                  Extracted Weekly Theory Slots ({parsedPreview.theorySlots?.length || 0} Periods)
                </span>
                <button
                  type="button"
                  onClick={handleAddSlotToParsedPreview}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-400/40 text-indigo-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Period Slot</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-72 overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-800 text-white z-10">
                    <tr>
                      <th className="p-2 border border-slate-700 w-32 font-mono text-center">Period Time</th>
                      {days.map((d) => (
                        <th key={d} className="p-2 border border-slate-700 text-center font-bold">
                          {d}
                        </th>
                      ))}
                      <th className="p-2 border border-slate-700 text-center w-10">Del</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {parsedPreview.theorySlots?.map((slot, sIdx) => (
                      <tr key={sIdx} className={slot.isBreak ? 'bg-amber-500/10' : 'hover:bg-slate-800/40'}>
                        <td className="p-1.5 border border-slate-700">
                          <input
                            type="text"
                            value={slot.time || ''}
                            onChange={(e) => handleParsedPreviewSlotChange(sIdx, 'time', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-[11px] font-mono text-indigo-300"
                          />
                          <label className="flex items-center justify-center gap-1 mt-1 text-[10px] text-amber-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!slot.isBreak}
                              onChange={(e) => handleParsedPreviewSlotChange(sIdx, 'isBreak', e.target.checked)}
                              className="rounded text-amber-500"
                            />
                            <span>Break</span>
                          </label>
                        </td>

                        {slot.isBreak ? (
                          <td colSpan={6} className="p-2 border border-slate-700 text-center font-bold text-amber-300">
                            ☕ Tea / Lunch Break
                          </td>
                        ) : (
                          days.map((day) => {
                            const cell = parsedPreview.theorySchedule?.[day]?.[sIdx] || {};
                            return (
                              <td key={day} className="p-1 border border-slate-700">
                                <input
                                  type="text"
                                  value={cell.subject || ''}
                                  onChange={(e) => handleParsedPreviewCellChange(day, sIdx, 'subject', e.target.value)}
                                  placeholder="Subj"
                                  className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-white font-bold text-[11px] text-center"
                                />
                                <input
                                  type="text"
                                  value={cell.faculty || ''}
                                  onChange={(e) => handleParsedPreviewCellChange(day, sIdx, 'faculty', e.target.value)}
                                  placeholder="Faculty"
                                  className="w-full mt-0.5 bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-slate-400 text-[9px] text-center"
                                />
                              </td>
                            );
                          })
                        )}

                        <td className="p-1 border border-slate-700 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveSlotFromParsedPreview(sIdx)}
                            className="p-1 rounded bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                ✨ Ready to publish. Changes immediately sync across Student and Teacher dashboards.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImporterModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => executePublish(parsedPreview, uploadedFileName)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply & Dynamically Publish to All Portals</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRM REMOVAL MODAL --- */}
      {showRemoveConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Remove Master Timetable?</h4>
                <p className="text-xs text-slate-400">Classroom 303 • SY.B.Sc. AIML</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove the current timetable? This will:
            </p>
            <ul className="text-xs text-slate-400 list-disc list-inside space-y-1 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <li>Clear the timetable from all active student portals.</li>
              <li>Pause dynamic lecture tracking until a new schedule is published.</li>
              <li>Notify students that a new semester schedule is being prepared.</li>
            </ul>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowRemoveConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Remove Timetable</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
