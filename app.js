// List of Pokémon (excluding Pikachu) for the game
const pokemonList = [
    { name: 'Bulbasaur', id: 1 },
    { name: 'Charmander', id: 4 },
    { name: 'Squirtle', id: 7 },
    { name: 'Caterpie', id: 10 },
    { name: 'Butterfree', id: 12 },
    { name: 'Pidgey', id: 16 },
    { name: 'Rattata', id: 19 },
    { name: 'Spearow', id: 21 },
    { name: 'Ekans', id: 23 },
    { name: 'Raichu', id: 26 },
    { name: 'Sandshrew', id: 27 },
    { name: 'Clefairy', id: 35 },
    { name: 'Vulpix', id: 37 },
    { name: 'Jigglypuff', id: 39 },
    { name: 'Zubat', id: 41 },
    { name: 'Oddish', id: 43 },
    { name: 'Paras', id: 46 },
    { name: 'Meowth', id: 52 },
    { name: 'Psyduck', id: 54 },
    { name: 'Mankey', id: 56 },
    { name: 'Growlithe', id: 58 },
    { name: 'Poliwag', id: 60 },
    { name: 'Abra', id: 63 },
    { name: 'Machop', id: 66 },
    { name: 'Bellsprout', id: 69 },
    { name: 'Geodude', id: 74 },
    { name: 'Ponyta', id: 77 },
    { name: 'Slowpoke', id: 79 },
    { name: 'Magnemite', id: 81 },
    { name: 'Doduo', id: 84 },
    { name: 'Seel', id: 86 },
    { name: 'Grimer', id: 88 },
    { name: 'Gastly', id: 92 },
    { name: 'Onix', id: 95 },
    { name: 'Drowzee', id: 96 },
    { name: 'Krabby', id: 98 },
    { name: 'Voltorb', id: 100 },
    { name: 'Cubone', id: 104 },
    { name: 'Lickitung', id: 108 },
    { name: 'Koffing', id: 109 },
    { name: 'Rhyhorn', id: 111 },
    { name: 'Horsea', id: 116 },
    { name: 'Goldeen', id: 118 },
    { name: 'Staryu', id: 120 },
    { name: 'Scyther', id: 123 },
    { name: 'Jynx', id: 124 },
    { name: 'Eevee', id: 133 },
    { name: 'Snorlax', id: 143 },
    { name: 'Dratini', id: 147 },
    { name: 'Mewtwo', id: 150 }
];

// Sarcastic insult templates
const insultTemplates = [
    "NO! That's {name}, you idiot!",
    "Are you serious?! That's clearly {name}!",
    "Wrong! It's {name}, dummy!",
    "{name}! How could you not know that?!",
    "Wow... just wow. It's {name}!",
    "That's {name}, you absolute fool!",
    "Come on! Even a baby knows that's {name}!",
    "{name}! Did you even LOOK at it?!",
    "Seriously?! It's obviously {name}!",
    "WRONG! It's {name}, not Pikachu!"
];

let currentPokemon = null;
let wrongAttempts = 0;
let conversationHistory = [];
const VERCEL_API_URL = 'https://whos-that-pokemon-4v093eu7h-ryan-russons-projects.vercel.app/api/insult';

// Rate limiting: cache last insult and timestamp
let lastInsultCache = null;
let lastInsultTime = 0;
const RATE_LIMIT_MS = 2000; // Minimum 2 seconds between API calls

// DOM elements
const pokemonImg = document.getElementById('pokemon-img');
const pikachuImg = document.getElementById('pikachu-img');
const pokemonImage = document.getElementById('pokemon-image');
const answerSection = document.getElementById('answer-section');
const resultSection = document.getElementById('result-section');
const resultText = document.getElementById('result-text');
const resultSubtext = document.getElementById('result-subtext');
const nextBtn = document.getElementById('next-btn');
const answerButtons = document.querySelectorAll('.answer-btn');

// Initialize game
function initGame() {
    loadPikachu();
    loadRandomPokemon();
    setupEventListeners();
}

// Load Pikachu image once (always shows as silhouette)
async function loadPikachu() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon/25');
        const data = await response.json();

        // Use the official artwork for Pikachu
        const imageUrl = data.sprites.other['official-artwork'].front_default;
        pikachuImg.src = imageUrl;
        pikachuImg.alt = 'Pikachu silhouette';
    } catch (error) {
        console.error('Error loading Pikachu:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    answerButtons.forEach(btn => {
        btn.addEventListener('click', handleAnswerClick);
    });

    nextBtn.addEventListener('click', () => {
        resetGame();
        loadRandomPokemon();
    });
}

// Load a random Pokémon (never Pikachu)
async function loadRandomPokemon() {
    const randomIndex = Math.floor(Math.random() * pokemonList.length);
    currentPokemon = pokemonList[randomIndex];

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${currentPokemon.id}`);
        const data = await response.json();

        // Use the official artwork for the random Pokemon
        const imageUrl = data.sprites.other['official-artwork'].front_default;
        pokemonImg.src = imageUrl;
        pokemonImg.alt = currentPokemon.name;

        // Ensure silhouette effect is applied and Pokemon layer is hidden
        pokemonImage.classList.remove('revealed');
        pokemonImage.classList.add('silhouette');
    } catch (error) {
        console.error('Error loading Pokémon:', error);
        // Retry with a different Pokémon
        loadRandomPokemon();
    }
}

// Handle answer click (all answers are wrong since they all say "Pikachu")
function handleAnswerClick() {
    // Reveal the Pokémon
    pokemonImage.classList.remove('silhouette');
    pokemonImage.classList.add('revealed');

    // Hide answer buttons
    answerSection.style.display = 'none';

    // Show angry result
    showAngryResult();

    // Show result section
    resultSection.classList.remove('hidden');
}

// Show angry result with LLM-generated escalating insult
async function showAngryResult() {
    wrongAttempts++;

    // Show loading message
    resultText.textContent = "Thinking of an insult...";
    resultSubtext.textContent = "";

    let insultText = '';
    const now = Date.now();

    // Rate limiting: if last call was too recent, use fallback
    const timeSinceLastCall = now - lastInsultTime;
    const shouldUseLLM = timeSinceLastCall >= RATE_LIMIT_MS;

    if (!shouldUseLLM) {
        console.log('Rate limited, using fallback insult');
        const randomInsult = insultTemplates[Math.floor(Math.random() * insultTemplates.length)];
        insultText = randomInsult.replace('{name}', currentPokemon.name);
        resultText.textContent = insultText;
        resultSubtext.textContent = "";
        return;
    }

    try {
        // Try to get LLM-generated insult
        const response = await fetch(VERCEL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                wrongAttempts,
                currentPokemon: currentPokemon.name,
                conversationHistory
            })
        });

        if (response.ok) {
            const data = await response.json();
            insultText = data.insult;

            // Update rate limit tracking
            lastInsultTime = Date.now();
            lastInsultCache = insultText;

            // Add to conversation history for escalating context
            conversationHistory.push({
                role: 'user',
                content: `I guessed Pikachu but it was ${currentPokemon.name}`
            });
            conversationHistory.push({
                role: 'assistant',
                content: insultText
            });
        } else {
            throw new Error(`API returned ${response.status}`);
        }
    } catch (error) {
        console.warn('LLM API failed, using fallback insult:', error);
        // Fallback to pre-determined insults
        const randomInsult = insultTemplates[Math.floor(Math.random() * insultTemplates.length)];
        insultText = randomInsult.replace('{name}', currentPokemon.name);
    }

    resultText.textContent = insultText;
    resultSubtext.textContent = "";
}

// Reset game for next round
function resetGame() {
    // Hide result section
    resultSection.classList.add('hidden');

    // Show answer section
    answerSection.style.display = 'block';

    // Reset image to silhouette
    pokemonImage.classList.remove('revealed');
    pokemonImage.classList.add('silhouette');

    // Note: We keep wrongAttempts and conversationHistory
    // so insults escalate across multiple rounds!
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', initGame);
