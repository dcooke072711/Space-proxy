// worker.js - Main Cloudflare Worker entry point
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }
    
    // Proxy endpoint
    if (url.pathname === '/proxy') {
      return handleProxyRequest(request);
    }
    
    // Worker script endpoint
    if (url.pathname === '/worker.js') {
      return handleWorkerRequest(request);
    }
    
    return new Response('Space Proxy API Running', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};

async function handleProxyRequest(request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  
  if (!targetUrl) {
    return new Response('Missing URL parameter', { status: 400 });
  }
  
  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    return new Response(response.body, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': response.headers.get('Content-Type') || 'text/plain'
      }
    });
  } catch (error) {
    return new Response('Error fetching URL: ' + error.message, { status: 500 });
  }
}

async function handleWorkerRequest(request) {
  // Simplified worker creation endpoint
  const script = `
    self.addEventListener('message', function(e) {
      self.postMessage('Worker received: ' + e.data);
    });
  `;
  
  return new Response(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
