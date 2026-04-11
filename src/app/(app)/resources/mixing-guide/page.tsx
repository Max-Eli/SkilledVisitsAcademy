import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import type { MixingCompatibility } from '@/types/database'

const STATUS_CONFIG = {
  compatible: {
    label: 'Compatible',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    badgeVariant: 'success' as const,
  },
  incompatible: {
    label: 'INCOMPATIBLE',
    icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    badgeVariant: 'destructive' as const,
  },
  caution: {
    label: 'Use Caution',
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    badgeVariant: 'warning' as const,
  },
}

export default async function MixingGuidePage() {
  const supabase = await createClient()
  const { data: entries } = await supabase
    .from('mixing_compatibility')
    .select('*')
    .order('status')

  const compatible = (entries ?? []).filter((e: MixingCompatibility) => e.status === 'compatible')
  const incompatible = (entries ?? []).filter((e: MixingCompatibility) => e.status === 'incompatible')
  const caution = (entries ?? []).filter((e: MixingCompatibility) => e.status === 'caution')

  const grouped = [
    { status: 'incompatible', entries: incompatible },
    { status: 'caution', entries: caution },
    { status: 'compatible', entries: compatible },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">IV Mixing Compatibility Guide</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Additive compatibility reference for IV therapy. Always verify with a pharmacist for complex combinations.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-8">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const Icon = config.icon
          return (
            <div key={key} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bg} ${config.border}`}>
              <Icon className={`h-4 w-4 ${config.text}`} />
              <span className={`text-sm font-medium ${config.text}`}>{config.label}</span>
            </div>
          )
        })}
      </div>

      {/* Entries grouped by status */}
      <div className="space-y-8">
        {grouped.map(({ status, entries: statusEntries }) => {
          if (!statusEntries.length) return null
          const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
          const Icon = config.icon

          return (
            <div key={status}>
              <h2 className={`flex items-center gap-2 text-base font-semibold mb-3 ${config.text}`}>
                <Icon className="h-4.5 w-4.5" />
                {config.label}
                <span className="text-sm font-normal text-[var(--muted-foreground)]">({statusEntries.length})</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {statusEntries.map((entry: MixingCompatibility) => (
                  <Card key={entry.id} className={`border ${config.border}`}>
                    <CardContent className={`p-4 ${config.bg}`}>
                      <div className="flex items-start gap-3">
                        <div className={`h-2 w-2 rounded-full ${config.dot} mt-2 shrink-0`} />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="font-semibold text-sm text-[var(--foreground)]">
                              {entry.additive_a}
                            </span>
                            <span className="text-[var(--muted-foreground)] text-sm">+</span>
                            <span className="font-semibold text-sm text-[var(--foreground)]">
                              {entry.additive_b}
                            </span>
                            <Badge variant={config.badgeVariant} className="text-[10px] ml-auto">
                              {config.label}
                            </Badge>
                          </div>
                          {entry.notes && (
                            <p className="text-xs text-[var(--foreground)] leading-relaxed">{entry.notes}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {(!entries || entries.length === 0) && (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          No compatibility data yet. Run the seed SQL to populate.
        </div>
      )}
    </div>
  )
}
