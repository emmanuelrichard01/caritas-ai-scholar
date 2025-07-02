
// Vercel serverless function to proxy Supabase edge functions
export default async function handler(req, res) {
  const { method, url, headers, body } = req;
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, X-Client-Info');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Extract function name from URL
  const functionName = req.query.function;
  
  if (!functionName) {
    return res.status(400).json({ error: 'Function name is required' });
  }
  
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yvlrspteukuooobkvzdz.supabase.co';
    const targetUrl = `${supabaseUrl}/functions/v1/${functionName}`;
    
    const response = await fetch(targetUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': headers.authorization || '',
        'apikey': headers.apikey || process.env.VITE_SUPABASE_ANON_KEY || '',
        'X-Client-Info': headers['x-client-info'] || 'vercel-proxy'
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined
    });
    
    const data = await response.json();
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
