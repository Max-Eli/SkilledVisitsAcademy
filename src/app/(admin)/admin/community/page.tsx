import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pin, MessageSquare, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Thread } from '@/types/database'

export default async function AdminCommunityPage() {
  const supabase = await createClient()

  const { data: threads } = await supabase
    .from('threads')
    .select(`
      *,
      author:profiles!author_id(id, full_name, role),
      replies(id)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  const CATEGORY_LABELS: Record<string, string> = {
    'general': 'General',
    'clinical-questions': 'Clinical Questions',
    'protocol-discussions': 'Protocols',
    'ask-sva-providers': 'Ask SVA',
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Community Moderation</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Review and moderate community posts. Click any post to reply as SVA Provider.
        </p>
      </div>

      <div className="space-y-2">
        {threads?.map((thread: Thread & {
          author: { id: string; full_name: string | null; role: string }
          replies: { id: string }[]
        }) => (
          <Link key={thread.id} href={`/community/${thread.id}`} target="_blank">
            <Card className="hover:shadow-sm transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {thread.is_pinned && <Pin className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                      <h3 className="font-medium text-[var(--foreground)] truncate">{thread.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        {thread.author?.full_name ?? 'User'}
                        {thread.author?.role === 'admin' && (
                          <Badge variant="sva" className="text-[10px] px-1.5 py-0 gap-0.5">
                            <Shield className="h-2.5 w-2.5" />SVA
                          </Badge>
                        )}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {CATEGORY_LABELS[thread.category] ?? thread.category}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {thread.replies?.length ?? 0}
                      </span>
                      <span>{formatDate(thread.created_at)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {(!threads || threads.length === 0) && (
          <div className="text-center py-12 text-[var(--muted-foreground)]">No posts yet</div>
        )}
      </div>
    </div>
  )
}
