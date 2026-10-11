import { GEMINI_CONFIG } from './config.js';

/**
 * Sends a user prompt to the Google Gemini API and returns the generated text.
 *
 * @param {string} userPrompt - The user message/prompt.
 * @param {string} apiKey - Gemini API key.
 * @param {string} [model] - Gemini model identifier (defaults to config model).
 * @returns {Promise<string>} The AI response text or a descriptive error message.
 */
export async function fetchGeminiResponse(
  userPrompt,
  apiKey = GEMINI_CONFIG.DEFAULT_API_KEY,
  model = GEMINI_CONFIG.DEFAULT_MODEL
) {
  const activeKey = apiKey || GEMINI_CONFIG.DEFAULT_API_KEY;

  if (!activeKey || activeKey === 'YOUR_GEMINI_API_KEY') {
    return (
      `Hello! I am your Gemini AI assistant.\n\n` +
      `I received your prompt: "${userPrompt}"\n\n` +
      `💡 **Ready for your Gemini API Key**: To connect live Gemini API responses:\n` +
      `1. Get your free API key at https://aistudio.google.com/\n` +
      `2. Paste your API key in the top header input or set DEFAULT_API_KEY in backend/config.js.`
    );
  }

  try {
    const endpoint = `${GEMINI_CONFIG.BASE_URL}/${model}:generateContent?key=${encodeURIComponent(activeKey)}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: userPrompt }],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.error?.message || `HTTP ${response.status} Error`;
      return `Gemini API Error: ${errorMessage}`;
    }

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else if (data.error) {
      return `Gemini API Error: ${data.error.message}`;
    }

    return 'Unexpected response format from Gemini API.';
  } catch (err) {
    return `Network Connection Error: ${err.message}`;
  }
}

/**
 * Utility function to validate if an API key is provided and non-empty.
 *
 * @param {string} key
 * @returns {boolean}
 */
export function hasValidApiKey(key) {
  const activeKey = key || GEMINI_CONFIG.DEFAULT_API_KEY;
  return Boolean(activeKey && activeKey.trim().length > 0 && activeKey !== 'YOUR_GEMINI_API_KEY');
}
