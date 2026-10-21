import React, { useState, useMemo, useRef } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  readFileAsAttachment,
  downloadAttachment,
  formatFileSize,
} from '../../utils/fileAttachmentUtils';
import {
  Heart,
  Repeat2,
  MessageCircle,
  Share,
  Sparkles,
  Image,
  Smile,
  Hash,
  Send,
  CheckCircle2,
  TrendingUp,
  Trash2,
  Paperclip,
  Download,
  UserPlus,
  UserCheck,
  UserX,
  Users,
  Search,
  X,
  FileText,
  Bookmark,
  Edit3,
  Flame,
  MessageSquare,
  ArrowLeft,
  Check,
  Layers,
} from 'lucide-react';

export default function StudentSocialFreak() {
  const {
    currentUser,
    students,
    posts,
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
    setActiveMode,
  } = useCollege();

  // Navigation State: 'feed' | 'connect' | 'profile'
  const [activeMainTab, setActiveMainTab] = useState('feed');

  // Feed Sub-Tabs: 'forYou' | 'following' | 'media'
  const [feedSubTab, setFeedSubTab] = useState('forYou');

  // Active hashtag filter
  const [activeTagFilter, setActiveTagFilter] = useState('');

  // Search input
  const [searchQuery, setSearchQuery] = useState('');

  // Post Composer State
  const [postText, setPostText] = useState('');
  const [postAttachments, setPostAttachments] = useState([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Active Reply/Comment Box (postId or null)
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentInput, setCommentInput] = useState('');

  // Active Inspecting Profile (null for own, or student object)
  const [viewingProfileStudent, setViewingProfileStudent] = useState(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileBioInput, setProfileBioInput] = useState(
    currentUser?.bio || 'SY.B.Sc. AIML Undergrad @ Indira University • Deep Learning & Cloud Computing Enthusiast 🚀'
  );
  const [profileHandleInput, setProfileHandleInput] = useState(
    currentUser?.handle || `@${(currentUser?.name || 'student').toLowerCase().replace(/[^a-z0-9]/g, '_')}`
  );

  // Image Preview Modal
  const [previewImageModal, setPreviewImageModal] = useState(null);

  // Quick Trending Topics
  const trendingTopics = [
    { tag: '#IndiraAIML2026', count: '142 posts', desc: 'Trending in School of IT' },
    { tag: '#AVLTreeBenchmarking', count: '89 posts', desc: 'Data Structures Practicals' },
    { tag: '#SOITHackathon', count: '64 posts', desc: 'Upcoming Campus Tech Fest' },
    { tag: '#DeanPawarAddress', count: '45 posts', desc: 'Academic Senate Notice' },
    { tag: '#FieldProjectTeam', count: '38 posts', desc: 'Sem-III Group Submissions' },
  ];

  // My current user's connections
  const myConnections = socialConnections[currentUser?.id] || {
    following: [],
    followers: [],
    requests: [],
  };

  // Approved students list (excluding current user)
  const peerStudents = useMemo(() => {
    return students.filter(
      (s) => s.status === 'APPROVED' && s.id !== currentUser?.id
    );
  }, [students, currentUser]);

  // Handle File & Image Attachments
  const handleAttachmentUpload = async (e, isImageOnly = false) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setIsUploadingAttachment(true);
      const newAtts = [];
      for (const file of files) {
        const att = await readFileAsAttachment(file);
        newAtts.push(att);
      }
      setPostAttachments((prev) => [...prev, ...newAtts]);
    } catch (err) {
      alert(`Attachment error: ${err.message}`);
    } finally {
      setIsUploadingAttachment(false);
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (idx) => {
    setPostAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  // Create Tweet / Post
  const handlePublishPost = (e) => {
    e.preventDefault();
    if (!postText.trim() && postAttachments.length === 0) return;

    // Extract hashtags from text
    const tagsFound = postText.match(/#[a-zA-Z0-9_]+/g) || [];

    createPost(postText, tagsFound, postAttachments);
    setPostText('');
    setPostAttachments([]);
  };

  // Post Comment / Reply
  const handleAddComment = (postId) => {
    if (!commentInput.trim()) return;
    addCommentToPost(postId, commentInput);
    setCommentInput('');
  };

  // Save Profile Edit
  const handleSaveProfile = () => {
    updateStudentProfile({
      bio: profileBioInput,
      handle: profileHandleInput.startsWith('@') ? profileHandleInput : `@${profileHandleInput}`,
    });
    setIsEditingProfile(false);
    alert('Profile updated successfully!');
  };

  // Filter Posts for Feed
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullContent = `${p.authorName} ${p.authorHandle || ''} ${p.content} ${p.tags?.join(' ') || ''}`.toLowerCase();
        if (!fullContent.includes(q)) return false;
      }

      // Hashtag filter
      if (activeTagFilter) {
        if (!p.content?.toLowerCase().includes(activeTagFilter.toLowerCase()) &&
            !p.tags?.some((t) => t.toLowerCase() === activeTagFilter.toLowerCase())) {
          return false;
        }
      }

      // Feed Sub-tabs
      if (feedSubTab === 'following') {
        const isFollowed = myConnections.following?.includes(p.authorId);
        const isSelf = p.authorId === currentUser?.id;
        return isFollowed || isSelf;
      }

      if (feedSubTab === 'media') {
        return p.attachments && p.attachments.length > 0;
      }

      return true;
    });
  }, [posts, searchQuery, activeTagFilter, feedSubTab, myConnections.following, currentUser]);

  // Profile Target Student (either current user or inspected peer)
  const activeProfileUser = viewingProfileStudent || currentUser;
  const isViewingSelf = !viewingProfileStudent || viewingProfileStudent.id === currentUser?.id;
  const activeProfileConns = socialConnections[activeProfileUser?.id] || {
    following: [],
    followers: [],
    requests: [],
  };

  // Posts authored by currently viewed profile
  const profilePosts = useMemo(() => {
    return posts.filter(
      (p) =>
        p.authorId === activeProfileUser?.id ||
        p.authorName === activeProfileUser?.name
    );
  }, [posts, activeProfileUser]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* ========================================================= */}
      {/* LEFT COLUMN: X NAVIGATION PILL MENU */}
      {/* ========================================================= */}
      <div className="lg:col-span-1 space-y-4">
        {/* Navigation Card */}
        <div className="bg-slate-900/90 rounded-3xl p-4 border border-slate-800 shadow-xl space-y-2 sticky top-20">
          <div className="flex items-center gap-2.5 px-3 py-2 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20">
              <span className="text-white font-black text-sm tracking-tighter">𝕏</span>
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Social Freak</h3>
              <p className="text-[10px] text-slate-400 font-mono">Indira University SOIT</p>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <button
              onClick={() => {
                setActiveMainTab('feed');
                setViewingProfileStudent(null);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                activeMainTab === 'feed'
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Campus Feed</span>
            </button>

            <button
              onClick={() => {
                setActiveMainTab('connect');
                setViewingProfileStudent(null);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                activeMainTab === 'connect'
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Connect &amp; Peers</span>
              </div>
              {myConnections.requests?.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                  {myConnections.requests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveMainTab('profile');
                setViewingProfileStudent(null);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                activeMainTab === 'profile' && isViewingSelf
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-sky-400"
              />
              <span>My 𝕏 Profile</span>
            </button>
          </div>

          {/* Quick User Badge */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2.5 px-2">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-sky-500/30"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-sky-400 font-mono truncate">
                {currentUser?.handle || `@${(currentUser?.name || 'student').toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CENTER COLUMN: FEED / CONNECT / PROFILE */}
      {/* ========================================================= */}
      <div className="lg:col-span-2 space-y-4">
        {/* ========================================================= */}
        {/* VIEW 1: CAMPUS FEED */}
        {/* ========================================================= */}
        {activeMainTab === 'feed' && (
          <>
            {/* Header Tabs: For You | Following | Media */}
            <div className="bg-slate-900/90 rounded-3xl p-1.5 border border-slate-800 shadow-xl flex items-center">
              {[
                { id: 'forYou', label: 'For You' },
                { id: 'following', label: `Following (${myConnections.following?.length || 0})` },
                { id: 'media', label: 'Media & Files' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFeedSubTab(tab.id)}
                  className={`flex-1 py-2 text-xs font-bold rounded-2xl transition text-center ${
                    feedSubTab === tab.id
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Active Tag Notice */}
            {activeTagFilter && (
              <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300">
                <span>Filtering by topic: <strong>{activeTagFilter}</strong></span>
                <button
                  onClick={() => setActiveTagFilter('')}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* X Post Composer Box */}
            <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                  className="w-11 h-11 rounded-2xl object-cover ring-2 ring-sky-500/40 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <textarea
                    rows={3}
                    placeholder="What is happening in Indira SOIT? Share notes, code, queries, campus buzz..."
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed"
                    maxLength={280}
                  />

                  {/* Attachment Previews */}
                  {postAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 pb-1">
                      {postAttachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                        >
                          {att.type?.startsWith('image/') ? (
                            <Image className="w-3.5 h-3.5 text-sky-400" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-purple-400" />
                          )}
                          <span className="truncate max-w-[150px] font-semibold">{att.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({att.size})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(idx)}
                            className="text-slate-400 hover:text-rose-400 ml-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tag Suggestions */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {['#IndiraAIML2026', '#DataStructures', '#AVLTreeBenchmarking', '#Hackathon', '#FieldProject'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setPostText((prev) => `${prev} ${tag}`)}
                        className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 px-2 py-0.5 rounded-lg border border-sky-500/20 transition"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Composer Toolbar */}
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      {/* Image Upload Input */}
                      <input
                        type="file"
                        accept="image/*"
                        ref={imageInputRef}
                        onChange={(e) => handleAttachmentUpload(e, true)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="p-2 rounded-xl hover:bg-slate-800 hover:text-sky-400 transition"
                        title="Attach Photo / Image"
                      >
                        <Image className="w-4 h-4" />
                      </button>

                      {/* File / Doc Upload Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleAttachmentUpload(e, false)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-xl hover:bg-slate-800 hover:text-sky-400 transition"
                        title="Attach File / Code / Document"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>

                      {/* Quick Emojis */}
                      <button
                        type="button"
                        onClick={() => setPostText((prev) => `${prev} 🚀✨`)}
                        className="p-2 rounded-xl hover:bg-slate-800 hover:text-sky-400 transition"
                        title="Add Emojis"
                      >
                        <Smile className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {280 - postText.length}
                      </span>
                      <button
                        onClick={handlePublishPost}
                        disabled={!postText.trim() && postAttachments.length === 0}
                        className="px-5 py-2 rounded-full bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white text-xs font-extrabold shadow-lg shadow-sky-500/30 transition flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Stream */}
            <div className="space-y-4">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => {
                  const isAuthor = post.authorId === currentUser?.id;
                  const isLiked = post.likedBy?.includes(currentUser?.id) || post.liked;
                  const isReposted = post.repostedBy?.includes(currentUser?.id) || post.reposted;
                  const showComments = activeCommentPostId === post.id;

                  return (
                    <div
                      key={post.id}
                      className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 hover:border-slate-700/80 transition shadow-lg space-y-3"
                    >
                      {/* Post Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.authorAvatar}
                            alt={post.authorName}
                            onClick={() => {
                              const found = students.find((s) => s.id === post.authorId);
                              if (found) {
                                setViewingProfileStudent(found);
                                setActiveMainTab('profile');
                              }
                            }}
                            className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-700 cursor-pointer hover:ring-sky-400 transition"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span
                                onClick={() => {
                                  const found = students.find((s) => s.id === post.authorId);
                                  if (found) {
                                    setViewingProfileStudent(found);
                                    setActiveMainTab('profile');
                                  }
                                }}
                                className="text-sm font-bold text-white cursor-pointer hover:underline"
                              >
                                {post.authorName}
                              </span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                              <span className="text-xs text-slate-400 font-mono">
                                {post.authorHandle || `@${post.authorName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400">{post.authorRole}</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-[10px] text-slate-500 font-mono">{post.timestamp}</span>
                            </div>
                          </div>
                        </div>

                        {isAuthor && (
                          <button
                            onClick={() => {
                              if (confirm('Delete this post?')) {
                                deletePost(post.id);
                              }
                            }}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Delete your post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Post Text */}
                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>

                      {/* Post Attachments (Images & Files) */}
                      {post.attachments && post.attachments.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {post.attachments.map((att, aIdx) => {
                            const isImg = att.type?.startsWith('image/') || att.dataUrl?.startsWith('data:image/');

                            if (isImg && att.dataUrl) {
                              return (
                                <div
                                  key={aIdx}
                                  onClick={() => setPreviewImageModal(att.dataUrl)}
                                  className="relative rounded-2xl overflow-hidden border border-slate-800 cursor-pointer group max-h-72 bg-black"
                                >
                                  <img
                                    src={att.dataUrl}
                                    alt={att.name}
                                    className="w-full object-cover group-hover:scale-105 transition duration-300"
                                  />
                                </div>
                              );
                            }

                            return (
                              <div
                                key={aIdx}
                                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs"
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <FileText className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                  <div className="truncate">
                                    <p className="font-semibold text-white truncate">{att.name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">
                                      {att.size || 'Attachment'}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  onClick={() => downloadAttachment(att)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold flex items-center gap-1 transition"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* X Action Bar (Like, Repost, Comment, Share) */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        {/* Reply / Comment */}
                        <button
                          onClick={() => setActiveCommentPostId(showComments ? null : post.id)}
                          className={`flex items-center gap-1.5 transition ${
                            showComments ? 'text-sky-400 font-bold' : 'hover:text-sky-400'
                          }`}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.commentsList?.length || post.comments || 0}</span>
                        </button>

                        {/* Repost / Retweet */}
                        <button
                          onClick={() => toggleRepost(post.id)}
                          className={`flex items-center gap-1.5 transition ${
                            isReposted ? 'text-emerald-400 font-bold' : 'hover:text-emerald-400'
                          }`}
                        >
                          <Repeat2 className="w-4 h-4" />
                          <span>{post.reposts || 0}</span>
                        </button>

                        {/* Like / Heart */}
                        <button
                          onClick={() => toggleLikePost(post.id)}
                          className={`flex items-center gap-1.5 transition ${
                            isLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-400'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
                          <span>{post.likes || 0}</span>
                        </button>

                        {/* Share */}
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(window.location.href);
                            alert('Post link copied to clipboard!');
                          }}
                          className="hover:text-purple-400 transition"
                          title="Share post"
                        >
                          <Share className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Inline Comments Section */}
                      {showComments && (
                        <div className="pt-3 border-t border-slate-800 space-y-3">
                          {/* Add Reply Input */}
                          <div className="flex items-center gap-2">
                            <img
                              src={currentUser?.avatar}
                              alt={currentUser?.name}
                              className="w-7 h-7 rounded-xl object-cover ring-1 ring-slate-700"
                            />
                            <input
                              type="text"
                              placeholder="Post your reply..."
                              value={commentInput}
                              onChange={(e) => setCommentInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddComment(post.id);
                              }}
                              className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              className="px-3 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-400 transition"
                            >
                              Reply
                            </button>
                          </div>

                          {/* Comments List */}
                          {post.commentsList && post.commentsList.length > 0 ? (
                            <div className="space-y-2 pt-1">
                              {post.commentsList.map((c) => (
                                <div
                                  key={c.id}
                                  className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs flex items-start gap-2.5"
                                >
                                  <img
                                    src={c.authorAvatar}
                                    alt={c.authorName}
                                    className="w-6 h-6 rounded-lg object-cover ring-1 ring-slate-700"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-white">{c.authorName}</span>
                                      <span className="text-[10px] text-slate-500 font-mono">{c.timestamp}</span>
                                    </div>
                                    <p className="text-slate-300 mt-1 leading-relaxed">{c.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500 italic">No replies yet. Be the first to reply!</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
                  No posts found matching the active criteria. Start the conversation above!
                </div>
              )}
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: CONNECT & PEERS DIRECTORY */}
        {/* ========================================================= */}
        {activeMainTab === 'connect' && (
          <div className="space-y-4">
            {/* Pending Requests */}
            {myConnections.requests?.length > 0 && (
              <div className="bg-slate-900/90 rounded-3xl p-5 border border-purple-500/40 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-purple-400" />
                    Pending Connection Requests ({myConnections.requests.length})
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {myConnections.requests.map((req) => (
                    <div
                      key={req.fromUserId}
                      className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={req.fromAvatar}
                          alt={req.fromName}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-purple-400"
                        />
                        <div>
                          <p className="font-bold text-white">{req.fromName}</p>
                          <p className="text-[10px] text-sky-400 font-mono">{req.fromHandle}</p>
                          <p className="text-[10px] text-slate-400">{req.fromDepartment}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => acceptConnectionRequest(req.fromUserId)}
                          className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => rejectConnectionRequest(req.fromUserId)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Campus Peers Directory */}
            <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    Campus Peers Directory
                  </h4>
                  <p className="text-xs text-slate-400">
                    Connect with fellow students across AIML, CSE, IT, and Data Science.
                  </p>
                </div>
                <span className="text-xs text-sky-400 font-mono">
                  {peerStudents.length} Students Active
                </span>
              </div>

              <div className="space-y-3">
                {peerStudents.map((stud) => {
                  const isFollowing = myConnections.following?.includes(stud.id);
                  const isFollower = myConnections.followers?.includes(stud.id);
                  const handle = stud.handle || `@${stud.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

                  return (
                    <div
                      key={stud.id}
                      className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/80 transition flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={stud.avatar}
                          alt={stud.name}
                          onClick={() => {
                            setViewingProfileStudent(stud);
                            setActiveMainTab('profile');
                          }}
                          className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-700 cursor-pointer hover:ring-sky-400 transition"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              onClick={() => {
                                setViewingProfileStudent(stud);
                                setActiveMainTab('profile');
                              }}
                              className="font-bold text-white cursor-pointer hover:underline text-sm"
                            >
                              {stud.name}
                            </span>
                            <span className="text-sky-400 font-mono text-xs">{handle}</span>
                          </div>
                          <p className="text-slate-400 text-[11px]">
                            {stud.department} • Batch {stud.batch} • Roll #{stud.rollNo}
                          </p>
                          {isFollower && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 text-[9px] font-semibold">
                              Follows you
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setViewingProfileStudent(stud);
                            setActiveMainTab('profile');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
                        >
                          Profile
                        </button>

                        <button
                          onClick={() => toggleFollowUser(stud.id)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                            isFollowing
                              ? 'bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700'
                              : 'bg-white hover:bg-slate-200 text-slate-900 shadow-md'
                          }`}
                        >
                          {isFollowing ? 'Following' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: PROFILE & ACCOUNT VIEW */}
        {/* ========================================================= */}
        {activeMainTab === 'profile' && (
          <div className="space-y-4">
            {/* Profile Header Banner Card */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
              {/* Header Cover Banner */}
              <div className="h-32 bg-gradient-to-r from-sky-600 via-indigo-700 to-purple-800 relative">
                {!isViewingSelf && (
                  <button
                    onClick={() => {
                      setViewingProfileStudent(null);
                      setActiveMainTab('feed');
                    }}
                    className="absolute top-4 left-4 p-2 rounded-xl bg-slate-900/70 text-white hover:bg-slate-900 transition flex items-center gap-1.5 text-xs font-semibold backdrop-blur-sm"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Feed</span>
                  </button>
                )}
              </div>

              {/* Profile Details Bar */}
              <div className="p-6 relative pt-0">
                <div className="flex items-end justify-between -mt-12 mb-4">
                  <img
                    src={activeProfileUser?.avatar}
                    alt={activeProfileUser?.name}
                    className="w-24 h-24 rounded-3xl object-cover ring-4 ring-slate-900 shadow-2xl bg-slate-900"
                  />

                  <div>
                    {isViewingSelf ? (
                      <button
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="px-4 py-2 rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFollowUser(activeProfileUser?.id)}
                          className={`px-5 py-2 rounded-full text-xs font-bold transition ${
                            myConnections.following?.includes(activeProfileUser?.id)
                              ? 'bg-slate-800 text-slate-300 hover:text-rose-300 border border-slate-700'
                              : 'bg-white hover:bg-slate-200 text-slate-900 shadow-md'
                          }`}
                        >
                          {myConnections.following?.includes(activeProfileUser?.id)
                            ? 'Following'
                            : 'Connect'}
                        </button>
                        <button
                          onClick={() => {
                            setActiveMode('chitchat');
                          }}
                          className="px-3.5 py-2 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30 text-xs font-bold transition flex items-center gap-1"
                          title="Message on ChitChat"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Edit Box */}
                {isEditingProfile ? (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs mb-4">
                    <p className="font-bold text-white">Edit Your 𝕏 Profile</p>
                    <div>
                      <label className="block text-slate-400 mb-1">Handle</label>
                      <input
                        type="text"
                        value={profileHandleInput}
                        onChange={(e) => setProfileHandleInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Bio / Tagline</label>
                      <textarea
                        rows={2}
                        value={profileBioInput}
                        onChange={(e) => setProfileBioInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="px-4 py-1.5 rounded-xl bg-sky-500 text-white font-bold text-xs"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-white">{activeProfileUser?.name}</h3>
                      <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    </div>
                    <p className="text-xs text-sky-400 font-mono">
                      {activeProfileUser?.handle || `@${activeProfileUser?.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                    </p>

                    <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                      {activeProfileUser?.bio || 'SY.B.Sc. AIML Student @ Indira University School of IT'}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>Department: <strong className="text-white">{activeProfileUser?.department || 'AIML'}</strong></span>
                      <span>•</span>
                      <span>Batch: <strong className="text-white">{activeProfileUser?.batch || 'A'}</strong></span>
                      <span>•</span>
                      <span>Roll No: <strong className="text-white">#{activeProfileUser?.rollNo || '15'}</strong></span>
                    </div>

                    {/* Stats Row */}
                    <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-6 text-xs">
                      <div>
                        <strong className="text-white font-bold text-sm">{profilePosts.length}</strong>{' '}
                        <span className="text-slate-400">Posts</span>
                      </div>
                      <div>
                        <strong className="text-white font-bold text-sm">
                          {activeProfileConns.following?.length || 0}
                        </strong>{' '}
                        <span className="text-slate-400">Following</span>
                      </div>
                      <div>
                        <strong className="text-white font-bold text-sm">
                          {activeProfileConns.followers?.length || 0}
                        </strong>{' '}
                        <span className="text-slate-400">Followers</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Authored Posts */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                Posts by {activeProfileUser?.name}
              </h4>
              {profilePosts.length > 0 ? (
                profilePosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                      <span>{post.timestamp}</span>
                      <span>❤️ {post.likes || 0} • 🔁 {post.reposts || 0}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
                  No posts published yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* RIGHT COLUMN: TRENDS & CAMPUS BUZZ */}
      {/* ========================================================= */}
      <div className="lg:col-span-1 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search 𝕏 campus posts, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 shadow-md"
          />
        </div>

        {/* Trending Box */}
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Flame className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Trends for You
            </h4>
          </div>

          <div className="space-y-2.5">
            {trendingTopics.map((topic, i) => (
              <div
                key={i}
                onClick={() => setActiveTagFilter(topic.tag)}
                className="p-2.5 rounded-2xl hover:bg-slate-800/80 transition cursor-pointer group"
              >
                <p className="text-[10px] text-slate-400">{topic.desc}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs font-bold text-white group-hover:text-sky-400 transition">
                    {topic.tag}
                  </p>
                  <TrendingUp className="w-3 h-3 text-slate-500 group-hover:text-sky-400" />
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{topic.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Who to Connect With (Top 3) */}
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              Who to Connect
            </h4>
            <button
              onClick={() => setActiveMainTab('connect')}
              className="text-[11px] text-sky-400 hover:underline"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {peerStudents.slice(0, 3).map((peer) => {
              const isFollowing = myConnections.following?.includes(peer.id);
              return (
                <div key={peer.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={peer.avatar}
                      alt={peer.name}
                      onClick={() => {
                        setViewingProfileStudent(peer);
                        setActiveMainTab('profile');
                      }}
                      className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-700 cursor-pointer"
                    />
                    <div className="truncate">
                      <p
                        onClick={() => {
                          setViewingProfileStudent(peer);
                          setActiveMainTab('profile');
                        }}
                        className="font-bold text-white truncate cursor-pointer hover:underline"
                      >
                        {peer.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {peer.handle || `@${peer.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFollowUser(peer.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex-shrink-0 ${
                      isFollowing
                        ? 'bg-slate-800 text-slate-300 border border-slate-700'
                        : 'bg-white hover:bg-slate-200 text-slate-900'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 rounded-3xl p-5 border border-indigo-500/20 text-xs text-slate-300 space-y-1.5">
          <h5 className="font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            Social Freak Etiquette
          </h5>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Connect respectfully with peers. Share project updates, algorithm proofs, study resources, and tech queries.
          </p>
        </div>
      </div>

      {/* Image Preview Lightbox Modal */}
      {previewImageModal && (
        <div
          onClick={() => setPreviewImageModal(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImageModal}
              alt="Enlarged Post Media"
              className="rounded-2xl max-h-[85vh] object-contain shadow-2xl"
            />
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
