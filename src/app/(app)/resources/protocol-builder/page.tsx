'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Layers, Plus, Trash2, Save, FlaskConical } from 'lucide-react'
import type { Vitamin, UserProtocol, ProtocolIngredient } from '@/types/database'

const BAG_TYPES = ['250mL NS', '500mL NS', '1L NS', '250mL LR', '500mL LR', '1L LR', '250mL D5W']

export default function ProtocolBuilderPage() {
  const supabase = createClient()

  const [vitamins, setVitamins] = useState<Vitamin[]>([])
  const [savedProtocols, setSavedProtocols] = useState<UserProtocol[]>([])
  const [protocolName, setProtocolName] = useState('')
  const [bagType, setBagType] = useState('500mL NS')
  const [ingredients, setIngredients] = useState<ProtocolIngredient[]>([])
  const [newAdditive, setNewAdditive] = useState('')
  const [newDose, setNewDose] = useState('')
  const [newUnit, setNewUnit] = useState('mg')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: vits }, { data: protos }] = await Promise.all([
        supabase.from('vitamins').select('*').order('name'),
        supabase
          .from('user_protocols')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ])
      if (vits) setVitamins(vits)
      if (protos) setSavedProtocols(protos)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function addIngredient() {
    if (!newAdditive || !newDose) return
    const vitamin = vitamins.find((v) => v.id === newAdditive)
    if (!vitamin) return

    setIngredients((prev) => [
      ...prev,
      {
        vitamin_id: vitamin.id,
        vitamin_name: vitamin.name,
        dose: newDose,
        unit: newUnit,
      },
    ])
    setNewAdditive('')
    setNewDose('')
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  async function saveProtocol() {
    if (!protocolName.trim()) { toast.error('Enter a protocol name'); return }
    if (ingredients.length === 0) { toast.error('Add at least one ingredient'); return }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('user_protocols')
      .insert({
        user_id: user.id,
        name: protocolName.trim(),
        bag_type: bagType,
        ingredients,
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to save protocol')
    } else {
      toast.success('Protocol saved!')
      setSavedProtocols((prev) => [data, ...prev])
      setProtocolName('')
      setIngredients([])
    }
    setSaving(false)
  }

  async function deleteProtocol(id: string) {
    await supabase.from('user_protocols').delete().eq('id', id)
    setSavedProtocols((prev) => prev.filter((p) => p.id !== id))
    toast.success('Protocol deleted')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">IV Protocol Builder</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Build, save, and reuse custom IV protocols for your practice
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Builder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-purple-500" />
              Build Protocol
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Protocol Name</Label>
              <Input
                placeholder="e.g. My Energy Protocol"
                value={protocolName}
                onChange={(e) => setProtocolName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>IV Bag Type</Label>
              <Select value={bagType} onValueChange={setBagType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BAG_TYPES.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Add ingredient */}
            <div className="space-y-2">
              <Label>Add Additive</Label>
              <Select value={newAdditive} onValueChange={setNewAdditive}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vitamin/additive..." />
                </SelectTrigger>
                <SelectContent>
                  {vitamins.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  placeholder="Dose"
                  type="number"
                  value={newDose}
                  onChange={(e) => setNewDose(e.target.value)}
                  className="flex-1"
                />
                <Select value={newUnit} onValueChange={setNewUnit}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['mg', 'mcg', 'g', 'mL', 'units', 'mEq'].map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addIngredient} disabled={!newAdditive || !newDose} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Ingredient list */}
            {ingredients.length > 0 && (
              <div className="space-y-2">
                <Label>Current Protocol</Label>
                <div className="bg-[var(--muted)] rounded-lg p-3 space-y-2">
                  <div className="text-xs text-[var(--muted-foreground)] font-medium">
                    Bag: {bagType}
                  </div>
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white rounded-md px-3 py-2">
                      <span className="text-sm text-[var(--foreground)]">{ing.vitamin_name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{ing.dose} {ing.unit}</Badge>
                        <button
                          onClick={() => removeIngredient(idx)}
                          className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={saveProtocol}
              disabled={saving || !protocolName.trim() || ingredients.length === 0}
              className="w-full gap-2"
            >
              <Save className="h-4 w-4" />
              Save Protocol
            </Button>
          </CardContent>
        </Card>

        {/* Saved protocols */}
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-3">Saved Protocols</h2>
          {savedProtocols.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <FlaskConical className="h-8 w-8 text-[var(--muted-foreground)] mx-auto mb-2" />
                <p className="text-sm text-[var(--muted-foreground)]">No saved protocols yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {savedProtocols.map((proto) => (
                <Card key={proto.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-[var(--foreground)]">{proto.name}</h3>
                        <p className="text-xs text-[var(--muted-foreground)]">{proto.bag_type}</p>
                      </div>
                      <button
                        onClick={() => deleteProtocol(proto.id)}
                        className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {proto.ingredients.map((ing: ProtocolIngredient, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-[var(--foreground)]">{ing.vitamin_name}</span>
                          <span className="text-[var(--muted-foreground)]">{ing.dose} {ing.unit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
