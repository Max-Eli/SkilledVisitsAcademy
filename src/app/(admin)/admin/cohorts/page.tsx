'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CalendarDays,
  Plus,
  Loader2,
  Trash2,
  Link as LinkIcon,
  Power,
  PowerOff,
} from 'lucide-react'

type Course = { id: string; title: string; slug: string }

type Cohort = {
  id: string
  course_id: string
  meeting_at: string
  meeting_link: string | null
  seats_cap: number
  active: boolean
  created_at: string
}

export default function AdminCohortsPage() {
  const supabase = createClient()

  const [courses, setCourses] = useState<Course[]>([])
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [loading, setLoading] = useState(true)

  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)

  const [newCourseId, setNewCourseId] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('18:00')
  const [newLink, setNewLink] = useState('')
  const [newSeats, setNewSeats] = useState('15')

  useEffect(() => {
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setLoading(true)
    const [{ data: courseRows }, { data: cohortRows }] = await Promise.all([
      supabase.from('courses').select('id, title, slug').order('title'),
      supabase.from('course_cohorts').select('*').order('meeting_at'),
    ])
    setCourses(courseRows ?? [])
    setCohorts(cohortRows ?? [])
    setLoading(false)
  }

  async function createCohort() {
    if (!newCourseId || !newDate || !newTime) {
      toast.error('Course and date/time are required')
      return
    }
    setSaving(true)

    // Combine date + time in the user's local timezone, then serialize as
    // ISO so Postgres stores it at UTC but the original local moment is
    // preserved. The student-facing page formats back into the viewer's
    // timezone, so picking "6:00 PM" in admin means 6 PM wherever the admin
    // is sitting — which for SVA's US-based ops is fine.
    const meetingAt = new Date(`${newDate}T${newTime}`).toISOString()

    const { error } = await supabase.from('course_cohorts').insert({
      course_id: newCourseId,
      meeting_at: meetingAt,
      meeting_link: newLink.trim() || null,
      seats_cap: Number(newSeats) || 15,
      active: true,
    })

    if (error) {
      toast.error('Failed to create cohort')
    } else {
      toast.success('Cohort created')
      setShowNew(false)
      setNewDate('')
      setNewTime('18:00')
      setNewLink('')
      setNewSeats('15')
      await load()
    }
    setSaving(false)
  }

  async function updateLink(cohortId: string, link: string) {
    const value = link.trim() || null
    const { error } = await supabase
      .from('course_cohorts')
      .update({ meeting_link: value, updated_at: new Date().toISOString() })
      .eq('id', cohortId)
    if (error) {
      toast.error('Failed to save link')
      return
    }
    setCohorts((prev) =>
      prev.map((c) => (c.id === cohortId ? { ...c, meeting_link: value } : c))
    )
    toast.success('Meeting link saved')
  }

  async function toggleActive(cohort: Cohort) {
    const { error } = await supabase
      .from('course_cohorts')
      .update({ active: !cohort.active, updated_at: new Date().toISOString() })
      .eq('id', cohort.id)
    if (error) {
      toast.error('Failed to update')
      return
    }
    setCohorts((prev) =>
      prev.map((c) => (c.id === cohort.id ? { ...c, active: !cohort.active } : c))
    )
  }

  async function deleteCohort(cohortId: string) {
    if (!confirm('Delete this cohort? Existing enrollments will lose their meeting reference.')) return
    const { error } = await supabase.from('course_cohorts').delete().eq('id', cohortId)
    if (error) {
      toast.error('Failed to delete')
      return
    }
    setCohorts((prev) => prev.filter((c) => c.id !== cohortId))
    toast.success('Cohort deleted')
  }

  const byCourse = new Map<string, Cohort[]>()
  for (const c of cohorts) {
    const list = byCourse.get(c.course_id) ?? []
    list.push(c)
    byCourse.set(c.course_id, list)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Cohorts</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Schedule live Zoom/Meet sessions. Course access unlocks 48h before each meeting.
          </p>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Cohort
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-[var(--muted-foreground)]">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => {
            const list = byCourse.get(course.id) ?? []
            return (
              <Card key={course.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{course.title}</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => {
                        setNewCourseId(course.id)
                        setShowNew(true)
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add date
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {list.length === 0 ? (
                    <p className="text-sm text-[var(--muted-foreground)]">No cohorts scheduled yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {list.map((cohort) => (
                        <CohortRow
                          key={cohort.id}
                          cohort={cohort}
                          onUpdateLink={updateLink}
                          onToggleActive={toggleActive}
                          onDelete={deleteCohort}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Cohort</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={newCourseId} onValueChange={setNewCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Meeting date</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Start time</Label>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Zoom / Google Meet link (optional — can add later)</Label>
              <Input
                placeholder="https://zoom.us/j/… or https://meet.google.com/…"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Display seat cap</Label>
              <Input
                type="number"
                min="1"
                value={newSeats}
                onChange={(e) => setNewSeats(e.target.value)}
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                Controls the &ldquo;X seats left&rdquo; urgency badge. No actual cap is enforced.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
            <Button onClick={createCohort} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CohortRow({
  cohort,
  onUpdateLink,
  onToggleActive,
  onDelete,
}: {
  cohort: Cohort
  onUpdateLink: (id: string, link: string) => Promise<void>
  onToggleActive: (c: Cohort) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [draftLink, setDraftLink] = useState(cohort.meeting_link ?? '')

  const meetingDate = new Date(cohort.meeting_at)
  const dateStr = meetingDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const timeStr = meetingDate.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
  const isPast = meetingDate.getTime() < Date.now()

  return (
    <div className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
        <CalendarDays className="h-5 w-5 text-[var(--primary)]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[var(--foreground)]">
            {dateStr} · {timeStr}
          </span>
          {!cohort.active && <Badge variant="outline">Hidden</Badge>}
          {isPast && <Badge variant="outline">Past</Badge>}
          <Badge variant="secondary" className="text-[10px]">
            Cap {cohort.seats_cap}
          </Badge>
        </div>

        {editing ? (
          <div className="mt-2 flex items-center gap-2">
            <Input
              placeholder="https://zoom.us/j/…"
              value={draftLink}
              onChange={(e) => setDraftLink(e.target.value)}
              className="h-8 text-xs"
            />
            <Button
              size="sm"
              onClick={async () => {
                await onUpdateLink(cohort.id, draftLink)
                setEditing(false)
              }}
            >
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="mt-1 flex items-center gap-2">
            {cohort.meeting_link ? (
              <a
                href={cohort.meeting_link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
              >
                <LinkIcon className="h-3 w-3" />
                {cohort.meeting_link.slice(0, 48)}
                {cohort.meeting_link.length > 48 && '…'}
              </a>
            ) : (
              <span className="text-xs text-[var(--muted-foreground)] italic">
                Meeting link not set yet
              </span>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={() => {
                setDraftLink(cohort.meeting_link ?? '')
                setEditing(true)
              }}
            >
              {cohort.meeting_link ? 'Edit' : 'Add link'}
            </Button>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => onToggleActive(cohort)}
          title={cohort.active ? 'Hide from checkout' : 'Show in checkout'}
        >
          {cohort.active ? (
            <Power className="h-4 w-4" />
          ) : (
            <PowerOff className="h-4 w-4 text-[var(--muted-foreground)]" />
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive"
          onClick={() => onDelete(cohort.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
