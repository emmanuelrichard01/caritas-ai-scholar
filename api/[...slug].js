
// Dynamic API route to handle all Supabase function calls
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, X-Client-Info');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Extract function path from URL
  const { slug } = req.query;
  const functionPath = Array.isArray(slug) ? slug.join('/') : slug;
  
  if (!functionPath) {
    return res.status(400).json({ error: 'Function path is required' });
  }
  
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yvlrspteukuooobkvzdz.supabase.co';
    const targetUrl = `${supabaseUrl}/functions/v1/${functionPath}`;
    
    console.log(`Proxying request to: ${targetUrl}`);
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'apikey': process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bHJzcHRldWt1b29vYmt2emR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NjQyNDAsImV4cCI6MjA2MTE0MDI0MH0.EdFXxTk2mOOJwxWugX_nj4wsxffy1lK_l1jljUk2-T0',
      'X-Client-Info': 'vercel-proxy'
    };
    
    // Forward authorization header if present
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }
    
    const fetchOptions = {
      method: req.method,
      headers
    };
    
    // Add body for non-GET requests
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(targetUrl, fetchOptions);
    
    if (!response.ok) {
      console.error(`Supabase function error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `Supabase function error: ${response.statusText}`,
        details: errorText
      });
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
