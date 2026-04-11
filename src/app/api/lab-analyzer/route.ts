import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { LabAnalysisResult } from '@/types/database'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { analysisId, extractedText } = await request.json()

  if (!extractedText || !analysisId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (typeof extractedText !== 'string' || extractedText.length > 50000) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Rate limit: max 10 analyses per user per 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('lab_analyses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', since)

  if ((count ?? 0) >= 10) {
    return NextResponse.json(
      { error: 'Daily limit reached. You can run up to 10 analyses per day.' },
      { status: 429 }
    )
  }

  const ollamaUrl = process.env.OLLAMA_API_URL ?? 'http://localhost:11434'
  const model = process.env.OLLAMA_MODEL ?? 'glm4'
  const apiKey = process.env.OLLAMA_API_KEY

  const systemPrompt = `You are a clinical assistant specializing in IV therapy and functional medicine lab interpretation.
Analyze the following lab results and respond ONLY with a valid JSON object in this exact format:
{
  "summary": "brief clinical summary",
  "out_of_range": [
    {
      "name": "test name",
      "value": "patient value with units",
      "reference_range": "normal range",
      "status": "low" or "high",
      "clinical_significance": "brief clinical note"
    }
  ],
  "normal_values": [
    {
      "name": "test name",
      "value": "patient value with units",
      "reference_range": "normal range",
      "status": "normal"
    }
  ],
  "iv_recommendations": ["recommendation 1", "recommendation 2"],
  "clinical_notes": "detailed clinical interpretation and IV therapy considerations"
}
Do not include any text outside the JSON object.`

  const userPrompt = `Lab results to analyze:\n\n${extractedText}`

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

    const response = await fetch(`${ollamaUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.message?.content ?? data.choices?.[0]?.message?.content ?? ''

    let result: LabAnalysisResult
    try {
      result = JSON.parse(content)
    } catch {
      result = {
        summary: 'Analysis complete. Please review the extracted values below.',
        out_of_range: [],
        normal_values: [],
        iv_recommendations: ['Consult with a qualified provider for IV therapy recommendations based on these results.'],
        clinical_notes: content,
      }
    }

    // Store result in database
    await supabase
      .from('lab_analyses')
      .update({ ai_result: result })
      .eq('id', analysisId)
      .eq('user_id', user.id)

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Lab analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed. Please try again or check your LLM configuration.' },
      { status: 500 }
    )
  }
}
