export type UserRole = 'admin' | 'subscriber' | 'free'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive'
export type CompatibilityStatus = 'compatible' | 'incompatible' | 'caution'
export type ThreadCategory =
  | 'general'
  | 'clinical-questions'
  | 'protocol-discussions'
  | 'ask-sva-providers'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  subscription_status: SubscriptionStatus
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  square_customer_id: string | null
  square_subscription_id: string | null
  license_type: string | null
  license_number: string | null
  license_state: string | null
  created_at: string
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  thumbnail_url: string | null
  category: string
  published: boolean
  created_by: string
  created_at: string
  price: number | null        // in cents
  price_label: string | null
  course_type: 'core' | 'addon' | 'aesthetics' | null
  is_featured: boolean | null
  lessons?: Lesson[]
}

export interface CoursePurchase {
  id: string
  user_id: string
  course_id: string
  square_payment_id: string | null
  square_order_id: string | null
  amount_paid: number
  created_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string | null
  mux_asset_id: string | null
  mux_playback_id: string | null
  duration_seconds: number | null
  order_index: number
  published: boolean
  created_at: string
  slide_pdf_url: string | null
  slide_page_count: number | null
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  completed_at: string
}

export interface Thread {
  id: string
  title: string
  body: string
  author_id: string
  category: ThreadCategory
  is_pinned: boolean
  upvotes: number
  reply_count?: number
  created_at: string
  author?: Profile
}

export interface Reply {
  id: string
  thread_id: string
  body: string
  author_id: string
  upvotes: number
  created_at: string
  author?: Profile
}

export interface Vitamin {
  id: string
  name: string
  category: string
  description: string
  therapeutic_uses: string[]
  dosing_range: string
  contraindications: string[]
  interactions: string[]
  created_at: string
}

export interface MixingCompatibility {
  id: string
  additive_a: string
  additive_b: string
  status: CompatibilityStatus
  notes: string | null
}

export interface Protocol {
  id: string
  name: string
  symptoms: string[]
  ingredients: ProtocolIngredient[]
  rationale: string
  is_sva_approved: boolean
  created_at: string
}

export interface ProtocolIngredient {
  vitamin_id: string
  vitamin_name: string
  dose: string
  unit: string
  notes?: string
}

export interface UserProtocol {
  id: string
  user_id: string
  name: string
  bag_type: string
  ingredients: ProtocolIngredient[]
  created_at: string
}

export interface DosageRule {
  id: string
  additive_name: string
  per_kg_dose: number | null
  min_dose: number
  max_dose: number
  unit: string
  notes: string | null
}

export interface LabAnalysis {
  id: string
  user_id: string
  file_path: string
  file_name: string
  extracted_text: string | null
  ai_result: LabAnalysisResult | null
  created_at: string
}

export interface LabAnalysisResult {
  summary: string
  out_of_range: LabValue[]
  normal_values: LabValue[]
  iv_recommendations: string[]
  clinical_notes: string
}

export interface LabValue {
  name: string
  value: string
  reference_range: string
  status: 'low' | 'high' | 'normal'
  clinical_significance?: string
}
