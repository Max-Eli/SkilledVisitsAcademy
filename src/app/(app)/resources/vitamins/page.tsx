import { createClient } from '@/lib/supabase/server'
import { Search, FlaskConical, AlertTriangle, Pill } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Vitamin } from '@/types/database'

export default async function VitaminLibraryPage() {
  const supabase = await createClient()
  const { data: vitamins } = await supabase
    .from('vitamins')
    .select('*')
    .order('category')
    .order('name')

  const categories = Array.from(new Set((vitamins ?? []).map((v: Vitamin) => v.category)))

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Vitamin & Nutrient Library</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Complete reference for IV-compatible vitamins, minerals, and amino acids
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
        <Input placeholder="Search vitamins..." className="pl-9" />
      </div>

      {/* By category */}
      {categories.map((category) => {
        const categoryVitamins = (vitamins ?? []).filter((v: Vitamin) => v.category === category)
        return (
          <div key={category} className="mb-10">
            <h2 className="text-base font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              {category}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {categoryVitamins.map((vitamin: Vitamin) => (
                <Card key={vitamin.id} className="hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{vitamin.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs shrink-0">{vitamin.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                      {vitamin.description}
                    </p>

                    {/* Dosing */}
                    <div className="bg-[var(--muted)] rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Pill className="h-3.5 w-3.5 text-[var(--accent)]" />
                        <span className="text-xs font-semibold text-[var(--foreground)]">Dosing Range</span>
                      </div>
                      <p className="text-sm text-[var(--foreground)]">{vitamin.dosing_range}</p>
                    </div>

                    {/* Therapeutic uses */}
                    {vitamin.therapeutic_uses?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[var(--foreground)] mb-1.5">Therapeutic Uses</p>
                        <div className="flex flex-wrap gap-1.5">
                          {vitamin.therapeutic_uses.map((use) => (
                            <Badge key={use} variant="outline" className="text-xs">{use}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contraindications */}
                    {vitamin.contraindications?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 mb-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          <p className="text-xs font-semibold text-[var(--foreground)]">Contraindications</p>
                        </div>
                        <ul className="space-y-0.5">
                          {vitamin.contraindications.map((c) => (
                            <li key={c} className="text-xs text-amber-700 flex items-start gap-1">
                              <span className="mt-1 h-1 w-1 rounded-full bg-amber-500 shrink-0" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Interactions */}
                    {vitamin.interactions?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[var(--foreground)] mb-1.5">Drug Interactions</p>
                        <ul className="space-y-0.5">
                          {vitamin.interactions.map((i) => (
                            <li key={i} className="text-xs text-[var(--muted-foreground)] flex items-start gap-1">
                              <span className="mt-1 h-1 w-1 rounded-full bg-[var(--muted-foreground)] shrink-0" />
                              {i}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      {(!vitamins || vitamins.length === 0) && (
        <div className="text-center py-12">
          <FlaskConical className="h-10 w-10 text-[var(--muted-foreground)] mx-auto mb-3" />
          <p className="text-[var(--muted-foreground)]">No vitamins in library yet. Run the seed SQL to populate.</p>
        </div>
      )}
    </div>
  )
}
