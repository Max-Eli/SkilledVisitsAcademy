'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { BookOpen, Plus, Upload, Loader2, Eye, EyeOff, Trash2, Video, CheckCircle2 } from 'lucide-react'
import { slugify } from '@/lib/utils'
import type { Course, Lesson } from '@/types/database'

const CATEGORIES = ['IV Fundamentals', 'Advanced Protocols', 'Patient Safety', 'Clinical Skills', 'Business', 'General']

export default function AdminCoursesPage() {
  const supabase = createClient()

  const [courses, setCourses] = useState<(Course & { lessons: Lesson[] })[]>([])
  const [showNewCourse, setShowNewCourse] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showAddLesson, setShowAddLesson] = useState(false)

  // New course form
  const [courseTitle, setCourseTitle] = useState('')
  const [courseDesc, setCourseDesc] = useState('')
  const [courseCategory, setCourseCategory] = useState('IV Fundamentals')
  const [savingCourse, setSavingCourse] = useState(false)

  // New lesson form
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonDesc, setLessonDesc] = useState('')
  const [lessonVideo, setLessonVideo] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [savingLesson, setSavingLesson] = useState(false)

  useEffect(() => {
    loadCourses()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadCourses() {
    const { data } = await supabase
      .from('courses')
      .select('*, lessons(*)')
      .order('created_at', { ascending: false })
    if (data) setCourses(data)
  }

  async function createCourse() {
    if (!courseTitle.trim()) return
    setSavingCourse(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: courseTitle.trim(),
        slug: slugify(courseTitle),
        description: courseDesc.trim(),
        category: courseCategory,
        created_by: user?.id,
      })
      .select('*, lessons(*)')
      .single()

    if (error) {
      toast.error('Failed to create course')
    } else {
      toast.success('Course created!')
      setCourses((prev) => [data, ...prev])
      setShowNewCourse(false)
      setCourseTitle('')
      setCourseDesc('')
    }
    setSavingCourse(false)
  }

  async function togglePublish(course: Course) {
    const { error } = await supabase
      .from('courses')
      .update({ published: !course.published })
      .eq('id', course.id)

    if (!error) {
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, published: !course.published } : c))
      )
      toast.success(course.published ? 'Course unpublished' : 'Course published!')
    }
  }

  async function addLesson() {
    if (!selectedCourse || !lessonTitle.trim()) return
    setSavingLesson(true)

    let muxAssetId: string | null = null
    let muxPlaybackId: string | null = null

    // Upload to Mux if video provided
    if (lessonVideo) {
      setUploadProgress('Getting upload URL...')
      const uploadRes = await fetch('/api/mux/upload', { method: 'POST' })
      if (!uploadRes.ok) {
        toast.error('Failed to get Mux upload URL')
        setSavingLesson(false)
        return
      }
      const { uploadId, uploadUrl } = await uploadRes.json()

      setUploadProgress('Uploading video...')
      const uploadFetch = await fetch(uploadUrl, {
        method: 'PUT',
        body: lessonVideo,
        headers: { 'Content-Type': lessonVideo.type },
      })

      if (!uploadFetch.ok) {
        toast.error('Video upload failed')
        setSavingLesson(false)
        return
      }

      // Poll for asset
      setUploadProgress('Processing video...')
      let attempts = 0
      while (attempts < 20) {
        await new Promise((r) => setTimeout(r, 3000))
        const assetRes = await fetch(`/api/mux/asset?uploadId=${uploadId}`)
        const assetData = await assetRes.json()

        if (assetData.assetId && assetData.status === 'ready') {
          muxAssetId = assetData.assetId
          muxPlaybackId = assetData.playbackId
          break
        }
        attempts++
      }
      setUploadProgress('')
    }

    // Get current lesson count for order
    const { count } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', selectedCourse.id)

    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert({
        course_id: selectedCourse.id,
        title: lessonTitle.trim(),
        description: lessonDesc.trim() || null,
        mux_asset_id: muxAssetId,
        mux_playback_id: muxPlaybackId,
        order_index: count ?? 0,
        published: !!muxPlaybackId,
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to add lesson')
    } else {
      toast.success('Lesson added!')
      setCourses((prev) =>
        prev.map((c) =>
          c.id === selectedCourse.id
            ? { ...c, lessons: [...(c.lessons ?? []), lesson] }
            : c
        )
      )
      setShowAddLesson(false)
      setLessonTitle('')
      setLessonDesc('')
      setLessonVideo(null)
    }
    setSavingLesson(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Courses</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Create and manage video courses</p>
        </div>
        <Button onClick={() => setShowNewCourse(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Course
        </Button>
      </div>

      {/* Course list */}
      <div className="space-y-4">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[var(--primary)] flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{course.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                      <Badge variant={course.published ? 'success' : 'outline'} className="text-xs">
                        {course.published ? 'Published' : 'Draft'}
                      </Badge>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {course.lessons?.length ?? 0} lessons
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => { setSelectedCourse(course); setShowAddLesson(true) }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Lesson
                  </Button>
                  <Button
                    size="sm"
                    variant={course.published ? 'outline' : 'default'}
                    onClick={() => togglePublish(course)}
                    className="gap-1.5"
                  >
                    {course.published ? (
                      <><EyeOff className="h-3.5 w-3.5" />Unpublish</>
                    ) : (
                      <><Eye className="h-3.5 w-3.5" />Publish</>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {course.lessons?.length > 0 && (
              <CardContent className="pt-0">
                <Separator className="mb-3" />
                <div className="space-y-1.5">
                  {course.lessons
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((lesson, idx) => (
                      <div key={lesson.id} className="flex items-center gap-2.5 text-sm">
                        <span className="text-xs text-[var(--muted-foreground)] w-5">{idx + 1}</span>
                        {lesson.mux_playback_id ? (
                          <Video className="h-3.5 w-3.5 text-[var(--accent)]" />
                        ) : (
                          <Video className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                        )}
                        <span className="text-[var(--foreground)]">{lesson.title}</span>
                        {lesson.mux_playback_id && (
                          <Badge variant="success" className="text-[10px] gap-0.5">
                            <CheckCircle2 className="h-2.5 w-2.5" />Ready
                          </Badge>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* New Course Dialog */}
      <Dialog open={showNewCourse} onOpenChange={setShowNewCourse}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Course Title</Label>
              <Input
                placeholder="e.g. IV Therapy Foundations"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="What will students learn in this course?"
                value={courseDesc}
                onChange={(e) => setCourseDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={courseCategory} onValueChange={setCourseCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCourse(false)}>Cancel</Button>
            <Button onClick={createCourse} disabled={!courseTitle.trim() || savingCourse} className="gap-2">
              {savingCourse && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
      <Dialog open={showAddLesson} onOpenChange={setShowAddLesson}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Lesson to &ldquo;{selectedCourse?.title}&rdquo;</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input
                placeholder="e.g. Introduction to IV Access"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Brief description of what this lesson covers"
                value={lessonDesc}
                onChange={(e) => setLessonDesc(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Video File (optional — upload MP4)</Label>
              <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  id="video-upload"
                  onChange={(e) => setLessonVideo(e.target.files?.[0] ?? null)}
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <Upload className="h-6 w-6 text-[var(--muted-foreground)] mx-auto mb-1" />
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {lessonVideo ? lessonVideo.name : 'Click to select video'}
                  </p>
                </label>
              </div>
              {uploadProgress && (
                <p className="text-xs text-[var(--accent)] flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {uploadProgress}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLesson(false)}>Cancel</Button>
            <Button onClick={addLesson} disabled={!lessonTitle.trim() || savingLesson} className="gap-2">
              {savingLesson && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
