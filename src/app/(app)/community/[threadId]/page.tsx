'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Pin, Send, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { Thread, Reply } from '@/types/database'

type ThreadWithAuthor = Thread & {
  author: { id: string; full_name: string | null; avatar_url: string | null; role: string }
}
type ReplyWithAuthor = Reply & {
  author: { id: string; full_name: string | null; avatar_url: string | null; role: string }
}

function AuthorBadge({ role }: { role: string }) {
  if (role !== 'admin') return null
  return (
    <Badge variant="sva" className="text-[10px] px-1.5 py-0 gap-0.5 h-4">
      <Shield className="h-2.5 w-2.5" />
      SVA Provider
    </Badge>
  )
}

function getInitials(name: string | null) {
  if (!name) return 'U'
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function ThreadPage() {
  const params = useParams()
  const router = useRouter()
  const threadId = params.threadId as string
  const supabase = createClient()

  const [thread, setThread] = useState<ThreadWithAuthor | null>(null)
  const [replies, setReplies] = useState<ReplyWithAuthor[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setCurrentUserId(user.id)

      const [{ data: t }, { data: r }] = await Promise.all([
        supabase
          .from('threads')
          .select('*, author:profiles!author_id(id, full_name, avatar_url, role)')
          .eq('id', threadId)
          .single(),
        supabase
          .from('replies')
          .select('*, author:profiles!author_id(id, full_name, avatar_url, role)')
          .eq('thread_id', threadId)
          .order('created_at', { ascending: true }),
      ])

      if (!t) { router.push('/community'); return }
      setThread(t as ThreadWithAuthor)
      setReplies((r ?? []) as ReplyWithAuthor[])
    }
    load()

    // Realtime subscription for new replies
    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'replies', filter: `thread_id=eq.${threadId}` },
        async (payload) => {
          const { data: newReply } = await supabase
            .from('replies')
            .select('*, author:profiles!author_id(id, full_name, avatar_url, role)')
            .eq('id', payload.new.id)
            .single()
          if (newReply) {
            setReplies((prev) => [...prev, newReply as ReplyWithAuthor])
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId])

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyBody.trim() || submitting || !currentUserId) return

    setSubmitting(true)
    const { error } = await supabase.from('replies').insert({
      thread_id: threadId,
      body: replyBody.trim(),
      author_id: currentUserId,
    })

    if (error) {
      toast.error('Failed to post reply')
    } else {
      setReplyBody('')
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
    setSubmitting(false)
  }

  if (!thread) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/community"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to community
      </Link>

      {/* Thread */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={thread.author?.avatar_url ?? ''} />
            <AvatarFallback>{getInitials(thread.author?.full_name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-sm text-[var(--foreground)]">
                {thread.author?.full_name ?? 'User'}
              </span>
              <AuthorBadge role={thread.author?.role} />
              {thread.is_pinned && (
                <span className="flex items-center gap-1 text-xs text-amber-600">
                  <Pin className="h-3 w-3" /> Pinned
                </span>
              )}
              <span className="text-xs text-[var(--muted-foreground)]">
                {formatDate(thread.created_at)}
              </span>
            </div>
            <h1 className="text-xl font-bold text-[var(--foreground)] mb-3">{thread.title}</h1>
            <p className="text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">{thread.body}</p>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Replies */}
      <div className="space-y-5 mb-8">
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>

        {replies.map((reply) => (
          <div key={reply.id} className="flex items-start gap-3">
            <Avatar className="h-8 w-8 shrink-0 mt-0.5">
              <AvatarImage src={reply.author?.avatar_url ?? ''} />
              <AvatarFallback className="text-xs">{getInitials(reply.author?.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-[var(--muted)] rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="font-semibold text-sm text-[var(--foreground)]">
                  {reply.author?.full_name ?? 'User'}
                </span>
                <AuthorBadge role={reply.author?.role} />
                <span className="text-xs text-[var(--muted-foreground)]">
                  {formatDate(reply.created_at)}
                </span>
              </div>
              <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                {reply.body}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply form */}
      <div className="sticky bottom-0 bg-[var(--background)] border-t border-[var(--border)] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4">
        <form onSubmit={handleReply} className="flex gap-3 items-end">
          <Textarea
            placeholder="Write a professional reply..."
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            rows={2}
            className="flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleReply(e)
              }
            }}
          />
          <Button type="submit" disabled={!replyBody.trim() || submitting} className="gap-2 shrink-0">
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Reply
          </Button>
        </form>
        <p className="text-xs text-[var(--muted-foreground)] mt-1.5">Cmd+Enter to submit</p>
      </div>
    </div>
  )
}
