import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protected subscriber routes
  const subscriberRoutes = ['/dashboard', '/courses', '/community', '/resources', '/settings']
  const isSubscriberRoute = subscriberRoutes.some((r) => pathname.startsWith(r))

  // Protected admin routes
  const isAdminRoute = pathname.startsWith('/admin')

  if (!user && (isSubscriberRoute || isAdminRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (user && isAdminRoute) {
    // Check role — fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Subscription gating — disabled during development
  // TODO: re-enable by setting ENABLE_SUBSCRIPTION_GATE=true in .env.local once Stripe is configured
  const subscriptionGateEnabled = process.env.ENABLE_SUBSCRIPTION_GATE === 'true'
  if (subscriptionGateEnabled && user && isSubscriberRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, subscription_status')
      .eq('id', user.id)
      .single()

    const hasAccess =
      profile?.role === 'admin' ||
      profile?.subscription_status === 'active' ||
      profile?.subscription_status === 'trialing'

    if (!hasAccess && pathname !== '/settings') {
      const url = request.nextUrl.clone()
      url.pathname = '/pricing'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
