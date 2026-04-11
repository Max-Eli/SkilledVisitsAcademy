'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  TestTube2,
  Upload,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Syringe,
  Clock,
  FileText,
  Trash2,
} from 'lucide-react'
import type { LabAnalysis, LabAnalysisResult, LabValue } from '@/types/database'
import { formatDate } from '@/lib/utils'

function LabValueRow({ val, expanded = false }: { val: LabValue; expanded?: boolean }) {
  const isAbnormal = val.status !== 'normal'
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${isAbnormal ? 'bg-red-50' : 'bg-emerald-50'}`}>
      <div className="shrink-0 mt-0.5">
        {val.status === 'high' ? (
          <TrendingUp className="h-4 w-4 text-red-500" />
        ) : val.status === 'low' ? (
          <TrendingDown className="h-4 w-4 text-red-500" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-medium text-sm text-[var(--foreground)]">{val.name}</span>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${isAbnormal ? 'text-red-700' : 'text-emerald-700'}`}>
              {val.value}
            </span>
            <Badge variant={val.status === 'normal' ? 'success' : 'destructive'} className="text-[10px]">
              {val.status === 'normal' ? 'Normal' : val.status === 'high' ? 'HIGH' : 'LOW'}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">Ref: {val.reference_range}</p>
        {expanded && val.clinical_significance && (
          <p className="text-xs text-[var(--foreground)] mt-1 leading-relaxed">{val.clinical_significance}</p>
        )}
      </div>
    </div>
  )
}

function AnalysisResult({ result }: { result: LabAnalysisResult }) {
  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="bg-[var(--muted)] rounded-xl p-4">
        <h3 className="font-semibold text-[var(--foreground)] mb-2">Clinical Summary</h3>
        <p className="text-sm text-[var(--foreground)] leading-relaxed">{result.summary}</p>
      </div>

      {/* Out of range */}
      {result.out_of_range?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h3 className="font-semibold text-[var(--foreground)]">
              Abnormal Values ({result.out_of_range.length})
            </h3>
          </div>
          <div className="space-y-2">
            {result.out_of_range.map((val, i) => (
              <LabValueRow key={i} val={val} expanded />
            ))}
          </div>
        </div>
      )}

      {/* IV Recommendations */}
      {result.iv_recommendations?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Syringe className="h-4 w-4 text-[var(--accent)]" />
            <h3 className="font-semibold text-[var(--foreground)]">IV Therapy Considerations</h3>
          </div>
          <div className="space-y-2">
            {result.iv_recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-blue-50 rounded-lg p-3">
                <div className="h-5 w-5 rounded-full bg-[var(--accent)] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-[var(--foreground)]">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Normal values (collapsed) */}
      {result.normal_values?.length > 0 && (
        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] list-none">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            View normal values ({result.normal_values.length})
          </summary>
          <div className="mt-3 space-y-2">
            {result.normal_values.map((val, i) => (
              <LabValueRow key={i} val={val} />
            ))}
          </div>
        </details>
      )}

      {/* Clinical notes */}
      {result.clinical_notes && (
        <div className="border-t border-[var(--border)] pt-4">
          <h3 className="font-semibold text-[var(--foreground)] mb-2 text-sm">Full Clinical Notes</h3>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed whitespace-pre-wrap">
            {result.clinical_notes}
          </p>
        </div>
      )}

      <p className="text-xs text-[var(--muted-foreground)] italic">
        ⚠️ This AI analysis is for educational purposes only and should not replace clinical judgment.
        Always interpret lab values in context of the full clinical picture.
      </p>
    </div>
  )
}

export default function LabAnalyzerPage() {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [history, setHistory] = useState<LabAnalysis[]>([])
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<LabAnalysis | null>(null)

  useEffect(() => {
    async function loadHistory() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('lab_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) setHistory(data)
    }
    loadHistory()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB')
      return
    }

    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const filePath = `${user.id}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('lab-uploads')
      .upload(filePath, file, { contentType: 'application/pdf' })

    if (uploadError) {
      toast.error('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: record, error: dbError } = await supabase
      .from('lab_analyses')
      .insert({
        user_id: user.id,
        file_path: filePath,
        file_name: file.name,
      })
      .select()
      .single()

    if (dbError || !record) {
      toast.error('Failed to save record')
      setUploading(false)
      return
    }

    setHistory((prev) => [record, ...prev])
    setUploading(false)
    toast.success('Lab uploaded. Starting AI analysis...')

    // Extract text from PDF via server and analyze
    await runAnalysis(record.id, filePath, file)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function runAnalysis(analysisId: string, filePath: string, file: File) {
    setAnalyzing(analysisId)

    // Read PDF as text (simple extraction via file text for client side demo)
    // In production this happens server-side via pdf-parse
    const formData = new FormData()
    formData.append('file', file)
    formData.append('analysisId', analysisId)
    formData.append('filePath', filePath)

    const extractRes = await fetch('/api/lab-analyzer/extract', {
      method: 'POST',
      body: formData,
    })

    if (!extractRes.ok) {
      toast.error('Text extraction failed')
      setAnalyzing(null)
      return
    }

    const { extractedText } = await extractRes.json()

    const analyzeRes = await fetch('/api/lab-analyzer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisId, extractedText }),
    })

    if (!analyzeRes.ok) {
      toast.error('AI analysis failed. Check your Ollama configuration.')
      setAnalyzing(null)
      return
    }

    const { result } = await analyzeRes.json()

    setHistory((prev) =>
      prev.map((h) => (h.id === analysisId ? { ...h, ai_result: result } : h))
    )
    setSelectedAnalysis((prev) =>
      prev?.id === analysisId ? { ...prev, ai_result: result } : prev
    )
    setAnalyzing(null)
    toast.success('Analysis complete!')
  }

  async function deleteAnalysis(id: string, filePath: string) {
    await supabase.storage.from('lab-uploads').remove([filePath])
    await supabase.from('lab_analyses').delete().eq('id', id)
    setHistory((prev) => prev.filter((h) => h.id !== id))
    if (selectedAnalysis?.id === id) setSelectedAnalysis(null)
    toast.success('Analysis deleted')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">AI Lab Test Analyzer</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Upload patient lab results for AI-powered interpretation and IV therapy recommendations
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: upload + history */}
        <div className="lg:col-span-2 space-y-4">
          {/* Upload */}
          <Card>
            <CardContent className="p-5">
              <div
                className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center cursor-pointer hover:border-[var(--accent)] hover:bg-blue-50/30 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 text-[var(--accent)] mx-auto mb-2 animate-spin" />
                ) : (
                  <Upload className="h-8 w-8 text-[var(--muted-foreground)] mx-auto mb-2" />
                )}
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {uploading ? 'Uploading...' : 'Upload Lab PDF'}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">PDF files only, max 10MB</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </CardContent>
          </Card>

          {/* History */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-2">Analysis History</h2>
            {history.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <TestTube2 className="h-8 w-8 text-[var(--muted-foreground)] mx-auto mb-2" />
                  <p className="text-xs text-[var(--muted-foreground)]">No analyses yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedAnalysis?.id === item.id
                        ? 'border-[var(--accent)] bg-blue-50'
                        : 'border-[var(--border)] bg-white hover:bg-[var(--muted)]'
                    }`}
                    onClick={() => setSelectedAnalysis(item)}
                  >
                    <FileText className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {item.file_name}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {formatDate(item.created_at)}
                        </p>
                        {analyzing === item.id ? (
                          <span className="flex items-center gap-1 text-xs text-[var(--accent)]">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Analyzing...
                          </span>
                        ) : item.ai_result ? (
                          <Badge variant="success" className="text-[10px]">Done</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">Pending</Badge>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteAnalysis(item.id, item.file_path)
                      }}
                      className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: analysis result */}
        <div className="lg:col-span-3">
          {selectedAnalysis ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{selectedAnalysis.file_name}</CardTitle>
                    <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {formatDate(selectedAnalysis.created_at)}
                    </p>
                  </div>
                  {analyzing === selectedAnalysis.id && (
                    <div className="flex items-center gap-2 text-[var(--accent)]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Analyzing with AI...</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-5">
                {selectedAnalysis.ai_result ? (
                  <AnalysisResult result={selectedAnalysis.ai_result as LabAnalysisResult} />
                ) : analyzing === selectedAnalysis.id ? (
                  <div className="py-12 text-center">
                    <Loader2 className="h-10 w-10 text-[var(--accent)] mx-auto mb-3 animate-spin" />
                    <p className="text-[var(--muted-foreground)]">
                      AI is analyzing your lab results...
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      This may take 15-30 seconds
                    </p>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <TestTube2 className="h-10 w-10 text-[var(--muted-foreground)] mx-auto mb-3" />
                    <p className="text-[var(--muted-foreground)]">Analysis not yet complete</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-20 text-center">
                <TestTube2 className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                <h3 className="font-semibold text-[var(--foreground)] mb-2">No analysis selected</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Upload a lab PDF or select a previous analysis from history
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
