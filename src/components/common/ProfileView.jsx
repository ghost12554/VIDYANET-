import React, { useState, useRef } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { jsPDF } from 'jspdf';
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
  Edit3,
  Save,
  X,
  ExternalLink,
  Eye,
  Award,
  BookOpen,
  HeartPulse,
  MapPin,
  Globe,
  Link2,
  Sparkles,
  RefreshCw,
  Camera,
  Check,
  AlertCircle,
  FileCheck,
  Share2,
  ChevronRight,
  Search,
  Filter,
  BadgeCheck,
} from 'lucide-react';

function GitHubIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedInIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&h=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&h=300&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&h=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
  'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=300&h=300&q=80',
];

const DEFAULT_SKILLS = [
  'Python',
  'PyTorch',
  'Data Structures & Algorithms',
  'Machine Learning',
  'React 19',
  'Tailwind CSS',
  'SQL & RDBMS',
  'WebRTC',
];

export default function ProfileView() {
  const {
    currentUser,
    userRole,
    emergencyDocs,
    uploadEmergencyDoc,
    deleteEmergencyDoc,
    updateUserProfile,
    updateStudentProfile,
  } = useCollege();

  const updateProfileFn = updateUserProfile || updateStudentProfile;

  // Active view tab: 'overview' | 'documents' | 'academics' | 'security'
  const [activeTab, setActiveTab] = useState('overview');

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  // ID Card flip state (front vs back)
  const [isIdCardFlipped, setIsIdCardFlipped] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Avatar Modal
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const avatarFileInputRef = useRef(null);

  // Document Vault states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docCategoryFilter, setDocCategoryFilter] = useState('All');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const docFileInputRef = useRef(null);

  // Document upload form
  const [docForm, setDocForm] = useState({
    title: '',
    category: 'Identity Proof',
    issuer: 'Indira University Registrar',
    docNumber: '',
    file: null,
    fileName: '',
    fileSize: '',
    fileData: null,
    fileType: 'application/pdf',
  });

  // Profile Edit Form State (initialized from currentUser with rich fallbacks)
  const [formData, setFormData] = useState({
    name: currentUser?.name || (userRole === 'student' ? 'Aarav Sharma' : 'Prof. Divya C'),
    headline:
      currentUser?.headline ||
      (userRole === 'student'
        ? 'B.Tech AI & Data Science Scholar | Deep Learning Enthusiast'
        : 'Assistant Professor & AI/ML Lab In-Charge'),
    bio:
      currentUser?.bio ||
      (userRole === 'student'
        ? 'Third-year undergraduate scholar focused on deep learning architectures, scalable full-stack applications, and real-time distributed media systems. Actively looking for AI research internships.'
        : 'Faculty lead for Advanced Algorithms and Deep Learning. Guiding B.Tech Capstone projects and publishing in IEEE/Scopus indexed conferences.'),
    email: currentUser?.email || 'aarav.student@indira.edu',
    altEmail: currentUser?.altEmail || 'aarav.personal@gmail.com',
    phone: currentUser?.phone || '+91 98765 43210',
    bloodGroup: currentUser?.bloodGroup || 'O+',
    dob: currentUser?.dob || '2005-04-18',
    gender: currentUser?.gender || 'Male',
    department: currentUser?.department || 'Information Technology (AIML)',
    semester: currentUser?.semester || 'Semester III',
    rollNo: currentUser?.rollNo || '15',
    facultyNo: currentUser?.facultyNo || 'FAC-303',
    batch: currentUser?.batch || 'Batch A',
    classroom: currentUser?.classroom || '303',
    cabin: currentUser?.cabin || 'Staff Room 3, 2nd Floor',
    mentor: currentUser?.mentor || 'Prof. Sarita Byagar (HOD - AIML)',
    address: currentUser?.address || 'Campus Hostel Block B, Indira University, Pune',
    emergencyContactName: currentUser?.emergencyContactName || 'Rajesh Sharma (Father)',
    emergencyContactRelation: currentUser?.emergencyContactRelation || 'Parent / Guardian',
    emergencyContactPhone: currentUser?.emergencyContactPhone || '+91 98220 99881',
    emergencyNotes: currentUser?.emergencyNotes || 'No known drug allergies. Penicillin safe.',
    linkedin: currentUser?.linkedin || 'https://linkedin.com/in/teacher-copilot-scholar',
    github: currentUser?.github || 'https://github.com/teacher-copilot-scholar',
    portfolio: currentUser?.portfolio || 'https://teachercopilot.indira.edu/scholars/aarav',
    skills: currentUser?.skills || DEFAULT_SKILLS,
    avatar:
      currentUser?.avatar ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&h=300&q=80',
  });

  const [skillInput, setSkillInput] = useState('');

  // Synchronize form if currentUser changes externally
  React.useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
        department: currentUser.department || prev.department,
        rollNo: currentUser.rollNo || prev.rollNo,
        batch: currentUser.batch || prev.batch,
        avatar: currentUser.avatar || prev.avatar,
        bloodGroup: currentUser.bloodGroup || prev.bloodGroup,
      }));
    }
  }, [currentUser]);

  // Handle Profile Form field updates
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add a new skill tag
  const handleAddSkill = (e) => {
    e?.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
      setSkillInput('');
    }
  };

  // Remove a skill tag
  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Save changes to profile
  const handleSaveProfile = (e) => {
    e?.preventDefault();
    if (updateProfileFn) {
      updateProfileFn({
        ...formData,
        id: currentUser?.id,
      });
    }
    setIsEditing(false);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3500);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        headline: currentUser.headline || prev.headline,
        bio: currentUser.bio || prev.bio,
        phone: currentUser.phone || prev.phone,
        email: currentUser.email || prev.email,
      }));
    }
    setIsEditing(false);
  };

  // Avatar Upload Handler
  const handleCustomAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result;
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, avatar: dataUrl }));
        if (updateProfileFn) {
          updateProfileFn({ avatar: dataUrl });
        }
        setShowAvatarModal(false);
        setSaveSuccessToast(true);
        setTimeout(() => setSaveSuccessToast(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Document File Picker Handler
  const handleDocFileSelect = (file) => {
    if (!file) return;

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result;
      setDocForm((prev) => ({
        ...prev,
        title: prev.title.trim() ? prev.title : file.name.replace(/\.[^/.]+$/, ''),
        file,
        fileName: file.name,
        fileSize: sizeFormatted,
        fileData: dataUrl,
        fileType: file.type || 'application/pdf',
      }));
    };
    reader.readAsDataURL(file);
  };

  // Save new document to vault
  const handleUploadDocumentSubmit = (e) => {
    e.preventDefault();
    if (!docForm.title.trim()) {
      alert('Please provide a document title.');
      return;
    }

    const newDoc = {
      title: docForm.title.trim(),
      category: docForm.category,
      issuer: docForm.issuer.trim() || 'Indira University Registrar',
      docNumber: docForm.docNumber.trim() || `DOC-${Date.now().toString().slice(-6)}`,
      fileName: docForm.fileName || `${docForm.title.replace(/\s+/g, '_')}.pdf`,
      fileSize: docForm.fileSize || '1.2 MB',
      fileData: docForm.fileData,
      fileType: docForm.fileType,
      uploadedAt: new Date().toISOString().split('T')[0],
      verified: true,
    };

    uploadEmergencyDoc(newDoc);

    // Reset form
    setDocForm({
      title: '',
      category: 'Identity Proof',
      issuer: 'Indira University Registrar',
      docNumber: '',
      file: null,
      fileName: '',
      fileSize: '',
      fileData: null,
      fileType: 'application/pdf',
    });
    setShowUploadModal(false);
  };

  // Download Document: real file download or synthesized PDF if mock
  const handleDownloadDoc = (doc) => {
    if (doc.fileData) {
      // Direct download of stored base64 payload
      const link = document.createElement('a');
      link.href = doc.fileData;
      link.download = doc.fileName || `${doc.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Synthesize an official Indira University Verified Document Certificate
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.setFillColor(15, 23, 42); // slate-900
      pdf.rect(0, 0, 210, 297, 'F');

      // Header Banner
      pdf.setFillColor(79, 70, 229); // indigo-600
      pdf.rect(0, 0, 210, 36, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INDIRA UNIVERSITY - DIGITAL VAULT', 15, 16);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Official Verified Institutional Document Record', 15, 24);

      // Card Box
      pdf.setFillColor(30, 41, 59);
      pdf.roundedRect(15, 48, 180, 200, 4, 4, 'F');
      pdf.setDrawColor(99, 102, 241);
      pdf.roundedRect(15, 48, 180, 200, 4, 4, 'S');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(15);
      pdf.setFont('helvetica', 'bold');
      pdf.text(doc.title || 'Institutional Record', 25, 65);

      pdf.setFontSize(10);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`Category: ${doc.category || 'Institutional Document'}`, 25, 75);
      pdf.text(`Document Reference: ${doc.docNumber || 'DOC-REG-2026-99'}`, 25, 83);
      pdf.text(`Issuing Authority: ${doc.issuer || 'Office of the Registrar, IU'}`, 25, 91);
      pdf.text(`Verification Timestamp: ${doc.uploadedAt || '2026-10-26'}`, 25, 99);
      pdf.text(`Holder: ${formData.name} (${userRole === 'student' ? 'Roll ' + formData.rollNo : formData.facultyNo})`, 25, 107);
      pdf.text(`Department: ${formData.department}`, 25, 115);

      // Decorative divider
      pdf.setDrawColor(51, 65, 85);
      pdf.line(25, 125, 175, 125);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(52, 211, 153);
      pdf.text('DIGITAL INTEGRITY SEAL: AES-256 ENCRYPTED', 25, 138);

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(203, 213, 225);
      pdf.text(
        'This document certificate has been digitally countersigned by the Indira University Central\nRegistrar Registry for presentation in academic, immigration, and clinical clearance.',
        25,
        148
      );

      // Signature block
      pdf.setTextColor(148, 163, 184);
      pdf.setFontSize(8);
      pdf.text('Cryptographic Hash: 8f4b23c91d77a28e5e31fa029bb1143c7210', 25, 210);
      pdf.text('Controller of Examinations & Academic Records', 115, 230);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Prof. Janardan Pawar (Dean, SOIT)', 115, 235);

      pdf.save(doc.fileName || `${doc.title.replace(/\s+/g, '_')}_Verified.pdf`);
    }
  };

  // Generate Institutional Biodata PDF
  const handleDownloadBiodataPdf = () => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Background
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, 210, 297, 'F');

    // Header Band
    pdf.setFillColor(79, 70, 229); // indigo-600
    pdf.rect(0, 0, 210, 32, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INDIRA UNIVERSITY - OFFICIAL INSTITUTIONAL BIODATA', 15, 14);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'normal');
    pdf.text('School of Information Technology & Engineering • Autonomous AI & Computing Excellence', 15, 22);

    // Profile Summary Card
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(15, 38, 180, 52, 3, 3, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(formData.name, 22, 50);

    pdf.setFontSize(9);
    pdf.setTextColor(165, 180, 252);
    pdf.text(formData.headline, 22, 57);

    pdf.setTextColor(203, 213, 225);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Email: ${formData.email}  |  Phone: ${formData.phone}`, 22, 65);
    pdf.text(`Department: ${formData.department}`, 22, 71);
    pdf.text(
      userRole === 'student'
        ? `Roll No: ${formData.rollNo}  |  Batch: ${formData.batch}  |  ${formData.semester}`
        : `Faculty ID: ${formData.facultyNo}  |  Cabin: ${formData.cabin}`,
      22,
      77
    );
    pdf.text(`Emergency Contact: ${formData.emergencyContactName} (${formData.emergencyContactPhone})`, 22, 83);

    // Academic Metrics
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(15, 96, 180, 32, 3, 3, 'F');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('ACADEMIC & PERFORMANCE METRICS', 22, 106);

    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(203, 213, 225);
    if (userRole === 'student') {
      pdf.text('Cumulative Grade Point Average (CGPA): 9.14 / 10.0 (First Class with Distinction)', 22, 114);
      pdf.text('Theory & Practical Attendance: 94.2% (Eligible for Final Examinations)', 22, 120);
      pdf.text(`Academic Mentor: ${formData.mentor}`, 22, 125);
    } else {
      pdf.text('Designation: Class Teacher & Assistant Professor (AI & Machine Learning)', 22, 114);
      pdf.text('Research Track: 12 Scopus / IEEE Indexed Publications • 8+ Years Experience', 22, 120);
      pdf.text('Academic Cabin: Staff Room 3, 2nd Floor, SOIT Complex', 22, 125);
    }

    // Skills & Proficiencies
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(15, 134, 180, 28, 3, 3, 'F');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('CORE COMPETENCIES & TECHNICAL PROFICIENCIES', 22, 144);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(147, 197, 253);
    const skillsJoined = formData.skills.join('  •  ');
    const splitSkills = pdf.splitTextToSize(skillsJoined, 165);
    pdf.text(splitSkills, 22, 152);

    // Verified Document Records
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(15, 168, 180, 70, 3, 3, 'F');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('VERIFIED REPOSITORY DOCUMENTS ON RECORD', 22, 178);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(203, 213, 225);
    let startY = 186;
    myDocs.slice(0, 5).forEach((d, idx) => {
      pdf.text(`${idx + 1}. ${d.title} [${d.category}] — ${d.uploadedAt} (${d.fileSize})`, 22, startY);
      startY += 7;
    });
    if (myDocs.length === 0) {
      pdf.text('No documents uploaded in vault yet.', 22, startY);
    }

    // Official Seal and Sign-off
    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(8);
    pdf.text('Generated via Teacher Co-Pilot (AI Assistant for Teachers) • UID: IU-VERIF-2026-894', 15, 260);
    pdf.text('Authorized Academic Seal: Controller of Examinations, Indira University', 15, 265);
    pdf.text('Dean: Prof. Janardan Pawar', 140, 265);

    pdf.save(`${formData.name.replace(/\s+/g, '_')}_Institutional_Biodata.pdf`);
  };

  // Filtered documents
  const myDocs = (emergencyDocs || []).filter(
    (d) => d.userId === currentUser?.id || d.userId === 'stud-1' || d.userId === 'teach-1'
  );

  const filteredDocs = myDocs.filter((d) => {
    const matchesCat = docCategoryFilter === 'All' || d.category === docCategoryFilter;
    const matchesSearch =
      d.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      (d.issuer && d.issuer.toLowerCase().includes(docSearchQuery.toLowerCase())) ||
      (d.docNumber && d.docNumber.toLowerCase().includes(docSearchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {saveSuccessToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl border border-emerald-400 animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-200" />
          <div>
            <p className="text-xs font-bold">Profile Updated Successfully</p>
            <p className="text-[10px] text-emerald-100">All institutional records have been synced.</p>
          </div>
        </div>
      )}

      {/* Top Hero Banner & Actions */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Decorative University Pattern Header */}
        <div className="h-44 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-4 left-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-extrabold text-white text-base shadow-lg">
              IU
            </div>
            <div>
              <p className="text-xs font-extrabold tracking-widest text-indigo-200 uppercase">
                INDIRA UNIVERSITY • PUNE
              </p>
              <p className="text-[11px] text-indigo-300/80 font-medium">
                School of Information Technology & Engineering • NAAC A++ Autonomous
              </p>
            </div>
          </div>

          <div className="absolute bottom-4 right-6 flex items-center gap-2.5">
            <button
              onClick={handleDownloadBiodataPdf}
              className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5 shadow-md"
              title="Export official verified university biodata sheet"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Official Biodata PDF</span>
            </button>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Avatar Bar & Fast Info */}
        <div className="px-6 pb-6 pt-3 flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar with Camera Overlay */}
            <div className="relative group">
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-28 h-28 rounded-2xl object-cover ring-4 ring-slate-900 shadow-2xl border-2 border-indigo-500/50"
              />
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer"
                title="Change Avatar"
              >
                <Camera className="w-6 h-6 text-indigo-300 mb-0.5" />
                <span className="text-[10px] font-semibold">Change Photo</span>
              </button>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white">
                ✓
              </span>
            </div>

            {/* Name, Headline & Department */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  {formData.name}
                  <BadgeCheck className="w-5 h-5 text-indigo-400" />
                </h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
                  {userRole === 'student' ? 'Student Scholar' : 'Faculty Member'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Verified Active
                </span>
              </div>

              <p className="text-xs text-indigo-200 font-medium max-w-2xl">{formData.headline}</p>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-slate-300">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  {formData.department}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-slate-300">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                  {userRole === 'student'
                    ? `Roll: ${formData.rollNo} (${formData.batch})`
                    : `Faculty ID: ${formData.facultyNo}`}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  Classroom {formData.classroom}
                </span>
              </div>
            </div>
          </div>

          {/* Social Links Chips */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            {formData.github && (
              <a
                href={formData.github}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                title="GitHub Profile"
              >
                <GitHubIcon className="w-4 h-4" />
              </a>
            )}
            {formData.linkedin && (
              <a
                href={formData.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 border border-slate-700 transition"
                title="LinkedIn Profile"
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => setIsIdCardFlipped(!isIdCardFlipped)}
              className="px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Flip ID Card</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Identity & Overview', icon: User },
            { id: 'documents', label: `Document Vault (${myDocs.length})`, icon: FileText },
            { id: 'academics', label: 'Academic Standing', icon: Award },
            { id: 'security', label: 'Security & Access', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  active
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & SMART ID CARD */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Smart Institutional Digital ID Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-400" />
                Institutional Smart ID
              </h3>
              <button
                onClick={() => setIsIdCardFlipped(!isIdCardFlipped)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                {isIdCardFlipped ? 'Show Front' : 'Show Back'}
              </button>
            </div>

            {/* Flip Card Container */}
            <div className="relative min-h-[360px] rounded-3xl p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/40 shadow-2xl overflow-hidden flex flex-col justify-between text-white transition-all">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              {!isIdCardFlipped ? (
                /* CARD FRONT */
                <>
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-indigo-500/30">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md">
                          IU
                        </div>
                        <div>
                          <p className="text-[11px] font-black tracking-widest text-indigo-300 uppercase">
                            INDIRA UNIVERSITY
                          </p>
                          <p className="text-[9px] text-slate-400">School of Information Technology</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                        {userRole === 'student' ? 'Student ID' : 'Faculty Pass'}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="py-4 flex items-center gap-4">
                      <img
                        src={formData.avatar}
                        alt={formData.name}
                        className="w-20 h-24 rounded-xl object-cover ring-2 ring-indigo-400/60 shadow-lg shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-base font-extrabold text-white truncate">{formData.name}</h4>
                        <p className="text-xs text-indigo-300 font-mono mt-0.5">
                          {userRole === 'student'
                            ? `Roll No: ${formData.rollNo} • Batch ${formData.batch}`
                            : `Faculty ID: ${formData.facultyNo}`}
                        </p>
                        <p className="text-[11px] text-slate-300 mt-1 font-medium">{formData.department}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Classroom {formData.classroom} • AY 2026-2027
                        </p>
                      </div>
                    </div>

                    {/* Chip & NFC Indicator */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-900/40 border border-indigo-500/30 text-[10px] text-indigo-200">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-4 rounded bg-amber-400/80 border border-amber-300/80 shadow-xs" />
                        <span className="font-mono text-[9px]">RFID / NFC ACTIVE</span>
                      </div>
                      <button
                        onClick={() => setShowQrModal(true)}
                        className="text-[9px] font-bold text-indigo-300 hover:text-white flex items-center gap-1 underline cursor-pointer"
                      >
                        <QrCode className="w-3 h-3" />
                        Verify QR
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-3 border-t border-indigo-500/30 flex items-center justify-between">
                    <div className="font-mono text-[9px] text-slate-400 tracking-wider">
                      ||| | ||||| || |||| ||| ||||
                      <br />
                      ID: {currentUser?.id?.toUpperCase() || 'IU-STU-15'}
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-indigo-300 font-serif italic">Janardan Pawar</p>
                      <p className="text-[8px] text-slate-400">Dean, SOIT</p>
                    </div>
                  </div>
                </>
              ) : (
                /* CARD BACK */
                <>
                  <div>
                    <div className="pb-3 border-b border-indigo-500/30 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-300 tracking-wider uppercase">
                        Emergency & Medical Record
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">Blood: {formData.bloodGroup}</span>
                    </div>

                    <div className="py-4 space-y-2.5 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400">Primary Emergency Contact:</p>
                        <p className="font-semibold text-white">
                          {formData.emergencyContactName} ({formData.emergencyContactRelation})
                        </p>
                        <p className="text-indigo-300 font-mono text-[11px]">{formData.emergencyContactPhone}</p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400">Authorized Campus Access:</p>
                        <p className="text-[11px] text-slate-200">
                          Classroom 303 • AI Computing Lab • Central Library • Robotics Wing
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400">Medical Notes:</p>
                        <p className="text-[10px] text-slate-300">{formData.emergencyNotes}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-indigo-500/30 text-center">
                    <p className="text-[9px] text-slate-400">
                      Property of Indira University. If found, please return to Dean Office, SOIT.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                Performance Snapshot
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <span className="text-[10px] text-slate-400">
                    {userRole === 'student' ? 'Current CGPA' : 'Experience'}
                  </span>
                  <p className="text-base font-extrabold text-emerald-400 mt-0.5">
                    {userRole === 'student' ? '9.14 / 10.0' : '8+ Years'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <span className="text-[10px] text-slate-400">
                    {userRole === 'student' ? 'Attendance' : 'Rating'}
                  </span>
                  <p className="text-base font-extrabold text-indigo-400 mt-0.5">
                    {userRole === 'student' ? '94.2%' : '4.92 / 5.0'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details & Interactive Editor Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">
                    {isEditing ? 'Update Institutional Profile' : 'Institutional Profile Overview'}
                  </h3>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Information</span>
                  </button>
                ) : (
                  <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5" /> Editing Mode Active
                  </span>
                )}
              </div>

              {isEditing ? (
                /* LIVE PROFILE EDIT FORM */
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Professional Headline
                      </label>
                      <input
                        type="text"
                        name="headline"
                        value={formData.headline}
                        onChange={handleFormChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Institutional Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Contact</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleFormChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        {userRole === 'student' ? 'Roll Number & Batch' : 'Faculty ID & Cabin'}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          name={userRole === 'student' ? 'rollNo' : 'facultyNo'}
                          value={userRole === 'student' ? formData.rollNo : formData.facultyNo}
                          onChange={handleFormChange}
                          placeholder={userRole === 'student' ? 'Roll No' : 'FAC-No'}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          name={userRole === 'student' ? 'batch' : 'classroom'}
                          value={userRole === 'student' ? formData.batch : formData.classroom}
                          onChange={handleFormChange}
                          placeholder={userRole === 'student' ? 'Batch A' : 'Room 303'}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Blood Group</label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleFormChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="O+">O Positive (O+)</option>
                        <option value="O-">O Negative (O-)</option>
                        <option value="A+">A Positive (A+)</option>
                        <option value="A-">A Negative (A-)</option>
                        <option value="B+">B Positive (B+)</option>
                        <option value="B-">B Negative (B-)</option>
                        <option value="AB+">AB Positive (AB+)</option>
                        <option value="AB-">AB Negative (AB-)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Academic Mentor</label>
                      <input
                        type="text"
                        name="mentor"
                        value={formData.mentor}
                        onChange={handleFormChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Primary Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleFormChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Emergency Contact Phone
                      </label>
                      <input
                        type="text"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleFormChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Professional Bio</label>
                    <textarea
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleFormChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Skills / Tech Stack Editor */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Skills & Technical Proficiencies
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30 flex items-center gap-1.5"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-rose-400 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add skill (e.g. PyTorch, Docker, React) and press Add"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-slate-700 cursor-pointer"
                      >
                        Add Skill
                      </button>
                    </div>
                  </div>

                  {/* Social Profile URLs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">LinkedIn Profile</label>
                      <input
                        type="text"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleFormChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">GitHub Profile</label>
                      <input
                        type="text"
                        name="github"
                        value={formData.github}
                        onChange={handleFormChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Institutional Profile</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* VIEW MODE */
                <div className="space-y-5">
                  {/* Bio statement */}
                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Academic Bio & Focus
                    </p>
                    <p className="text-xs text-slate-200 leading-relaxed">{formData.bio}</p>
                  </div>

                  {/* Detailed Information Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-400" /> Institutional Email
                      </span>
                      <p className="font-semibold text-white mt-1 break-all">{formData.email}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-indigo-400" /> Direct Contact
                      </span>
                      <p className="font-semibold text-white mt-1 font-mono">{formData.phone}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-indigo-400" /> Academic Division
                      </span>
                      <p className="font-semibold text-white mt-1">
                        {formData.department} • Classroom {formData.classroom}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                        <HeartPulse className="w-3.5 h-3.5 text-rose-400" /> Blood Group & Medical
                      </span>
                      <p className="font-semibold text-white mt-1">
                        {formData.bloodGroup} (Verified on University Health Record)
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Academic Mentor
                      </span>
                      <p className="font-semibold text-white mt-1">{formData.mentor}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" /> Emergency Contact
                      </span>
                      <p className="font-semibold text-white mt-1">
                        {formData.emergencyContactName} ({formData.emergencyContactPhone})
                      </p>
                    </div>
                  </div>

                  {/* Skills Pills */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Skills & Technical Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 rounded-xl bg-slate-800 text-indigo-300 text-xs font-semibold border border-slate-700/80 shadow-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENT VAULT & ADD DOCUMENT OPTION */}
      {activeTab === 'documents' && (
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
          {/* Header & Upload Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                Institutional Document Locker & Vault
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload and secure verified academic transcripts, government IDs, and medical certificates with
                AES-256 cloud encryption.
              </p>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Document</span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            {/* Filter Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {['All', 'Identity Proof', 'Academic', 'Certifications', 'Emergency & Health'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setDocCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    docCategoryFilter === cat
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search documents or issuer..."
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Document Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/50 hover:bg-slate-800/70 transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    {/* Category & Status Bar */}
                    <div className="flex items-center justify-between text-xs mb-2.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-[10px] border border-indigo-500/30">
                        {doc.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{doc.fileSize}</span>
                    </div>

                    {/* Title & Issuer */}
                    <div className="flex items-start gap-3 mt-1">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white leading-snug truncate" title={doc.title}>
                          {doc.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 truncate">
                          {doc.issuer || 'Indira University Registrar'}
                        </p>
                        {doc.docNumber && (
                          <p className="text-[9px] font-mono text-indigo-300/80 mt-0.5">Ref: {doc.docNumber}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-700/40">
                      <span>Uploaded: {doc.uploadedAt}</span>
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDownloadDoc(doc)}
                        className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                        title="Download actual file"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>

                      {doc.fileData && (
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white font-semibold cursor-pointer"
                          title="Preview in-app"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => deleteEmergencyDoc(doc.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-700/50 transition cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-300">No documents found matching criteria</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Upload an identity card, semester transcript, or certification to store in your vault.
                </p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition inline-flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload First Document</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ACADEMIC STANDING */}
      {activeTab === 'academics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              Semester Grade Ledger (AY 2026-2027)
            </h3>
            <p className="text-xs text-slate-400">
              Official university transcripts and semester-wise grade point distribution.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { sem: 'Semester I', sgpa: '9.08', credits: '22 / 22', status: 'Passed (Distinction)' },
                { sem: 'Semester II', sgpa: '9.24', credits: '24 / 24', status: 'Passed (Distinction)' },
                { sem: 'Semester III (Current)', sgpa: '9.10 (Projected)', credits: '24 / 24', status: 'In Progress' },
              ].map((row) => (
                <div
                  key={row.sem}
                  className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-white">{row.sem}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Credits: {row.credits}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-indigo-400 font-mono">{row.sgpa}</span>
                    <p className="text-[10px] text-emerald-400 font-semibold">{row.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Enrolled Courses & Laboratory Sections
            </h3>
            <p className="text-xs text-slate-400">Current Semester III accredited curriculum.</p>

            <div className="space-y-2.5 pt-2 text-xs">
              {[
                { code: 'IT-301', title: 'Data Structures & Algorithms', faculty: 'Prof. Divya C', status: '95% Attendance' },
                { code: 'IT-302', title: 'Relational Database Management (RDBMS)', faculty: 'Prof. Jyoti J', status: '92% Attendance' },
                { code: 'IT-303', title: 'Software Engineering & Agile Methodologies', faculty: 'Prof. Divya C', status: '96% Attendance' },
                { code: 'AI-304', title: 'Deep Learning & Neural Network Lab', faculty: 'Prof. Sarita Byagar', status: '98% Attendance' },
              ].map((course) => (
                <div
                  key={course.code}
                  className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-indigo-300 font-bold">{course.code}</span>
                      <h5 className="font-semibold text-white">{course.title}</h5>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Instructor: {course.faculty}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    {course.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & ACCESS */}
      {activeTab === 'security' && (
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            Institutional Security & Verification State
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Authentication Mode</span>
              <p className="text-sm font-bold text-white mt-1">Two-Factor Authenticated</p>
              <p className="text-[10px] text-emerald-400 mt-1">Hardware TOTP & Mobile OTP</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Session</span>
              <p className="text-sm font-bold text-white mt-1">Campus Secure Wi-Fi</p>
              <p className="text-[10px] text-slate-400 mt-1">IP: 192.168.30.15 (Lab 303)</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Digital Identity Seal</span>
              <p className="text-sm font-bold text-indigo-400 mt-1">SHA-256 Validated</p>
              <p className="text-[10px] text-slate-400 mt-1">Registry Ref: IU-2026-9810</p>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL ("add a document adding option") */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-400" />
                Upload Document to Institutional Vault
              </h4>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDocumentSubmit} className="space-y-4">
              {/* Drag & Drop File Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleDocFileSelect(file);
                }}
                onClick={() => docFileInputRef.current?.click()}
                className={`p-6 rounded-2xl border-2 border-dashed text-center transition cursor-pointer flex flex-col items-center justify-center ${
                  isDraggingFile
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-700 hover:border-indigo-400/60 bg-slate-800/40'
                }`}
              >
                <input
                  ref={docFileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={(e) => handleDocFileSelect(e.target.files?.[0])}
                  className="hidden"
                />
                <Upload className="w-7 h-7 text-indigo-400 mb-2" />
                {docForm.fileName ? (
                  <div>
                    <p className="text-xs font-bold text-white">{docForm.fileName}</p>
                    <p className="text-[10px] text-indigo-300 mt-0.5">{docForm.fileSize}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      Click to browse or drag & drop document
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Supports PDF, PNG, JPG, DOCX (Max 25MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Document Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Government Aadhaar Card / Semester Marksheet"
                  value={docForm.title}
                  onChange={(e) => setDocForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Category & Issuer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={docForm.category}
                    onChange={(e) => setDocForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Identity Proof">Identity Proof (Aadhaar / Passport)</option>
                    <option value="Academic">Academic Transcript / Marksheet</option>
                    <option value="Certifications">Certifications & Honors</option>
                    <option value="Emergency & Health">Emergency & Health / Blood Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Issuing Authority</label>
                  <input
                    type="text"
                    placeholder="e.g. UIDAI / Indira University"
                    value={docForm.issuer}
                    onChange={(e) => setDocForm((prev) => ({ ...prev, issuer: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Reference ID */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Document Reference / Certificate Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. XXXX-XXXX-9912 or IU-REG-2026"
                  value={docForm.docNumber}
                  onChange={(e) => setDocForm((prev) => ({ ...prev, docNumber: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Encrypt & Save to Vault</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  {previewDoc.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{previewDoc.category} • {previewDoc.fileSize}</p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document display */}
            <div className="max-h-[60vh] overflow-y-auto rounded-2xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-center min-h-[240px]">
              {previewDoc.fileData && previewDoc.fileType?.startsWith('image/') ? (
                <img
                  src={previewDoc.fileData}
                  alt={previewDoc.title}
                  className="max-h-[50vh] object-contain rounded-lg"
                />
              ) : (
                <div className="text-center space-y-3">
                  <FileText className="w-12 h-12 text-indigo-400 mx-auto" />
                  <div>
                    <p className="text-xs font-semibold text-white">{previewDoc.fileName || previewDoc.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Verified Institutional PDF Document</p>
                  </div>
                  <button
                    onClick={() => handleDownloadDoc(previewDoc)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download to View in PDF Reader</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Digitally Signed by {previewDoc.issuer || 'Indira University'}
              </span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR VERIFICATION MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto">
              <QrCode className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-bold text-white">Digital Identity Verification</h4>
              <p className="text-xs text-slate-400 mt-1">
                Scan this cryptographically signed code to verify academic credential status.
              </p>
            </div>

            {/* Simulated QR Pattern */}
            <div className="p-4 rounded-2xl bg-white mx-auto inline-block shadow-inner">
              <div className="w-36 h-36 bg-slate-900 rounded-lg p-2 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-7 h-7 bg-white rounded-xs p-1">
                    <div className="w-full h-full bg-slate-900" />
                  </div>
                  <div className="w-7 h-7 bg-white rounded-xs p-1">
                    <div className="w-full h-full bg-slate-900" />
                  </div>
                </div>
                <div className="text-[7px] text-white font-mono tracking-tighter">
                  IU-HASH-9812-OK
                </div>
                <div className="flex justify-between">
                  <div className="w-7 h-7 bg-white rounded-xs p-1">
                    <div className="w-full h-full bg-slate-900" />
                  </div>
                  <div className="w-3 h-3 bg-white" />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-[10px] text-slate-300 font-mono">
              TOKEN: IU-AUTH-2026-STU15-SIGMA
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* AVATAR SELECTOR MODAL */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-400" />
                Change Profile Avatar
              </h4>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-300 font-medium mb-2">Upload Custom Photo</p>
              <input
                ref={avatarFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomAvatarUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarFileInputRef.current?.click()}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Select Image from Computer</span>
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-300 font-medium mb-2.5">Or Choose an Institutional Preset</p>
              <div className="grid grid-cols-3 gap-3">
                {PRESET_AVATARS.map((avUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, avatar: avUrl }));
                      if (updateProfileFn) updateProfileFn({ avatar: avUrl });
                      setShowAvatarModal(false);
                      setSaveSuccessToast(true);
                      setTimeout(() => setSaveSuccessToast(false), 3000);
                    }}
                    className={`rounded-2xl overflow-hidden ring-2 transition cursor-pointer hover:scale-105 ${
                      formData.avatar === avUrl ? 'ring-indigo-500 ring-offset-2 ring-offset-slate-900' : 'ring-transparent'
                    }`}
                  >
                    <img src={avUrl} alt={`Preset ${index}`} className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
