/**
 * functions/api/[[path]].js
 *
 * Cloudflare Pages Function that proxies all /api/* requests to the
 * backend on Render. The real API URL is stored in the Cloudflare
 * Pages environment variable API_BASE_URL — never exposed to the browser.
 *
 * Set in Cloudflare Dashboard → Pages → thesynagogues.com → Settings
 * → Environment variables:
 *   API_BASE_URL = https://campushub-api.onrender.com
 */

export async function onRequest({ request, env, params }) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    })
  }

  const apiBase = env.API_BASE_URL
  if (!apiBase) {
    return new Response(
      JSON.stringify({ error: 'API_BASE_URL is not configured on Cloudflare Pages.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Build the target URL — /api/contact → apiBase/api/contact
  const path      = params.path ? params.path.join('/') : ''
  const url       = new URL(request.url)
  const targetUrl = `${apiBase}/api/${path}${url.search}`

  // Forward the request
  const proxyRequest = new Request(targetUrl, {
    method:  request.method,
    headers: {
      'Content-Type':  request.headers.get('Content-Type') || 'application/json',
      'X-Forwarded-For': request.headers.get('CF-Connecting-IP') || '',
      'X-Origin':       'thesynagogues.com',
    },
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
  })

  try {
    const response    = await fetch(proxyRequest)
    const contentType = response.headers.get('Content-Type') || 'application/json'

    return new Response(response.body, {
      status:  response.status,
      headers: {
        'Content-Type': contentType,
        ...corsHeaders(),
      },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Could not reach the backend. Please try again.' }),
      { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders() } }
    )
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  'https://thesynagogues.com',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}
