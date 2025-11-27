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

  const baseRules = `RULES: Respond with ONLY the insult. No quotes. No narration. Keep it under 15 words. Be funny and sarcastic.`;

  if (attempts === 1) {
    systemPrompt = `You're a snarky game host. The user guessed "Pikachu" but it was ${currentPokemon}. Give a short, sarcastic one-liner. ${baseRules}`;
  } else if (attempts <= 3) {
    systemPrompt = `You're an exasperated game host. Wrong ${attempts} times! They keep saying "Pikachu" - it was ${currentPokemon}. Short frustrated one-liner. ${baseRules}`;
  } else if (attempts <= 5) {
    systemPrompt = `You're losing your mind. Wrong ${attempts} times! EVERYTHING is "Pikachu" to them. It was ${currentPokemon}. One angry one-liner. ${baseRules}`;
  } else {
    systemPrompt = `You've completely lost it. Wrong ${attempts} TIMES! They said "Pikachu" AGAIN - it was ${currentPokemon}. One unhinged one-liner. ${baseRules}`;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-4), // Keep last 2 exchanges for context
          { role: 'user', content: `I guessed Pikachu but it was ${currentPokemon}` }
        ],
        temperature: 0.9, // High creativity for varied insults
        max_tokens: 60,
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
