"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Check,
  Circle,
  CheckCircle,
  X,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Eye,
  EyeOff,
  Files,
  CalendarPlus,
} from "lucide-react";
import { useSocialAuth } from "../../components/SocialAuthProvider";

/* ─── Types ─── */

interface Post {
  id: string;
  content: string;
  platform: string;
  category: string | null;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at?: string;
  generation_metadata?: Record<string, unknown> | null;
}

/* ─── Constants ─── */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const platformBadge: Record<string, { bg: string; text: string; label: string }> = {
  twitter: { bg: "bg-[#6B7280]", text: "text-white", label: "X" },
  linkedin: { bg: "bg-[#4374BA]", text: "text-white", label: "Li" },
  instagram: { bg: "bg-[#6C3393]", text: "text-white", label: "Ig" },
};

const platformBorder: Record<string, string> = {
  twitter: "border-l-[#6B7280]",
  linkedin: "border-l-[#4374BA]",
  instagram: "border-l-[#6C3393]",
};

const TWITTER_TIME_SLOTS = [
  { label: "10:00 AM EST", hourUTC: 15 },
  { label: "1:00 PM EST", hourUTC: 18 },
  { label: "4:00 PM EST", hourUTC: 21 },
];

const LINKEDIN_TIME_SLOT = { label: "9:00 AM EST", hourUTC: 14 };

const CHAR_LIMITS: Record<string, number> = { twitter: 280, linkedin: 3000 };

const STATUS_PILL: Record<string, string> = {
  approved: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  scheduled: "bg-[#4374BA]/10 text-[#4374BA] border-[#4374BA]/20",
  published: "bg-green-500/10 text-green-400 border-green-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
};

/* ─── Helpers ─── */

function getWeekDates(offset: number): Date[] {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatTimeEST(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const h = (d.getUTCHours() - 5 + 24) % 24;
  const ampm = h >= 12 ? "PM" : "AM";
  const dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${dh}:00 ${ampm}`;
}

function formatDateShort(iso: string | null): string {
  if (!iso) return "Not scheduled";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " · " + formatTimeEST(iso);
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

function statusLabel(s: string): string {
  if (s === "approved") return "Unscheduled";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ─── Component ─── */

export default function QueuePage() {
  const { user, loading, session } = useSocialAuth();
  const router = useRouter();

  /* ── Shared state ── */
  const [filter, setFilter] = useState<string>("all");
  const [weekOffset, setWeekOffset] = useState(0);

  /* ── Data ── */
  const [calendarPosts, setCalendarPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [loadingQueue, setLoadingQueue] = useState(true);

  /* ── Calendar modals ── */
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingPublish, setTogglingPublish] = useState<Set<string>>(new Set());

  /* ── New post modal ── */
  const [newPostDate, setNewPostDate] = useState<Date | null>(null);
  const [newPostPlatform, setNewPostPlatform] = useState<"linkedin" | "twitter">("twitter");
  const [newPostTimeSlot, setNewPostTimeSlot] = useState(0);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostSaving, setNewPostSaving] = useState(false);
  const [newPostError, setNewPostError] = useState<string | null>(null);

  /* ── Drag state ── */
  const [dragPostId, setDragPostId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);

  /* ── Queue inline edit ── */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inlineContent, setInlineContent] = useState("");
  const [inlineSaving, setInlineSaving] = useState(false);

  /* ── Preview ── */
  const [previewId, setPreviewId] = useState<string | null>(null);

  /* ── Duplicate flash ── */
  const [duplicatedId, setDuplicatedId] = useState<string | null>(null);

  /* ── Schedule picker for unscheduled ── */
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleSlot, setScheduleSlot] = useState(0);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  /* ── Bulk selection ── */
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDate, setBulkDate] = useState("");
  const [showBulkReschedule, setShowBulkReschedule] = useState(false);
  const [bulkActing, setBulkActing] = useState(false);

  /* ── Auth guard ── */
  useEffect(() => {
    if (!loading && !user) router.replace("/sign-in");
  }, [user, loading, router]);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  /* ── Fetch calendar posts ── */
  const fetchCalendar = useCallback(async () => {
    if (!user) return;
    setLoadingCalendar(true);
    try {
      const start = weekDates[0].toISOString();
      const end = new Date(weekDates[6].getTime() + 86400000).toISOString();
      const res = await fetch(`/api/posts?scheduled_after=${start}&scheduled_before=${end}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setCalendarPosts(
          (data.posts || []).filter((p: Post) => ["approved", "scheduled", "published"].includes(p.status))
        );
      }
    } catch { /* silent */ } finally {
      setLoadingCalendar(false);
    }
  }, [user, weekDates]);

  /* ── Fetch queue + unscheduled posts ── */
  const fetchQueue = useCallback(async () => {
    if (!user) return;
    setLoadingQueue(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch("/api/posts?status=approved&limit=100"),
        fetch("/api/posts?status=scheduled&limit=100"),
      ]);
      const d1 = r1.ok ? await r1.json() : { posts: [] };
      const d2 = r2.ok ? await r2.json() : { posts: [] };
      const merged = [...(d1.posts || []), ...(d2.posts || [])];
      const unique = Array.from(new Map(merged.map((p: Post) => [p.id, p])).values()) as Post[];
      unique.sort((a, b) => {
        if (!a.scheduled_at && !b.scheduled_at) return 0;
        if (!a.scheduled_at) return 1;
        if (!b.scheduled_at) return -1;
        return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
      });
      setAllPosts(unique);
    } catch { /* silent */ } finally {
      setLoadingQueue(false);
    }
  }, [user]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);
  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  /* ── Derived data ── */
  const applyFilter = useCallback(
    (posts: Post[]) => (filter === "all" ? posts : posts.filter((p) => p.platform === filter)),
    [filter]
  );

  const unscheduledPosts = useMemo(
    () => applyFilter(allPosts.filter((p) => !p.scheduled_at && p.status === "approved")),
    [allPosts, applyFilter]
  );

  const queuePosts = useMemo(
    () => applyFilter(allPosts.filter((p) => p.scheduled_at)),
    [allPosts, applyFilter]
  );

  /* ─────────────── API helpers ─────────────── */

  const authHeaders = useCallback(() => {
    if (!session) return {};
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    };
  }, [session]);

  async function patchPost(id: string, body: Record<string, unknown>): Promise<Post | null> {
    if (!session) return null;
    const res = await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: authHeaders() as HeadersInit,
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.post;
  }

  function updatePostInState(updated: Post) {
    setCalendarPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setAllPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedPost?.id === updated.id) setSelectedPost(updated);
  }

  function removePostFromState(id: string) {
    setCalendarPosts((prev) => prev.filter((p) => p.id !== id));
    setAllPosts((prev) => prev.filter((p) => p.id !== id));
    if (selectedPost?.id === id) { setSelectedPost(null); setShowDeleteConfirm(false); }
  }

  /* ─── Calendar: edit modal ─── */
  function openPostDetail(post: Post) {
    setSelectedPost(post);
    setEditContent(post.content);
    setSaved(false);
    setShowDeleteConfirm(false);
  }

  async function handleSaveEdit() {
    if (!selectedPost) return;
    setSaving(true);
    const updated = await patchPost(selectedPost.id, { content: editContent });
    if (updated) {
      updatePostInState(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  const togglePublish = useCallback(
    async (post: Post, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      if (!session) return;
      setTogglingPublish((prev) => new Set(prev).add(post.id));
      const newStatus = post.status === "published" ? "approved" : "published";
      const updated = await patchPost(post.id, { status: newStatus });
      if (updated) updatePostInState(updated);
      setTogglingPublish((prev) => { const n = new Set(prev); n.delete(post.id); return n; });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session]
  );

  async function handleCopy(id: string, content: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (await copyText(content)) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  async function handleDeletePost(id?: string) {
    const targetId = id || selectedPost?.id;
    if (!targetId || !session) return;
    setDeleting(true);
    await patchPost(targetId, { generation_metadata: { deleted_for_reuse: true, deleted_at: new Date().toISOString() } });
    const res = await fetch(`/api/posts/${targetId}`, { method: "DELETE", headers: { Authorization: `Bearer ${session.access_token}` } });
    if (res.ok) removePostFromState(targetId);
    setDeleting(false);
  }

  /* ─── Calendar: new post ─── */
  function openNewPostModal(date: Date) {
    setNewPostDate(date);
    setNewPostPlatform("twitter");
    setNewPostTimeSlot(0);
    setNewPostContent("");
    setNewPostError(null);
  }

  async function handleCreatePost() {
    if (!newPostDate || !session || !newPostContent.trim()) return;
    setNewPostSaving(true);
    setNewPostError(null);
    const hourUTC = newPostPlatform === "linkedin" ? LINKEDIN_TIME_SLOT.hourUTC : TWITTER_TIME_SLOTS[newPostTimeSlot]?.hourUTC ?? 12;
    const scheduled = new Date(Date.UTC(newPostDate.getFullYear(), newPostDate.getMonth(), newPostDate.getDate(), hourUTC, 0, 0));
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: authHeaders() as HeadersInit,
        body: JSON.stringify({
          content: newPostContent.trim(),
          platform: newPostPlatform,
          category: newPostPlatform === "linkedin" ? "tech_story" : "current_events",
          status: "approved",
          scheduled_at: scheduled.toISOString(),
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => null); setNewPostError(d?.error || `Failed (${res.status})`); return; }
      const data = await res.json();
      setCalendarPosts((prev) => [...prev, data.post]);
      setAllPosts((prev) => [...prev, data.post]);
      setNewPostDate(null);
    } catch (err) {
      setNewPostError(err instanceof Error ? err.message : "Network error");
    } finally {
      setNewPostSaving(false);
    }
  }

  /* ─── Drag-to-reschedule ─── */
  function handleDragStart(e: React.DragEvent, postId: string) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", postId);
    setDragPostId(postId);
  }

  function handleDragOver(e: React.DragEvent, dayIndex: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(dayIndex);
  }

  function handleDragLeave() {
    setDropTarget(null);
  }

  async function handleDrop(e: React.DragEvent, dayIndex: number) {
    e.preventDefault();
    setDropTarget(null);
    const postId = e.dataTransfer.getData("text/plain");
    if (!postId) return;
    const post = calendarPosts.find((p) => p.id === postId);
    if (!post || !post.scheduled_at) return;
    const targetDate = weekDates[dayIndex];
    const orig = new Date(post.scheduled_at);
    const newScheduled = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), orig.getUTCHours(), orig.getUTCMinutes(), 0));
    const newIso = newScheduled.toISOString();
    // Optimistic update
    const optimistic = { ...post, scheduled_at: newIso };
    updatePostInState(optimistic);
    setDragPostId(null);
    const updated = await patchPost(postId, { scheduled_at: newIso });
    if (!updated) {
      // Revert
      updatePostInState(post);
    }
  }

  function handleDragEnd() {
    setDragPostId(null);
    setDropTarget(null);
  }

  /* ─── Inline edit ─── */
  function startInlineEdit(post: Post) {
    setEditingId(post.id);
    setInlineContent(post.content);
  }

  async function saveInlineEdit(postId: string) {
    setInlineSaving(true);
    const updated = await patchPost(postId, { content: inlineContent });
    if (updated) updatePostInState(updated);
    setEditingId(null);
    setInlineSaving(false);
  }

  /* ─── Duplicate ─── */
  async function handleDuplicate(post: Post) {
    if (!session) return;
    const newPlatform = post.platform === "twitter" ? "linkedin" : "twitter";
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: authHeaders() as HeadersInit,
      body: JSON.stringify({ content: post.content, platform: newPlatform, category: post.category, status: "approved" }),
    });
    if (res.ok) {
      const data = await res.json();
      setAllPosts((prev) => [...prev, data.post]);
      setDuplicatedId(post.id);
      setTimeout(() => setDuplicatedId(null), 2000);
    }
  }

  /* ─── Schedule unscheduled ─── */
  async function handleSchedulePost(post: Post) {
    if (!scheduleDate) return;
    setScheduleSaving(true);
    const hourUTC = post.platform === "linkedin" ? LINKEDIN_TIME_SLOT.hourUTC : TWITTER_TIME_SLOTS[scheduleSlot]?.hourUTC ?? 15;
    const parts = scheduleDate.split("-").map(Number);
    const scheduled = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], hourUTC, 0, 0));
    const updated = await patchPost(post.id, { scheduled_at: scheduled.toISOString() });
    if (updated) {
      updatePostInState(updated);
      setCalendarPosts((prev) => [...prev, updated]);
    }
    setSchedulingId(null);
    setScheduleDate("");
    setScheduleSlot(0);
    setScheduleSaving(false);
  }

  /* ─── Bulk actions ─── */
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function bulkPush1Week() {
    if (!session) return;
    setBulkActing(true);
    const ids = Array.from(selected);
    for (const id of ids) {
      const post = allPosts.find((p) => p.id === id);
      if (!post?.scheduled_at) continue;
      const d = new Date(post.scheduled_at);
      d.setDate(d.getDate() + 7);
      const updated = await patchPost(id, { scheduled_at: d.toISOString() });
      if (updated) updatePostInState(updated);
    }
    setSelected(new Set());
    setBulkActing(false);
    fetchCalendar();
  }

  async function bulkReschedule() {
    if (!session || !bulkDate) return;
    setBulkActing(true);
    const ids = Array.from(selected);
    const parts = bulkDate.split("-").map(Number);
    for (const id of ids) {
      const post = allPosts.find((p) => p.id === id);
      if (!post) continue;
      const origHour = post.scheduled_at ? new Date(post.scheduled_at).getUTCHours() : 15;
      const scheduled = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], origHour, 0, 0));
      const updated = await patchPost(id, { scheduled_at: scheduled.toISOString() });
      if (updated) updatePostInState(updated);
    }
    setSelected(new Set());
    setShowBulkReschedule(false);
    setBulkDate("");
    setBulkActing(false);
    fetchCalendar();
  }

  async function bulkDelete() {
    if (!session || !confirm(`Delete ${selected.size} post(s)? This cannot be undone.`)) return;
    setBulkActing(true);
    const ids = Array.from(selected);
    for (const id of ids) {
      await patchPost(id, { generation_metadata: { deleted_for_reuse: true, deleted_at: new Date().toISOString() } });
      await fetch(`/api/posts/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${session.access_token}` } });
      removePostFromState(id);
    }
    setSelected(new Set());
    setBulkActing(false);
  }

  /* ─── Loading / Auth guard ─── */
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#4374BA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const today = new Date();
  const monthLabel = (() => {
    const months = new Set(weekDates.map((d) => d.toLocaleString("en-US", { month: "long", year: "numeric" })));
    return Array.from(months).join(" / ");
  })();

  /* ══════════════════════════ RENDER ══════════════════════════ */

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

      {/* ═══ SECTION 1: CALENDAR BAR ═══ */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Calendar</h2>
            <div className="flex items-center gap-1 mt-0.5">
              <button onClick={() => setWeekOffset((w) => w - 4)} className="text-gray-400 hover:text-white transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <p className="text-sm text-gray-400">{monthLabel}</p>
              <button onClick={() => setWeekOffset((w) => w + 4)} className="text-gray-400 hover:text-white transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset((w) => w - 1)} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-colors">Prev</button>
            <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-colors">Today</button>
            <button onClick={() => setWeekOffset((w) => w + 1)} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-colors">Next</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, i) => {
            const isToday = isSameDay(date, today);
            const isDrop = dropTarget === i;
            const dayPosts = applyFilter(
              calendarPosts.filter((p) => {
                const pd = p.scheduled_at ? new Date(p.scheduled_at) : new Date(p.created_at);
                return isSameDay(pd, date);
              })
            );

            return (
              <div
                key={i}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, i)}
                className={`min-h-[180px] rounded-xl border p-2 transition-colors ${
                  isDrop ? "border-[#4374BA] bg-[#4374BA]/10 ring-2 ring-[#4374BA]/40" :
                  isToday ? "border-[#4374BA]/40 bg-[#4374BA]/5" :
                  "border-white/[0.06] bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{DAYS[i]}</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openNewPostModal(date)} title="Add post" className="w-4 h-4 flex items-center justify-center rounded bg-white/[0.06] hover:bg-white/[0.12] text-gray-500 hover:text-white transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className={`text-xs font-medium ${isToday ? "text-[#4374BA]" : "text-gray-400"}`}>{date.getDate()}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {loadingCalendar ? (
                    <div className="h-8 bg-white/[0.04] rounded animate-pulse" />
                  ) : (
                    dayPosts.map((post) => {
                      const badge = platformBadge[post.platform] || platformBadge.twitter;
                      const bColor = platformBorder[post.platform] || "border-l-gray-500";
                      const isPublished = post.status === "published";
                      const isToggling = togglingPublish.has(post.id);
                      const isCopied = copiedId === post.id;
                      const isDragging = dragPostId === post.id;

                      return (
                        <div
                          key={post.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, post.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => openPostDetail(post)}
                          className={`group relative p-1.5 rounded-md border border-l-2 ${bColor} cursor-grab transition-all ${
                            isDragging ? "opacity-50 scale-95" :
                            isPublished ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10" :
                            "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <div className="flex items-center gap-1">
                              <GripVertical className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>{badge.label}</span>
                              {post.scheduled_at && <span className="text-[9px] text-gray-500">{formatTimeEST(post.scheduled_at)}</span>}
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={(e) => handleCopy(post.id, post.content, e)} title="Copy" className="transition-colors">
                                {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400" />}
                              </button>
                              <button onClick={(e) => togglePublish(post, e)} disabled={isToggling} title={isPublished ? "Mark unposted" : "Mark posted"} className="transition-colors disabled:opacity-50">
                                {isToggling ? <span className="w-3.5 h-3.5 border border-gray-500 border-t-transparent rounded-full animate-spin inline-block" /> :
                                  isPublished ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Circle className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-400" />}
                              </button>
                            </div>
                          </div>
                          {isPublished && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold text-green-400 bg-green-500/10 px-1 py-0.5 rounded mb-0.5">
                              <Check className="w-2 h-2" />Published
                            </span>
                          )}
                          <p className={`text-[10px] line-clamp-2 leading-tight ${isPublished ? "text-gray-500" : "text-gray-400"}`}>
                            {post.content.slice(0, 100)}{post.content.length > 100 ? "..." : ""}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ PLATFORM FILTER ═══ */}
      <div className="flex items-center gap-1 mb-6">
        {["all", "twitter", "linkedin"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              filter === f ? "bg-white/[0.08] text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* ═══ SECTION 2: UNSCHEDULED BIN ═══ */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-white mb-1">Unscheduled</h2>
        <p className="text-xs text-gray-500 mb-4">{unscheduledPosts.length} post{unscheduledPosts.length !== 1 ? "s" : ""} without a date</p>

        {loadingQueue ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-24 bg-white/[0.03] border border-white/[0.06] rounded-xl animate-pulse" />)}
          </div>
        ) : unscheduledPosts.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-white/[0.08] rounded-xl">
            <p className="text-sm text-gray-500">No unscheduled posts. Approve posts in Generate to see them here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unscheduledPosts.map((post) => {
              const badge = platformBadge[post.platform] || platformBadge.twitter;
              const isScheduling = schedulingId === post.id;

              return (
                <div key={post.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>{badge.label}</span>
                    {post.category && <span className="text-xs text-gray-600">{post.category.replace(/_/g, " ")}</span>}
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap mb-3">{post.content}</p>

                  {isScheduling ? (
                    <div className="flex flex-wrap items-end gap-2 p-3 bg-white/[0.02] rounded-lg border border-white/[0.06]">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">Date</label>
                        <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="bg-white/[0.03] border border-white/[0.08] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#4374BA]/50" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">Time</label>
                        <select value={scheduleSlot} onChange={(e) => setScheduleSlot(Number(e.target.value))} className="bg-white/[0.03] border border-white/[0.08] rounded px-2 py-1 text-xs text-white focus:outline-none">
                          {(post.platform === "linkedin" ? [LINKEDIN_TIME_SLOT] : TWITTER_TIME_SLOTS).map((slot, idx) => (
                            <option key={idx} value={idx}>{slot.label}</option>
                          ))}
                        </select>
                      </div>
                      <button onClick={() => handleSchedulePost(post)} disabled={!scheduleDate || scheduleSaving} className="px-3 py-1 text-xs font-medium text-white bg-[#4374BA] rounded hover:bg-[#4374BA]/80 disabled:opacity-50 transition-colors">
                        {scheduleSaving ? "..." : "Set"}
                      </button>
                      <button onClick={() => setSchedulingId(null)} className="px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSchedulingId(post.id); setScheduleDate(""); setScheduleSlot(0); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#4374BA] border border-[#4374BA]/30 rounded-lg hover:bg-[#4374BA]/10 transition-colors">
                        <CalendarPlus className="w-3.5 h-3.5" />Schedule
                      </button>
                      <button onClick={() => startInlineEdit(post)} className="px-3 py-1.5 text-xs text-gray-400 border border-white/[0.08] rounded-lg hover:text-white hover:bg-white/[0.04] transition-colors">Edit</button>
                      <button onClick={() => handleDeletePost(post.id)} className="px-3 py-1.5 text-xs text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {editingId === post.id && (
                    <div className="mt-3 space-y-2">
                      <textarea value={inlineContent} onChange={(e) => setInlineContent(e.target.value)} rows={4} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4374BA]/50 resize-y" />
                      <div className="flex gap-2">
                        <button onClick={() => saveInlineEdit(post.id)} disabled={inlineSaving} className="px-3 py-1 text-xs font-medium text-white bg-[#4374BA] rounded hover:bg-[#4374BA]/80 disabled:opacity-50 transition-colors">{inlineSaving ? "Saving..." : "Save"}</button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ SECTION 3: QUEUE LIST — READY TO PUBLISH ═══ */}
      <div className="mb-24">
        <h2 className="text-lg font-bold text-white mb-1">Ready to Publish</h2>
        <p className="text-xs text-gray-500 mb-4">{queuePosts.length} scheduled post{queuePosts.length !== 1 ? "s" : ""}</p>

        {loadingQueue ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-white/[0.03] border border-white/[0.06] rounded-xl animate-pulse" />)}
          </div>
        ) : queuePosts.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-white/[0.08] rounded-xl">
            <p className="text-sm text-gray-500">No scheduled posts yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queuePosts.map((post) => {
              const badge = platformBadge[post.platform] || platformBadge.twitter;
              const charLimit = CHAR_LIMITS[post.platform] || 280;
              const remaining = charLimit - post.content.length;
              const isEditing = editingId === post.id;
              const isPreviewing = previewId === post.id;
              const isDuplicated = duplicatedId === post.id;
              const isSelected = selected.has(post.id);
              const statusPill = STATUS_PILL[post.status] || STATUS_PILL.approved;
              const sLabel = post.scheduled_at ? statusLabel(post.status === "approved" ? "scheduled" : post.status) : statusLabel(post.status);

              return (
                <div key={post.id} className={`bg-white/[0.03] border rounded-xl p-4 transition-colors ${isSelected ? "border-[#4374BA]/50 bg-[#4374BA]/5" : "border-white/[0.06]"}`}>
                  {/* Header row */}
                  <div className="flex items-center gap-2 mb-2">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(post.id)} className="w-3.5 h-3.5 rounded border-white/20 bg-transparent accent-[#4374BA] cursor-pointer" />
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>{badge.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusPill}`}>{sLabel}</span>
                    {post.category && <span className="text-xs text-gray-600">{post.category.replace(/_/g, " ")}</span>}
                    <span className="text-xs text-gray-600 ml-auto">{formatDateShort(post.scheduled_at)}</span>
                  </div>

                  {/* Content / inline edit */}
                  {isEditing ? (
                    <div className="mb-3 space-y-2">
                      <textarea value={inlineContent} onChange={(e) => setInlineContent(e.target.value)} rows={4} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#4374BA]/50 resize-y" />
                      <div className="flex items-center gap-2">
                        <button onClick={() => saveInlineEdit(post.id)} disabled={inlineSaving} className="px-3 py-1 text-xs font-medium text-white bg-[#4374BA] rounded hover:bg-[#4374BA]/80 disabled:opacity-50 transition-colors">{inlineSaving ? "Saving..." : "Save"}</button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p onClick={() => startInlineEdit(post)} className="text-sm text-gray-300 whitespace-pre-wrap mb-2 cursor-text hover:bg-white/[0.02] rounded px-1 -mx-1 py-0.5 transition-colors font-mono">{post.content}</p>
                  )}

                  {/* Char count */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-[10px] ${remaining < 0 ? "text-red-400" : remaining < 30 ? "text-yellow-400" : "text-gray-600"}`}>
                      {remaining < 0 ? `${Math.abs(remaining)} over limit` : `${remaining} chars remaining`}
                    </span>
                  </div>

                  {/* Preview */}
                  {isPreviewing && (
                    <div className="mb-3 p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                      {post.platform === "twitter" ? (
                        <div className="max-w-[500px]">
                          <p className="text-sm text-gray-200 whitespace-pre-wrap">
                            {post.content.length > 280 ? (
                              <>{post.content.slice(0, 280)}<span className="text-[#4374BA]"> Read more</span></>
                            ) : post.content}
                          </p>
                        </div>
                      ) : (
                        <div className="max-w-[600px]">
                          <p className="text-sm text-gray-200 whitespace-pre-wrap">
                            {post.content.length > 200 ? (
                              <>{post.content.slice(0, 200)}<span className="text-[#4374BA]"> ...See more</span></>
                            ) : post.content}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setPreviewId(isPreviewing ? null : post.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 border border-white/[0.08] rounded-lg hover:text-white hover:bg-white/[0.04] transition-colors">
                      {isPreviewing ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      Preview
                    </button>
                    <button onClick={() => handleDuplicate(post)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 border border-white/[0.08] rounded-lg hover:text-white hover:bg-white/[0.04] transition-colors">
                      {isDuplicated ? <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Duplicated!</span></> : <><Files className="w-3.5 h-3.5" />Duplicate</>}
                    </button>
                    <button onClick={() => handleCopy(post.id, post.content)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 border border-white/[0.08] rounded-lg hover:text-white hover:bg-white/[0.04] transition-colors">
                      {copiedId === post.id ? <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></> : <><Copy className="w-3.5 h-3.5" />Copy</>}
                    </button>
                    {post.status !== "published" && (
                      <button onClick={(e) => togglePublish(post, e)} disabled={togglingPublish.has(post.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 border border-white/[0.08] rounded-lg hover:text-white hover:bg-white/[0.04] transition-colors disabled:opacity-50">
                        <CheckCircle className="w-3.5 h-3.5" />Mark as Posted
                      </button>
                    )}
                    <button onClick={() => handleDeletePost(post.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors ml-auto">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ BULK ACTION BAR ═══ */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slideUp">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-4">
            <div className="bg-[#0B0F1A] border border-white/[0.1] rounded-xl shadow-2xl px-4 py-3 flex flex-wrap items-center gap-3">
              <span className="text-sm text-white font-medium">{selected.size} selected</span>
              <div className="w-px h-5 bg-white/10" />

              {showBulkReschedule ? (
                <div className="flex items-center gap-2">
                  <input type="date" value={bulkDate} onChange={(e) => setBulkDate(e.target.value)} className="bg-white/[0.03] border border-white/[0.08] rounded px-2 py-1 text-xs text-white focus:outline-none" />
                  <button onClick={bulkReschedule} disabled={!bulkDate || bulkActing} className="px-3 py-1.5 text-xs font-medium text-white bg-[#4374BA] rounded-lg disabled:opacity-50 transition-colors">Set</button>
                  <button onClick={() => setShowBulkReschedule(false)} className="text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
                </div>
              ) : (
                <>
                  <button onClick={() => setShowBulkReschedule(true)} className="px-3 py-1.5 text-xs text-gray-300 border border-white/[0.08] rounded-lg hover:text-white hover:bg-white/[0.04] transition-colors">Reschedule</button>
                  <button onClick={bulkPush1Week} disabled={bulkActing} className="px-3 py-1.5 text-xs text-gray-300 border border-white/[0.08] rounded-lg hover:text-white hover:bg-white/[0.04] transition-colors disabled:opacity-50">Push 1 Week</button>
                  <button onClick={bulkDelete} disabled={bulkActing} className="px-3 py-1.5 text-xs text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50">Delete</button>
                </>
              )}

              <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors ml-auto">Deselect All</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CALENDAR: EDIT MODAL ═══ */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setSelectedPost(null); setShowDeleteConfirm(false); }}>
          <div className="w-full max-w-lg bg-[#0B0F1A] border border-white/[0.1] rounded-2xl shadow-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                {(() => { const b = platformBadge[selectedPost.platform] || platformBadge.twitter; return <span className={`text-xs font-bold px-2 py-0.5 rounded ${b.bg} ${b.text}`}>{b.label}</span>; })()}
                {selectedPost.scheduled_at && <span className="text-xs text-gray-500">{formatTimeEST(selectedPost.scheduled_at)} EST</span>}
                {selectedPost.category && <span className="text-xs text-gray-500">{selectedPost.category.replace(/_/g, " ")}</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full ${selectedPost.status === "published" ? "bg-green-500/10 text-green-400" : "bg-[#4374BA]/10 text-[#4374BA]"}`}>{selectedPost.status}</span>
              </div>
              <button onClick={() => { setSelectedPost(null); setShowDeleteConfirm(false); }} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <textarea value={editContent} onChange={(e) => { setEditContent(e.target.value); setSaved(false); }} rows={Math.max(5, editContent.split("\n").length + 2)} className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-gray-200 leading-relaxed focus:outline-none focus:border-[#4374BA]/50 resize-y" />
            </div>
            <div className="p-4 border-t border-white/[0.06]">
              {showDeleteConfirm ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-400">Delete this post? This cannot be undone.</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-colors">Cancel</button>
                    <button onClick={() => handleDeletePost()} disabled={deleting} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50">
                      {deleting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Yes, Delete"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" />Delete</button>
                    <button onClick={(e) => togglePublish(selectedPost, e)} disabled={togglingPublish.has(selectedPost.id)} className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${selectedPost.status === "published" ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : "border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.04]"}`}>
                      {selectedPost.status === "published" ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      {selectedPost.status === "published" ? "Posted" : "Mark as Posted"}
                    </button>
                    <button onClick={() => handleCopy(selectedPost.id, editContent)} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-colors">
                      {copiedId === selectedPost.id ? <><Check className="w-4 h-4 text-green-400" /><span className="text-green-400">Copied!</span></> : <><Copy className="w-4 h-4" />Copy</>}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {saved && <span className="flex items-center gap-1 text-xs text-green-400"><Check className="w-3 h-3" />Saved</span>}
                    <button onClick={handleSaveEdit} disabled={saving || editContent === selectedPost.content} className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-[#4374BA] hover:bg-[#4374BA]/80 rounded-lg transition-colors disabled:opacity-50">
                      {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Save"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ CALENDAR: NEW POST MODAL ═══ */}
      {newPostDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setNewPostDate(null)}>
          <div className="w-full max-w-md bg-[#0B0F1A] border border-white/[0.1] rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-semibold text-white">New Post</h3>
                <p className="text-xs text-gray-400 mt-0.5">{newPostDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
              </div>
              <button onClick={() => setNewPostDate(null)} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Platform</label>
                <div className="flex gap-2">
                  {(["twitter", "linkedin"] as const).map((p) => {
                    const b = platformBadge[p];
                    return (
                      <button key={p} onClick={() => { setNewPostPlatform(p); setNewPostTimeSlot(0); }} className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${newPostPlatform === p ? "border-[#4374BA]/50 bg-[#4374BA]/10 text-white" : "border-white/[0.08] text-gray-400 hover:text-white hover:border-white/[0.15]"}`}>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${b.bg} ${b.text}`}>{b.label}</span>
                        {p === "twitter" ? "Twitter / X" : "LinkedIn"}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Time Slot</label>
                {newPostPlatform === "twitter" ? (
                  <div className="flex gap-2">
                    {TWITTER_TIME_SLOTS.map((slot, idx) => (
                      <button key={idx} onClick={() => setNewPostTimeSlot(idx)} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${newPostTimeSlot === idx ? "border-[#4374BA]/50 bg-[#4374BA]/10 text-white" : "border-white/[0.08] text-gray-400 hover:text-white hover:border-white/[0.15]"}`}>{slot.label}</button>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-1.5 text-xs text-gray-400 border border-white/[0.08] rounded-lg inline-block">{LINKEDIN_TIME_SLOT.label}</div>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Content</label>
                <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder={newPostPlatform === "twitter" ? "Write your tweet (280 chars max)..." : "Write your LinkedIn post..."} rows={5} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4374BA]/50 resize-y" />
                {newPostPlatform === "twitter" && <p className={`text-xs mt-1 ${newPostContent.length > 280 ? "text-red-400" : "text-gray-500"}`}>{newPostContent.length}/280</p>}
              </div>
              {newPostError && <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">{newPostError}</div>}
            </div>
            <div className="p-4 border-t border-white/[0.06]">
              <button onClick={handleCreatePost} disabled={newPostSaving || !newPostContent.trim()} className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#6C3393] to-[#4374BA] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                {newPostSaving ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span> : "Add to Calendar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ GLOBAL STYLES ═══ */}
      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.2s ease-out; }
      `}</style>
    </div>
  );
}
