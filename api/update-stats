export default async function handler(req, res) {
  console.log('Test-Scraper aufgerufen um', new Date().toISOString());

  const url = process.env.SUPABASE_URL || 'MISSING_URL';
  const key = process.env.SUPABASE_ANON_KEY ? 'KEY_VORHANDEN' : 'MISSING_KEY';

  res.status(200).json({
    status: 'ok',
    message: 'Scraper Test erfolgreich – kein Crash',
    env_vars: {
      SUPABASE_URL: url,
      SUPABASE_ANON_KEY: key
    },
    timestamp: new Date().toISOString()
  });
}
