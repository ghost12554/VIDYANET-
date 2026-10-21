import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  User,
  Shield,
  FileText,
  Upload,
  Download,
  Trash2,
  Lock,
  QrCode,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  Building,
  CheckCircle,
  Plus,
} from 'lucide-react';

export default function ProfileView() {
  const {
    currentUser,
    userRole,
    emergencyDocs,
    uploadEmergencyDoc,
    deleteEmergencyDoc,
  } = useCollege();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('Identity Proof');

  const myDocs = emergencyDocs.filter((d) => d.userId === currentUser?.id);

  const handleUpload = (e) => {
    e.preventDefault();
    if (!docTitle.trim()) return;
    uploadEmergencyDoc({
      title: docTitle.endsWith('.pdf') ? docTitle : `${docTitle}.pdf`,
      category: docCategory,
      fileSize: '1.2 MB',
    });
    setDocTitle('');
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Official College ID Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Digital ID Card (Faithful to Indira University) */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 rounded-3xl p-6 border border-indigo-500/40 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* ID Card Header */}
          <div className="flex items-center justify-between pb-4 border-b border-indigo-500/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                IU
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase">
                  INDIRA UNIVERSITY
                </p>
                <p className="text-[9px] text-slate-400">School of Information Technology</p>
              </div>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
              {userRole === 'student' ? 'Student ID' : 'Faculty Pass'}
            </span>
          </div>

          {/* Card Body */}
          <div className="py-5 flex items-center gap-4">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-20 h-24 rounded-xl object-cover ring-2 ring-indigo-400/50 shadow-md"
            />
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-white truncate">
                {currentUser?.name}
              </h3>
              <p className="text-xs text-indigo-300 font-mono mt-0.5">
                {userRole === 'student'
                  ? `Roll No: ${currentUser?.rollNo || '15'} • Batch ${currentUser?.batch || 'A'}`
                  : `Faculty ID: ${currentUser?.facultyNo || 'FAC-303'}`}
              </p>
              <p className="text-[11px] text-slate-300 mt-1">
                {currentUser?.department || 'Information Technology (AIML)'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Classroom: 303 • AY 2026-2027
              </p>
            </div>
          </div>

          {/* Card Footer Barcode & Seal */}
          <div className="pt-3 border-t border-indigo-500/30 flex items-center justify-between">
            <div className="font-mono text-[9px] text-slate-400 tracking-wider">
              ||| | ||||| || |||| ||| ||||
              <br />
              ID: {currentUser?.id?.toUpperCase()}
            </div>
            <div className="text-right">
              <p className="text-[9px] text-indigo-300 font-serif italic">Janardan Pawar</p>
              <p className="text-[8px] text-slate-400">Dean, SOIT</p>
            </div>
          </div>
        </div>

        {/* Profile Details & Metadata */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              Verified Institutional Profile
            </h3>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Identity Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> Official Email
              </span>
              <p className="font-semibold text-white mt-1">{currentUser?.email}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-indigo-400" /> Emergency Contact
              </span>
              <p className="font-semibold text-white mt-1">{currentUser?.phone || '+91 98765 43210'}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-indigo-400" /> Division & Classroom
              </span>
              <p className="font-semibold text-white mt-1">Div-A • Classroom No. 303</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-indigo-400" /> Blood Group & Medical
              </span>
              <p className="font-semibold text-white mt-1">{currentUser?.bloodGroup || 'O+'} (On File)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Document Drive (Secure Vault) */}
      <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              Emergency Document Vault / Drive
            </h3>
            <p className="text-xs text-slate-400">
              Upload your critical documents (ID proof, marksheets, medical cards) for fast access during campus emergencies.
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Document List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {myDocs.length > 0 ? (
            myDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:bg-slate-800/80 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-[10px] border border-indigo-500/30">
                      {doc.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{doc.fileSize}</span>
                  </div>

                  <div className="flex items-start gap-2.5 mt-2">
                    <FileText className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{doc.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Uploaded: {doc.uploadedAt}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                  <button
                    onClick={() => alert(`Downloading emergency copy of: ${doc.title}`)}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={() => deleteEmergencyDoc(doc.id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-700/50 transition"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-8 text-center text-xs text-slate-400">
              No emergency documents uploaded yet. Click "Upload Document" to store your ID card or transcript.
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              Upload Emergency Document
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              File will be encrypted and stored in your student vault.
            </p>

            <form onSubmit={handleUpload} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aadhar Card / College Admission Receipt"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Document Category
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Identity Proof">Identity Proof (Aadhar / PAN / Passport)</option>
                  <option value="Academic">Academic Transcript / Marksheet</option>
                  <option value="Emergency & Health">Emergency & Health Card / Blood Group</option>
                  <option value="Fee & Admission">Fee Receipt / Admission Letter</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
