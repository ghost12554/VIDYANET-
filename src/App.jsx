import React, { useState } from 'react';
import { CollegeProvider, useCollege } from './context/CollegeContext';
import { GoogleDialogProvider } from './components/common/GoogleDialog';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import AuthModal from './components/auth/AuthModal';
import LoginPage from './components/auth/LoginPage';

// Student Panels
import StudentDashboard from './components/student/StudentDashboard';
import StudentWorkstore from './components/student/StudentWorkstore';
import StudentSocialFreak from './components/student/StudentSocialFreak';

// Teacher Panels
import TeacherDashboard from './components/teacher/TeacherDashboard';
import TeacherWorkstore from './components/teacher/TeacherWorkstore';
import TeacherBotMarket from './components/teacher/TeacherBotMarket';

// Shared Panels
import ChitChatView from './components/common/ChitChatView';
import ProfileView from './components/common/ProfileView';
import TeacherReminderPopup from './components/common/TeacherReminderPopup';
import ErrorBoundary from './components/common/ErrorBoundary';

function MainLayout() {
  const { currentUser, userRole, activeMode } = useCollege();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // If user is not logged in, show the dedicated full-screen Login & Registration page
  if (!currentUser) {
    return <LoginPage />;
  }

  // Render appropriate view based on role and active mode
  const renderContent = () => {
    if (userRole === 'student') {
      switch (activeMode) {
        case 'dashboard':
          return <StudentDashboard />;
        case 'workstore':
          return <StudentWorkstore />;
        case 'chitchat':
          return <ChitChatView />;
        case 'socialfreak':
          return <StudentSocialFreak />;
        case 'profile':
          return <ProfileView />;
        default:
          return <StudentDashboard />;
      }
    } else {
      // Teacher role
      switch (activeMode) {
        case 'dashboard':
          return <TeacherDashboard />;
        case 'workstore':
          return <TeacherWorkstore />;
        case 'chitchat':
          return <ChitChatView />;
        case 'botmarket':
          return <TeacherBotMarket />;
        case 'profile':
          return <ProfileView />;
        default:
          return <TeacherDashboard />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. College Institutional Header & Navbar */}
      <Navbar onOpenAuth={() => setShowAuthModal(true)} />

      {/* 3. Main Body: Sidebar + Dynamic Panel */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        {/* Navigation Sidebar (5 modes for student or teacher) */}
        <Sidebar />

        {/* Dynamic Mode Stage */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          <ErrorBoundary title="View Recovery">
            {renderContent()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Auth Modal for Login, Student Registration (with Approval Queue) & Teacher Registration */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Floating Student Reminder Alert Popup for Teachers */}
      <TeacherReminderPopup />
    </div>
  );
}

export default function App() {
  return (
    <CollegeProvider>
      <GoogleDialogProvider>
        <MainLayout />
      </GoogleDialogProvider>
    </CollegeProvider>
  );
}
