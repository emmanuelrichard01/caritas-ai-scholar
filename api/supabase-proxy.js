
// Vercel serverless function to proxy Supabase edge functions
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, X-Client-Info');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Extract function name from URL path
  const { slug } = req.query;
  const functionName = Array.isArray(slug) ? slug.join('/') : slug;
  
  if (!functionName) {
    return res.status(400).json({ error: 'Function name is required' });
  }
  
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yvlrspteukuooobkvzdz.supabase.co';
    const targetUrl = `${supabaseUrl}/functions/v1/${functionName}`;
    
    // Prepare headers for the request
    const headers = {
      'Content-Type': 'application/json',
      'apikey': process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bHJzcHRldWt1b29vYmt2emR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NjQyNDAsImV4cCI6MjA2MTE0MDI0MH0.EdFXxTk2mOOJwxWugX_nj4wsxffy1lK_l1jljUk2-T0',
      'X-Client-Info': 'vercel-proxy'
    };
    
    // Add authorization header if present
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
