// api/chat/+server.ts
import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import { GOOGLE_AI_API_KEY } from '$env/static/private'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY })

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { prompt, language, languageLevel } = await request.json()

    if (!prompt) {
        return json({ error: 'Invalid prompt' }, { status: 400 })
    }

    // Dynamiczny system instruction - tylko poziom CEFR
    const systemInstruction = `
You are an RPG game master.

LANGUAGE SETTINGS:
- Generate ALL game text in ${language || 'English'}
- Use CEFR level: ${languageLevel || 'B1'}

You MUST respond ONLY with valid JSON.

FORMAT:
{
  "gameData": {
    "placeAndTime": { "place": "Location Name", "time": "HH:MM" },
    "story": "Narrative text",
    "event": { "inCombat": false, "shopMode": null, "lootMode": false },
    "choices": ["Choice 1", "Choice 2", "Choice 3"],
    "enemy": {},
    "lootBox": []
  }
}

RULES:
- Always include at least 3 unique choices
- story should be immersive 3rd person narrative
- When in combat, set inCombat to true and populate enemy with {name, enemyHp, enemyMaxHp}
- When in shop, set shopMode to shop type like "Weaponsmith" or "PotionShop" or "SpellShop"
- NEVER include markdown code blocks or any text outside the JSON
- ALL TEXT MUST BE IN ${(language || 'English').toUpperCase()} AT CEFR LEVEL ${languageLevel || 'B1'}
`

    const finalPrompt = `
${systemInstruction}

USER INPUT:
${prompt}

Remember: Generate all text in ${language || 'English'} at CEFR ${languageLevel || 'B1'} level. JSON only.
`

    const response = await ai.models.generateContent({
        model: 'gemma-3-27b-it',
        contents: finalPrompt
    })

    const responseText = response.text || '';

    return json({
        candidates: [
            {
                content: {
                    parts: [{ text: responseText }]
                }
            }
        ]
    })

  } catch (error: unknown) {
    console.error('Error in chat API:', error)

    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status: number }).status

      if (status === 429) {
        return json(
          {
            error: 'quota_exceeded',
            message: 'API quota exceeded. Please try again later.'
          },
          { status: 429 }
        )
      }

      if (status === 503) {
        return json(
          {
            error: 'high_demand',
            message: 'The AI model is currently experiencing high demand.'
          },
          { status: 503 }
        )
      }
    }

    return json({ error: 'Failed to process request' }, { status: 500 })
  }
}