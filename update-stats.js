const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  console.log('Scraper started at', new Date().toISOString());

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // 1. Steam-Spielerzahl scrapen
    const steamRes = await fetch('https://steamplayerstats.com/games/arc-raiders');
    const steamText = await steamRes.text();

    const match = steamText.match(/Current Players<\/span>:\s*([\d,]+)/i);
    const steamPlayers = match ? parseInt(match[1].replace(/,/g, '')) : 0;
    const estimatedTotal = Math.round(steamPlayers * 2 / 1000) * 1000;

    // 2. In live_stats schreiben
    await supabase.from('live_stats').upsert({
      id: 'players',
      total_estimated: estimatedTotal,
      steam_current: steamPlayers,
      last_updated: new Date().toISOString()
    });

    // 3. Conditions scrapen (metaforge – Beispiel, passe an wenn nötig)
    const conditionsRes = await fetch('https://metaforge.app/arc-raiders/event-timers');
    const conditionsData = await conditionsRes.json();

    const conditions = conditionsData?.events || []; // Anpassen an echte Struktur

    // Max 3 Conditions schreiben
    const batch = [];
    if (conditions[0]) {
      batch.push(supabase.from('live_conditions').upsert({
        id: 'current',
        ...conditions[0],
        updated_at: new Date().toISOString()
      }));
    }
    if (conditions[1]) {
      batch.push(supabase.from('live_conditions').upsert({
        id: 'next1',
        ...conditions[1],
        updated_at: new Date().toISOString()
      }));
    }
    if (conditions[2]) {
      batch.push(supabase.from('live_conditions').upsert({
        id: 'next2',
        ...conditions[2],
        updated_at: new Date().toISOString()
      }));
    }

    await Promise.all(batch);

    res.status(200).json({
      success: true,
      steam_players: steamPlayers,
      estimated_total: estimatedTotal,
      conditions_count: conditions.length
    });
  } catch (error) {
    console.error('Scraper error:', error.message, error.stack);
    res.status(500).json({
      error: 'Scraper crashed',
      details: error.message
    });
  }
};
