// api/grammar-check/+server.ts
import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import { GOOGLE_AI_API_KEY } from '$env/static/private'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY })

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { text, language, languageLevel } = await request.json()

    if (!text) {
        return json({ error: 'Invalid text' }, { status: 400 })
    }

    const systemInstruction = `
You are a language teacher evaluating an RPG player's input.
The player is learning ${language || 'English'} and is at ${languageLevel || 'B1'} level.

Your task is to:
1. Score the grammar and naturalness of the input on a scale of 0-100.
2. Identify specific errors or awkward phrasing.
3. Provide a corrected version.
4. Explain the errors briefly.



Respond ONLY with valid JSON in this format:
{
  "score": 85,
  "isCorrect": false,
  "explanation": "Brief explanation of overall quality.",
  "errors": [
    {
      "text": "incorrect part",
      "correction": "corrected part",
      "reason": "Why it's wrong"
    }
  ],
  "correctedText": "The full corrected sentence."
}
  RULES:
- You have to answer "explanation" in json response in ${language}.
`

    const finalPrompt = `
${systemInstruction}

PLAYER INPUT:
"${text}"

Evaluate the input. JSON only.
`

    const response = await ai.models.generateContent({
        model: 'gemma-3-27b-it',
        contents: finalPrompt
    })

    const responseText = response.text || '';
    
    // Clean JSON if needed (sometimes models add markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanedText = jsonMatch ? jsonMatch[0] : responseText;
    
    const evaluation = JSON.parse(cleanedText);

    return json(evaluation);

  } catch (error: any) {
    console.error('Error in grammar-check API:', error)
    return json({ error: 'Failed to evaluate grammar', details: error.message }, { status: 500 })
  }
}
