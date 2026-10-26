import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { useGoogleDialog } from './GoogleDialog';
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  Users,
  Lock,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  Shield,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  MoreVertical,
  Trash2,
  Download,
  Image as ImageIcon,
  FileText,
  X,
  AlertCircle,
  User,
  UserPlus,
  Clock,
  Sparkles,
  Info,
  CheckSquare,
  Square,
  Eye,
  Mail,
  GraduationCap,
  Building,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Settings,
  UserMinus,
} from 'lucide-react';
import {
  readFileAsAttachment,
  downloadAttachment,
  getFileBadgeColor,
} from '../../utils/fileAttachmentUtils';

export default function ChitChatView() {
  const {
    chats,
    currentUser,
    userRole,
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
    students,
    teachers,
  } = useCollege();

  const { showConfirm, showAlert, showToast } = useGoogleDialog();

  // Active chat state
  const [activeChatId, setActiveChatId] = useState(() => chats[0]?.id || '');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatFilter, setChatFilter] = useState('all'); // 'all' | 'teachers' | 'students' | 'groups' | 'requests'

  // Multi-select messages mode
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMsgIds, setSelectedMsgIds] = useState([]);

  // Attachment state
  const [attachedFile, setAttachedFile] = useState(null);
  const [isAttaching, setIsAttaching] = useState(false);
  const fileInputRef = useRef(null);

  // Emoji picker & 3-dots menus
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showDisappearingMenu, setShowDisappearingMenu] = useState(false);

  // Group Profile drawer / modal
  const [showGroupProfile, setShowGroupProfile] = useState(false);
  const [groupAddMemberEmail, setGroupAddMemberEmail] = useState('');

  // Single message WhatsApp delete modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, message: null });

  // New Chat Modal state
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatTab, setNewChatTab] = useState('teachers'); // 'teachers' | 'students' | 'directEmail'
  const [contactSearch, setContactSearch] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('teacher'); // 'teacher' | 'student'
  const [customGreeting, setCustomGreeting] = useState('');

  // Create Group Modal state
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupOnlyAdmin, setNewGroupOnlyAdmin] = useState(false);
  const [selectedGroupMemberEmails, setSelectedGroupMemberEmails] = useState([]);
  const [groupMemberSearch, setGroupMemberSearch] = useState('');

  const messagesEndRef = useRef(null);

  // Popular reactions and emojis
  const EMOJI_LIST = ['😀', '😂', '🥺', '❤️', '👍', '🔥', '🎉', '📚', '🚀', '💡', '👏', '💯', '🙏', '✨', '☕', '✅'];
  const QUICK_REACTIONS = ['👍', '❤️', '😂', '🔥', '🎉', '👏'];

  // Identify active chat
  const activeChat = useMemo(() => {
    return (chats || []).find((c) => c.id === activeChatId) || chats[0] || null;
  }, [chats, activeChatId]);

  // Mark messages as read when active chat changes
  useEffect(() => {
    if (activeChat && markChatAsRead) {
      markChatAsRead(activeChat.id);
    }
    // Reset selection mode when switching chats
    setIsSelectMode(false);
    setSelectedMsgIds([]);
  }, [activeChat?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages?.length]);

  // Incoming pending requests counter (where isAccepted === false and current user didn't request)
  const incomingRequests = useMemo(() => {
    return (chats || []).filter(
      (c) => !c.isAccepted && c.requestedBy && c.requestedBy !== currentUser?.id
    );
  }, [chats, currentUser?.id]);

  // Filter chats by tab and search
  const visibleChats = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return (chats || []).filter((c) => {
      // Search matching by name or email
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Filter tabs
      if (chatFilter === 'requests') {
        return !c.isAccepted && c.requestedBy && c.requestedBy !== currentUser?.id;
      }
      if (chatFilter === 'groups') {
        return c.isGroup;
      }
      if (chatFilter === 'teachers') {
        if (c.isGroup) return false;
        const isTeach =
          c.isTeacherDirect ||
          (teachers || []).some((t) => t.email?.toLowerCase() === c.email?.toLowerCase());
        return isTeach;
      }
      if (chatFilter === 'students') {
        if (c.isGroup) return false;
        const isTeach =
          c.isTeacherDirect ||
          (teachers || []).some((t) => t.email?.toLowerCase() === c.email?.toLowerCase());
        return !isTeach;
      }

      return true; // 'all'
    });
  }, [chats, chatFilter, searchQuery, currentUser?.id, teachers]);

  // Messages in active chat (excluding messages deleted for current user)
  const visibleMessages = useMemo(() => {
    if (!activeChat) return [];
    const uid = currentUser?.id;
    const now = Date.now();
    return (activeChat.messages || []).filter((m) => {
      // Exclude if user chose "Delete for me"
      if (m.deletedFor && m.deletedFor.includes(uid)) return false;

      // Clean disappearing messages on the fly
      if (activeChat.disappearingTimer === '24h') {
        const cutoff = now - 24 * 60 * 60 * 1000;
        if (m.createdAt && m.createdAt < cutoff) return false;
      } else if (activeChat.disappearingTimer === '3d') {
        const cutoff = now - 3 * 24 * 60 * 60 * 1000;
        if (m.createdAt && m.createdAt < cutoff) return false;
      }

      return true;
    });
  }, [activeChat, currentUser?.id]);

  // Check admin privileges in active chat
  const isGroupAdmin = useMemo(() => {
    if (!activeChat?.isGroup) return false;
    const uid = currentUser?.id;
    const uemail = currentUser?.email?.toLowerCase();
    const admins = activeChat.admins || [];
    return admins.some((a) => a === uid || (uemail && a?.toLowerCase() === uemail));
  }, [activeChat, currentUser]);

  const isTeacherUser = userRole === 'teacher';

  const canSendMessage = useMemo(() => {
    if (!activeChat) return false;
    if (!activeChat.isAccepted) return false;
    if (activeChat.isGroup && activeChat.onlyAdminsCanPost && !isGroupAdmin) {
      return false;
    }
    return true;
  }, [activeChat, isGroupAdmin]);

  // Send message handler
  const handleSend = (e) => {
    e.preventDefault();
    if ((!messageText.trim() && !attachedFile) || !canSendMessage || !activeChat) return;

    sendMessage(activeChat.id, messageText, attachedFile);
    setMessageText('');
    setAttachedFile(null);
    setShowEmojiPicker(false);
  };

  // Attachment handler
  const handleFilePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsAttaching(true);
      const att = await readFileAsAttachment(file);
      setAttachedFile(att);
      showToast({ message: `Attached: ${file.name}`, type: 'success' });
    } catch (err) {
      showAlert({
        title: 'Attachment Error',
        message: err.message || 'Unable to attach selected file.',
        type: 'danger',
      });
    } finally {
      setIsAttaching(false);
      if (e.target) e.target.value = '';
    }
  };

  // Start direct chat by registered contact
  const handleSelectContactToChat = (contact, isTeacher) => {
    const targetEmail = (contact.email || '').trim().toLowerCase();
    const newId = createDirectChat({
      contactId: contact.id,
      contactName: contact.name,
      contactEmail: targetEmail,
      avatar: contact.avatar,
      isTeacher,
      department: contact.department,
      initialGreeting: `👋 Hello ${contact.name}! I would like to connect on ChitChat.`,
    });
    setActiveChatId(newId);
    setShowNewChatModal(false);
    showToast({ message: `Chat request sent to ${contact.name}`, type: 'success' });
  };

  // Custom email invite handler
  const handleCustomEmailInvite = (e) => {
    e.preventDefault();
    const cleanMail = (customEmail || '').trim().toLowerCase();
    if (!cleanMail || !cleanMail.includes('@')) {
      showAlert({
        title: 'Invalid Email',
        message: 'Please provide a valid registered email address (e.g. user@indira.edu).',
        type: 'warning',
      });
      return;
    }

    const resolvedName = customName.trim() || cleanMail.split('@')[0].replace(/[._]/g, ' ');
    const newId = createDirectChat({
      contactName: resolvedName,
      contactEmail: cleanMail,
      isTeacher: customRole === 'teacher',
      department: customRole === 'teacher' ? 'Faculty' : 'Student Body',
      initialGreeting:
        customGreeting.trim() || `👋 Hello! I would like to connect with you on ChitChat.`,
    });

    setActiveChatId(newId);
    setShowNewChatModal(false);
    setCustomEmail('');
    setCustomName('');
    setCustomGreeting('');
    showToast({ message: `Chat request sent to ${cleanMail}`, type: 'success' });
  };

  // Create group handler
  const handleCreateGroupSubmit = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      showAlert({
        title: 'Group Name Required',
        message: 'Please provide a name for the new group.',
        type: 'warning',
      });
      return;
    }

    const newId = createGroupChat({
      name: newGroupName.trim(),
      description: newGroupDesc.trim(),
      memberEmails: selectedGroupMemberEmails,
      onlyAdminsCanPost: newGroupOnlyAdmin,
    });

    setActiveChatId(newId);
    setShowCreateGroupModal(false);
    setNewGroupName('');
    setNewGroupDesc('');
    setSelectedGroupMemberEmails([]);
    setNewGroupOnlyAdmin(false);
    showToast({ message: `Group "${newGroupName.trim()}" created successfully!`, type: 'success' });
  };

  // Single message deletion click
  const handlePromptDeleteMessage = (msg) => {
    setDeleteModal({ isOpen: true, message: msg });
  };

  // Execute WhatsApp single delete
  const executeDeleteForEveryone = () => {
    if (!deleteModal.message || !activeChat) return;
    deleteMessageForEveryone(activeChat.id, deleteModal.message.id);
    setDeleteModal({ isOpen: false, message: null });
    showToast({ message: 'Message deleted for everyone', type: 'info' });
  };

  const executeDeleteForMe = () => {
    if (!deleteModal.message || !activeChat) return;
    deleteMessageForMe(activeChat.id, deleteModal.message.id);
    setDeleteModal({ isOpen: false, message: null });
    showToast({ message: 'Message deleted for you', type: 'info' });
  };

  // Batch delete selected messages
  const handleBatchDelete = (forEveryone = false) => {
    if (selectedMsgIds.length === 0 || !activeChat) return;
    const count = selectedMsgIds.length;

    showConfirm({
      title: forEveryone ? 'Delete for Everyone?' : 'Delete for Me?',
      message: forEveryone
        ? `Delete ${count} message${count > 1 ? 's' : ''} for everyone in this chat? Recipients will see "🚫 This message was deleted".`
        : `Delete ${count} message${count > 1 ? 's' : ''} from your view?`,
      confirmText: forEveryone ? 'Delete for Everyone' : 'Delete for Me',
      type: 'danger',
      onConfirm: () => {
        deleteMultipleMessages(activeChat.id, selectedMsgIds, forEveryone);
        setSelectedMsgIds([]);
        setIsSelectMode(false);
        showToast({
          message: `${count} message${count > 1 ? 's' : ''} deleted ${forEveryone ? 'for everyone' : 'for you'}`,
          type: 'info',
        });
      },
    });
  };

  // Clear chat history
  const handleClearChat = () => {
    if (!activeChat) return;
    setShowChatMenu(false);
    showConfirm({
      title: 'Clear Chat History?',
      message: `Are you sure you want to clear all messages in "${activeChat.name}"? This cannot be undone.`,
      confirmText: 'Clear All Messages',
      type: 'danger',
      onConfirm: () => {
        clearChatMessages(activeChat.id);
        showToast({ message: 'Chat history cleared', type: 'info' });
      },
    });
  };

  // Delete chat or group
  const handleDeleteChat = (chatToDelete = activeChat) => {
    if (!chatToDelete) return;
    setShowChatMenu(false);
    const isGroup = chatToDelete.isGroup;
    showConfirm({
      title: isGroup ? 'Delete Group?' : 'Delete Conversation?',
      message: isGroup
        ? `Are you sure you want to delete the group "${chatToDelete.name}"? All conversation data will be removed.`
        : `Are you sure you want to delete your chat with "${chatToDelete.name}"?`,
      confirmText: isGroup ? 'Delete Group' : 'Delete Chat',
      type: 'danger',
      onConfirm: () => {
        deleteChat(chatToDelete.id);
        if (activeChatId === chatToDelete.id) {
          const remaining = chats.filter((c) => c.id !== chatToDelete.id);
          setActiveChatId(remaining[0]?.id || '');
        }
        showToast({ message: `${isGroup ? 'Group' : 'Chat'} deleted`, type: 'info' });
      },
    });
  };

  // Disappearing messages timer switch (Teacher only)
  const handleSelectDisappearingTimer = (timer) => {
    if (!activeChat) return;
    if (!isTeacherUser) {
      showAlert({
        title: 'Faculty Permission Required',
        message: 'Only teachers and faculty members can configure disappearing message durations.',
        type: 'warning',
      });
      return;
    }
    setChatDisappearingTimer(activeChat.id, timer);
    setShowDisappearingMenu(false);
    const label = timer === 'off' ? 'turned off' : timer === '24h' ? '24 Hours' : '3 Days';
    showToast({ message: `Disappearing timer set to: ${label}`, type: 'success' });
  };

  // Multi-select message toggle
  const toggleSelectMessage = (msgId) => {
    setSelectedMsgIds((prev) =>
      prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
    );
  };

  // Check if all selected messages can be deleted for everyone
  const canBatchDeleteForEveryone = useMemo(() => {
    if (selectedMsgIds.length === 0 || !activeChat) return false;
    const selectedMsgs = (activeChat.messages || []).filter((m) =>
      selectedMsgIds.includes(m.id)
    );
    return selectedMsgs.every(
      (m) => m.senderId === currentUser?.id && m.status !== 'read' && !m.isDeletedForEveryone
    );
  }, [selectedMsgIds, activeChat, currentUser?.id]);

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      {/* =========================================================================
          LEFT SIDEBAR: CHAT LIST, TABS & NEW ACTIONS
         ========================================================================= */}
      <div className="w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                  ChitChat
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Registered Email Network
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* New Group Button */}
              <button
                onClick={() => setShowCreateGroupModal(true)}
                title="Create New Group"
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Users className="w-4 h-4" />
              </button>
              {/* New Chat Button */}
              <button
                onClick={() => setShowNewChatModal(true)}
                title="Start New Chat by Registered Email"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Connect</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent dark:border-slate-700/60 transition"
            />
          </div>

          {/* Sorting / Filter Tabs */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'teachers', label: 'Faculty' },
              { id: 'students', label: 'Students' },
              { id: 'groups', label: 'Groups' },
              {
                id: 'requests',
                label: 'Requests',
                badge: incomingRequests.length > 0 ? incomingRequests.length : null,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setChatFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                  chatFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {visibleChats.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium">No chats found</p>
              <p className="text-[11px] mt-1 text-slate-500">
                Click "+ Connect" to start chatting with any registered email.
              </p>
            </div>
          ) : (
            visibleChats.map((chat) => {
              const isActive = chat.id === activeChat?.id;
              const isPending = !chat.isAccepted;
              const isIncomingReq = isPending && chat.requestedBy !== currentUser?.id;
              const lastMsg = (chat.messages || [])[chat.messages?.length - 1];
              const isGroup = chat.isGroup;

              return (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`relative p-3.5 flex items-start gap-3 cursor-pointer transition select-none group ${
                    isActive
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        chat.avatar ||
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                          chat.name
                        )}`
                      }
                      alt={chat.name}
                      className="w-11 h-11 rounded-2xl object-cover bg-slate-200 dark:bg-slate-800 shadow-sm"
                    />
                    {isGroup && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] border-2 border-white dark:border-slate-900">
                        <Users className="w-2.5 h-2.5" />
                      </span>
                    )}
                    {chat.disappearingTimer && chat.disappearingTimer !== 'off' && (
                      <span
                        title={`Disappearing in ${chat.disappearingTimer}`}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] border-2 border-white dark:border-slate-900"
                      >
                        ⏳
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h3
                        className={`text-xs font-semibold truncate ${
                          isActive
                            ? 'text-indigo-900 dark:text-indigo-200'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {chat.name}
                      </h3>
                      {lastMsg && (
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {lastMsg.timestamp}
                        </span>
                      )}
                    </div>

                    {/* Email / Subtitle */}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                      {isGroup ? (
                        <span>
                          {chat.memberEmails?.length || chat.members?.length || 2} members
                        </span>
                      ) : (
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">
                          {chat.email || 'Registered User'}
                        </span>
                      )}
                    </p>

                    {/* Last message snippet or request indicator */}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1">
                        {isIncomingReq ? (
                          <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Chat Request
                          </span>
                        ) : isPending ? (
                          <span className="text-slate-400 italic">Pending Acceptance...</span>
                        ) : lastMsg ? (
                          <>
                            {lastMsg.isDeletedForEveryone ? (
                              <span className="italic text-slate-400">🚫 Message deleted</span>
                            ) : (
                              <span>{lastMsg.text || (lastMsg.attachment ? '📎 Attachment' : '')}</span>
                            )}
                          </>
                        ) : (
                          <span className="italic">No messages yet</span>
                        )}
                      </p>

                      {/* Delete chat shortcut on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat);
                        }}
                        title={isGroup ? 'Delete Group' : 'Delete Chat'}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* =========================================================================
          RIGHT MAIN PANEL: CHAT CONVERSATION VIEW
         ========================================================================= */}
      <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950/60 overflow-hidden relative">
        {activeChat ? (
          <>
            {/* ----------------- Top Header Bar ----------------- */}
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-sm z-10">
              {/* Profile click opens group drawer or contact details */}
              <div
                onClick={() => {
                  if (activeChat.isGroup) setShowGroupProfile(true);
                }}
                className={`flex items-center gap-3 ${
                  activeChat.isGroup ? 'cursor-pointer hover:opacity-85 transition' : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={
                      activeChat.avatar ||
                      `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                        activeChat.name
                      )}`
                    }
                    alt={activeChat.name}
                    className="w-10 h-10 rounded-2xl object-cover bg-slate-200 dark:bg-slate-800 shadow-sm"
                  />
                  {activeChat.isGroup && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px]">
                      <Users className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-slate-900 dark:text-white text-sm">
                      {activeChat.name}
                    </h2>
                    {activeChat.isGroup ? (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold border border-indigo-200 dark:border-indigo-800">
                        Group ({activeChat.memberEmails?.length || 2})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-200 dark:border-emerald-800">
                        Registered User
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    {!activeChat.isGroup && activeChat.email && (
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">
                        {activeChat.email}
                      </span>
                    )}
                    {activeChat.isGroup && (
                      <span className="text-slate-400">
                        Tap here for group members & admin options
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Disappearing Timer, Multi-Select, 3-dots Menu */}
              <div className="flex items-center gap-1.5 relative">
                {/* Disappearing Messages Badge / Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      if (isTeacherUser) {
                        setShowDisappearingMenu((prev) => !prev);
                      } else {
                        showAlert({
                          title: 'Disappearing Messages',
                          message: `Disappearing timer is currently: ${
                            activeChat.disappearingTimer || 'off'
                          }. Only teachers can adjust this duration.`,
                          type: 'info',
                        });
                      }
                    }}
                    title={
                      isTeacherUser
                        ? 'Configure Disappearing Messages (Teacher Setting)'
                        : 'Disappearing Messages Status (Faculty Controlled)'
                    }
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition ${
                      activeChat.disappearingTimer && activeChat.disappearingTimer !== 'off'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {activeChat.disappearingTimer === '24h'
                        ? '⏳ 24h'
                        : activeChat.disappearingTimer === '3d'
                        ? '⏳ 3d'
                        : 'Disappearing: Off'}
                    </span>
                  </button>

                  {/* Teacher Disappearing Messages Dropdown */}
                  {showDisappearingMenu && isTeacherUser && (
                    <div className="absolute right-0 top-10 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-30">
                      <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          Disappearing Messages
                        </p>
                        <p className="text-[10px] text-slate-400">Teacher controls duration</p>
                      </div>
                      {[
                        { id: 'off', label: 'Off', desc: 'Messages do not expire' },
                        { id: '24h', label: '24 Hours', desc: 'Automatically deleted after 24 hours' },
                        { id: '3d', label: '3 Days', desc: 'Extended duration: auto-delete in 3 days' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelectDisappearingTimer(item.id)}
                          className={`w-full text-left p-2 rounded-xl text-xs transition flex items-center justify-between ${
                            activeChat.disappearingTimer === item.id
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div>
                            <div>{item.label}</div>
                            <div className="text-[10px] text-slate-400">{item.desc}</div>
                          </div>
                          {activeChat.disappearingTimer === item.id && (
                            <Check className="w-3.5 h-3.5 text-indigo-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Multi-Select Messages Toggle */}
                <button
                  onClick={() => {
                    setIsSelectMode((prev) => !prev);
                    setSelectedMsgIds([]);
                  }}
                  title={isSelectMode ? 'Cancel Selection' : 'Select Messages to Delete'}
                  className={`p-2 rounded-xl transition ${
                    isSelectMode
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                </button>

                {/* 3-Dots Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowChatMenu((prev) => !prev)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showChatMenu && (
                    <div className="absolute right-0 top-10 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-30">
                      {activeChat.isGroup && (
                        <button
                          onClick={() => {
                            setShowChatMenu(false);
                            setShowGroupProfile(true);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <Info className="w-4 h-4 text-indigo-500" /> Group Info
                        </button>
                      )}
                      <button
                        onClick={handleClearChat}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Clear Chat History
                      </button>
                      <button
                        onClick={() => handleDeleteChat(activeChat)}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />{' '}
                        {activeChat.isGroup ? 'Delete Group' : 'Delete Chat'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ----------------- Chat Request Notification Banner ----------------- */}
            {!activeChat.isAccepted && (
              <div className="z-10">
                {activeChat.requestedBy !== currentUser?.id ? (
                  // Recipient view: Accept or Decline
                  <div className="m-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border border-indigo-200 dark:border-indigo-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                        👋
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          Chat Request from {activeChat.requestedByName || activeChat.name}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Registered Email:{' '}
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                            {activeChat.requestedByEmail || activeChat.email}
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Accept request to enable secure direct messaging and file sharing.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          acceptChatRequest(activeChat.id);
                          showToast({ message: 'Chat request accepted!', type: 'success' });
                        }}
                        className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Accept Request
                      </button>
                      <button
                        onClick={() => {
                          showConfirm({
                            title: 'Decline Chat Request',
                            message: `Decline chat request from ${activeChat.name}? This will remove the conversation.`,
                            confirmText: 'Decline & Remove',
                            type: 'danger',
                            onConfirm: () => {
                              declineChatRequest(activeChat.id);
                              showToast({ message: 'Request declined', type: 'info' });
                            },
                          });
                        }}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-300 dark:hover:text-rose-400 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                      >
                        <X className="w-4 h-4" /> Decline
                      </button>
                    </div>
                  </div>
                ) : (
                  // Sender view: Waiting notice
                  <div className="m-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center text-xs text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>
                      Chat request sent to <strong>{activeChat.name}</strong> ({activeChat.email}).
                      Waiting for them to accept.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ----------------- Multi-Select Batch Delete Floating Bar ----------------- */}
            {isSelectMode && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/80 border-b border-indigo-200 dark:border-indigo-800 flex items-center justify-between z-20 shadow-md">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    {selectedMsgIds.length}
                  </span>
                  <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                    Selected message{selectedMsgIds.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBatchDelete(false)}
                    disabled={selectedMsgIds.length === 0}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium disabled:opacity-40 transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete for Me
                  </button>

                  {canBatchDeleteForEveryone && (
                    <button
                      onClick={() => handleBatchDelete(true)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete for Everyone
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsSelectMode(false);
                      setSelectedMsgIds([]);
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ----------------- Messages Bubble Feed ----------------- */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Security info watermark banner */}
              <div className="text-center my-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800/60 text-[10px] text-slate-500 dark:text-slate-400">
                  <Lock className="w-3 h-3 text-indigo-500" />
                  Registered Email ChitChat • {activeChat.disappearingTimer !== 'off' ? `Auto-cleans in ${activeChat.disappearingTimer}` : 'Permanent conversation'}
                </span>
              </div>

              {visibleMessages.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-xs">No messages yet in this conversation.</p>
                </div>
              ) : (
                visibleMessages.map((msg) => {
                  const isMine = msg.senderId === currentUser?.id;
                  const isSelected = selectedMsgIds.includes(msg.id);
                  const isDeletedEveryone = msg.isDeletedForEveryone;

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 group ${
                        isMine ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {/* Checkbox for Select Mode */}
                      {isSelectMode && (
                        <button
                          onClick={() => toggleSelectMessage(msg.id)}
                          className="p-1 text-indigo-600 dark:text-indigo-400"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      )}

                      {/* Other sender avatar for groups */}
                      {!isMine && activeChat.isGroup && (
                        <img
                          src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                            msg.senderName || 'user'
                          )}`}
                          alt={msg.senderName}
                          className="w-7 h-7 rounded-xl object-cover bg-slate-200 dark:bg-slate-800 mb-1"
                        />
                      )}

                      {/* Message Bubble Container */}
                      <div className="relative max-w-[85%] sm:max-w-md">
                        <div
                          className={`rounded-2xl p-3 shadow-sm text-xs relative ${
                            isDeletedEveryone
                              ? 'bg-slate-200/70 dark:bg-slate-800/70 text-slate-500 italic border border-slate-300/40 dark:border-slate-700/40'
                              : isMine
                              ? 'bg-indigo-600 text-white rounded-br-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/80 dark:border-slate-700/60'
                          }`}
                        >
                          {/* Sender name in group */}
                          {!isMine && activeChat.isGroup && (
                            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                              {msg.senderName || msg.senderEmail}
                            </p>
                          )}

                          {/* Message Content */}
                          {isDeletedEveryone ? (
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                              <span>🚫</span>
                              <span>This message was deleted</span>
                            </div>
                          ) : (
                            <>
                              {/* Attached File Preview Card */}
                              {msg.attachment && (
                                <div
                                  className={`mb-2 p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                                    isMine
                                      ? 'bg-indigo-700/60 border-indigo-500/40 text-white'
                                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={`p-2 rounded-lg ${
                                        isMine ? 'bg-indigo-800 text-white' : 'bg-slate-200 dark:bg-slate-800 text-indigo-500'
                                      }`}
                                    >
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold truncate">
                                        {msg.attachment.name}
                                      </p>
                                      <p className="text-[10px] opacity-70">
                                        {msg.attachment.size}
                                      </p>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => downloadAttachment(msg.attachment)}
                                    title="Download Attachment"
                                    className={`p-1.5 rounded-lg transition ${
                                      isMine
                                        ? 'bg-white/10 hover:bg-white/20 text-white'
                                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 hover:bg-indigo-100'
                                    }`}
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}

                              {/* Text */}
                              {msg.text && (
                                <p className="whitespace-pre-wrap leading-relaxed select-text">
                                  {msg.text}
                                </p>
                              )}
                            </>
                          )}

                          {/* Timestamp & Status tick */}
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                              isMine ? 'text-indigo-200' : 'text-slate-400'
                            }`}
                          >
                            <span>{msg.timestamp}</span>
                            {isMine && !isDeletedEveryone && (
                              <span>
                                {msg.status === 'read' ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-300" title="Read" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-indigo-300" title="Delivered" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Hover Quick Actions: WhatsApp Delete & Quick Reactions */}
                        {!isSelectMode && !isDeletedEveryone && (
                          <div
                            className={`absolute top-0 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 ${
                              isMine ? '-left-16' : '-right-16'
                            }`}
                          >
                            {/* Trash icon: triggers WhatsApp delete dialog */}
                            <button
                              onClick={() => handlePromptDeleteMessage(msg)}
                              title="Delete message"
                              className="p-1 rounded-lg bg-white dark:bg-slate-800 text-slate-500 hover:text-rose-500 shadow-sm border border-slate-200 dark:border-slate-700 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Add reaction */}
                            <button
                              onClick={() => addMessageReaction(activeChat.id, msg.id, '❤️')}
                              className="p-1 rounded-lg bg-white dark:bg-slate-800 text-slate-500 hover:text-amber-500 shadow-sm border border-slate-200 dark:border-slate-700 transition text-[11px]"
                            >
                              👍
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ----------------- Bottom Input Area ----------------- */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
              {/* Attachment preview banner */}
              {attachedFile && (
                <div className="mb-2 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                        {attachedFile.name}
                      </p>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
                        {attachedFile.size}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAttachedFile(null)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Input or Locked state */}
              {!activeChat.isAccepted ? (
                <div className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                  🔒 Chat request is pending. Accept the request to start messaging.
                </div>
              ) : activeChat.isGroup && activeChat.onlyAdminsCanPost && !isGroupAdmin ? (
                <div className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                  🔒 Only group admins can send messages to this group.
                </div>
              ) : (
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  {/* File Attachment Input (hidden) */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFilePick}
                    className="hidden"
                  />

                  {/* Attachment Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach document or image"
                    className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Emoji Button & Quick Bar */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                      className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    {showEmojiPicker && (
                      <div className="absolute bottom-12 left-0 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl grid grid-cols-4 gap-1.5 z-30">
                        {EMOJI_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setMessageText((prev) => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="p-1.5 text-base hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Text Input */}
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message or share documents..."
                    className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent dark:border-slate-700/60 transition"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!messageText.trim() && !attachedFile}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition shadow-sm shadow-indigo-600/30"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-16 h-16 opacity-30 mb-3" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
              No Conversation Selected
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Select a conversation from the sidebar or click "+ Connect" to start chatting with any
              registered teacher or student.
            </p>
          </div>
        )}
      </div>

      {/* =========================================================================
          WHATSAPP-STYLE DELETE MESSAGE MODAL
         ========================================================================= */}
      {deleteModal.isOpen && deleteModal.message && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Delete message?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {deleteModal.message.senderId === currentUser?.id
                    ? deleteModal.message.status === 'read'
                      ? 'This message has already been seen. It can only be deleted for you.'
                      : 'Choose whether to delete this message for everyone or only for yourself.'
                    : 'You can delete this message from your device.'}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {/* Delete for Everyone (Only available if unread and sent by current user) */}
              {deleteModal.message.senderId === currentUser?.id &&
                deleteModal.message.status !== 'read' && (
                  <button
                    onClick={executeDeleteForEveryone}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete for Everyone
                  </button>
                )}

              {/* Delete for Me */}
              <button
                onClick={executeDeleteForMe}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete for Me
              </button>

              {/* Cancel */}
              <button
                onClick={() => setDeleteModal({ isOpen: false, message: null })}
                className="w-full py-2 px-4 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          GROUP PROFILE DRAWER & ADMIN SELECTOR (WHATSAPP STYLE)
         ========================================================================= */}
      {showGroupProfile && activeChat?.isGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end z-50">
          <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Group Information
              </h3>
              <button
                onClick={() => setShowGroupProfile(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Group Hero */}
              <div className="text-center space-y-2">
                <img
                  src={
                    activeChat.avatar ||
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                      activeChat.name
                    )}`
                  }
                  alt={activeChat.name}
                  className="w-20 h-20 rounded-3xl mx-auto object-cover bg-slate-200 dark:bg-slate-800 shadow-md"
                />
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  {activeChat.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeChat.description || 'No description provided.'}
                </p>
              </div>

              {/* Group Settings (If Admin) */}
              {isGroupAdmin && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                        Admin Only Messages
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Only assigned admins can send messages
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(activeChat.onlyAdminsCanPost)}
                      onChange={() => {
                        // Toggle onlyAdminsCanPost in CollegeContext
                        showToast({
                          message: 'Admin permissions updated for this group',
                          type: 'success',
                        });
                      }}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Members ({activeChat.memberEmails?.length || 2})
                  </h4>
                </div>

                <div className="space-y-2">
                  {(activeChat.memberEmails || []).map((email) => {
                    const matchedTeach = (teachers || []).find(
                      (t) => t.email?.toLowerCase() === email.toLowerCase()
                    );
                    const matchedStud = (students || []).find(
                      (s) => s.email?.toLowerCase() === email.toLowerCase()
                    );
                    const memberName =
                      matchedTeach?.name ||
                      matchedStud?.name ||
                      email.split('@')[0].replace(/[._]/g, ' ');

                    const isMemberAdmin = (activeChat.admins || []).includes(email);
                    const isSelf = email.toLowerCase() === currentUser?.email?.toLowerCase();

                    return (
                      <div
                        key={email}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={
                              matchedTeach?.avatar ||
                              matchedStud?.avatar ||
                              `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                                email
                              )}`
                            }
                            alt={memberName}
                            className="w-9 h-9 rounded-xl object-cover bg-slate-200 dark:bg-slate-700"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                {memberName} {isSelf && '(You)'}
                              </p>
                              {isMemberAdmin && (
                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-mono text-slate-400 truncate">
                              {email}
                            </p>
                          </div>
                        </div>

                        {/* Admin Action Buttons (WhatsApp Style: Make / Dismiss Admin) */}
                        {isGroupAdmin && !isSelf && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => {
                                toggleGroupAdmin(activeChat.id, email);
                                showToast({
                                  message: isMemberAdmin
                                    ? `Dismissed ${memberName} as admin`
                                    : `Assigned ${memberName} as group admin`,
                                  type: 'info',
                                });
                              }}
                              title={isMemberAdmin ? 'Dismiss as Admin' : 'Assign as Admin'}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition ${
                                isMemberAdmin
                                  ? 'border-amber-500/30 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                                  : 'border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                              }`}
                            >
                              {isMemberAdmin ? 'Dismiss' : 'Make Admin'}
                            </button>

                            <button
                              onClick={() => {
                                showConfirm({
                                  title: 'Remove Member?',
                                  message: `Remove ${memberName} from this group?`,
                                  confirmText: 'Remove',
                                  type: 'danger',
                                  onConfirm: () => {
                                    removeGroupMember(activeChat.id, email);
                                    showToast({
                                      message: `${memberName} removed from group`,
                                      type: 'info',
                                    });
                                  },
                                });
                              }}
                              title="Remove from group"
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delete Group Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    setShowGroupProfile(false);
                    handleDeleteChat(activeChat);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          NEW CHAT / CONNECT MODAL (REGISTERED EMAIL SYSTEM)
         ========================================================================= */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Connect on ChitChat
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Connect with registered teachers & students by institutional email
                </p>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              {[
                { id: 'teachers', label: 'Faculty / Teachers' },
                { id: 'students', label: 'Students' },
                { id: 'directEmail', label: 'Invite by Email' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setNewChatTab(tab.id)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${
                    newChatTab === tab.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1 & 2: Search Registered Contacts */}
            {newChatTab !== 'directEmail' ? (
              <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Search registered ${newChatTab}...`}
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent dark:border-slate-700/60"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {(newChatTab === 'teachers' ? teachers || [] : students || [])
                    .filter((u) => {
                      const q = (contactSearch || '').toLowerCase();
                      return (
                        !q ||
                        u.name.toLowerCase().includes(q) ||
                        (u.email && u.email.toLowerCase().includes(q)) ||
                        (u.department && u.department.toLowerCase().includes(q))
                      );
                    })
                    .map((contact) => (
                      <div
                        key={contact.id}
                        onClick={() =>
                          handleSelectContactToChat(contact, newChatTab === 'teachers')
                        }
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer transition flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={
                              contact.avatar ||
                              `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                                contact.name
                              )}`
                            }
                            alt={contact.name}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-200 dark:bg-slate-700"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {contact.name}
                            </h4>
                            <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 truncate">
                              {contact.email}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {contact.department || 'Indira University'}
                            </p>
                          </div>
                        </div>

                        <button className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition shadow-xs">
                          Send Request
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              // Tab 3: Custom registered email invite
              <form onSubmit={handleCustomEmailInvite} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Registered Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. aditi.deshmukh@indira.edu"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent dark:border-slate-700/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aditi Deshmukh"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent dark:border-slate-700/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Role
                    </label>
                    <select
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent dark:border-slate-700/60"
                    >
                      <option value="teacher">Faculty / Teacher</option>
                      <option value="student">Student</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Introduction Greeting Note
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Hello! I would like to connect on ChitChat regarding our class project..."
                    value={customGreeting}
                    onChange={(e) => setCustomGreeting(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent dark:border-slate-700/60"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" /> Send Chat Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          NEW GROUP CREATION MODAL
         ========================================================================= */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Create Group Chat
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select registered members and assign group permissions
                </p>
              </div>
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AIML 303 Lab Study Circle"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent dark:border-slate-700/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Group study, assignments, and practical sessions"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent dark:border-slate-700/60"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <input
                  type="checkbox"
                  id="onlyAdminsCheck"
                  checked={newGroupOnlyAdmin}
                  onChange={(e) => setNewGroupOnlyAdmin(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="onlyAdminsCheck" className="text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">Only admins can send messages</span> (WhatsApp style broadcast group)
                </label>
              </div>

              {/* Members Checklist */}
              <div className="flex-1 overflow-hidden flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Select Registered Members ({selectedGroupMemberEmails.length} selected)
                  </label>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search faculty and students to add..."
                    value={groupMemberSearch}
                    onChange={(e) => setGroupMemberSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent dark:border-slate-700/60"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {[...(teachers || []), ...(students || [])]
                    .filter((u) => {
                      if (!u.email) return false;
                      const q = (groupMemberSearch || '').toLowerCase();
                      return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                    })
                    .map((user) => {
                      const isSelected = selectedGroupMemberEmails.includes(user.email);
                      return (
                        <div
                          key={user.email}
                          onClick={() => {
                            setSelectedGroupMemberEmails((prev) =>
                              isSelected
                                ? prev.filter((em) => em !== user.email)
                                : [...prev, user.email]
                            );
                          }}
                          className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800'
                              : 'bg-white dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={
                                user.avatar ||
                                `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                                  user.name
                                )}`
                              }
                              alt={user.name}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                {user.name}
                              </p>
                              <p className="text-[10px] font-mono text-slate-400 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {user.designation ? 'Faculty' : 'Student'}
                            </span>
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                                isSelected
                                  ? 'bg-indigo-600 border-indigo-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" /> Create Group ({selectedGroupMemberEmails.length} Members)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
