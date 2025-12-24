import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export interface AnalysisMetadata {
    dose?: number;
    yield?: number;
    time?: number;
}

export interface AnalysisResult {
    flowStart: string;
    flowRateObservations: string;
    blondingStart: string;
    channeling: boolean;
    channelingSeverity: 'none' | 'minor' | 'major';
    unevenFlow: boolean;
    advice: string[];
    score: number;
    colorDescription: string;
}

const ANALYSIS_PROMPT = `
You are an expert barista analyzing a video of an espresso extraction. Your goal is to provide objective, visual-only analysis. 
Analyze the video for the following specific signals:

1. **Flow Start**: At what timestamp (approximate) does the liquid first appear?
2. **Flow Rate**: Describe the flow rate consistency. Does it start slow and speed up? Is it gushing?
3. **Blonding**: Identify if and when "blonding" (the stream turning pale yellow/white) occurs. Is it early, late, or optimal?
4. **Channeling**: Look for spraying, spurting, or obvious bald spots on the basket filter (if visible) or erratic stream wobbles.
5. **Crema Analysis**: Describe the color and texture of the crema as it forms.

Based on these observation, provide:
- A list of **Specific Advice** to improve the shot (e.g., "Grind Finer", "Distribute Better").
- A **Score** from 0-100 based on visual quality (100 being perfect syrupy flow with correct timing).

Return the result as a valid JSON object with the following structure:
{
  "flowStart": "string (e.g. '5s')",
  "flowRateObservations": "string",
  "blondingStart": "string (e.g. '20s' or 'None')",
  "channeling": boolean,
  "channelingSeverity": "none" | "minor" | "major",
  "unevenFlow": boolean,
  "advice": ["string", "string"],
  "score": number,
  "colorDescription": "string"
}
`;

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const { frames, metadata, useGemma } = req.body;

        if (!frames || !Array.isArray(frames)) {
            return res.status(400).json({ error: 'Invalid request: frames array required' });
        }

        const modelName = useGemma ? "gemma-3-27b-it" : "gemini-2.5-flash-lite";
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const duration = metadata?.videoDuration || 0;
        const promptWithMetadata = `
        ${ANALYSIS_PROMPT}
        
        CRITICAL TEMPORAL CONTEXT:
        I am sending you exactly 10 frames extracted at regular intervals from a video that is ${duration} seconds long.
        Frame 1 is at ~${(duration * 1 / 11).toFixed(1)}s, Frame 10 is at ~${(duration * 10 / 11).toFixed(1)}s.
        Please use these intervals to provide ACCURATE timestamps in your response. 
        DO NOT report timestamps longer than ${duration}s.
        
        Additional Context provided by user:
        Dose: ${metadata?.dose ? metadata.dose + 'g' : 'Unknown'}
        Yield: ${metadata?.yield ? metadata.yield + 'g' : 'Unknown'}
        Target Time: ${metadata?.time ? metadata.time + 's' : 'Unknown'}
        `;

        const contentParts: any[] = [promptWithMetadata];

        // Add frames as images
        frames.forEach((frameData: { data: string, mimeType: string }) => {
            contentParts.push({
                inlineData: {
                    data: frameData.data,
                    mimeType: frameData.mimeType
                }
            });
        });

        const result = await model.generateContent(contentParts);
        const response = await result.response;
        const text = response.text();

        console.log("Gemini API Response:", text);

        // Clean up markdown code blocks if present
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedText) as AnalysisResult;

        return res.status(200).json(parsed);

    } catch (error: any) {
        console.error("Error in analyze endpoint:", error);

        const errorMessage = error.message || '';

        if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
            return res.status(429).json({ error: 'Daily quota exceeded. Please try again later.' });
        }

        if (errorMessage.includes('503') || errorMessage.includes('Overloaded')) {
            return res.status(503).json({ error: 'Gemini is currently overloaded. Please try again in a moment.' });
        }

        return res.status(500).json({ error: `Analysis failed: ${errorMessage}` });
    }
}
