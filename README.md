# Who's That Pokémon? (Prank Edition)

A hilarious prank version of the classic "Who's That Pokémon?" game. This mobile web app is designed to frustrate and amuse your friends!

## The Prank

- Every silhouette **looks like Pikachu** (but it's actually a different Pokémon!)
- Presents 4 answer options - **ALL of them say "Pikachu"**
- When the user clicks ANY option, the silhouette morphs into a completely different Pokémon
- The app gets progressively more "mad" with **AI-generated escalating insults**
- The more times you get it "wrong", the more unhinged the insults become!

## Features

- **Pikachu Silhouette Morph**: Every silhouette appears as Pikachu, then transforms into the actual Pokémon
- **AI-Generated Escalating Insults**: Uses Groq API to generate increasingly frustrated, hilarious insults
- **Conversation Memory**: The AI remembers previous wrong answers and gets progressively more exasperated
- Mobile-first responsive design with smooth animations
- Fetches real Pokémon data and images from PokéAPI
- 50 different Pokémon to discover (all Gen 1, excluding Pikachu)
- Fallback to pre-determined insults if API fails
- Beautiful gradient UI with shake animations

## How to Use

1. Open `index.html` in a web browser
2. Watch your friends get increasingly frustrated as they realize all options are "Pikachu"
3. Enjoy the angry reactions when they discover they're always wrong!

## Technical Details

- Pure vanilla JavaScript (no frameworks required)
- CSS3 animations and gradients for silhouette morphing effect
- PokéAPI integration for Pokémon data and images
- Groq API (Mixtral-8x7B) for AI-generated insults via Vercel Functions
- Mobile-responsive design (works great on phones!)

## Setup & Deployment

### For GitHub Pages (Frontend Only)
The frontend is already deployed at GitHub Pages. To use AI insults, you need to deploy the Vercel function.

### Deploy to Vercel

1. **Install Vercel CLI** (optional, for local testing):
   ```bash
   npm install -g vercel
   ```

2. **Get a free Groq API key**:
   - Go to https://console.groq.com/keys
   - Sign up for a free account
   - Create a new API key

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   - Follow the prompts to link your GitHub repo
   - Add environment variable: `GROQ_API_KEY=your_key_here`

4. **Update API URL in app.js**:
   - Change `VERCEL_API_URL` to your deployed Vercel function URL
   - Example: `https://your-project.vercel.app/api/insult`

5. **Push changes and enjoy!**

### Local Development
```bash
# Install Vercel CLI
npm install -g vercel

# Create .env file
cp .env.example .env
# Add your GROQ_API_KEY to .env

# Run local development server
vercel dev
```

## Files

- `index.html` - Main HTML structure
- `styles.css` - Mobile-first styling with animations
- `app.js` - Game logic, PokéAPI integration, and LLM API calls
- `api/insult.js` - Vercel serverless function for AI-generated insults
- `vercel.json` - Vercel configuration

## License

This is a parody/prank project for entertainment purposes only. Pokémon and all related marks are © Nintendo/Creatures Inc./GAME FREAK inc.
