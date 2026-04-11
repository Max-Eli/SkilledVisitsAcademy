import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const analysisId = formData.get('analysisId') as string | null

  if (!file || !analysisId) {
    return NextResponse.json({ error: 'Missing file or analysisId' }, { status: 400 })
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    // Dynamic import to avoid SSR issues with pdf-parse
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    const parsed = await pdfParse(buffer)
    const extractedText = parsed.text?.trim() ?? ''

    if (!extractedText) {
      return NextResponse.json({
        extractedText: '[Could not extract text from this PDF. It may be a scanned image.]',
      })
    }

    // Store extracted text
    await supabase
      .from('lab_analyses')
      .update({ extracted_text: extractedText })
      .eq('id', analysisId)
      .eq('user_id', user.id)

    return NextResponse.json({ extractedText })
  } catch (error) {
    console.error('PDF extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract text from PDF' },
      { status: 500 }
    )
  }
}
