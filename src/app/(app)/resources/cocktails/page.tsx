import { createClient } from '@/lib/supabase/server'
import { Syringe, CheckCircle, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Protocol, ProtocolIngredient } from '@/types/database'

const SYMPTOM_CATEGORIES = [
  'fatigue', 'low energy', 'immune support', 'illness prevention',
  'athletic recovery', 'dehydration', 'hangover', 'detoxification',
  'cognitive decline', 'brain fog', 'anti-aging', 'liver support',
]

export default async function CocktailsPage({
  searchParams,
}: {
  searchParams: Promise<{ symptom?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const symptomFilter = params.symptom?.toLowerCase()

  const { data: protocols } = await supabase
    .from('protocols')
    .select('*')
    .order('is_sva_approved', { ascending: false })
    .order('name')

  const filtered = symptomFilter
    ? (protocols ?? []).filter((p: Protocol) =>
        p.symptoms.some((s) => s.toLowerCase().includes(symptomFilter))
      )
    : (protocols ?? [])

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">IV Cocktail Protocol Finder</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          SVA-approved IV cocktails organized by patient symptoms and treatment goals
        </p>
      </div>

      {/* Symptom chips */}
      <div className="mb-6">
        <p className="text-sm font-medium text-[var(--foreground)] mb-2">Filter by symptom/goal:</p>
        <div className="flex flex-wrap gap-2">
          <a href="/resources/cocktails">
            <Badge variant={!symptomFilter ? 'default' : 'outline'} className="cursor-pointer">
              All Protocols
            </Badge>
          </a>
          {SYMPTOM_CATEGORIES.map((s) => (
            <a key={s} href={`/resources/cocktails?symptom=${encodeURIComponent(s)}`}>
              <Badge
                variant={symptomFilter === s ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
              >
                {s}
              </Badge>
            </a>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Syringe className="h-10 w-10 text-[var(--muted-foreground)] mx-auto mb-3" />
          <p className="text-[var(--muted-foreground)]">No protocols found for this symptom.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {filtered.map((protocol: Protocol) => (
            <Card key={protocol.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{protocol.name}</CardTitle>
                  {protocol.is_sva_approved && (
                    <Badge variant="sva" className="gap-1 text-xs shrink-0">
                      <Shield className="h-3 w-3" />
                      SVA Approved
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Symptoms */}
                <div>
                  <p className="text-xs font-semibold text-[var(--foreground)] mb-1.5">Indicated For</p>
                  <div className="flex flex-wrap gap-1.5">
                    {protocol.symptoms.map((s) => (
                      <a key={s} href={`/resources/cocktails?symptom=${encodeURIComponent(s)}`}>
                        <Badge variant="outline" className="text-xs capitalize cursor-pointer hover:bg-[var(--muted)]">
                          {s}
                        </Badge>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <p className="text-xs font-semibold text-[var(--foreground)] mb-2">Ingredients</p>
                  <div className="space-y-1.5">
                    {protocol.ingredients.map((ing: ProtocolIngredient, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-[var(--muted)] rounded-md px-3 py-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="text-sm text-[var(--foreground)]">{ing.vitamin_name}</span>
                        </div>
                        <span className="text-sm font-medium text-[var(--foreground)]">
                          {ing.dose} {ing.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rationale */}
                <div>
                  <p className="text-xs font-semibold text-[var(--foreground)] mb-1">Clinical Rationale</p>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{protocol.rationale}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
