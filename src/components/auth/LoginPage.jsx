import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  GraduationCap,
  UserCheck,
  Lock,
  Mail,
  User,
  Hash,
  Building,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  HelpCircle,
} from 'lucide-react';

export default function LoginPage() {
  const { login, registerStudent, registerTeacher } = useCollege();

  // Active role tab: 'student' | 'teacher'
  const [authRole, setAuthRole] = useState('student');
  // Active action: 'signin' | 'register'
  const [authMode, setAuthMode] = useState('signin');

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [facultyNo, setFacultyNo] = useState('');
  const [department, setDepartment] = useState('Information Technology (AIML)');

  // Alerts
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingNotice, setPendingNotice] = useState(null);

  // Departments available in college
  const departmentsList = [
    'Information Technology (AIML)',
    'Computer Science & Engineering',
    'Data Science & Analytics',
    'Software Engineering',
  ];

  // Handle Sign In (Email & Password only)
  const handleSignIn = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setPendingNotice(null);

    const res = login(email, password, authRole);
    if (!res.success) {
      if (res.isPending) {
        setErrorMessage(
          '⏳ Your account is in the Teacher Portal Request Queue awaiting faculty verification. Once approved by faculty, you can log in!'
        );
      } else {
        setErrorMessage(res.error || 'Invalid credentials. Please verify your email and password.');
      }
    }
  };

  // Handle Registration
  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setPendingNotice(null);

    if (authRole === 'student') {
      // Student: #name, #roll no, #department, #email, #password
      if (!name.trim() || !rollNo.trim() || !email.trim() || !password.trim()) {
        setErrorMessage('All registration fields (#Name, #Roll No, #Department, #Email, #Password) are mandatory.');
        return;
      }

      const res = registerStudent({ name, rollNo, department, email, password });
      if (!res.success) {
        setErrorMessage(res.error);
      } else {
        setPendingNotice({
          studentName: name,
          rollNo,
          department,
          email,
        });
        // Clear fields
        setName('');
        setRollNo('');
        setPassword('');
      }
    } else {
      // Teacher: #name, #faculty no, #department, #email, #password (Direct access)
      if (!name.trim() || !facultyNo.trim() || !email.trim() || !password.trim()) {
        setErrorMessage('All teacher registration fields are mandatory.');
        return;
      }

      const res = registerTeacher({ name, facultyNo, department, email, password });
      if (!res.success) {
        setErrorMessage(res.error);
      }
    }
  };

  // Fast demo credential presets
  const fillDemo = (type) => {
    setErrorMessage('');
    setPendingNotice(null);
    if (type === 'student-approved') {
      setAuthRole('student');
      setAuthMode('signin');
      setEmail('aarav.student@indira.edu');
      setPassword('password123');
    } else if (type === 'student-pending') {
      setAuthRole('student');
      setAuthMode('signin');
      setEmail('isha.patel@indira.edu');
      setPassword('password123');
    } else if (type === 'teacher') {
      setAuthRole('teacher');
      setAuthMode('signin');
      setEmail('divya.c@indira.edu');
      setPassword('password123');
    }
  };

  const handleInstantTeacherLogin = () => {
    const res = login('divya.c@indira.edu', 'password123', 'teacher');
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to login as faculty.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between relative overflow-hidden font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background glow graphics */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 ring-1 ring-white/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white">
              INDIRA UNIVERSITY
            </h1>
            <p className="text-[11px] text-indigo-400 font-medium">
              School of Information Technology • UMS Portal
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Indira SOIT Portal • Live Cloud Sync</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Institution badge */}
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold uppercase tracking-wider mb-2">
              Integrated Campus Gateway
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Sign In to Your Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your role to access your personalized campus dashboard.
            </p>
          </div>

          {/* 1. Dual Role Selector: Student vs Teacher */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthRole('student');
                setErrorMessage('');
                setPendingNotice(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
                authRole === 'student'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/30'
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
                setPendingNotice(null);
                setEmail('divya.c@indira.edu');
                setPassword('password123');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
                authRole === 'teacher'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Teacher Portal</span>
            </button>
          </div>

          {/* Quick Teacher 1-Click Login Option if Teacher Selected */}
          {authRole === 'teacher' && authMode === 'signin' && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleInstantTeacherLogin}
                className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition ring-1 ring-purple-400/40"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>⚡ Instant 1-Click Login as Teacher (Prof. Divya C)</span>
              </button>
            </div>
          )}

          {/* 2. Sub-mode Switcher: Sign In vs Registration */}
          <div className="flex items-center justify-center gap-4 pb-4 mb-4 border-b border-slate-800/80 text-xs">
            <button
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage('');
              }}
              className={`font-semibold pb-1 border-b-2 transition ${
                authMode === 'signin'
                  ? 'text-white border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Log In
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => {
                setAuthMode('register');
                setErrorMessage('');
              }}
              className={`font-semibold pb-1 border-b-2 transition ${
                authMode === 'register'
                  ? 'text-white border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              {authRole === 'student' ? 'Student Registration (Request)' : 'Faculty Registration (Direct)'}
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Pending Student Registration Notice Banner */}
          {pendingNotice && (
            <div className="mb-5 p-4 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Admission Request Dispatched!</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Hello <strong>{pendingNotice.studentName}</strong> (Roll #{pendingNotice.rollNo})! Your registration has been sent to the <strong>Teacher Portal Request Panel</strong>.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] space-y-1 font-mono text-slate-400">
                <p>• Department: {pendingNotice.department}</p>
                <p>• Status: Awaiting Faculty Approval</p>
                <p>• Next Step: Once approved, your profile will be added to the Attendance Register and you can log in.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setEmail(pendingNotice.email);
                  setPendingNotice(null);
                }}
                className="w-full mt-2 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Go to Sign In Screen
              </button>
            </div>
          )}

          {/* 3. SIGN IN FORM (Email & Password Only) */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {authRole === 'student' ? 'Student Email' : 'Faculty Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder={authRole === 'student' ? 'e.g. aarav.student@indira.edu' : 'e.g. divya.c@indira.edu'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-2xl text-white text-xs font-bold shadow-lg transition flex items-center justify-center gap-2 mt-2 ${
                  authRole === 'student'
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                    : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                }`}
              >
                <span>Enter {authRole === 'student' ? 'Student Portal' : 'Teacher Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 4. REGISTRATION FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              {authRole === 'student' ? (
                /* STUDENT REGISTRATION: #name, #roll no, #department, #email, #password */
                <>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Full Name (#name)
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rohit Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Roll Number (#roll no)
                      </label>
                      <div className="relative">
                        <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. 42"
                          value={rollNo}
                          onChange={(e) => setRollNo(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Department (#department)
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 truncate"
                      >
                        {departmentsList.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Email Address (#email)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="rohit.sharma@indira.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Password (#password)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Clarification Notice */}
                  <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 leading-relaxed">
                    <strong>Approval Workflow:</strong> Submitting will send an admission request to the Teacher Portal. You will be allowed to log in once a teacher accepts.
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Submit Student Admission Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                /* TEACHER REGISTRATION: #name, #faculty no, #department, #email, #password (Direct access) */
                <>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Faculty Name (#name)
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Prof. Anand K"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Faculty ID (#faculty no)
                      </label>
                      <div className="relative">
                        <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          placeholder="FAC-306"
                          value={facultyNo}
                          onChange={(e) => setFacultyNo(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Department (#department)
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 truncate"
                      >
                        {departmentsList.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Faculty Email (#email)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="faculty@indira.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Password (#password)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 leading-relaxed">
                    <strong>Direct Registration:</strong> Faculty members register without approval and can log in immediately.
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Register Faculty & Enter Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </form>
          )}

          {/* Quick Demo Test Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Quick Test Demo Accounts:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => fillDemo('student-approved')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-[11px] font-semibold transition"
              >
                🎓 Aarav (Approved Student)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('student-pending')}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition"
              >
                ⏳ Isha (Pending Request)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('teacher')}
                className="px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[11px] font-semibold transition"
              >
                👩‍🏫 Prof. Divya C (Teacher)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-800/60 z-10">
        Indira University • School of Information Technology (SOIT) • AY 2026-2027
      </footer>
    </div>
  );
}
