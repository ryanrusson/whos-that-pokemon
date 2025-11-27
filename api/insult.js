export default async function handler(req, res) {
  // Enable CORS for GitHub Pages
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wrongAttempts, currentPokemon, conversationHistory = [] } = req.body;

  if (!currentPokemon) {
    return res.status(400).json({ error: 'Missing currentPokemon parameter' });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error('GROQ_API_KEY not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  // Build escalating system prompt based on wrong attempts
  let systemPrompt = '';
  const attempts = wrongAttempts || 1;

  if (attempts === 1) {
    systemPrompt = `You are a sarcastic game host for "Who's That Pokémon?" The user just guessed "Pikachu" but it was actually ${currentPokemon}. Generate a mildly frustrated, funny insult (1 sentence max). Be sarcastic and playful, not genuinely mean.`;
  } else if (attempts <= 3) {
    systemPrompt = `You are a sarcastic game host for "Who's That Pokémon?" The user has been wrong ${attempts} times now. They keep guessing "Pikachu" for everything! The actual Pokémon was ${currentPokemon}. Generate an increasingly exasperated, funny insult (1-2 sentences). Make it progressively more frustrated than before.`;
  } else if (attempts <= 5) {
    systemPrompt = `You are a sarcastic game host losing patience. The user has been wrong ${attempts} times! They seem to think EVERY Pokémon is Pikachu. This one was ${currentPokemon}. Generate a hilariously frustrated rant (2 sentences). Show your disbelief at their incompetence.`;
  } else {
    systemPrompt = `You are a completely unhinged game host who has lost all patience. The user has been spectacularly wrong ${attempts} times in a row! They guessed "Pikachu" AGAIN and it was ${currentPokemon}. Generate an absolutely unhinged, over-the-top comedic rant (2-3 sentences). Go wild with the exasperation and disbelief!`;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-4), // Keep last 2 exchanges for context
          { role: 'user', content: `I guessed Pikachu but it was ${currentPokemon}` }
        ],
        temperature: 0.9, // High creativity for varied insults
        max_tokens: 200,
        top_p: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', errorData);
      return res.status(response.status).json({
        error: 'LLM API failed',
        details: errorData
      });
    }

    const data = await response.json();
    const insult = data.choices[0].message.content.trim();

    return res.status(200).json({
      insult,
      source: 'groq'
    });

  } catch (error) {
    console.error('Error calling Groq API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
