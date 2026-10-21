import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  X,
  GraduationCap,
  UserCheck,
  Lock,
  Mail,
  User,
  Hash,
  Building,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, registerStudent, registerTeacher, switchRole } = useCollege();

  const [authRole, setAuthRole] = useState('student'); // 'student' | 'teacher'
  const [isRegistering, setIsRegistering] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [facultyNo, setFacultyNo] = useState('');
  const [department, setDepartment] = useState('Information Technology (AIML)');

  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice(null);

    const res = login(email, password, authRole);
    if (!res.success) {
      if (res.isPending) {
        setErrorMessage(
          '⏳ Your account is in the Teacher Portal Request Queue awaiting faculty verification. Please ask Prof. Divya C to approve your registration in the Teacher Portal!'
        );
      } else {
        setErrorMessage(res.error || 'Login failed. Please check credentials.');
      }
    } else {
      onClose();
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice(null);

    if (authRole === 'student') {
      const res = registerStudent({ name, rollNo, department, email, password });
      if (!res.success) {
        setErrorMessage(res.error);
      } else {
        setSuccessNotice({
          title: 'Registration Request Submitted to Faculty!',
          message: `Hello ${name}! Your admission application has been dispatched to the Teacher Portal Request Panel. Once approved, you can log in with your email and password.`,
        });
        setIsRegistering(false);
      }
    } else {
      const res = registerTeacher({ name, facultyNo, department, email, password });
      if (!res.success) {
        setErrorMessage(res.error);
      } else {
        onClose();
      }
    }
  };

  const fillQuickDemo = (type) => {
    setErrorMessage('');
    setSuccessNotice(null);
    if (type === 'student-approved') {
      setAuthRole('student');
      setIsRegistering(false);
      setEmail('aarav.student@indira.edu');
      setPassword('password123');
    } else if (type === 'student-pending') {
      setAuthRole('student');
      setIsRegistering(false);
      setEmail('isha.patel@indira.edu');
      setPassword('password123');
    } else if (type === 'teacher') {
      setAuthRole('teacher');
      setIsRegistering(false);
      setEmail('divya.c@indira.edu');
      setPassword('password123');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Portal & Role Selector */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">INDIRA UNIVERSITY SOIT</h3>
            <p className="text-xs text-slate-400">Integrated College UMS Access</p>
          </div>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthRole('student');
              setErrorMessage('');
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition ${
              authRole === 'student'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthRole('teacher');
              setErrorMessage('');
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition ${
              authRole === 'teacher'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Teacher Portal</span>
          </button>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="mb-4 p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            One-Click Demo Credentials:
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => fillQuickDemo('student-approved')}
              className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-[10px] font-semibold border border-indigo-500/30"
            >
              Approved Student
            </button>
            <button
              onClick={() => fillQuickDemo('student-pending')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] font-semibold border border-amber-500/30"
            >
              Pending Student (Test Request)
            </button>
            <button
              onClick={() => fillQuickDemo('teacher')}
              className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-[10px] font-semibold border border-purple-500/30"
            >
              Prof. Divya C (Teacher)
            </button>
          </div>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-snug">{errorMessage}</p>
          </div>
        )}

        {successNotice && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successNotice.title}</span>
            </div>
            <p className="text-[11px] leading-snug">{successNotice.message}</p>
          </div>
        )}

        {/* Main Form */}
        {!isRegistering ? (
          /* LOGIN FORM (Email and Password only) */
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder={authRole === 'student' ? 'e.g. aarav.student@indira.edu' : 'e.g. divya.c@indira.edu'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition mt-2 ${
                authRole === 'student'
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                  : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
              }`}
            >
              Sign In to {authRole === 'student' ? 'Student' : 'Teacher'} Portal
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setErrorMessage('');
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                New here? Create an institutional account
              </button>
            </div>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
            {/* Student Registration Fields: #name #roll no #department #email #password */}
            {authRole === 'student' ? (
              <>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sneha Joshi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Roll Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 48"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="student@indira.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[11px] text-purple-300 leading-snug">
                  Notice: As a student, your registration creates a request card in the Teacher Portal. You can log in once faculty accepts!
                </div>
              </>
            ) : (
              /* Teacher Registration Fields: #name #faculty no #department #email #password */
              <>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Faculty Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prof. Anand K"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Faculty Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FAC-305"
                      value={facultyNo}
                      onChange={(e) => setFacultyNo(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Faculty Email</label>
                  <input
                    type="email"
                    required
                    placeholder="faculty@indira.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 leading-snug">
                  Notice: Faculty members can register directly without prior permission and log in immediately.
                </div>
              </>
            )}

            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition mt-2 ${
                authRole === 'student'
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                  : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
              }`}
            >
              {authRole === 'student' ? 'Submit Admission Registration' : 'Register Faculty Account'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setErrorMessage('');
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Already registered? Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
