import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_TIMETABLE,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_ATTENDANCE,
  INITIAL_TASKS,
  INITIAL_NOTIFICATIONS,
  INITIAL_NOTES,
  INITIAL_ASSIGNMENTS,
  INITIAL_TESTS,
  INITIAL_CHATS,
  INITIAL_POSTS,
  INITIAL_EMERGENCY_DOCS,
  INITIAL_AWARENESS_MESSAGES,
  INITIAL_PRACTICAL_ATTENDANCE,
  INITIAL_DEPARTMENT_BATCHES,
  INITIAL_LAB_NOTES,
  INITIAL_MEETING,
} from '../data/initialData';
import {
  subscribeToCollection,
  setFirestoreDoc,
  deleteFirestoreDoc,
  registerStudentFirebase,
  registerTeacherFirebase,
  loginFirebase,
  recordUserInFirebase,
} from '../firebase/firestoreService';
import { isRealFirebaseConfigured } from '../firebase/firebaseConfig';

const CollegeContext = createContext(null);

export function CollegeProvider({ children }) {
  // One-time cache reset to clear pre-uploaded/dummy records from user's browser
  const FRESH_RESET_KEY = 'indira_ums_fresh_v5';
  if (typeof localStorage !== 'undefined' && localStorage.getItem('indira_ums_reset_version') !== FRESH_RESET_KEY) {
    localStorage.removeItem('indira_ums_notes');
    localStorage.removeItem('indira_ums_labNotes');
    localStorage.removeItem('indira_ums_assignments');
    localStorage.removeItem('indira_ums_tests');
    localStorage.removeItem('indira_ums_tasks');
    localStorage.removeItem('indira_ums_chats');
    localStorage.removeItem('indira_ums_posts');
    localStorage.removeItem('indira_ums_notifications');
    localStorage.removeItem('indira_ums_awarenessMessages');
    localStorage.removeItem('indira_ums_emergencyDocs');
    localStorage.removeItem('indira_ums_attendance');
    localStorage.removeItem('indira_ums_practicalAttendance');
    localStorage.removeItem('indira_ums_botHistory');
    localStorage.setItem('indira_ums_reset_version', FRESH_RESET_KEY);
  }

  // Load state from localStorage or defaults
  const loadState = (key, fallback) => {
    try {
      const saved = localStorage.getItem(`indira_ums_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [students, setStudents] = useState(() => {
    const saved = loadState('students', INITIAL_STUDENTS);
    const existingIds = new Set(saved.map((s) => s.id));
    const missing = INITIAL_STUDENTS.filter((s) => !existingIds.has(s.id));
    return missing.length > 0 ? [...saved, ...missing] : saved;
  });
  const [teachers, setTeachers] = useState(() => {
    const saved = loadState('teachers', INITIAL_TEACHERS);
    const existingIds = new Set((saved || []).map((t) => t.id));
    const missing = INITIAL_TEACHERS.filter((t) => !existingIds.has(t.id));
    const merged = missing.length > 0 ? [...saved, ...missing] : (saved || INITIAL_TEACHERS);
    return merged.map((t) => {
      const init = INITIAL_TEACHERS.find((it) => it.id === t.id);
      return {
        ...t,
        phone: t.phone || init?.phone || '+91 98201 44521',
      };
    });
  });
  const [timetable, setTimetable] = useState(() => {
    const saved = loadState('timetable', null);
    if (!saved || saved.effectiveDate === '20/07/2026') {
      return INITIAL_TIMETABLE;
    }
    return saved;
  });
  const [attendance, setAttendance] = useState(() => loadState('attendance', INITIAL_ATTENDANCE));
  const [tasks, setTasks] = useState(() => loadState('tasks', INITIAL_TASKS));
  const [notifications, setNotifications] = useState(() => loadState('notifications', INITIAL_NOTIFICATIONS));
  const [notes, setNotes] = useState(() => loadState('notes', INITIAL_NOTES));
  const [assignments, setAssignments] = useState(() => {
    const saved = loadState('assignments', INITIAL_ASSIGNMENTS);
    const existingIds = new Set(saved.map((a) => a.id));
    const missing = INITIAL_ASSIGNMENTS.filter((a) => !existingIds.has(a.id));
    const merged = missing.length > 0 ? [...saved, ...missing] : saved;
    return merged.map((a) => ({
      ...a,
      department: a.department || 'Information Technology (AIML)',
      allowLateSubmission: a.allowLateSubmission !== undefined ? a.allowLateSubmission : true,
    }));
  });
  const [tests, setTests] = useState(() => loadState('tests', INITIAL_TESTS));
  const [chats, setChats] = useState(() => {
    const saved = loadState('chats', INITIAL_CHATS);
    const existingIds = new Set((saved || []).map((c) => c.id));
    const missing = INITIAL_CHATS.filter((c) => !existingIds.has(c.id));
    const merged = missing.length > 0 ? [...saved, ...missing] : (saved || INITIAL_CHATS);
    return merged.map((c) => {
      const init = INITIAL_CHATS.find((ic) => ic.id === c.id);
      return {
        ...c,
        phone: c.phone || init?.phone || '+91 98201 44521',
      };
    });
  });
  const [posts, setPosts] = useState(() => loadState('posts', INITIAL_POSTS));
  const [socialConnections, setSocialConnections] = useState(() =>
    loadState('socialConnections', {
      'stud-1': {
        following: ['stud-2', 'stud-3', 'teach-1'],
        followers: ['stud-2', 'stud-4', 'stud-5'],
        requests: [
          {
            fromUserId: 'stud-6',
            fromName: 'Neha Deshmukh',
            fromHandle: '@neha_deshmukh',
            fromAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80',
            fromDepartment: 'Information Technology (AIML)',
            timestamp: '2 hours ago',
          },
          {
            fromUserId: 'stud-7',
            fromName: 'Aditya Kulkarni',
            fromHandle: '@aditya_k',
            fromAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
            fromDepartment: 'Computer Science & Engineering',
            timestamp: 'Yesterday',
          },
        ],
      },
    })
  );
  const [emergencyDocs, setEmergencyDocs] = useState(() => loadState('docs', INITIAL_EMERGENCY_DOCS));
  const [awarenessMessages, setAwarenessMessages] = useState(() => loadState('awarenessMessages', INITIAL_AWARENESS_MESSAGES));
  const [botHistory, setBotHistory] = useState(() => loadState('botHistory', []));
  const [practicalAttendance, setPracticalAttendance] = useState(() => loadState('practicalAttendance', INITIAL_PRACTICAL_ATTENDANCE));
  const [departmentBatches, setDepartmentBatches] = useState(() => loadState('departmentBatches', INITIAL_DEPARTMENT_BATCHES));
  const [labNotes, setLabNotes] = useState(() => loadState('labNotes', INITIAL_LAB_NOTES));
  const [activeMeeting, setActiveMeeting] = useState(() => loadState('meeting', INITIAL_MEETING));

  // Current session (null if not logged in, requiring login page)
  const [currentUser, setCurrentUser] = useState(() => {
    const stayLoggedIn = loadState('stay_logged_in', true);
    if (!stayLoggedIn) return null;
    const saved = loadState('currentUser', null);
    if (!saved || typeof saved !== 'object') return null;
    return saved;
  });
  const [userRole, setUserRole] = useState(() => {
    const savedUser = loadState('currentUser', null);
    if (savedUser && typeof savedUser === 'object') {
      if (savedUser.facultyNo || savedUser.designation) return 'teacher';
      if (savedUser.rollNo || savedUser.batch) return 'student';
    }
    const savedRole = loadState('userRole', 'student');
    return savedRole === 'teacher' ? 'teacher' : 'student';
  });
  const [activeMode, setActiveMode] = useState(() => {
    return loadState('activeMode', 'dashboard');
  }); // dashboard, workstore, chitchat, socialfreak, botmarket, profile
  const [workstoreTargetTab, setWorkstoreTargetTab] = useState(null);

  // URL query parameter listener for direct meeting link (/ ?meeting=EDU-303-ZOOM)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const meetingParam = params.get('meeting') || params.get('joinMeeting');
      if (meetingParam) {
        setActiveMode('workstore');
        setWorkstoreTargetTab('meeting');
      }
    }
  }, []);

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('indira_ums_currentUser');
      localStorage.removeItem('indira_ums_stay_logged_in');
      localStorage.setItem('indira_ums_activeMode', JSON.stringify('dashboard'));
    } catch (e) {
      console.warn('Logout storage clearance error', e);
    }
  };

  // Dynamic Lecture Time Simulation with Indian Standard Time (IST - Asia/Kolkata)
  const getIndianTime = () => {
    try {
      const now = new Date();
      // Format in Indian Standard Time (Asia/Kolkata)
      const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      const istDate = new Date(istString);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const istDay = dayNames[istDate.getDay()];
      return {
        day: istDay === 'Sunday' ? 'Monday' : istDay,
        hour: istDate.getHours(),
        minute: istDate.getMinutes(),
        second: istDate.getSeconds(),
        isLiveTime: true,
      };
    } catch {
      return { day: 'Monday', hour: 9, minute: 10, second: 0, isLiveTime: false };
    }
  };

  const [simulatedTime, setSimulatedTime] = useState(() => {
    // Default to Indian Standard Time (IST) awareness
    return getIndianTime();
  });

  // Ticking effect when in Live IST mode
  useEffect(() => {
    if (!simulatedTime.isLiveTime) return;

    const interval = setInterval(() => {
      setSimulatedTime((prev) => {
        if (!prev.isLiveTime) return prev;
        const ist = getIndianTime();
        return { ...prev, hour: ist.hour, minute: ist.minute, second: ist.second, day: ist.day };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [simulatedTime.isLiveTime]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('indira_ums_students', JSON.stringify(students));
  }, [students]);
  useEffect(() => {
    localStorage.setItem('indira_ums_teachers', JSON.stringify(teachers));
  }, [teachers]);
  useEffect(() => {
    localStorage.setItem('indira_ums_timetable', JSON.stringify(timetable));
  }, [timetable]);
  useEffect(() => {
    localStorage.setItem('indira_ums_attendance', JSON.stringify(attendance));
  }, [attendance]);
  useEffect(() => {
    localStorage.setItem('indira_ums_tasks', JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem('indira_ums_notifications', JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem('indira_ums_notes', JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    localStorage.setItem('indira_ums_assignments', JSON.stringify(assignments));
  }, [assignments]);
  useEffect(() => {
    localStorage.setItem('indira_ums_tests', JSON.stringify(tests));
  }, [tests]);
  useEffect(() => {
    localStorage.setItem('indira_ums_chats', JSON.stringify(chats));
  }, [chats]);
  useEffect(() => {
    localStorage.setItem('indira_ums_posts', JSON.stringify(posts));
  }, [posts]);
  useEffect(() => {
    localStorage.setItem('indira_ums_socialConnections', JSON.stringify(socialConnections));
  }, [socialConnections]);
  useEffect(() => {
    localStorage.setItem('indira_ums_docs', JSON.stringify(emergencyDocs));
  }, [emergencyDocs]);
  useEffect(() => {
    localStorage.setItem('indira_ums_awarenessMessages', JSON.stringify(awarenessMessages));
  }, [awarenessMessages]);
  useEffect(() => {
    localStorage.setItem('indira_ums_botHistory', JSON.stringify(botHistory));
  }, [botHistory]);
  useEffect(() => {
    localStorage.setItem('indira_ums_practicalAttendance', JSON.stringify(practicalAttendance));
  }, [practicalAttendance]);
  useEffect(() => {
    localStorage.setItem('indira_ums_departmentBatches', JSON.stringify(departmentBatches));
  }, [departmentBatches]);
  useEffect(() => {
    localStorage.setItem('indira_ums_labNotes', JSON.stringify(labNotes));
  }, [labNotes]);
  useEffect(() => {
    localStorage.setItem('indira_ums_meeting', JSON.stringify(activeMeeting));
  }, [activeMeeting]);
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'indira_ums_meeting' && e.newValue) {
        try {
          setActiveMeeting(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'indira_ums_chats' && e.newValue) {
        try {
          setChats(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('indira_ums_currentUser', JSON.stringify(currentUser));
        localStorage.setItem('indira_ums_userRole', JSON.stringify(userRole));
      } else {
        localStorage.removeItem('indira_ums_currentUser');
      }
    } catch (e) {
      console.warn('Could not persist currentUser session to localStorage', e);
    }
  }, [currentUser, userRole]);

  useEffect(() => {
    try {
      localStorage.setItem('indira_ums_activeMode', JSON.stringify(activeMode));
    } catch (e) {
      console.warn('Could not persist activeMode to localStorage', e);
    }
  }, [activeMode]);

  // Synchronize currentUser with master database array (students / teachers)
  useEffect(() => {
    if (!currentUser) return;
    if (userRole === 'teacher') {
      const match = teachers.find(
        (t) => t.id === currentUser.id || t.email?.toLowerCase() === currentUser.email?.toLowerCase()
      );
      if (match && JSON.stringify(match) !== JSON.stringify(currentUser)) {
        setCurrentUser(match);
        try {
          localStorage.setItem('indira_ums_currentUser', JSON.stringify(match));
        } catch (e) {}
      }
    } else {
      const match = students.find(
        (s) => s.id === currentUser.id || s.email?.toLowerCase() === currentUser.email?.toLowerCase()
      );
      if (match && JSON.stringify(match) !== JSON.stringify(currentUser)) {
        setCurrentUser(match);
        try {
          localStorage.setItem('indira_ums_currentUser', JSON.stringify(match));
        } catch (e) {}
      }
    }
  }, [students, teachers, userRole]);

  // Whenever currentUser is active, ensure their email is recorded in Firebase Console
  useEffect(() => {
    if (currentUser?.email && isRealFirebaseConfigured) {
      recordUserInFirebase({
        email: currentUser.email,
        password: currentUser.password || 'password123',
        role: userRole || (currentUser.facultyNo ? 'teacher' : 'student'),
        name: currentUser.name,
        extraData: {
          id: currentUser.id,
          rollNo: currentUser.rollNo || null,
          facultyNo: currentUser.facultyNo || null,
          department: currentUser.department || 'Information Technology',
          status: currentUser.status || 'APPROVED',
        },
      }).catch((e) => console.warn('Active user Firebase sync notice:', e));
    }
  }, [currentUser?.email]);

  // Auth methods
  const login = (email, password, role, stayLoggedIn = true) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    if (role === 'student') {
      const student = students.find((s) => s.email?.toLowerCase() === cleanEmail);
      if (!student) {
        return { success: false, error: 'Student account not found with this email.' };
      }
      if (student.password !== cleanPassword) {
        return { success: false, error: 'Incorrect password entered.' };
      }
      if (student.status === 'PENDING') {
        return {
          success: false,
          isPending: true,
          student,
          error: 'Your admission registration is currently awaiting teacher approval in the request queue.',
        };
      }
      if (student.status === 'REJECTED') {
        return { success: false, error: 'Your admission request was declined. Please contact faculty.' };
      }

      // Record student email in Firebase Console (Authentication and Firestore)
      if (isRealFirebaseConfigured) {
        recordUserInFirebase({
          email: cleanEmail,
          password: cleanPassword,
          role: 'student',
          name: student.name,
          extraData: {
            rollNo: student.rollNo,
            batch: student.batch,
            department: student.department,
            status: student.status,
          },
        }).catch((err) => console.warn('Firebase student login record notice:', err));
      }

      // Save or clear persistent session based on user choice ("Don't log out / Stay logged in")
      try {
        localStorage.setItem('indira_ums_stay_logged_in', JSON.stringify(Boolean(stayLoggedIn)));
        if (stayLoggedIn) {
          localStorage.setItem('indira_ums_currentUser', JSON.stringify(student));
          localStorage.setItem('indira_ums_userRole', JSON.stringify('student'));
          localStorage.setItem('indira_ums_activeMode', JSON.stringify('dashboard'));
        } else {
          localStorage.removeItem('indira_ums_currentUser');
        }
      } catch (e) {
        console.warn('Storage error on student login', e);
      }

      setCurrentUser(student);
      setUserRole('student');
      setActiveMode('dashboard');
      return { success: true, user: student };
    } else {
      const teacher = teachers.find((t) => t.email?.toLowerCase() === cleanEmail);
      if (!teacher) {
        return { success: false, error: 'Faculty account not found with this email.' };
      }
      if (teacher.password !== cleanPassword) {
        return { success: false, error: 'Incorrect password entered.' };
      }

      // Record faculty email in Firebase Console (Authentication and Firestore)
      if (isRealFirebaseConfigured) {
        recordUserInFirebase({
          email: cleanEmail,
          password: cleanPassword,
          role: 'teacher',
          name: teacher.name,
          extraData: {
            facultyNo: teacher.facultyNo,
            department: teacher.department,
            designation: teacher.designation,
          },
        }).catch((err) => console.warn('Firebase teacher login record notice:', err));
      }

      // Save or clear persistent session based on user choice ("Don't log out / Stay logged in")
      try {
        localStorage.setItem('indira_ums_stay_logged_in', JSON.stringify(Boolean(stayLoggedIn)));
        if (stayLoggedIn) {
          localStorage.setItem('indira_ums_currentUser', JSON.stringify(teacher));
          localStorage.setItem('indira_ums_userRole', JSON.stringify('teacher'));
          localStorage.setItem('indira_ums_activeMode', JSON.stringify('dashboard'));
        } else {
          localStorage.removeItem('indira_ums_currentUser');
        }
      } catch (e) {
        console.warn('Storage error on teacher login', e);
      }

      setCurrentUser(teacher);
      setUserRole('teacher');
      setActiveMode('dashboard');
      return { success: true, user: teacher };
    }
  };

  const registerStudent = ({ name, rollNo, department, email, password, autoApprove = false, stayLoggedIn = true }) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    // Check if email exists
    if (students.some((s) => s.email?.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'A student with this email is already registered.' };
    }
    const rollInt = parseInt(rollNo, 10) || 1;
    let batch = 'A';
    if (rollInt >= 32 && rollInt <= 62) batch = 'B';
    if (rollInt >= 63) batch = 'C';

    const newStudent = {
      id: `stud-${Date.now()}`,
      name: name.trim(),
      rollNo: String(rollNo).trim(),
      batch,
      department: department || 'Information Technology (AIML)',
      email: cleanEmail,
      password: String(password || '').trim(),
      status: autoApprove ? 'APPROVED' : 'PENDING',
      registeredAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      phone: '+91 98000 00000',
      bloodGroup: 'B+',
      semester: 'Semester III',
      academicYear: '2026-2027',
      classroom: '303',
    };

    const nextStudents = [newStudent, ...students];
    setStudents(nextStudents);
    try {
      localStorage.setItem('indira_ums_students', JSON.stringify(nextStudents));
    } catch (e) {}

    // Record in Firebase Authentication and Firestore Console
    if (isRealFirebaseConfigured) {
      recordUserInFirebase({
        email: cleanEmail,
        password: String(password || '').trim(),
        role: 'student',
        name,
        extraData: newStudent,
      }).catch((e) => console.warn('Firebase student registration notice:', e));

      setFirestoreDoc('users', newStudent.id, newStudent);
      if (!autoApprove) {
        setFirestoreDoc('requests', newStudent.id, newStudent);
      }
    }

    // Send high priority notification to teacher portal
    const notif = {
      id: `notif-${Date.now()}`,
      title: 'New Student Admission Request',
      category: 'request',
      message: `${name} (Roll No: ${rollNo}, Batch ${batch}) submitted registration request. ${autoApprove ? 'Auto-approved.' : 'Action required in Request Panel.'}`,
      timestamp: 'Just now',
      readBy: [],
    };
    setNotifications((prev) => [notif, ...prev]);

    if (autoApprove) {
      try {
        localStorage.setItem('indira_ums_stay_logged_in', JSON.stringify(Boolean(stayLoggedIn)));
        if (stayLoggedIn) {
          localStorage.setItem('indira_ums_currentUser', JSON.stringify(newStudent));
          localStorage.setItem('indira_ums_userRole', JSON.stringify('student'));
          localStorage.setItem('indira_ums_activeMode', JSON.stringify('dashboard'));
        }
      } catch (e) {}
      setCurrentUser(newStudent);
      setUserRole('student');
      setActiveMode('dashboard');
    }

    return { success: true, student: newStudent };
  };

  const registerTeacher = ({ name, facultyNo, department, email, password, designation, stayLoggedIn = true }) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (teachers.some((t) => t.email?.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'A faculty member with this email already exists.' };
    }

    const cleanName = name.startsWith('Prof.') || name.startsWith('Dr.') ? name.trim() : `Prof. ${name.trim()}`;
    const newTeacher = {
      id: `teach-${Date.now()}`,
      name: cleanName,
      facultyNo: facultyNo?.trim() || `FAC-${Math.floor(100 + Math.random() * 900)}`,
      department: department || 'Information Technology',
      email: cleanEmail,
      password: String(password || '').trim(),
      designation: designation || 'Assistant Professor',
      subjects: ['Information Technology'],
      cabin: 'Faculty Block, Room 303',
      phone: '+91 98201 44521',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`,
    };

    const nextTeachers = [newTeacher, ...teachers];
    setTeachers(nextTeachers);

    // Record in Firebase Authentication and Firestore Console
    if (isRealFirebaseConfigured) {
      recordUserInFirebase({
        email: cleanEmail,
        password: String(password || '').trim(),
        role: 'teacher',
        name: cleanName,
        extraData: newTeacher,
      }).catch((e) => console.warn('Firebase faculty registration notice:', e));

      setFirestoreDoc('users', newTeacher.id, newTeacher);
    }

    try {
      localStorage.setItem('indira_ums_teachers', JSON.stringify(nextTeachers));
      localStorage.setItem('indira_ums_stay_logged_in', JSON.stringify(Boolean(stayLoggedIn)));
      if (stayLoggedIn) {
        localStorage.setItem('indira_ums_currentUser', JSON.stringify(newTeacher));
        localStorage.setItem('indira_ums_userRole', JSON.stringify('teacher'));
        localStorage.setItem('indira_ums_activeMode', JSON.stringify('dashboard'));
      }
    } catch (e) {}

    setCurrentUser(newTeacher);
    setUserRole('teacher');
    setActiveMode('dashboard');

    return { success: true, teacher: newTeacher };
  };

  const approveStudent = (studentId) => {
    const nextStudents = students.map((s) => (s.id === studentId ? { ...s, status: 'APPROVED' } : s));
    setStudents(nextStudents);
    try {
      localStorage.setItem('indira_ums_students', JSON.stringify(nextStudents));
    } catch (e) {}

    if (isRealFirebaseConfigured) {
      setFirestoreDoc('users', studentId, { status: 'APPROVED' });
      deleteFirestoreDoc('requests', studentId);
    }

    const approvedStudent = students.find((s) => s.id === studentId);
    if (approvedStudent) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Admission Approved',
          category: 'request',
          message: `${approvedStudent.name} (Roll ${approvedStudent.rollNo}) has been approved and granted login access to Indira UMS.`,
          timestamp: 'Just now',
          readBy: [],
        },
        ...prev,
      ]);
    }
  };

  const instantApproveAndLoginStudent = (studentId) => {
    let studentToLogin = null;
    const nextStudents = students.map((s) => {
      if (s.id === studentId || s.email?.toLowerCase() === String(studentId).toLowerCase()) {
        const approved = { ...s, status: 'APPROVED' };
        studentToLogin = approved;
        return approved;
      }
      return s;
    });

    setStudents(nextStudents);
    try {
      localStorage.setItem('indira_ums_students', JSON.stringify(nextStudents));
    } catch (e) {}

    if (studentToLogin) {
      try {
        localStorage.setItem('indira_ums_currentUser', JSON.stringify(studentToLogin));
        localStorage.setItem('indira_ums_userRole', JSON.stringify('student'));
        localStorage.setItem('indira_ums_activeMode', JSON.stringify('dashboard'));
      } catch (e) {}
      setCurrentUser(studentToLogin);
      setUserRole('student');
      setActiveMode('dashboard');
      return { success: true, student: studentToLogin };
    }
    return { success: false, error: 'Student not found.' };
  };

  const rejectStudent = (studentId) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: 'REJECTED' } : s))
    );

    if (isRealFirebaseConfigured) {
      setFirestoreDoc('users', studentId, { status: 'REJECTED' });
      deleteFirestoreDoc('requests', studentId);
    }
  };

  const switchRole = (newRole) => {
    if (newRole === 'student') {
      const activeStudent = students.find((s) => s.status === 'APPROVED') || students[0];
      setCurrentUser(activeStudent);
      setUserRole('student');
      localStorage.setItem('indira_ums_currentUser', JSON.stringify(activeStudent));
      localStorage.setItem('indira_ums_userRole', JSON.stringify('student'));
    } else {
      const activeTeacher = teachers[0] || INITIAL_TEACHERS[0];
      setCurrentUser(activeTeacher);
      setUserRole('teacher');
      localStorage.setItem('indira_ums_currentUser', JSON.stringify(activeTeacher));
      localStorage.setItem('indira_ums_userRole', JSON.stringify('teacher'));
    }
    setActiveMode('dashboard');
  };

  // Timetable CRUD methods (Only teachers can edit/add/remove/reset)
  const updateTimetableSlot = (day, slotIndex, updatedData) => {
    setTimetable((prev) => {
      const daySlots = [...(prev.theorySchedule[day] || [])];
      daySlots[slotIndex] = { ...daySlots[slotIndex], ...updatedData };
      return {
        ...prev,
        theorySchedule: {
          ...prev.theorySchedule,
          [day]: daySlots,
        },
      };
    });

    // Notify students
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Timetable Adjusted',
        category: 'schedule',
        message: `Classroom 303 schedule for ${day} was updated by ${currentUser?.name || 'Faculty'}.`,
        timestamp: 'Just now',
        readBy: [],
      },
      ...prev,
    ]);
  };

  const addTimetableSlot = (day, newSlot) => {
    setTimetable((prev) => {
      const daySlots = [...(prev.theorySchedule[day] || []), newSlot];
      return {
        ...prev,
        theorySchedule: {
          ...prev.theorySchedule,
          [day]: daySlots,
        },
      };
    });
  };

  const removeTimetableSlot = (day, slotIndex) => {
    setTimetable((prev) => {
      const daySlots = [...(prev.theorySchedule[day] || [])];
      daySlots.splice(slotIndex, 1);
      return {
        ...prev,
        theorySchedule: {
          ...prev.theorySchedule,
          [day]: daySlots,
        },
      };
    });
  };

  const resetTimetableToDefault = () => {
    setTimetable(INITIAL_TIMETABLE);
    if (isRealFirebaseConfigured) {
      setFirestoreDoc('settings', 'timetable', INITIAL_TIMETABLE);
    }
  };

  // Complete removal / clearance of timetable by faculty
  const clearTimetable = () => {
    const emptyTimetable = {
      institution: "INDIRA UNIVERSITY, SCHOOL OF INFORMATION TECHNOLOGY",
      program: "Schedule Cleared - Awaiting New Upload",
      division: "Div-A",
      effectiveDate: new Date().toLocaleDateString(),
      dean: "Dr. Janardan Pawar",
      classTeacher: currentUser?.name || "Divya C",
      theorySlots: [],
      theorySchedule: {
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: []
      },
      practicalSlots: { time: "12:30 PM to 03:00 PM", days: {} },
      facultyMapping: [],
      batches: []
    };
    setTimetable(emptyTimetable);
    if (isRealFirebaseConfigured) {
      setFirestoreDoc('settings', 'timetable', emptyTimetable);
    }
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Timetable Removed by Faculty',
        category: 'schedule',
        message: `${currentUser?.name || 'Class Teacher'} removed the current timetable. A new schedule will be uploaded shortly.`,
        timestamp: 'Just now',
        readBy: [],
      },
      ...prev,
    ]);
  };

  // Bulk import timetable (from Image, PDF, Excel, Word parser)
  const importTimetable = (importedTimetableData) => {
    setTimetable(importedTimetableData);
    if (isRealFirebaseConfigured) {
      const safeData = { ...importedTimetableData };
      if (safeData.documentImage && safeData.documentImage.length > 800000) {
        delete safeData.documentImage;
      }
      setFirestoreDoc('settings', 'timetable', safeData);
    }

    // Dynamic notification to student portal
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Timetable Uploaded by Teacher',
        category: 'schedule',
        message: `${currentUser?.name || 'Class Teacher'} processed and uploaded an updated class timetable (${importedTimetableData.division || 'Div-A'}). Your schedule has dynamically updated!`,
        timestamp: 'Just now',
        readBy: [],
      },
      ...prev,
    ]);
  };

  // Attendance methods
  const recordAttendance = ({
    subject,
    date,
    day,
    department,
    attendanceMap,
    faculty,
    studentsSnapshot,
  }) => {
    const attMap = attendanceMap || {};
    const presentCount = Object.values(attMap).filter(Boolean).length;
    const totalCount = Object.keys(attMap).length;

    const newRecord = {
      id: `att-rec-${Date.now()}`,
      date: date || new Date().toISOString().split('T')[0],
      day: day || 'Monday',
      subject: subject || 'DS',
      department: department || 'Information Technology (AIML)',
      faculty: faculty || currentUser?.name || 'Prof. Divya C',
      attendance: attMap,
      studentsSnapshot: studentsSnapshot || [],
      presentCount,
      totalCount,
      recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAttendance((prev) => ({
      records: [newRecord, ...(prev?.records || [])],
    }));

    // Notify students
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Attendance Marked for ${newRecord.subject}`,
        category: 'attendance',
        message: `${newRecord.faculty} recorded attendance for ${newRecord.subject} on ${newRecord.date} (${newRecord.department}). Check your percentage.`,
        timestamp: 'Just now',
        readBy: [],
      },
      ...prev,
    ]);
  };

  const updateAttendanceRecord = (recordId, updatedAttendance) => {
    setAttendance((prev) => ({
      records: (prev?.records || []).map((r) =>
        r.id === recordId ? { ...r, attendance: updatedAttendance } : r
      ),
    }));
  };

  const deleteAttendanceRecord = (recordId) => {
    setAttendance((prev) => ({
      records: (prev?.records || []).filter((r) => r.id !== recordId),
    }));
  };

  const deleteSelectedAttendanceRecords = (recordIds = []) => {
    const idSet = new Set(recordIds);
    setAttendance((prev) => ({
      records: (prev?.records || []).filter((r) => !idSet.has(r.id)),
    }));
  };

  const clearAllAttendanceHistory = (departmentFilter = 'ALL') => {
    setAttendance((prev) => ({
      records:
        departmentFilter === 'ALL'
          ? []
          : (prev?.records || []).filter((r) => r.department !== departmentFilter),
    }));
  };

  // Helper to compute student attendance percentage
  const getStudentAttendanceStats = (rollNo) => {
    const studentRoll = String(rollNo || currentUser?.rollNo || '15');
    let totalClasses = 0;
    let presentClasses = 0;
    const subjectBreakdown = {};

    (attendance?.records || []).forEach((rec) => {
      if (rec.attendance && studentRoll in rec.attendance) {
        totalClasses++;
        const isPresent = Boolean(rec.attendance[studentRoll]);
        if (isPresent) presentClasses++;

        if (!subjectBreakdown[rec.subject]) {
          subjectBreakdown[rec.subject] = { total: 0, present: 0 };
        }
        subjectBreakdown[rec.subject].total++;
        if (isPresent) subjectBreakdown[rec.subject].present++;
      }
    });

    const percentage = totalClasses === 0 ? 85 : Math.round((presentClasses / totalClasses) * 100);
    return {
      totalClasses,
      presentClasses,
      absentClasses: totalClasses - presentClasses,
      percentage,
      subjectBreakdown,
    };
  };

  // Practical Session Attendance (Distinct from theory lecture attendance)
  const recordPracticalAttendance = ({
    department,
    batch,
    subject,
    date,
    day,
    labRoom,
    faculty,
    topic,
    attendanceMap,
  }) => {
    const newRecord = {
      id: `pract-${Date.now()}`,
      date: date || new Date().toISOString().split('T')[0],
      day: day || new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      subject: subject || 'Data Structures Lab (DS Lab)',
      department: department || 'Information Technology (AIML)',
      batch: batch || 'Batch A',
      labRoom: labRoom || 'Lab 3-B',
      faculty: faculty || currentUser?.name || 'Prof. Divya C',
      topic: topic || 'Practical Lab Session',
      attendance: attendanceMap,
    };

    setPracticalAttendance((prev) => ({
      records: [newRecord, ...(prev?.records || [])],
    }));

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `🔬 Practical Attendance: ${newRecord.subject}`,
        category: 'attendance',
        message: `${newRecord.batch} practical attendance for ${newRecord.date} recorded by ${newRecord.faculty}.`,
        timestamp: 'Just now',
        readBy: [],
      },
      ...prev,
    ]);
  };

  const updatePracticalAttendanceRecord = (recordId, updatedAttendance) => {
    setPracticalAttendance((prev) => ({
      records: (prev?.records || []).map((r) =>
        r.id === recordId ? { ...r, attendance: updatedAttendance } : r
      ),
    }));
  };

  const deletePracticalAttendanceRecord = (recordId) => {
    setPracticalAttendance((prev) => ({
      records: (prev?.records || []).filter((r) => r.id !== recordId),
    }));
  };

  // Helper for Individual Student Practical Attendance Profile
  const getStudentPracticalAttendanceStats = (rollNo, department) => {
    const studentRoll = String(rollNo || currentUser?.rollNo || '').trim();
    let totalLabs = 0;
    let presentLabs = 0;
    const history = [];

    (practicalAttendance?.records || []).forEach((rec) => {
      if (department && rec.department && rec.department !== department) {
        return;
      }
      let matchedKey = null;
      if (rec.attendance) {
        if (studentRoll in rec.attendance) {
          matchedKey = studentRoll;
        } else if (!isNaN(parseInt(studentRoll, 10))) {
          const sNum = parseInt(studentRoll, 10);
          matchedKey = Object.keys(rec.attendance).find((k) => parseInt(k, 10) === sNum);
        }
      }

      if (matchedKey !== null && matchedKey !== undefined) {
        totalLabs++;
        const isPresent = Boolean(rec.attendance[matchedKey]);
        if (isPresent) presentLabs++;

        history.push({
          id: rec.id,
          date: rec.date,
          day: rec.day,
          subject: rec.subject,
          batch: rec.batch,
          labRoom: rec.labRoom,
          faculty: rec.faculty,
          topic: rec.topic,
          isPresent,
        });
      }
    });

    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    const percentage = totalLabs === 0 ? 100 : Math.round((presentLabs / totalLabs) * 100);
    return {
      totalLabs,
      presentLabs,
      absentLabs: totalLabs - presentLabs,
      percentage,
      history,
    };
  };

  // Batch Management: Update roll range and dynamically assign matching students
  const updateDepartmentBatchRange = (department, batchId, { name, startRoll, endRoll }) => {
    const start = Number(startRoll);
    const end = Number(endRoll);
    const batchName = name;

    setDepartmentBatches((prev) => {
      const currentList = prev[department] || [];
      const updated = currentList.map((b) =>
        b.id === batchId
          ? {
              ...b,
              name: batchName || b.name,
              startRoll: start,
              endRoll: end,
              description: `Roll ${start} to ${end}`,
            }
          : b
      );
      return { ...prev, [department]: updated };
    });

    // Dynamically assign students having roll no in this range to the batch!
    setStudents((prev) =>
      prev.map((s) => {
        if (s.department === department) {
          const r = Number(s.rollNo);
          if (!isNaN(r) && r >= start && r <= end) {
            return { ...s, batch: batchName };
          }
        }
        return s;
      })
    );
  };

  const createDepartmentBatch = (department, { name, startRoll, endRoll }) => {
    const start = Number(startRoll);
    const end = Number(endRoll);
    const newBatch = {
      id: `batch-${Date.now()}`,
      name,
      startRoll: start,
      endRoll: end,
      description: `Roll ${start} to ${end}`,
    };

    setDepartmentBatches((prev) => ({
      ...prev,
      [department]: [...(prev[department] || []), newBatch],
    }));

    // Dynamically assign students
    setStudents((prev) =>
      prev.map((s) => {
        if (s.department === department) {
          const r = Number(s.rollNo);
          if (!isNaN(r) && r >= start && r <= end) {
            return { ...s, batch: name };
          }
        }
        return s;
      })
    );
  };

  const deleteDepartmentBatch = (department, batchId) => {
    setDepartmentBatches((prev) => ({
      ...prev,
      [department]: (prev[department] || []).filter((b) => b.id !== batchId),
    }));
  };

  // Lab Notes & Practical Manuals Repository
  const addLabNote = (labNoteData) => {
    const newNote = {
      id: `lab-note-${Date.now()}`,
      title: labNoteData.title,
      subject: labNoteData.subject,
      department: labNoteData.department || 'Information Technology (AIML)',
      batch: labNoteData.batch || 'All Batches',
      labRoom: labNoteData.labRoom || 'Lab 3-B',
      uploadedBy: currentUser?.name || 'Prof. Divya C',
      date: new Date().toISOString().split('T')[0],
      description: labNoteData.description || 'Laboratory manual and experiment guide.',
      attachment: labNoteData.attachment || null,
    };
    setLabNotes((prev) => [newNote, ...(prev || [])]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `🔬 New Lab Notes: ${newNote.subject}`,
        category: 'note',
        message: `${newNote.uploadedBy} posted practical manual '${newNote.title}' for ${newNote.department}.`,
        timestamp: 'Just now',
        readBy: [],
      },
      ...prev,
    ]);
  };

  const deleteLabNote = (noteId) => {
    setLabNotes((prev) => (prev || []).filter((n) => n.id !== noteId));
  };

  // Task Tracking
  const createTask = (taskData) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      subject: taskData.subject,
      assignedBy: currentUser?.name || 'Prof. Divya C',
      dueDate: taskData.dueDate,
      priority: taskData.priority || 'Medium',
      description: taskData.description,
      attachments: taskData.attachments || [],
      submissions: {},
    };
    setTasks((prev) => [newTask, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `New Task Assigned: ${taskData.title}`,
        category: 'task',
        message: `${taskData.subject} assignment due by ${taskData.dueDate}.`,
        timestamp: 'Just now',
        readBy: [],
      },
      ...prev,
    ]);
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const submitStudentTask = (taskId, studentId, submissionDetails) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            submissions: {
              ...t.submissions,
              [studentId]: {
                status: 'DONE',
                submittedAt: new Date().toISOString(),
                ...submissionDetails,
              },
            },
          };
        }
        return t;
      })
    );
  };

  // Notes Management
  const addNote = (noteData) => {
    const fileName = noteData.attachment?.name || noteData.fileName || `${(noteData.title || 'Notes').replace(/\s+/g, '_')}.pdf`;
    const fileSize = noteData.attachment?.size || noteData.fileSize || '1.8 MB';
    const fileType = noteData.attachment?.type || noteData.fileType || 'application/pdf';

    const newNote = {
      id: `note-${Date.now()}`,
      title: noteData.title,
      subject: noteData.subject,
      uploadedBy: currentUser?.name || 'Prof. Sarita Byagar',
      date: new Date().toISOString().split('T')[0],
      fileName,
      fileSize,
      fileType,
      content: noteData.content || '',
      summary: noteData.summary || noteData.description || '',
      sections: noteData.sections || [],
      keyTakeaways: noteData.keyTakeaways || [],
      attachment: noteData.attachment || {
        name: fileName,
        size: fileSize,
        type: fileType,
        dataUrl: noteData.attachment?.dataUrl || null,
      },
      downloadUrl: '#',
      description: noteData.description || 'Lecture supplementary notes & slides.',
      tags: noteData.tags || [noteData.subject],
    };
    setNotes((prev) => [newNote, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `New Notes Uploaded: ${noteData.subject}`,
        category: 'note',
        message: `${newNote.uploadedBy} posted '${noteData.title}' in Workstore.`,
        timestamp: 'Just now',
        readBy: [],
      },
      ...prev,
    ]);
  };

  const deleteNote = (noteId) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  // Student Reminder Awareness System (Strictly reminder awareness, no attachments, no communication)
  const sendAwarenessMessage = ({ teacherName, subject, message }) => {
    const newMsg = {
      id: `reminder-${Date.now()}`,
      studentId: currentUser?.id || 'stud-1',
      studentName: currentUser?.name || 'Student',
      studentRoll: currentUser?.rollNo || '15',
      studentAvatar: currentUser?.avatar || '',
      teacherName: teacherName || 'Prof. Divya C',
      subject: subject || 'Lecture / Lab Reminder',
      type: 'Reminder',
      message: message.trim(),
      status: 'UNSEEN', // Triggers pop-up on Teacher Portal
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    };

    setAwarenessMessages((prev) => [newMsg, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `🔔 Student Reminder for ${newMsg.teacherName}`,
        category: 'reminder',
        message: `${newMsg.studentName} (Roll ${newMsg.studentRoll}): "${newMsg.message.substring(0, 90)}"`,
        timestamp: 'Just now',
        readBy: [],
      },
      ...prev,
    ]);
  };

  const acknowledgeReminder = (reminderId) => {
    setAwarenessMessages((prev) =>
      prev.map((m) => (m.id === reminderId ? { ...m, status: 'ACKNOWLEDGED' } : m))
    );
  };

  const deleteAwarenessMessage = (messageId) => {
    setAwarenessMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  // Assignments Management
  const createAssignment = (assignData) => {
    const newAssign = {
      id: `assign-${Date.now()}`,
      title: assignData.title,
      subject: assignData.subject || 'Information Technology',
      department: assignData.department || 'Information Technology (AIML)',
      assignedBy: currentUser?.name || 'Prof. Sarita Byagar',
      deadline: assignData.deadline,
      allowLateSubmission: assignData.allowLateSubmission !== undefined ? assignData.allowLateSubmission : true,
      maxMarks: assignData.maxMarks || 50,
      description: assignData.description,
      rubric: assignData.rubric || 'Accuracy (60%), Approach (20%), Neatness (20%)',
      attachment: assignData.attachment || null,
      questions: assignData.questions || assignData.problems || [],
      submissions: [],
    };
    setAssignments((prev) => [newAssign, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Assignment Published: ${assignData.title} (${newAssign.department})`,
        category: 'assignment',
        message: `Due on ${new Date(assignData.deadline).toLocaleString()}. Maximum marks: ${assignData.maxMarks}.`,
        timestamp: 'Just now',
        readBy: [],
      },
      ...prev,
    ]);
  };

  const deleteAssignment = (assignId) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignId));
  };

  const submitAssignment = (assignId, submission) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignId) {
          const filtered = a.submissions.filter((s) => s.studentId !== currentUser.id);
          const now = new Date();
          const isLate = a.deadline ? now > new Date(a.deadline) : false;

          const fileName =
            submission.attachment?.name ||
            submission.file ||
            `${(currentUser.name || 'student').toLowerCase().replace(/\s+/g, '_')}_solution.pdf`;

          const newSub = {
            studentId: currentUser.id,
            studentName: currentUser.name || 'Student',
            rollNo: currentUser.rollNo || 'N/A',
            department: currentUser.department || 'Information Technology (AIML)',
            file: fileName,
            attachment: submission.attachment || {
              name: fileName,
              size: submission.fileSize || '1.2 MB',
              type: submission.fileType || 'application/pdf',
            },
            textAnswer: submission.textAnswer || '',
            submittedAt: now.toISOString(),
            isLate,
            score: null,
            graded: false,
            feedback: '',
          };
          return {
            ...a,
            submissions: [...filtered, newSub],
          };
        }
        return a;
      })
    );
  };

  const gradeAssignment = (assignId, studentId, score, feedback) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignId) {
          return {
            ...a,
            submissions: a.submissions.map((sub) =>
              sub.studentId === studentId
                ? { ...sub, score: Number(score), graded: true, feedback }
                : sub
            ),
          };
        }
        return a;
      })
    );
  };

  // Test & Quiz Management
  const createTest = (testData) => {
    const newTest = {
      id: `test-${Date.now()}`,
      title: testData.title,
      subject: testData.subject,
      department: testData.department || 'Information Technology (AIML)',
      type: testData.type || 'mcq', // 'mcq' | 'coding' | 'typing'
      durationMins: Number(testData.durationMins) || 20,
      totalMarks: Number(testData.totalMarks) || (testData.questions ? testData.questions.length * 5 : 25),
      passingMarks: Number(testData.passingMarks) || 10,
      deadline: testData.deadline || '',
      createdBy: currentUser?.name || 'Prof. Divya C',
      questions: testData.questions || [],
      problems: testData.problems || [],
      passage: testData.passage || '',
      studentResults: {},
    };
    setTests((prev) => [newTest, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `New Assessment Live: ${testData.title}`,
        category: 'test',
        message: `Department: ${newTest.department} • Duration: ${newTest.durationMins} mins.`,
        timestamp: 'Just now',
        readBy: [],
      },
      ...prev,
    ]);
  };

  const deleteTest = (testId) => {
    setTests((prev) => prev.filter((t) => t.id !== testId));
  };

  const updateTestScore = (testId, studentId, { score, feedback }) => {
    setTests((prev) =>
      prev.map((t) => {
        if (t.id === testId) {
          const existing = t.studentResults?.[studentId] || {};
          const newScore = Number(score);
          const total = t.totalMarks || existing.total || 100;
          const percentage = total > 0 ? Math.round((newScore / total) * 100) : 0;
          return {
            ...t,
            studentResults: {
              ...t.studentResults,
              [studentId]: {
                ...existing,
                score: newScore,
                percentage,
                feedback: feedback !== undefined ? feedback : existing.feedback,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }
        return t;
      })
    );
  };

  const submitTestResult = (testId, resultData) => {
    let currentTestTitle = resultData?.testTitle || 'Assessment';
    setTests((prev) =>
      prev.map((t) => {
        if (t.id === testId) {
          currentTestTitle = t.title;
          return {
            ...t,
            studentResults: {
              ...t.studentResults,
              [currentUser?.id]: {
                ...resultData,
                studentId: currentUser?.id,
                studentName: currentUser?.name,
                rollNo: currentUser?.rollNo,
                department: currentUser?.department,
                batch: currentUser?.batch,
                completedAt: new Date().toISOString(),
              },
            },
          };
        }
        return t;
      })
    );

    // Record at Teacher Bot History Tracker per Department and Roll No
    if (saveBotHistoryItem && currentUser) {
      saveBotHistoryItem({
        panel: resultData?.code ? 'Coding Test Submissions' : 'Test Submissions',
        title: `${currentUser.name} (Roll ${currentUser.rollNo}) • ${currentTestTitle}`,
        details: `Dept: ${currentUser.department || 'AIML'} • Roll: ${currentUser.rollNo} • Score: ${resultData?.score}/${resultData?.total} (${resultData?.percentage}%)`,
        department: currentUser.department || 'Information Technology (AIML)',
        rollNo: currentUser.rollNo || '15',
        studentName: currentUser.name,
        data: {
          studentId: currentUser.id,
          studentName: currentUser.name,
          rollNo: currentUser.rollNo,
          department: currentUser.department,
          testId,
          testTitle: currentTestTitle,
          code: resultData?.code || '',
          terminalOutput: resultData?.terminalOutput || '',
          score: resultData?.score,
          total: resultData?.total,
          percentage: resultData?.percentage,
          submittedAt: new Date().toLocaleString(),
        },
      });
    }
  };

  // ChitChat - WhatsApp Mechanics
  const sendMessage = (chatId, text, attachment = null) => {
    if ((!text || !text.trim()) && !attachment) return;
    const now = Date.now();
    const newMsg = {
      id: `msg-${now}`,
      senderId: currentUser?.id || 'anonymous',
      senderName: currentUser?.name || 'User',
      senderEmail: currentUser?.email || '',
      text: text ? text.trim() : '',
      attachment: attachment || null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: now,
      status: 'delivered',
      readBy: [currentUser?.id],
      deletedFor: [],
      isDeletedForEveryone: false,
      reactions: {},
    };

    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        // Clean disappearing messages if active
        let currentMsgs = c.messages || [];
        if (c.disappearingTimer === '24h') {
          const cutoff = now - 24 * 60 * 60 * 1000;
          currentMsgs = currentMsgs.filter((m) => !m.createdAt || m.createdAt > cutoff);
        } else if (c.disappearingTimer === '3d') {
          const cutoff = now - 3 * 24 * 60 * 60 * 1000;
          currentMsgs = currentMsgs.filter((m) => !m.createdAt || m.createdAt > cutoff);
        }
        return {
          ...c,
          messages: [...currentMsgs, newMsg],
        };
      })
    );
  };

  // Mark all unread messages in chat as read by current user
  const markChatAsRead = (chatId) => {
    const uid = currentUser?.id;
    if (!uid) return;
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        let changed = false;
        const nextMsgs = (c.messages || []).map((m) => {
          if (m.senderId !== uid && (!m.readBy || !m.readBy.includes(uid))) {
            changed = true;
            return {
              ...m,
              status: 'read',
              readBy: [...(m.readBy || []), uid],
            };
          }
          return m;
        });
        return changed ? { ...c, messages: nextMsgs } : c;
      })
    );
  };

  // WhatsApp "Delete for me" (Message is hidden only from current user's screen)
  const deleteMessageForMe = (chatId, messageId) => {
    const uid = currentUser?.id;
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          messages: (c.messages || []).map((m) => {
            if (m.id !== messageId) return m;
            const currentDeleted = m.deletedFor || [];
            return {
              ...m,
              deletedFor: currentDeleted.includes(uid) ? currentDeleted : [...currentDeleted, uid],
            };
          }),
        };
      })
    );
  };

  // WhatsApp "Delete for everyone" (Replaces message with "🚫 This message was deleted" for both sides)
  const deleteMessageForEveryone = (chatId, messageId) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          messages: (c.messages || []).map((m) => {
            if (m.id !== messageId) return m;
            return {
              ...m,
              isDeletedForEveryone: true,
              text: '🚫 This message was deleted',
              attachment: null,
            };
          }),
        };
      })
    );
  };

  // Bulk delete selected messages
  const deleteMultipleMessages = (chatId, messageIds = [], forEveryone = false) => {
    const uid = currentUser?.id;
    const idSet = new Set(messageIds);
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          messages: (c.messages || []).map((m) => {
            if (!idSet.has(m.id)) return m;
            if (forEveryone) {
              return {
                ...m,
                isDeletedForEveryone: true,
                text: '🚫 This message was deleted',
                attachment: null,
              };
            }
            const currentDeleted = m.deletedFor || [];
            return {
              ...m,
              deletedFor: currentDeleted.includes(uid) ? currentDeleted : [...currentDeleted, uid],
            };
          }),
        };
      })
    );
  };

  // Clear full chat history
  const clearChatMessages = (chatId) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, messages: [] } : c))
    );
  };

  // Delete an entire chat or group from list
  const deleteChat = (chatId) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
  };

  // Accept a pending chat request
  const acceptChatRequest = (chatId) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const acceptNotice = {
          id: `m-accept-${Date.now()}`,
          senderId: 'system',
          senderName: 'System',
          text: `🎉 Chat request accepted. You can now chat securely!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: Date.now(),
          status: 'read',
        };
        return {
          ...c,
          isAccepted: true,
          messages: [...(c.messages || []), acceptNotice],
        };
      })
    );
  };

  // Decline/Reject a chat request
  const declineChatRequest = (chatId) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
  };

  // Disappearing messages timer (Teacher controlled: 'off' | '24h' | '3d')
  const setChatDisappearingTimer = (chatId, timer = 'off') => {
    const now = Date.now();
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const label = timer === 'off' ? 'turned off' : timer === '24h' ? 'set to 24 hours' : 'set to 3 days';
        const timerNotice = {
          id: `m-timer-${now}`,
          senderId: 'system',
          senderName: 'System',
          text: `⏳ Disappearing messages was ${label}. New messages will expire accordingly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: now,
          status: 'read',
        };
        return {
          ...c,
          disappearingTimer: timer,
          messages: [...(c.messages || []), timerNotice],
        };
      })
    );
  };

  // Group Admin toggling (Make Admin / Dismiss as Admin)
  const toggleGroupAdmin = (chatId, memberEmailOrId) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId || !c.isGroup) return c;
        const currentAdmins = c.admins || [];
        const isAlreadyAdmin = currentAdmins.includes(memberEmailOrId);
        const nextAdmins = isAlreadyAdmin
          ? currentAdmins.filter((a) => a !== memberEmailOrId)
          : [...currentAdmins, memberEmailOrId];
        return {
          ...c,
          admins: nextAdmins.length > 0 ? nextAdmins : currentAdmins,
        };
      })
    );
  };

  // Remove member from group
  const removeGroupMember = (chatId, memberEmailOrId) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId || !c.isGroup) return c;
        return {
          ...c,
          members: (c.members || []).filter((m) => m !== memberEmailOrId),
          memberEmails: (c.memberEmails || []).filter((e) => e !== memberEmailOrId),
          admins: (c.admins || []).filter((a) => a !== memberEmailOrId),
        };
      })
    );
  };

  // Add / Toggle emoji reaction
  const addMessageReaction = (chatId, messageId, emoji) => {
    const uid = currentUser?.id;
    if (!uid) return;
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          messages: (c.messages || []).map((m) => {
            if (m.id !== messageId) return m;
            const currentReactions = m.reactions || {};
            const users = currentReactions[emoji] || [];
            const hasReacted = users.includes(uid);
            const nextUsers = hasReacted ? users.filter((u) => u !== uid) : [...users, uid];

            const nextReactions = { ...currentReactions };
            if (nextUsers.length > 0) {
              nextReactions[emoji] = nextUsers;
            } else {
              delete nextReactions[emoji];
            }

            return {
              ...m,
              reactions: nextReactions,
            };
          }),
        };
      })
    );
  };

  // Start or open a direct chat by registered email (with Chat Request / Approval workflow)
  const createDirectChat = ({ contactId, contactName, contactEmail, avatar, isTeacher, department, initialGreeting }) => {
    const targetEmail = (contactEmail || '').toLowerCase().trim();
    const existing = chats.find(
      (c) =>
        !c.isGroup &&
        ((targetEmail && c.email && c.email.toLowerCase() === targetEmail) ||
          (contactId && c.members?.includes(contactId)) ||
          (c.name && contactName && c.name.toLowerCase() === contactName.toLowerCase()))
    );
    if (existing) {
      return existing.id;
    }

    const resolvedEmail = targetEmail || `${(contactName || 'user').toLowerCase().replace(/\s+/g, '.')}@indira.edu`;
    const newChat = {
      id: `chat-dm-${Date.now()}`,
      name: contactName || resolvedEmail.split('@')[0],
      email: resolvedEmail,
      isGroup: false,
      isTeacherDirect: Boolean(isTeacher),
      department: department || 'Information Technology',
      members: [currentUser?.id, contactId || resolvedEmail].filter(Boolean),
      memberEmails: [currentUser?.email, resolvedEmail].filter(Boolean),
      avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(resolvedEmail)}`,
      status: 'online',
      isAccepted: false, // Requires recipient to accept to start chatting
      requestedBy: currentUser?.id,
      requestedByEmail: currentUser?.email,
      requestedByName: currentUser?.name || 'Faculty',
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      disappearingTimer: 'off',
      messages: [
        {
          id: `m-init-${Date.now()}`,
          senderId: currentUser?.id,
          senderName: currentUser?.name || 'User',
          senderEmail: currentUser?.email,
          text: initialGreeting || `👋 Hello! Chat request sent. Once accepted, we can chat securely on ChitChat.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: Date.now(),
          status: 'sent',
          readBy: [currentUser?.id],
        },
      ],
    };

    setChats((prev) => [newChat, ...prev]);
    return newChat.id;
  };

  // Create group chat with member emails & WhatsApp-grade admin selectors
  const createGroupChat = ({ name, description = '', memberEmails = [], onlyAdminsCanPost = false }) => {
    const creatorEmail = currentUser?.email || 'faculty@indira.edu';
    const allMembers = Array.from(new Set([creatorEmail, ...memberEmails.filter(Boolean)]));
    const newChat = {
      id: `chat-group-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      isGroup: true,
      onlyAdminsCanPost: Boolean(onlyAdminsCanPost),
      admins: [currentUser?.id, creatorEmail],
      members: [currentUser?.id, ...allMembers],
      memberEmails: allMembers,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
      disappearingTimer: 'off',
      isAccepted: true,
      messages: [
        {
          id: `m-init-${Date.now()}`,
          senderId: currentUser?.id,
          senderName: currentUser?.name || 'Faculty',
          text: `🎉 Group "${name}" created by ${currentUser?.name || 'Faculty'}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: Date.now(),
          status: 'read',
        },
      ],
    };
    setChats((prev) => [newChat, ...prev]);
    return newChat.id;
  };

  // ZOOM-STYLE LIVE MEETING & WAITING ROOM
  const startHostMeeting = ({ roomId = 'EDU-303-ZOOM', title, department } = {}) => {
    setActiveMeeting((prev) => ({
      ...prev,
      roomId: roomId || prev?.roomId || 'EDU-303-ZOOM',
      title: title || prev?.title || 'Classroom 303 • Live Virtual Lecture Studio',
      department: department || prev?.department || 'Information Technology (AIML)',
      isLive: true,
      hostName: currentUser?.name || 'Prof. Divya C',
      hostId: currentUser?.id || 'teach-1',
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
  };

  const endHostMeeting = () => {
    setActiveMeeting((prev) => ({
      ...prev,
      isLive: false,
      waitingRoom: [],
    }));
  };

  const requestJoinMeeting = ({ studentId, studentName, rollNo, department, avatar } = {}) => {
    const sid = studentId || currentUser?.id;
    const sname = studentName || currentUser?.name || 'Student';
    const sroll = rollNo || currentUser?.rollNo || 'N/A';
    const sdept = department || currentUser?.department || 'Information Technology (AIML)';
    const savatar = avatar || currentUser?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(sname)}`;

    setActiveMeeting((prev) => {
      // Check if already in admitted
      if (prev.admittedParticipants?.some((p) => p.studentId === sid)) {
        return prev;
      }
      // Check if already waiting
      if (prev.waitingRoom?.some((r) => r.studentId === sid)) {
        return prev;
      }

      const newReq = {
        id: `req-${Date.now()}`,
        studentId: sid,
        studentName: sname,
        rollNo: sroll,
        department: sdept,
        avatar: savatar,
        requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      return {
        ...prev,
        waitingRoom: [...(prev.waitingRoom || []), newReq],
      };
    });
  };

  const cancelJoinRequest = (studentId) => {
    const sid = studentId || currentUser?.id;
    setActiveMeeting((prev) => ({
      ...prev,
      waitingRoom: (prev.waitingRoom || []).filter((r) => r.studentId !== sid),
    }));
  };

  const admitStudentToMeeting = (studentId) => {
    setActiveMeeting((prev) => {
      const studentReq = (prev.waitingRoom || []).find((r) => r.studentId === studentId);
      const newWaiting = (prev.waitingRoom || []).filter((r) => r.studentId !== studentId);

      const newParticipant = studentReq
        ? {
            id: `part-${Date.now()}-${studentId}`,
            studentId: studentReq.studentId,
            studentName: studentReq.studentName,
            rollNo: studentReq.rollNo,
            department: studentReq.department,
            avatar: studentReq.avatar,
            joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMuted: true,
            isVideoOn: false,
            hasHandRaised: false,
          }
        : {
            id: `part-${Date.now()}-${studentId}`,
            studentId,
            studentName: 'Admitted Student',
            rollNo: 'N/A',
            joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMuted: true,
            isVideoOn: false,
            hasHandRaised: false,
          };

      return {
        ...prev,
        waitingRoom: newWaiting,
        admittedParticipants: [...(prev.admittedParticipants || []), newParticipant],
      };
    });
  };

  const denyStudentFromMeeting = (studentId) => {
    setActiveMeeting((prev) => ({
      ...prev,
      waitingRoom: (prev.waitingRoom || []).filter((r) => r.studentId !== studentId),
    }));
  };

  const admitAllWaitingStudents = () => {
    setActiveMeeting((prev) => {
      const newlyAdmitted = (prev.waitingRoom || []).map((r) => ({
        id: `part-${Date.now()}-${r.studentId}`,
        studentId: r.studentId,
        studentName: r.studentName,
        rollNo: r.rollNo,
        department: r.department,
        avatar: r.avatar,
        joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMuted: true,
        isVideoOn: false,
        hasHandRaised: false,
      }));

      return {
        ...prev,
        waitingRoom: [],
        admittedParticipants: [...(prev.admittedParticipants || []), ...newlyAdmitted],
      };
    });
  };

  const leaveMeeting = (studentId) => {
    const sid = studentId || currentUser?.id;
    setActiveMeeting((prev) => ({
      ...prev,
      admittedParticipants: (prev.admittedParticipants || []).filter((p) => p.studentId !== sid),
    }));
  };

  const toggleMeetingStudentMute = (studentId) => {
    setActiveMeeting((prev) => ({
      ...prev,
      admittedParticipants: (prev.admittedParticipants || []).map((p) =>
        p.studentId === studentId ? { ...p, isMuted: !p.isMuted } : p
      ),
    }));
  };

  const toggleStudentHandRaise = (studentId) => {
    const sid = studentId || currentUser?.id;
    setActiveMeeting((prev) => ({
      ...prev,
      admittedParticipants: (prev.admittedParticipants || []).map((p) =>
        p.studentId === sid ? { ...p, hasHandRaised: !p.hasHandRaised } : p
      ),
    }));
  };

  const updateParticipantMeetingState = (participantId, updates = {}) => {
    const pid = participantId || currentUser?.id;
    setActiveMeeting((prev) => ({
      ...prev,
      admittedParticipants: (prev.admittedParticipants || []).map((p) => {
        if (p.studentId === pid || p.id === pid) {
          return { ...p, ...updates };
        }
        return p;
      }),
    }));
  };

  const updateHostMeetingState = (updates = {}) => {
    setActiveMeeting((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const setMeetingScreenSharer = (sharer = null) => {
    setActiveMeeting((prev) => ({
      ...prev,
      screenSharer: sharer,
    }));
  };

  const toggleAllowStudentScreenShare = () => {
    setActiveMeeting((prev) => ({
      ...prev,
      allowStudentScreenShare: prev.allowStudentScreenShare === false ? true : false,
    }));
  };

  const sendMeetingReaction = ({ senderId, senderName, emoji } = {}) => {
    const sid = senderId || currentUser?.id;
    const sname = senderName || currentUser?.name || 'Participant';
    setActiveMeeting((prev) => ({
      ...prev,
      lastReaction: { senderId: sid, senderName: sname, emoji, timestamp: Date.now() },
      admittedParticipants: (prev.admittedParticipants || []).map((p) =>
        (p.studentId === sid || p.id === sid) ? { ...p, reaction: emoji, reactionTime: Date.now() } : p
      ),
    }));
  };

  const sendMeetingMessage = ({ senderId, senderName, text, isTeacher } = {}) => {
    if (!text || !text.trim()) return;
    const newMsg = {
      id: `m-chat-${Date.now()}`,
      senderId: senderId || currentUser?.id,
      senderName: senderName || currentUser?.name || 'Participant',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isTeacher: isTeacher ?? (userRole === 'teacher'),
    };
    setActiveMeeting((prev) => ({
      ...prev,
      messages: [...(prev.messages || []), newMsg],
    }));
  };

  // Direct join with meeting link or room code (Instant Admission)
  const directJoinMeeting = ({ studentId, studentName, rollNo, department, avatar } = {}) => {
    const sid = studentId || currentUser?.id;
    const sname = studentName || currentUser?.name || 'Student';
    const sroll = rollNo || currentUser?.rollNo || 'N/A';
    const sdept = department || currentUser?.department || 'Information Technology (AIML)';
    const savatar = avatar || currentUser?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(sname)}`;

    setActiveMeeting((prev) => {
      if (prev.admittedParticipants?.some((p) => p.studentId === sid)) {
        return prev;
      }
      const newPart = {
        id: `part-${Date.now()}-${sid}`,
        studentId: sid,
        name: sname,
        rollNo: sroll,
        department: sdept,
        avatar: savatar,
        isMuted: false,
        hasHandRaised: false,
        joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      return {
        ...prev,
        waitingRoom: (prev.waitingRoom || []).filter((r) => r.studentId !== sid),
        admittedParticipants: [...(prev.admittedParticipants || []), newPart],
      };
    });
  };

  // Open meeting directly from notification, ChitChat, or shared link
  const openMeetingDirectly = (roomId = 'EDU-303-ZOOM') => {
    setActiveMode('workstore');
    setWorkstoreTargetTab('meeting');
  };

  // Broadcast meeting invite link to all students, ChitChat, and Notifications
  const broadcastMeetingInvite = ({ roomId = 'EDU-303-ZOOM', title = 'Classroom 303 • Live Virtual Lecture Studio', department = 'Information Technology (AIML)' } = {}) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const meetingLink = `${origin}/?meeting=${roomId}`;

    // 1. Ensure meeting is live
    setActiveMeeting((prev) => ({
      ...prev,
      roomId,
      title,
      department,
      isLive: true,
      hostName: currentUser?.name || 'Prof. Divya C',
      hostId: currentUser?.id || 'teach-1',
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    // 2. Add Campus Notification
    const notif = {
      id: `notif-meet-${Date.now()}`,
      title: `🔴 LIVE Virtual Lecture: ${title}`,
      message: `${currentUser?.name || 'Prof. Divya C'} has broadcasted the live lecture link. Click to join the video session!`,
      type: 'meeting',
      timestamp: 'Just now',
      roomId,
      link: meetingLink,
    };
    setNotifications((prev) => [notif, ...prev]);

    // 3. Post to ChitChat
    const meetingChitChatMsg = {
      id: `msg-meet-${Date.now()}`,
      senderId: currentUser?.id || 'teach-1',
      senderName: `${currentUser?.name || 'Prof. Divya C'} (Faculty Host)`,
      text: `📹 LIVE VIRTUAL LECTURE INVITATION\n\n📌 Session: ${title}\n🏛️ Dept: ${department}\n👤 Faculty: ${currentUser?.name || 'Prof. Divya C'}\n🔑 Room ID: ${roomId}\n\n🔗 Meeting Link: ${meetingLink}\n\nClick "Join Live Meeting" below to connect with audio, video, and slides!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
      isMeetingInvite: true,
      meetingRoomId: roomId,
      meetingLink,
    };

    setChats((prev) =>
      prev.map((c) => ({
        ...c,
        messages: [...(c.messages || []), meetingChitChatMsg],
      }))
    );

    return { success: true, meetingLink };
  };

  // Notification Management (Select Delete, Delete All, Delete 24 Hours)
  const deleteNotification = (notifId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  const deleteSelectedNotifications = (notifIds = []) => {
    const idSet = new Set(notifIds);
    setNotifications((prev) => prev.filter((n) => !idSet.has(n.id)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const deleteNotifications24Hours = (mode = 'older') => {
    const isOlderThan24h = (n) => {
      const timeStr = (n.timestamp || '').toLowerCase();
      if (
        timeStr.includes('yesterday') ||
        timeStr.includes('day') ||
        timeStr.includes('days') ||
        timeStr.includes('2 days')
      ) {
        return true;
      }
      const match = n.id?.match(/notif-(\d{10,14})/);
      if (match) {
        const time = Number(match[1]);
        if (Date.now() - time > 24 * 60 * 60 * 1000) return true;
      }
      if (n.createdAt) {
        const time = new Date(n.createdAt).getTime();
        if (!isNaN(time) && Date.now() - time > 24 * 60 * 60 * 1000) return true;
      }
      return false;
    };

    setNotifications((prev) =>
      prev.filter((n) => {
        const older = isOlderThan24h(n);
        return mode === 'older' ? !older : older;
      })
    );
  };

  // Social Freak (X / Twitter System for Students & Campus)
  const createPost = (content, tags = [], attachments = []) => {
    if (!content?.trim() && (!attachments || attachments.length === 0)) return;
    const handle =
      currentUser?.handle ||
      `@${(currentUser?.name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const newPost = {
      id: `post-${Date.now()}`,
      authorId: currentUser?.id || 'stud-1',
      authorName: currentUser?.name || 'Student',
      authorHandle: handle,
      authorRole:
        userRole === 'teacher'
          ? 'Faculty • SOIT'
          : `Student • Roll ${currentUser?.rollNo || '15'}`,
      authorAvatar:
        currentUser?.avatar ||
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Indira',
      department: currentUser?.department || 'Information Technology (AIML)',
      content: content || '',
      tags: tags || [],
      attachments: attachments || [],
      likes: 0,
      likedBy: [],
      reposts: 0,
      repostedBy: [],
      comments: 0,
      commentsList: [],
      timestamp: 'Just now',
      liked: false,
      reposted: false,
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const deletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const toggleLikePost = (postId) => {
    if (!currentUser) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const userLiked = p.likedBy?.includes(currentUser.id) || p.liked;
          const updatedLikedBy = userLiked
            ? (p.likedBy || []).filter((id) => id !== currentUser.id)
            : [...(p.likedBy || []), currentUser.id];
          const isNowLiked = !userLiked;
          return {
            ...p,
            liked: isNowLiked,
            likedBy: updatedLikedBy,
            likes: isNowLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
          };
        }
        return p;
      })
    );
  };

  const toggleRepost = (postId) => {
    if (!currentUser) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const userReposted = p.repostedBy?.includes(currentUser.id) || p.reposted;
          const updatedRepostedBy = userReposted
            ? (p.repostedBy || []).filter((id) => id !== currentUser.id)
            : [...(p.repostedBy || []), currentUser.id];
          const isNowReposted = !userReposted;
          return {
            ...p,
            reposted: isNowReposted,
            repostedBy: updatedRepostedBy,
            reposts: isNowReposted
              ? (p.reposts || 0) + 1
              : Math.max(0, (p.reposts || 0) - 1),
          };
        }
        return p;
      })
    );
  };

  const addCommentToPost = (postId, commentText) => {
    if (!commentText?.trim() || !currentUser) return;
    const handle =
      currentUser?.handle ||
      `@${(currentUser?.name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const newComment = {
      id: `comm-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorHandle: handle,
      authorAvatar: currentUser.avatar,
      text: commentText.trim(),
      timestamp: 'Just now',
    };
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const currentList = p.commentsList || [];
          return {
            ...p,
            comments: (p.comments || 0) + 1,
            commentsList: [...currentList, newComment],
          };
        }
        return p;
      })
    );
  };

  const sendConnectionRequest = (targetStudent) => {
    if (!targetStudent || !currentUser) return;
    const handle =
      currentUser?.handle ||
      `@${(currentUser?.name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    setSocialConnections((prev) => {
      const targetConns = prev[targetStudent.id] || { following: [], followers: [], requests: [] };
      if (targetConns.requests?.some((r) => r.fromUserId === currentUser.id)) {
        return prev;
      }
      const newReq = {
        fromUserId: currentUser.id,
        fromName: currentUser.name,
        fromHandle: handle,
        fromAvatar: currentUser.avatar,
        fromDepartment: currentUser.department || 'Information Technology (AIML)',
        timestamp: 'Just now',
      };
      return {
        ...prev,
        [targetStudent.id]: {
          ...targetConns,
          requests: [newReq, ...(targetConns.requests || [])],
        },
      };
    });
  };

  const acceptConnectionRequest = (requesterId) => {
    if (!currentUser || !requesterId) return;
    setSocialConnections((prev) => {
      const myConns = prev[currentUser.id] || { following: [], followers: [], requests: [] };
      const theirConns = prev[requesterId] || { following: [], followers: [], requests: [] };

      return {
        ...prev,
        [currentUser.id]: {
          ...myConns,
          followers: Array.from(new Set([...(myConns.followers || []), requesterId])),
          following: Array.from(new Set([...(myConns.following || []), requesterId])),
          requests: (myConns.requests || []).filter((r) => r.fromUserId !== requesterId),
        },
        [requesterId]: {
          ...theirConns,
          followers: Array.from(new Set([...(theirConns.followers || []), currentUser.id])),
          following: Array.from(new Set([...(theirConns.following || []), currentUser.id])),
        },
      };
    });
  };

  const rejectConnectionRequest = (requesterId) => {
    if (!currentUser || !requesterId) return;
    setSocialConnections((prev) => {
      const myConns = prev[currentUser.id] || { following: [], followers: [], requests: [] };
      return {
        ...prev,
        [currentUser.id]: {
          ...myConns,
          requests: (myConns.requests || []).filter((r) => r.fromUserId !== requesterId),
        },
      };
    });
  };

  const toggleFollowUser = (targetUserId) => {
    if (!currentUser || !targetUserId || currentUser.id === targetUserId) return;
    setSocialConnections((prev) => {
      const myConns = prev[currentUser.id] || { following: [], followers: [], requests: [] };
      const theirConns = prev[targetUserId] || { following: [], followers: [], requests: [] };
      const isFollowing = (myConns.following || []).includes(targetUserId);

      const updatedMyFollowing = isFollowing
        ? myConns.following.filter((id) => id !== targetUserId)
        : [...(myConns.following || []), targetUserId];

      const updatedTheirFollowers = isFollowing
        ? theirConns.followers.filter((id) => id !== currentUser.id)
        : [...(theirConns.followers || []), currentUser.id];

      return {
        ...prev,
        [currentUser.id]: { ...myConns, following: updatedMyFollowing },
        [targetUserId]: { ...theirConns, followers: updatedTheirFollowers },
      };
    });
  };

  const updateStudentProfile = (updates) => {
    if (!currentUser) return;
    setCurrentUser((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('indira_ums_currentUser', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist updated user to localStorage', e);
      }
      return updated;
    });

    setStudents((prev) =>
      prev.map((s) => (s.id === currentUser.id ? { ...s, ...updates } : s))
    );
    setTeachers((prev) =>
      prev.map((t) => (t.id === currentUser.id ? { ...t, ...updates } : t))
    );
  };

  const updateUserProfile = updateStudentProfile;

  // Emergency Document Drive & Digital Vault
  const uploadEmergencyDoc = (doc) => {
    const newDoc = {
      id: doc.id || `doc-${Date.now()}`,
      userId: currentUser?.id || 'anon',
      title: doc.title,
      category: doc.category || 'Identity Proof',
      fileSize: doc.fileSize || '1.2 MB',
      fileData: doc.fileData || null,
      fileName: doc.fileName || `${doc.title}.pdf`,
      fileType: doc.fileType || 'application/pdf',
      uploadedAt: doc.uploadedAt || new Date().toISOString().split('T')[0],
      verified: doc.verified ?? true,
      issuer: doc.issuer || 'Indira University Registrar',
    };
    setEmergencyDocs((prev) => [newDoc, ...prev]);
    return newDoc;
  };

  const deleteEmergencyDoc = (docId) => {
    setEmergencyDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  // BotMarket History
  const saveBotHistoryItem = (item) => {
    const record = {
      id: `bot-hist-${Date.now()}`,
      timestamp: new Date().toISOString(),
      creator: currentUser?.name || 'Prof. Divya C',
      ...item,
    };
    setBotHistory((prev) => [record, ...prev]);
  };

  const deleteBotHistoryItem = (id) => {
    setBotHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearBotHistory = (panelType) => {
    if (!panelType || panelType === 'all') {
      setBotHistory([]);
    } else {
      setBotHistory((prev) => prev.filter((item) => item.panel !== panelType));
    }
  };

  return (
    <CollegeContext.Provider
      value={{
        // Auth & Navigation
        currentUser,
        userRole,
        activeMode,
        setActiveMode,
        switchRole,
        login,
        logout,
        registerStudent,
        registerTeacher,
        approveStudent,
        rejectStudent,
        instantApproveAndLoginStudent,

        // Data collections
        students,
        teachers,
        timetable,
        attendance,
        tasks,
        notifications,
        notes,
        assignments,
        tests,
        chats,
        posts,
        emergencyDocs,
        awarenessMessages,
        botHistory,
        practicalAttendance,
        departmentBatches,
        labNotes,

        // Lecture Tracker & Clock simulation
        simulatedTime,
        setSimulatedTime,
        getIndianTime,

        // Operations
        updateTimetableSlot,
        addTimetableSlot,
        removeTimetableSlot,
        resetTimetableToDefault,
        clearTimetable,
        importTimetable,
        recordAttendance,
        updateAttendanceRecord,
        deleteAttendanceRecord,
        deleteSelectedAttendanceRecords,
        clearAllAttendanceHistory,
        getStudentAttendanceStats,
        recordPracticalAttendance,
        updatePracticalAttendanceRecord,
        deletePracticalAttendanceRecord,
        getStudentPracticalAttendanceStats,
        updateDepartmentBatchRange,
        createDepartmentBatch,
        deleteDepartmentBatch,
        addLabNote,
        deleteLabNote,
        createTask,
        deleteTask,
        submitStudentTask,
        addNote,
        deleteNote,
        sendAwarenessMessage,
        acknowledgeReminder,
        deleteAwarenessMessage,
        createAssignment,
        deleteAssignment,
        submitAssignment,
        gradeAssignment,
        createTest,
        deleteTest,
        submitTestResult,
        updateTestScore,
        sendMessage,
        markChatAsRead,
        deleteMessageForMe,
        deleteMessageForEveryone,
        deleteMultipleMessages,
        clearChatMessages,
        deleteChat,
        acceptChatRequest,
        declineChatRequest,
        setChatDisappearingTimer,
        toggleGroupAdmin,
        removeGroupMember,
        addMessageReaction,
        createDirectChat,
        createGroupChat,
        createPost,
        deletePost,
        toggleLikePost,
        toggleRepost,
        addCommentToPost,
        socialConnections,
        sendConnectionRequest,
        acceptConnectionRequest,
        rejectConnectionRequest,
        toggleFollowUser,
        updateStudentProfile,
        updateUserProfile,
        deleteNotification,
        deleteSelectedNotifications,
        clearAllNotifications,
        deleteNotifications24Hours,
        uploadEmergencyDoc,
        deleteEmergencyDoc,
        saveBotHistoryItem,
        deleteBotHistoryItem,
        clearBotHistory,

        // Meeting state & Zoom waiting room mechanics
        activeMeeting,
        startHostMeeting,
        endHostMeeting,
        requestJoinMeeting,
        directJoinMeeting,
        openMeetingDirectly,
        broadcastMeetingInvite,
        workstoreTargetTab,
        setWorkstoreTargetTab,
        cancelJoinRequest,
        admitStudentToMeeting,
        denyStudentFromMeeting,
        admitAllWaitingStudents,
        leaveMeeting,
        toggleMeetingStudentMute,
        toggleStudentHandRaise,
        updateParticipantMeetingState,
        updateHostMeetingState,
        setMeetingScreenSharer,
        toggleAllowStudentScreenShare,
        sendMeetingReaction,
        sendMeetingMessage,
      }}
    >
      {children}
    </CollegeContext.Provider>
  );
}

export function useCollege() {
  const context = useContext(CollegeContext);
  if (!context) {
    throw new Error('useCollege must be used within a CollegeProvider');
  }
  return context;
}
