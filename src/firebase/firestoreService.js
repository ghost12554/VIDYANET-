import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from './firebaseConfig';

// Generic real-time collection listener with local fallback safety
export function subscribeToCollection(collectionName, onData, onError) {
  try {
    if (!db) return () => {};
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        onData(items);
      },
      (err) => {
        console.warn(`Firestore subscription notice for [${collectionName}]:`, err.message);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn(`Firestore setup notice for [${collectionName}]:`, err.message);
    return () => {};
  }
}

// Save document with explicit ID
export async function setFirestoreDoc(collectionName, docId, data) {
  try {
    if (!db) return { success: false, error: 'Database not initialized' };
    const docRef = doc(db, collectionName, String(docId));
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    return { success: true };
  } catch (err) {
    console.warn(`Error writing to ${collectionName}:`, err);
    return { success: false, error: err.message };
  }
}

// Fetch all documents in a collection once
export async function fetchFirestoreCollection(collectionName) {
  try {
    if (!db) return [];
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn(`Error fetching ${collectionName}:`, err);
    return [];
  }
}

// Fetch single document
export async function fetchFirestoreDoc(collectionName, docId) {
  try {
    if (!db) return null;
    const docRef = doc(db, collectionName, String(docId));
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.warn(`Error fetching doc ${collectionName}/${docId}:`, err);
    return null;
  }
}

// Add document with auto ID
export async function addFirestoreDoc(collectionName, data) {
  try {
    if (!db) return { success: false, error: 'Database not initialized' };
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (err) {
    console.warn(`Error adding to ${collectionName}:`, err);
    return { success: false, error: err.message };
  }
}

// Delete document
export async function deleteFirestoreDoc(collectionName, docId) {
  try {
    if (!db) return { success: false, error: 'Database not initialized' };
    const docRef = doc(db, collectionName, String(docId));
    await deleteDoc(docRef);
    return { success: true };
  } catch (err) {
    console.warn(`Error deleting from ${collectionName}:`, err);
    return { success: false, error: err.message };
  }
}

// Firebase Auth: Student Registration (sets status: PENDING)
export async function registerStudentFirebase({ name, rollNo, department, email, password }) {
  try {
    if (!auth || !db) return { success: false, error: 'Firebase not configured' };
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const rollInt = parseInt(rollNo, 10) || 1;
    let batch = 'A';
    if (rollInt >= 32 && rollInt <= 62) batch = 'B';
    if (rollInt >= 63) batch = 'C';

    const studentProfile = {
      id: uid,
      uid,
      name,
      rollNo: String(rollNo),
      batch,
      department: department || 'Information Technology (AIML)',
      email,
      role: 'student',
      status: 'PENDING', // Awaiting teacher approval!
      registeredAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      semester: 'Semester III',
      academicYear: '2026-2027',
      classroom: '303',
    };

    // Save to Firestore 'users' collection
    await setDoc(doc(db, 'users', uid), studentProfile);

    // Also add to 'requests' collection for teacher queue
    await setDoc(doc(db, 'requests', uid), studentProfile);

    return { success: true, student: studentProfile };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Firebase Auth: Teacher Registration (sets status: APPROVED)
export async function registerTeacherFirebase({ name, facultyNo, department, email, password, designation }) {
  try {
    if (!auth || !db) return { success: false, error: 'Firebase not configured' };
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const teacherProfile = {
      id: uid,
      uid,
      name: name.startsWith('Prof.') || name.startsWith('Dr.') ? name : `Prof. ${name}`,
      facultyNo: facultyNo || `FAC-${Math.floor(100 + Math.random() * 900)}`,
      department: department || 'Information Technology',
      email,
      role: 'teacher',
      status: 'APPROVED',
      designation: designation || 'Assistant Professor',
      subjects: ['Information Technology (AIML)'],
      cabin: 'Room 303, Faculty Block',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    };

    await setDoc(doc(db, 'users', uid), teacherProfile);
    return { success: true, teacher: teacherProfile };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Firebase Auth: Login with approval check
export async function loginFirebase(email, password, role) {
  try {
    if (!auth || !db) return { success: false, error: 'Firebase not configured' };
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Fetch user profile from Firestore
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      return { success: false, error: 'User profile not found in database.' };
    }

    const userData = userSnap.data();

    if (userData.role !== role) {
      return {
        success: false,
        error: `This account is registered as a ${userData.role}, not as a ${role}. Please toggle role tab.`,
      };
    }

    if (userData.role === 'student' && userData.status === 'PENDING') {
      return {
        success: false,
        isPending: true,
        error: 'Your admission request is awaiting Teacher Portal approval. Please wait for faculty to accept.',
      };
    }

    return { success: true, user: userData };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Ensure user email is reliably recorded in Firebase Auth and Firestore Console
export async function recordUserInFirebase({ email, password, role, name, extraData = {} }) {
  try {
    if (!auth && !db) return { success: false, error: 'Firebase not configured' };

    let uid = null;
    let cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      cleanEmail = `${cleanEmail}@indira.edu`;
    }
    const cleanPassword = String(password || 'password123').trim();
    // Firebase auth requires at least 6 characters
    const authPassword = cleanPassword.length >= 6 ? cleanPassword : cleanPassword.padEnd(6, '0');

    // 1. Record user in Firebase Authentication (Users table in Firebase Console)
    if (auth && cleanEmail) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, authPassword);
        uid = cred.user.uid;
      } catch (authErr) {
        // If not found in Auth or invalid credentials, create user so their email appears in Firebase Authentication console!
        if (
          authErr.code === 'auth/user-not-found' ||
          authErr.code === 'auth/invalid-credential' ||
          authErr.code === 'auth/invalid-login-credentials' ||
          authErr.code === 'auth/wrong-password'
        ) {
          try {
            const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, authPassword);
            uid = newCred.user.uid;
          } catch (createErr) {
            console.warn('Firebase Auth user creation notice:', createErr.message);
          }
        } else if (authErr.code === 'auth/email-already-in-use') {
          // Email already registered in Auth
        } else {
          console.warn('Firebase Auth notice:', authErr.message);
        }
      }
    }

    // 2. Write to Firestore Database 'users' and 'logins' collections
    if (db && cleanEmail) {
      const docId = uid || cleanEmail.replace(/[^a-z0-9]/g, '_');
      const userDocRef = doc(db, 'users', docId);
      await setDoc(
        userDocRef,
        {
          email: cleanEmail,
          role: role || 'teacher',
          name: name || cleanEmail.split('@')[0],
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...extraData,
        },
        { merge: true }
      );

      // Also ensure indexed by sanitized email
      if (uid) {
        try {
          const emailDocRef = doc(db, 'users', cleanEmail.replace(/[^a-z0-9]/g, '_'));
          await setDoc(emailDocRef, {
            uid,
            email: cleanEmail,
            role: role || 'teacher',
            name: name || cleanEmail.split('@')[0],
            lastLoginAt: new Date().toISOString(),
          }, { merge: true });
        } catch (e) {}
      }

      // Also record in 'logins' collection for real-time audit logs in Firebase Console
      try {
        const loginsCol = collection(db, 'logins');
        await addDoc(loginsCol, {
          email: cleanEmail,
          role: role || 'teacher',
          name: name || cleanEmail.split('@')[0],
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Could not add login event to Firestore', e);
      }
    }

    return { success: true, uid };
  } catch (err) {
    console.warn('recordUserInFirebase error:', err);
    return { success: false, error: err.message };
  }
}
