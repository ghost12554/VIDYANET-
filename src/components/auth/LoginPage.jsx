import React, { useState, useEffect } from 'react';
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
  Eye,
  EyeOff,
  Zap,
  BookmarkCheck,
  Check,
} from 'lucide-react';

export default function LoginPage() {
  const {
    login,
    registerStudent,
    registerTeacher,
    instantApproveAndLoginStudent,
    teachers = [],
    students = [],
  } = useCollege();

  // Active role tab: 'student' | 'teacher'
  const [authRole, setAuthRole] = useState('student');
  // Active action: 'signin' | 'register'
  const [authMode, setAuthMode] = useState('signin');

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [autoApproveStudent, setAutoApproveStudent] = useState(false);

  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [facultyNo, setFacultyNo] = useState('');
  const [department, setDepartment] = useState('Information Technology (AIML)');

  // Alerts
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingNotice, setPendingNotice] = useState(null);

  // Load remembered credentials or sensible preset on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('indira_ums_remembered_login');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.password) setPassword(parsed.password);
        if (parsed.authRole) setAuthRole(parsed.authRole);
      } else {
        if (authRole === 'student') {
          setEmail('aarav.student@indira.edu');
          setPassword('password123');
        } else {
          setEmail('divya.c@indira.edu');
          setPassword('password123');
        }
      }
    } catch (e) {}
  }, []);

  // Sync default email/pass when switching role if inputs are pristine
  const handleRoleChange = (role) => {
    setAuthRole(role);
    setErrorMessage('');
    setPendingNotice(null);
    if (role === 'student') {
      setEmail((prev) => (prev.includes('@indira.edu') || !prev ? 'aarav.student@indira.edu' : prev));
      setPassword((prev) => prev || 'password123');
    } else {
      setEmail((prev) => (prev.includes('@indira.edu') || !prev ? 'divya.c@indira.edu' : prev));
      setPassword((prev) => prev || 'password123');
    }
  };

  // Departments available in college
  const departmentsList = [
    'Information Technology (AIML)',
    'Computer Science & Engineering',
    'Data Science & Analytics',
    'Software Engineering',
  ];

  // Handle Sign In (Email & Password only)
  const handleSignIn = (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setPendingNotice(null);

    const res = login(email, password, authRole);
    if (!res.success) {
      if (res.isPending) {
        setErrorMessage(
          '⏳ Your account is in the Teacher Portal Request Queue awaiting faculty verification. Once approved by faculty, you can log in!'
        );
        if (res.student) {
          setPendingNotice({
            studentName: res.student.name,
            rollNo: res.student.rollNo,
            department: res.student.department,
            email: res.student.email,
            id: res.student.id,
          });
        }
      } else {
        setErrorMessage(res.error || 'Invalid credentials. Please verify your email and password.');
      }
    } else {
      // Save credentials if Remember Me is checked
      if (rememberMe) {
        try {
          localStorage.setItem(
            'indira_ums_remembered_login',
            JSON.stringify({ email: email.trim(), password: password.trim(), authRole })
          );
        } catch (e) {}
      } else {
        try {
          localStorage.removeItem('indira_ums_remembered_login');
        } catch (e) {}
      }
    }
  };

  // Quick 1-click login handler
  const handleQuickSelect = (accEmail, accPass, role) => {
    setEmail(accEmail);
    setPassword(accPass);
    setAuthRole(role);
    setErrorMessage('');
    setPendingNotice(null);

    const res = login(accEmail, accPass, role);
    if (res.success && rememberMe) {
      try {
        localStorage.setItem(
          'indira_ums_remembered_login',
          JSON.stringify({ email: accEmail, password: accPass, authRole: role })
        );
      } catch (e) {}
    }
  };

  // Handle Registration
  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setPendingNotice(null);

    if (authRole === 'student') {
      if (!name.trim() || !rollNo.trim() || !email.trim() || !password.trim()) {
        setErrorMessage('All registration fields (#Name, #Roll No, #Department, #Email, #Password) are mandatory.');
        return;
      }

      const res = registerStudent({
        name,
        rollNo,
        department,
        email,
        password,
        autoApprove: autoApproveStudent,
      });

      if (!res.success) {
        setErrorMessage(res.error);
      } else {
        if (autoApproveStudent) {
          // Immediately logged in via context!
          return;
        }
        setPendingNotice({
          studentName: name,
          rollNo,
          department,
          email,
          id: res.student?.id,
        });
        // Clear fields
        setName('');
        setRollNo('');
        setPassword('');
      }
    } else {
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

  // Quick demo student presets
  const quickStudents = [
    { name: 'Aarav Sharma', email: 'aarav.student@indira.edu', role: 'Roll 15 • Batch A', pass: 'password123' },
    { name: 'Pooja Verma', email: 'pooja.verma@indira.edu', role: 'Roll 35 • Batch B', pass: 'password123' },
    { name: 'Rohan Kulkarni', email: 'rohan.k@indira.edu', role: 'Roll 68 • Batch C', pass: 'password123' },
  ];

  // Quick demo teacher presets
  const quickTeachers = [
    { name: 'Prof. Divya C', email: 'divya.c@indira.edu', role: 'Class Teacher • DS/SE', pass: 'password123' },
    { name: 'Prof. Jyoti J', email: 'jyoti.j@indira.edu', role: 'Assoc. Prof • RDBMS', pass: 'password123' },
    { name: 'Prof. Rajesh Sharma', email: 'rajesh.sharma@indira.edu', role: 'Faculty • CSE', pass: 'password123' },
  ];



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
              onClick={() => handleRoleChange('student')}
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
              onClick={() => handleRoleChange('teacher')}
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
            <div className="mb-5 p-4 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs space-y-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Admission Request Dispatched!</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Hello <strong>{pendingNotice.studentName}</strong> (Roll #{pendingNotice.rollNo})! Your registration is in the <strong>Teacher Portal Request Panel</strong>.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] space-y-1 font-mono text-slate-400">
                <p>• Department: {pendingNotice.department}</p>
                <p>• Status: Awaiting Faculty Approval</p>
                <p>• Email: {pendingNotice.email}</p>
              </div>

              {/* Instant Approve & Sign In for Testing */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const res = instantApproveAndLoginStudent(pendingNotice.id || pendingNotice.email);
                    if (!res.success) {
                      setErrorMessage(res.error || 'Could not auto-approve.');
                    }
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-1.5 transition"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>⚡ Instant Approve & Enter</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setEmail(pendingNotice.email);
                    setPendingNotice(null);
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition"
                >
                  Go to Sign In Screen
                </button>
              </div>
            </div>
          )}

          {/* 3. SIGN IN FORM (Email & Password Only) */}
          {authMode === 'signin' && (
            <div className="space-y-4 text-xs">
              {/* Quick 1-Click Demo Accounts Selector */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Quick 1-Click Sign-In ({authRole === 'student' ? 'Students' : 'Faculty'})</span>
                  </span>
                  <span className="text-[9px] text-indigo-400 font-mono">Instant Auth</span>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {(authRole === 'student' ? quickStudents : quickTeachers).map((item) => (
                    <button
                      key={item.email}
                      type="button"
                      onClick={() => handleQuickSelect(item.email, item.pass, authRole)}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 transition group text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[10px] group-hover:bg-indigo-600 group-hover:text-white transition">
                          {authRole === 'student' ? 'S' : 'T'}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-xs leading-none">{item.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.role}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-0.5">
                        <span>Sign In</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 my-1 text-[11px] text-slate-500">
                <div className="flex-1 h-px bg-slate-800" />
                <span>or enter credentials</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              <form onSubmit={handleSignIn} className="space-y-3.5">
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-10 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 text-xs">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span>Remember login on this browser</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Auto-sync enabled</span>
                  </span>
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
            </div>
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

                  {/* Fast-Track Auto-Approve Option */}
                  <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={autoApproveStudent}
                        onChange={(e) => setAutoApproveStudent(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-white block">⚡ Fast-Track Instant Sign-In</span>
                        <span className="text-[10px] text-indigo-200">
                          Automatically approve admission and log in immediately without waiting for teacher review.
                        </span>
                      </div>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 mt-2"
                  >
                    <span>{autoApproveStudent ? 'Register & Instant Sign In' : 'Submit Student Admission Request'}</span>
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

          {/* Persistent Session Guarantee Notice */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Persistent Session Enabled • Survives page refresh and browser restarts</span>
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
