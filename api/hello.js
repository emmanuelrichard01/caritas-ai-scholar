
// Vercel serverless function for health check
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'CARITAS AI API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
}
