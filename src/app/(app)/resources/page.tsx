import Link from 'next/link'
import {
  FlaskConical,
  Beaker,
  Layers,
  Syringe,
  Calculator,
  TestTube2,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const tools = [
  {
    href: '/resources/vitamins',
    icon: FlaskConical,
    title: 'Vitamin Library',
    description:
      'Comprehensive reference for all IV-compatible vitamins, minerals, and amino acids. Includes therapeutic uses, dosing ranges, contraindications, and interactions.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    href: '/resources/mixing-guide',
    icon: Beaker,
    title: 'Interactive Mixing Guide',
    description:
      'Color-coded compatibility matrix for IV additives. Instantly see which combinations are safe, require caution, or are absolutely contraindicated.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    href: '/resources/protocol-builder',
    icon: Layers,
    title: 'IV Protocol Builder',
    description:
      'Build custom IV protocols step-by-step. Select your bag type, add additives with doses, and save your protocol library for quick reference.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  {
    href: '/resources/cocktails',
    icon: Syringe,
    title: 'Cocktail Protocol Finder',
    description:
      'Enter patient symptoms or treatment goals to get SVA-approved IV cocktail recommendations with ingredient lists, dosing, and rationale.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
  },
  {
    href: '/resources/dosage-calculator',
    icon: Calculator,
    title: 'Dosage Calculator',
    description:
      'Calculate weight-based or standard dosing for common IV additives. Returns dose with safety range and clinical notes.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
  {
    href: '/resources/lab-analyzer',
    icon: TestTube2,
    title: 'AI Lab Test Analyzer',
    description:
      'Upload patient lab results (PDF) and receive AI-powered interpretation: flagged values, clinical significance, and IV therapy recommendations.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
]

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Clinical Resource Hub</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Professional tools designed for IV therapy practice at the point of care
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Link key={tool.href} href={tool.href}>
              <Card className={`h-full hover:shadow-md transition-all cursor-pointer border ${tool.border} hover:border-current`}>
                <CardHeader className="pb-3">
                  <div className={`h-12 w-12 rounded-xl ${tool.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`h-6 w-6 ${tool.color}`} />
                  </div>
                  <CardTitle className="text-base flex items-center justify-between">
                    {tool.title}
                    <ArrowRight className={`h-4 w-4 ${tool.color} opacity-0 group-hover:opacity-100`} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
