import React, { useState, useRef } from 'react';
import { useCollege } from '../../context/CollegeContext';
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
  UserCheck,
  ChevronRight,
  Phone,
  Video,
  MoreVertical,
  Trash2,
  Download,
  Image as ImageIcon,
  FileText,
  X,
  AlertCircle,
  Ban,
  User,
  UserPlus,
  Building,
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
    deleteMessageForMe,
    deleteMessageForEveryone,
    addMessageReaction,
    createDirectChat,
    createGroupChat,
    students,
    teachers,
    openMeetingDirectly,
    directJoinMeeting,
    broadcastMeetingInvite,
  } = useCollege();

  const [activeChatId, setActiveChatId] = useState(chats[0]?.id || '');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatFilter, setChatFilter] = useState('all'); // 'all' | 'faculty' | 'groups' | 'students'

  // WhatsApp Attachment State
  const [attachedFile, setAttachedFile] = useState(null);
  const [isAttaching, setIsAttaching] = useState(false);
  const fileInputRef = useRef(null);

  // WhatsApp Emoji Picker State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // WhatsApp Delete Message Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, message: null });

  // Contact / New Chat Modal State (start chat by phone or with faculty)
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [contactTypeFilter, setContactTypeFilter] = useState('faculty'); // 'faculty' | 'students'

  // Group creation modal state (for teachers)
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [onlyAdminsPost, setOnlyAdminsPost] = useState(true);

  // Popular WhatsApp Emojis
  const EMOJI_LIST = ['😀', '😂', '🥺', '❤️', '👍', '🔥', '🎉', '📚', '🚀', '💡', '👏', '💯', '🙏', '✨', '☕', '✅'];
  const QUICK_REACTIONS = ['👍', '❤️', '😂', '🔥', '🎉', '👏'];

  // Filter chats visible to user based on role and tab
  const visibleChats = (chats || []).filter((c) => {
    // If it is a faculty-only chat and current user is student, hide
    if (c.isFacultyOnly && userRole === 'student') return false;

    // Search query matching by name or phone
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery));
    if (!matchesSearch) return false;

    // Filter tab
    if (chatFilter === 'faculty') return c.isTeacherDirect || c.isFacultyOnly;
    if (chatFilter === 'groups') return c.isGroup;
    if (chatFilter === 'students') return !c.isGroup && !c.isTeacherDirect && !c.isFacultyOnly;

    return true;
  });

  const activeChat = (chats || []).find((c) => c.id === activeChatId) || visibleChats[0];

  // Permissions in active chat
  const isAdmin = activeChat?.admins?.includes(currentUser?.id);
  const canSend = !activeChat?.isGroup || !activeChat?.onlyAdminsCanPost || isAdmin;

  // Handle file pick for attachment (Images, PDFs, docs, etc.)
  const handleFilePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsAttaching(true);
      const att = await readFileAsAttachment(file);
      setAttachedFile(att);
    } catch (err) {
      alert(err.message || 'Error attaching file');
    } finally {
      setIsAttaching(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if ((!messageText.trim() && !attachedFile) || !canSend || !activeChat) return;

    if (sendMessage) {
      sendMessage(activeChat.id, messageText, attachedFile);
    }
    setMessageText('');
    setAttachedFile(null);
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emoji) => {
    setMessageText((prev) => prev + emoji);
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    createGroupChat({
      name: newGroupName,
      onlyAdminsCanPost: onlyAdminsPost,
      memberIds: [...(students || []).map((s) => s.id), ...(teachers || []).map((t) => t.id)],
    });
    setNewGroupName('');
    setShowCreateGroup(false);
  };

  // Start direct chat with contact by phone/name
  const handleStartDirectChat = (contact, isTeacher = false) => {
    if (createDirectChat) {
      const chatId = createDirectChat({
        contactId: contact.id,
        contactName: contact.name,
        contactPhone: contact.phone || '+91 98000 00000',
        avatar: contact.avatar,
        isTeacher,
        department: contact.department,
      });
      setActiveChatId(chatId);
    }
    setShowNewChatModal(false);
  };

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[760px] animate-fadeIn">
      {/* 1. LEFT SIDEBAR: CHAT & PHONE DIRECTORY */}
      <div className="w-full md:w-88 bg-slate-950/80 border-r border-slate-800 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">ChitChat</h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {currentUser?.name} • {currentUser?.phone || '+91 98201 44521'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* New Chat Button (Contact & Phone directory) */}
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
              title="Start Chat with Teacher or Student (by phone number)"
            >
              <UserPlus className="w-4 h-4" />
            </button>

            {userRole === 'teacher' && (
              <button
                onClick={() => setShowCreateGroup(true)}
                className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md transition"
                title="Create New Class or Faculty Group"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search By Name or Phone */}
        <div className="p-3 border-b border-slate-800/80 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name or phone (+91...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/70 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px]">
            {[
              { id: 'all', label: 'All' },
              { id: 'faculty', label: 'Faculty' },
              { id: 'groups', label: 'Groups' },
              { id: 'students', label: 'Students' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setChatFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  chatFilter === tab.id
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          {visibleChats.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No chats found. Click the + button above to start a conversation by phone number!
            </div>
          ) : (
            visibleChats.map((c) => {
              const isSelected = activeChat?.id === c.id;
              // Get last message not deleted for current user
              const nonDeletedMessages = (c.messages || []).filter(
                (m) => !m.deletedFor?.includes(currentUser?.id)
              );
              const lastMsg = nonDeletedMessages[nonDeletedMessages.length - 1];

              return (
                <button
                  key={c.id}
                  onClick={() => setActiveChatId(c.id)}
                  className={`w-full p-3 flex items-start gap-3 text-left transition ${
                    isSelected
                      ? 'bg-slate-800/90 border-l-4 border-emerald-500'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-10 h-10 rounded-2xl object-cover ring-1 ring-slate-700"
                    />
                    {c.status === 'online' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                        {c.name}
                        {c.isTeacherDirect && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold">
                            Faculty
                          </span>
                        )}
                        {c.isFacultyOnly && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                            Staff Lounge
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {lastMsg?.timestamp || ''}
                      </span>
                    </div>

                    {/* Phone Number Display */}
                    {c.phone && (
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-2.5 h-2.5 text-slate-500" />
                        <span>{c.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[11px] text-slate-400 truncate max-w-[170px] flex items-center gap-1">
                        {lastMsg?.isDeletedForEveryone ? (
                          <span className="italic text-slate-500 flex items-center gap-1">
                            <Ban className="w-2.5 h-2.5 text-slate-500" /> This message was deleted
                          </span>
                        ) : lastMsg?.attachment ? (
                          <span className="text-indigo-300 flex items-center gap-1">
                            <Paperclip className="w-2.5 h-2.5" /> {lastMsg.attachment.name}
                          </span>
                        ) : lastMsg ? (
                          `${lastMsg.senderName}: ${lastMsg.text}`
                        ) : (
                          'No messages yet'
                        )}
                      </p>
                      {c.onlyAdminsCanPost && (
                        <Lock className="w-3 h-3 text-slate-500 shrink-0" title="Admin only group" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. RIGHT CHAT STAGE: WHATSAPP CONVERSATION PANEL */}
      <div className="flex-1 flex flex-col bg-slate-900/60 justify-between">
        {activeChat ? (
          <>
            {/* Stage Header */}
            <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={activeChat.avatar}
                    alt={activeChat.name}
                    className="w-10 h-10 rounded-2xl object-cover ring-1 ring-slate-700"
                  />
                  {activeChat.status === 'online' && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {activeChat.name}
                    {activeChat.isGroup && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-normal">
                        Group ({activeChat.members?.length || 5} members)
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    {activeChat.phone && (
                      <span className="font-mono text-emerald-400 font-medium">
                        {activeChat.phone}
                      </span>
                    )}
                    <span>•</span>
                    <span className="text-slate-400">
                      {activeChat.status || 'Active now'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Header */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <button
                  onClick={() => alert(`Voice call initiated with ${activeChat.name} (${activeChat.phone || 'Class channel'})`)}
                  className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition"
                  title="Voice Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openMeetingDirectly('EDU-303-ZOOM')}
                  className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-purple-400 transition"
                  title="Open Classroom 303 Live Lecture Studio"
                >
                  <Video className="w-4 h-4" />
                </button>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-xl bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 text-[10px] flex items-center gap-1 ml-1">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
            </div>

            {/* WhatsApp Messages Stream */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
              {(activeChat.messages || [])
                .filter((m) => !m.deletedFor?.includes(currentUser?.id))
                .map((msg) => {
                  const isMe = msg.senderId === currentUser?.id;
                  const isDeletedEveryone = Boolean(msg.isDeletedForEveryone);

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="relative max-w-md">
                        {/* Message Bubble */}
                        <div
                          className={`rounded-2xl p-3 text-xs shadow-md transition ${
                            isDeletedEveryone
                              ? 'bg-slate-800/80 border border-slate-700/60 text-slate-400 italic'
                              : isMe
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                              : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none'
                          }`}
                        >
                          {!isMe && !isDeletedEveryone && (
                            <span className="text-[10px] font-bold text-indigo-300 block mb-0.5">
                              {msg.senderName}
                            </span>
                          )}

                          {/* Message Content */}
                          {isDeletedEveryone ? (
                            <div className="flex items-center gap-1.5 py-0.5 text-slate-400">
                              <Ban className="w-3.5 h-3.5 text-slate-400" />
                              <span>This message was deleted</span>
                            </div>
                          ) : (
                            <>
                              {/* File Attachment Render */}
                              {msg.attachment && (
                                <div className="mb-2 p-2 rounded-xl bg-black/20 border border-white/10 space-y-1.5">
                                  {msg.attachment.isImage ? (
                                    <div className="rounded-lg overflow-hidden max-h-48 bg-black/40 flex items-center justify-center">
                                      <img
                                        src={msg.attachment.dataUrl}
                                        alt={msg.attachment.name}
                                        className="max-h-48 w-auto object-contain cursor-pointer hover:opacity-95"
                                        onClick={() => downloadAttachment(msg.attachment)}
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between gap-2 text-xs">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <FileText className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                                        <div className="truncate">
                                          <p className="font-semibold text-white truncate text-[11px]">
                                            {msg.attachment.name}
                                          </p>
                                          <span className="text-[9px] text-slate-300 font-mono">
                                            {msg.attachment.sizeFormatted || 'Document'}
                                          </span>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => downloadAttachment(msg.attachment)}
                                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition flex-shrink-0"
                                        title="Download Attached File"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Text message */}
                              {msg.text && (
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                              )}

                              {/* Meeting Interactive Card */}
                              {(msg.isMeetingInvite || msg.text?.includes('EDU-303-ZOOM') || msg.text?.includes('meeting=')) && (
                                <div className="mt-2.5 p-3 rounded-2xl bg-slate-900/90 border border-purple-500/40 text-left space-y-2 shadow-inner">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                                      <Video className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="text-[11px] font-bold text-white block">Classroom 303 • Live Virtual Lecture</span>
                                      <span className="text-[10px] text-purple-300 font-mono">Room: EDU-303-ZOOM</span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      directJoinMeeting({
                                        studentId: currentUser?.id,
                                        studentName: currentUser?.name,
                                        rollNo: currentUser?.rollNo,
                                        department: currentUser?.department,
                                      });
                                      openMeetingDirectly('EDU-303-ZOOM');
                                    }}
                                    className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 transition"
                                  >
                                    <Video className="w-3.5 h-3.5" />
                                    <span>Click Here to Join Meeting</span>
                                  </button>
                                </div>
                              )}
                            </>
                          )}

                          {/* Message Footer: Timestamp + Read Receipts */}
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[9px] font-mono ${
                              isMe ? 'text-emerald-200' : 'text-slate-400'
                            }`}
                          >
                            <span>{msg.timestamp}</span>
                            {isMe && !isDeletedEveryone && (
                              <CheckCheck
                                className={`w-3.5 h-3.5 ${
                                  msg.status === 'read' ? 'text-sky-300' : 'text-emerald-200'
                                }`}
                                title={msg.status === 'read' ? 'Read (Blue Ticks)' : 'Delivered'}
                              />
                            )}
                          </div>
                        </div>

                        {/* WhatsApp Hover Actions: Quick Reactions & Delete Trash */}
                        {!isDeletedEveryone && (
                          <div
                            className={`absolute top-0 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 z-10 ${
                              isMe ? '-left-20' : '-right-20'
                            }`}
                          >
                            {/* Quick Emoji Reaction Pill */}
                            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-1 py-0.5 shadow-lg">
                              {QUICK_REACTIONS.slice(0, 3).map((emo) => (
                                <button
                                  key={emo}
                                  onClick={() => addMessageReaction(activeChat.id, msg.id, emo)}
                                  className="text-xs hover:scale-125 transition px-0.5"
                                  title={`React with ${emo}`}
                                >
                                  {emo}
                                </button>
                              ))}
                            </div>

                            {/* Delete Message Button */}
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, message: msg })}
                              className="p-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400 shadow-lg transition"
                              title="Delete message"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Reaction Badges beneath Bubble */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div
                            className={`flex items-center gap-1 mt-0.5 ${
                              isMe ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {Object.entries(msg.reactions).map(([emo, uids]) => (
                              <button
                                key={emo}
                                onClick={() => addMessageReaction(activeChat.id, msg.id, emo)}
                                className="px-1.5 py-0.2 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-300 hover:border-slate-600 transition flex items-center gap-1"
                              >
                                <span>{emo}</span>
                                <span className="font-mono text-[9px]">{uids.length}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* WhatsApp Attachment Preview Chip */}
            {attachedFile && (
              <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs animate-fadeIn">
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-white font-medium truncate max-w-xs">
                    {attachedFile.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({attachedFile.sizeFormatted})
                  </span>
                </div>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="p-1 text-slate-400 hover:text-rose-400 transition"
                  title="Remove attachment"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* WhatsApp Quick Emoji Bar */}
            {showEmojiPicker && (
              <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2 overflow-x-auto animate-fadeIn">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Emojis:</span>
                {EMOJI_LIST.map((emo) => (
                  <button
                    key={emo}
                    type="button"
                    onClick={() => handleEmojiClick(emo)}
                    className="text-base hover:scale-130 transition px-1 py-0.5"
                  >
                    {emo}
                  </button>
                ))}
              </div>
            )}

            {/* WhatsApp Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800">
              {canSend ? (
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  {/* Emoji Button */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2 rounded-xl transition ${
                      showEmojiPicker
                        ? 'bg-emerald-600/30 text-emerald-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="Insert Emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  {/* File Attachment Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAttaching}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Attach File / Image / Document"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFilePick}
                    className="hidden"
                  />

                  {/* Message Input */}
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!messageText.trim() && !attachedFile}
                    className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white shadow-lg shadow-emerald-600/30 transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>
                    Only administrators can send messages to this group. You have read-only access.
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs p-6 text-center">
            <MessageSquare className="w-12 h-12 text-slate-600 mb-2" />
            <h4 className="text-white font-bold text-sm">Select a Conversation</h4>
            <p className="text-slate-400 mt-1 max-w-xs">
              Choose a chat from the sidebar or click the new contact icon to message a teacher or student by phone number.
            </p>
          </div>
        )}
      </div>

      {/* 3. MODAL: WHATSAPP MESSAGE DELETION (DELETE FOR ME vs DELETE FOR EVERYONE) */}
      {deleteModal.isOpen && deleteModal.message && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Delete Message?</h4>
                <p className="text-[11px] text-slate-400">Choose deletion mode like WhatsApp</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 p-3 rounded-2xl bg-slate-950 border border-slate-800 italic">
              "{deleteModal.message.text || deleteModal.message.attachment?.name || 'Attachment'}"
            </p>

            <div className="space-y-2 pt-2">
              {/* If sent by current user: Allow Delete for Everyone */}
              {deleteModal.message.senderId === currentUser?.id && (
                <button
                  onClick={() => {
                    if (deleteMessageForEveryone && activeChat) {
                      deleteMessageForEveryone(activeChat.id, deleteModal.message.id);
                    }
                    setDeleteModal({ isOpen: false, message: null });
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Delete for Everyone</span>
                </button>
              )}

              {/* Delete for Me */}
              <button
                onClick={() => {
                  if (deleteMessageForMe && activeChat) {
                    deleteMessageForMe(activeChat.id, deleteModal.message.id);
                  }
                  setDeleteModal({ isOpen: false, message: null });
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                Delete for Me
              </button>

              <button
                onClick={() => setDeleteModal({ isOpen: false, message: null })}
                className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-xs transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: CONTACT & PHONE DIRECTORY (START CHAT WITH TEACHER OR BY PHONE) */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Start New Conversation</h4>
                  <p className="text-[11px] text-slate-400">Chat with teacher or student by phone number</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs: Faculty vs Students */}
            <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                onClick={() => setContactTypeFilter('faculty')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                  contactTypeFilter === 'faculty'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Faculty / Teachers ({(teachers || []).length})
              </button>
              <button
                onClick={() => setContactTypeFilter('students')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                  contactTypeFilter === 'students'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Students ({(students || []).length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, department or phone..."
                value={contactSearchQuery}
                onChange={(e) => setContactSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Contact List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {contactTypeFilter === 'faculty' ? (
                (teachers || [])
                  .filter((t) => t.id !== currentUser?.id)
                  .filter((t) =>
                    t.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
                    (t.phone && t.phone.includes(contactSearchQuery)) ||
                    (t.department && t.department.toLowerCase().includes(contactSearchQuery.toLowerCase()))
                  )
                  .map((teach) => (
                    <div
                      key={teach.id}
                      onClick={() => handleStartDirectChat(teach, true)}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 cursor-pointer flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={teach.avatar}
                          alt={teach.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                        />
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-white group-hover:text-purple-300 transition truncate">
                            {teach.name}
                          </h5>
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            {teach.designation || 'Faculty'} • {teach.department}
                          </p>
                          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{teach.phone || '+91 98201 00000'}</span>
                          </div>
                        </div>
                      </div>

                      <button className="px-2.5 py-1 rounded-lg bg-purple-600/20 group-hover:bg-purple-600 text-purple-300 group-hover:text-white text-[11px] font-semibold transition">
                        Chat
                      </button>
                    </div>
                  ))
              ) : (
                (students || [])
                  .filter((s) => s.id !== currentUser?.id)
                  .filter((s) =>
                    s.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
                    (s.phone && s.phone.includes(contactSearchQuery)) ||
                    (s.rollNo && s.rollNo.includes(contactSearchQuery))
                  )
                  .map((stud) => (
                    <div
                      key={stud.id}
                      onClick={() => handleStartDirectChat(stud, false)}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 cursor-pointer flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={stud.avatar}
                          alt={stud.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                        />
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-white group-hover:text-indigo-300 transition truncate">
                            {stud.name}
                          </h5>
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            Roll {stud.rollNo} • {stud.department}
                          </p>
                          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{stud.phone || '+91 98765 00000'}</span>
                          </div>
                        </div>
                      </div>

                      <button className="px-2.5 py-1 rounded-lg bg-indigo-600/20 group-hover:bg-indigo-600 text-indigo-300 group-hover:text-white text-[11px] font-semibold transition">
                        Chat
                      </button>
                    </div>
                  ))
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: CREATE GROUP CHAT (TEACHERS ONLY) */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Create Class / Faculty Group
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Set group name and posting permissions for students.
            </p>

            <form onSubmit={handleCreateGroup} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Group Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Div-A Project Teams or AIML Faculty Lounge"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">Admin-Only Messages</span>
                  <p className="text-[11px] text-slate-400">
                    If checked, only you and designated admins can chat.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={onlyAdminsPost}
                  onChange={(e) => setOnlyAdminsPost(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
