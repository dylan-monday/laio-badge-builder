// LA.IO Badge Builder - Tracking Edge Function
// Handles impression and click events from badge.js
//
// Deploy with: supabase functions deploy track
// Test with: curl -X POST https://xxx.supabase.co/functions/v1/track -d '{"t":"impression","slug":"test"}'

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// 1x1 transparent GIF for pixel tracking
const TRANSPARENT_GIF = Uint8Array.from(atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), c => c.charCodeAt(0))

interface TrackingPayload {
  t: 'impression' | 'click'
  slug: string
  color?: string
  size?: string
  layout?: string
  v?: string
  domain?: string
  page?: string
  ua?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    let payload: TrackingPayload

    // Parse payload from either POST body or GET query params
    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        payload = await req.json()
      } else {
        // Handle sendBeacon with text body
        const text = await req.text()
        payload = JSON.parse(text)
      }
    } else {
      // GET request - parse from query params (pixel fallback)
      const url = new URL(req.url)
      payload = {
        t: url.searchParams.get('t') as 'impression' | 'click',
        slug: url.searchParams.get('slug') || '',
        color: url.searchParams.get('color') || undefined,
        size: url.searchParams.get('size') || undefined,
        layout: url.searchParams.get('layout') || undefined,
        v: url.searchParams.get('v') || undefined,
        domain: url.searchParams.get('domain') || undefined,
        page: url.searchParams.get('page') || undefined,
        ua: url.searchParams.get('ua') || undefined,
      }
    }

    // Validate required fields
    if (!payload.t || !payload.slug) {
      console.error('Missing required fields:', { t: payload.t, slug: payload.slug })
      return new Response(
        JSON.stringify({ error: 'Missing required fields: t, slug' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate event type
    if (payload.t !== 'impression' && payload.t !== 'click') {
      return new Response(
        JSON.stringify({ error: 'Invalid event type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get geo info from Cloudflare headers (Supabase Edge provides these)
    const country = req.headers.get('cf-ipcountry') || req.headers.get('x-country') || null

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Insert event
    const { error } = await supabase.from('events').insert({
      event_type: payload.t,
      partner_slug: payload.slug.slice(0, 50), // Enforce max length
      domain: payload.domain?.slice(0, 255) || null,
      page_url: payload.page?.slice(0, 2000) || null,
      badge_layout: payload.layout || 'standard',
      badge_color: payload.color || null,
      badge_size: payload.size || null,
      user_agent: payload.ua?.slice(0, 500) || null,
      referrer: req.headers.get('referer')?.slice(0, 2000) || null,
      country,
    })

    if (error) {
      console.error('Database error:', error)
      // Don't fail the request - tracking errors shouldn't break the badge
    }

    // Return appropriate response based on request type
    if (req.method === 'GET') {
      // Return 1x1 transparent GIF for pixel requests
      return new Response(TRANSPARENT_GIF, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      })
    }

    // Return 204 No Content for POST/sendBeacon requests
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })

  } catch (err) {
    console.error('Tracking error:', err)

    // Still return success to not break the badge
    if (req.method === 'GET') {
      return new Response(TRANSPARENT_GIF, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      })
    }

    return new Response(null, { status: 204, headers: corsHeaders })
  }
})
