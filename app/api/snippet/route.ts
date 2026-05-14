import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// The actual snippet code that gets injected into client sites
const SNIPPET_CODE = `
(function(w, d, k) {
  'use strict';
  if (w._vb) return;

  var VB_ENDPOINT = 'ENDPOINT_URL/api/analyze';
  var events = [];
  var startTime = Date.now();
  var scrollDepth = 0;
  var apiKey = k;

  // Track scroll depth
  w.addEventListener('scroll', function() {
    var depth = Math.round((w.scrollY / (d.body.scrollHeight - w.innerHeight)) * 100);
    scrollDepth = Math.max(scrollDepth, depth);
  }, { passive: true });

  // Track events
  function track(type, data) {
    events.push({ type: type, ts: Date.now() - startTime, data: data || {} });
    if (events.length >= 5 || type === 'add_to_cart' || type === 'checkout') {
      flush();
    }
  }

  // Send to VeroBehavior
  function flush() {
    if (!events.length) return;
    var payload = {
      events: events.splice(0),
      pageContext: d.title + ' — ' + w.location.pathname,
      sessionDuration: Math.round((Date.now() - startTime) / 1000),
      scrollDepth: scrollDepth,
      apiKey: apiKey
    };
    fetch(VB_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-vb-key': apiKey },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function(){});
  }

  // Auto-track clicks on key elements
  d.addEventListener('click', function(e) {
    var el = e.target;
    var tag = el.tagName.toLowerCase();
    if (tag === 'button' || tag === 'a' || el.dataset.vbTrack) {
      track('click', { text: el.textContent.trim().slice(0, 50), tag: tag, id: el.id });
    }
  });

  // Track form interactions
  d.addEventListener('change', function(e) {
    track('field_change', { name: e.target.name || e.target.id || 'unknown' });
  });

  // Flush on page unload
  w.addEventListener('visibilitychange', function() {
    if (d.visibilityState === 'hidden') flush();
  });

  // Expose manual tracking
  w._vb = { track: track };
  console.log('[VeroBehavior] Behavioral intelligence active ✓');
})(window, document, '{{API_KEY}}');
`

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key') || 'demo'
  const origin = req.headers.get('origin') || '*'

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://verobehavior.com'
  const code = SNIPPET_CODE
    .replace('ENDPOINT_URL', appUrl)
    .replace('{{API_KEY}}', key)

  return new NextResponse(code, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': origin,
    },
  })
}
