'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'clinical-questions', label: 'Clinical Questions' },
  { value: 'protocol-discussions', label: 'Protocol Discussions' },
  { value: 'ask-sva-providers', label: 'Ask SVA Providers' },
]

export default function NewThreadPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('general')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (title.trim().length < 10) {
      toast.error('Title must be at least 10 characters')
      return
    }
    if (body.trim().length < 20) {
      toast.error('Post body must be at least 20 characters')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error } = await supabase
      .from('threads')
      .insert({ title: title.trim(), body: body.trim(), category, author_id: user.id })
      .select()
      .single()

    if (error) {
      toast.error('Failed to post. Please try again.')
      setLoading(false)
      return
    }

    toast.success('Post published!')
    router.push(`/community/${data.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/community"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to community
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Start a discussion</CardTitle>
          <p className="text-sm text-[var(--muted-foreground)]">
            Keep posts professional and relevant to IV therapy practice.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="What do you want to discuss?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
              />
              <p className="text-xs text-[var(--muted-foreground)]">{title.length}/200</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Post</Label>
              <Textarea
                id="body"
                placeholder="Share your question, case, or insight. Be specific and professional."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={8}
                maxLength={5000}
              />
              <p className="text-xs text-[var(--muted-foreground)]">{body.length}/5000</p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Publish post
              </Button>
              <Link href="/community">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
