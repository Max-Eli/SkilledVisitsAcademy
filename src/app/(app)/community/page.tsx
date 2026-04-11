import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MessageSquare, Pin, ChevronRight, Plus, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'
import type { Thread } from '@/types/database'

const CATEGORIES = [
  { key: 'all', label: 'All Discussions', color: '' },
  { key: 'general', label: 'General', color: 'bg-slate-100 text-slate-700' },
  { key: 'clinical-questions', label: 'Clinical Questions', color: 'bg-blue-100 text-blue-700' },
  { key: 'protocol-discussions', label: 'Protocols', color: 'bg-purple-100 text-purple-700' },
  { key: 'ask-sva-providers', label: 'Ask SVA Providers', color: 'bg-amber-100 text-amber-700' },
]

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const category = params.category ?? 'all'

  let query = supabase
    .from('threads')
    .select(`
      *,
      author:profiles!author_id(id, full_name, avatar_url, role),
      replies(id)
    `)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (category !== 'all') {
    query = query.eq('category', category)
  }

  const { data: threads } = await query

  const categoryMeta = CATEGORIES.find((c) => c.key === category)

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Community</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Professional discussions for IV therapy providers
          </p>
        </div>
        <Link href="/community/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => (
          <Link key={cat.key} href={cat.key === 'all' ? '/community' : `/community?category=${cat.key}`}>
            <Badge
              variant={category === cat.key ? 'default' : 'outline'}
              className="cursor-pointer hover:opacity-80 transition-opacity text-xs px-3 py-1"
            >
              {cat.label}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Thread list */}
      <div className="space-y-2">
        {threads && threads.length > 0 ? (
          threads.map((thread: Thread & { author: { id: string; full_name: string | null; avatar_url: string | null; role: string }; replies: { id: string }[] }) => {
            const author = thread.author
            const initials = author?.full_name
              ? author.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
              : 'U'
            const replyCount = thread.replies?.length ?? 0
            const catInfo = CATEGORIES.find((c) => c.key === thread.category)

            return (
              <Link key={thread.id} href={`/community/${thread.id}`}>
                <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 shrink-0 mt-0.5">
                        <AvatarImage src={author?.avatar_url ?? ''} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {thread.is_pinned && (
                            <Pin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          )}
                          <h3 className="font-semibold text-[var(--foreground)] line-clamp-1">
                            {thread.title}
                          </h3>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-2">
                          {thread.body}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-[var(--foreground)]">
                              {author?.full_name ?? 'User'}
                            </span>
                            {author?.role === 'admin' && (
                              <Badge variant="sva" className="text-[10px] px-1.5 py-0 gap-0.5">
                                <Shield className="h-2.5 w-2.5" />
                                SVA
                              </Badge>
                            )}
                          </div>
                          {catInfo && catInfo.key !== 'all' && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${catInfo.color}`}>
                              {catInfo.label}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {replyCount}
                          </div>
                          <span>{formatDate(thread.created_at)}</span>
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <MessageSquare className="h-10 w-10 text-[var(--muted-foreground)] mx-auto mb-3" />
              <h3 className="font-semibold text-[var(--foreground)] mb-1">No posts yet</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                Be the first to start a discussion in this category.
              </p>
              <Link href="/community/new">
                <Button>Start a discussion</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
