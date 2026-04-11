import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mux } from '@/lib/mux'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const uploadId = searchParams.get('uploadId')

  if (!uploadId) {
    return NextResponse.json({ error: 'Missing uploadId' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const upload = await mux.video.uploads.retrieve(uploadId)

  if (!upload.asset_id) {
    return NextResponse.json({ status: 'waiting', assetId: null, playbackId: null })
  }

  const asset = await mux.video.assets.retrieve(upload.asset_id)
  const playbackId = asset.playback_ids?.[0]?.id ?? null

  return NextResponse.json({
    status: asset.status,
    assetId: asset.id,
    playbackId,
    duration: asset.duration ? Math.round(asset.duration) : null,
  })
}
