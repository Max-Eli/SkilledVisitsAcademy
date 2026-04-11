'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calculator, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import type { DosageRule } from '@/types/database'

interface CalculationResult {
  additive: string
  weight: number
  unit: string
  calculatedDose: number | null
  minDose: number
  maxDose: number
  recommendedDose: number
  status: 'safe' | 'low' | 'high'
  notes: string | null
}

export default function DosageCalculatorPage() {
  const supabase = createClient()

  const [rules, setRules] = useState<DosageRule[]>([])
  const [selectedAdditive, setSelectedAdditive] = useState('')
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [result, setResult] = useState<CalculationResult | null>(null)

  useEffect(() => {
    supabase.from('dosage_rules').select('*').order('additive_name').then(({ data }) => {
      if (data) setRules(data)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function calculate() {
    if (!selectedAdditive) return
    const rule = rules.find((r) => r.additive_name === selectedAdditive)
    if (!rule) return

    const weightKg =
      weightUnit === 'lbs'
        ? parseFloat(weight) / 2.205
        : parseFloat(weight)

    let calculatedDose: number | null = null
    if (rule.per_kg_dose && !isNaN(weightKg) && weightKg > 0) {
      calculatedDose = Math.round(rule.per_kg_dose * weightKg * 100) / 100
    }

    const recommendedDose = calculatedDose
      ? Math.min(Math.max(calculatedDose, rule.min_dose), rule.max_dose)
      : Math.round((rule.min_dose + rule.max_dose) / 2)

    let status: 'safe' | 'low' | 'high' = 'safe'
    if (calculatedDose && calculatedDose < rule.min_dose) status = 'low'
    if (calculatedDose && calculatedDose > rule.max_dose) status = 'high'

    setResult({
      additive: rule.additive_name,
      weight: parseFloat(weight),
      unit: rule.unit,
      calculatedDose,
      minDose: rule.min_dose,
      maxDose: rule.max_dose,
      recommendedDose,
      status,
      notes: rule.notes,
    })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dosage Calculator</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Calculate weight-based or standard dosing for IV additives
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4.5 w-4.5 text-rose-500" />
            Calculate Dose
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Additive */}
          <div className="space-y-2">
            <Label>IV Additive</Label>
            <Select value={selectedAdditive} onValueChange={setSelectedAdditive}>
              <SelectTrigger>
                <SelectValue placeholder="Select an additive..." />
              </SelectTrigger>
              <SelectContent>
                {rules.map((r) => (
                  <SelectItem key={r.id} value={r.additive_name}>
                    {r.additive_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label>Patient Weight (optional — for weight-based dosing)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="e.g. 70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min={0}
                max={500}
                className="flex-1"
              />
              <Select value={weightUnit} onValueChange={(v) => setWeightUnit(v as 'kg' | 'lbs')}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={calculate}
            disabled={!selectedAdditive}
            className="w-full gap-2"
          >
            <Calculator className="h-4 w-4" />
            Calculate
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Result — {result.additive}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main dose display */}
            <div className="bg-[var(--muted)] rounded-xl p-5 text-center">
              <p className="text-sm text-[var(--muted-foreground)] mb-1">Recommended Dose</p>
              <p className="text-4xl font-bold text-[var(--foreground)]">
                {result.recommendedDose}
                <span className="text-xl font-normal ml-1 text-[var(--muted-foreground)]">
                  {result.unit}
                </span>
              </p>
              {result.calculatedDose && (
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Weight-based: {result.calculatedDose} {result.unit} →
                  clamped to safe range
                </p>
              )}
            </div>

            {/* Safety range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <p className="text-xs text-emerald-700 font-medium">Minimum</p>
                <p className="text-lg font-bold text-emerald-800">
                  {result.minDose} {result.unit}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xs text-blue-700 font-medium">Maximum</p>
                <p className="text-lg font-bold text-blue-800">
                  {result.maxDose} {result.unit}
                </p>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2">
              {result.status === 'safe' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <Badge variant="success">Within safe range</Badge>
                </>
              ) : result.status === 'high' ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <Badge variant="destructive">Calculated dose exceeds maximum — using max</Badge>
                </>
              ) : (
                <>
                  <Info className="h-4 w-4 text-amber-500" />
                  <Badge variant="warning">Calculated dose below minimum — using standard</Badge>
                </>
              )}
            </div>

            {/* Notes */}
            {result.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">{result.notes}</p>
                </div>
              </div>
            )}

            <p className="text-xs text-[var(--muted-foreground)]">
              ⚠️ Clinical judgment always supersedes calculator output. Verify with prescribing provider.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
