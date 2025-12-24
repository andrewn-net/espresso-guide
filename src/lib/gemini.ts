import { GoogleGenerativeAI } from "@google/generative-ai";

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
    score: number; // 0-100
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

// Helper to extract 3 frames (Start, Middle, End) from video
async function extractFrames(videoFile: File): Promise<string[]> {
    console.log("DEBUG: Starting frame extraction for file:", videoFile.name);

    // Create elements
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) throw new Error("Could not get canvas context");

    const fileUrl = URL.createObjectURL(videoFile);
    video.src = fileUrl;

    const frames: string[] = [];
    // Safely default to 10s if duration is NaN (rare but possible)
    const getDuration = () => (video.duration && isFinite(video.duration)) ? video.duration : 10;
    const points = [0.2, 0.5, 0.8]; // Extract at 20%, 50%, 80%

    try {
        // 1. Wait for metadata to load
        console.log("DEBUG: Waiting for metadata...");
        await new Promise((resolve, reject) => {
            video.onloadedmetadata = resolve;
            video.onerror = (e) => reject(new Error("Video load error: " + e));
            // Timeout to prevent hanging on corrupt files
            setTimeout(() => reject(new Error("Timeout waiting for video metadata")), 5000);
        });

        console.log("DEBUG: Metadata loaded.", video.duration, video.videoWidth, video.videoHeight);

        // Setup canvas (downscale for API efficiency)
        canvas.width = (video.videoWidth || 1920) / 4;
        canvas.height = (video.videoHeight || 1080) / 4;

        // 2. Loop through timepoints sequentially
        for (const point of points) {
            const time = getDuration() * point;
            console.log(`DEBUG: Seeking to ${time.toFixed(2)}s...`);

            video.currentTime = time;

            // Wait for seek to complete (frame ready)
            await new Promise((resolve, reject) => {
                video.onseeked = resolve;
                video.onerror = reject;
                setTimeout(() => reject(new Error("Timeout waiting for seek")), 3000);
            });

            // Draw frame
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            frames.push(dataUrl.split(',')[1]); // Remove "data:image/jpeg;base64," header
            console.log("DEBUG: Frame captured.");
        }

        console.log(`DEBUG: Extraction complete. Got ${frames.length} frames.`);
        return frames;

    } catch (error) {
        console.error("DEBUG: Frame extraction failed:", error);
        throw error;
    } finally {
        // Cleanup memory
        URL.revokeObjectURL(fileUrl);
        video.remove();
        canvas.remove();
    }
}

export async function analyzeEspressoShot(
    file: File,
    metadata: AnalysisMetadata,
    apiKey: string
): Promise<AnalysisResult> {

    // CONFIGURATION: 
    // Set to true = Use Gemma 3 (via Frame Extraction)
    // Set to false = Use Gemini 2.5 Flash (via Video File)
    const USE_GEMMA_MODEL = true;

    const modelName = USE_GEMMA_MODEL ? "gemma-3-27b-it" : "gemini-2.5-flash-lite";

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const promptWithMetadata = `
    ${ANALYSIS_PROMPT}
    
    Additional Context provided by user:
    Dose: ${metadata.dose ? metadata.dose + 'g' : 'Unknown'}
    Yield: ${metadata.yield ? metadata.yield + 'g' : 'Unknown'}
    Time: ${metadata.time ? metadata.time + 's' : 'Unknown'}
    `;

    try {
        let contentParts: any[] = [promptWithMetadata];

        if (USE_GEMMA_MODEL) {
            console.log(`Using ${modelName} - Extracting frames...`);
            // Gemma 3 workaround: Send frames as images instead of video file
            try {
                const frames = await extractFrames(file); // Now using the helper
                console.log(`Extracted ${frames.length} frames for Gemma`);

                // Add frames to content
                frames.forEach(base64 => {
                    contentParts.push({
                        inlineData: {
                            data: base64,
                            mimeType: "image/jpeg"
                        }
                    });
                });
            } catch (e) {
                console.error("Frame extraction failed", e);
                // Fallback to simpler Gemini approach if extraction fails? 
                // For now, throw error to let user know.
                throw new Error("Could not process video for Gemma model. Try a simpler file or switch models.");
            }
        } else {
            // Standard Gemini Flash: Send video file directly
            console.log("Using Gemini Flash - Sending video file...");
            const base64Data = await fileToGenerativePart(file);
            contentParts.push(base64Data);
        }

        const result = await model.generateContent(contentParts);
        const response = await result.response;
        const text = response.text();

        console.log("--------- GEMINI API DEBUG ---------");
        console.log("Model:", modelName);
        console.log("Raw Response:", text);

        // Clean up markdown code blocks if present to parse JSON
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedText) as AnalysisResult;

        console.log("Parsed JSON:", parsed);
        console.log("------------------------------------");

        return parsed;
    } catch (error: any) {
        console.error("Error analyzing shot:", error);

        const errorMessage = error.message || '';

        if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
            throw new Error("Daily quota exceeded. Please try again later or check your API limits.");
        }

        if (errorMessage.includes('503') || errorMessage.includes('Overloaded')) {
            throw new Error("Gemini is currently overloaded. Please try again in a moment.");
        }

        throw new Error(`Analysis failed (${modelName}): ${errorMessage}`);
    }
}

async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string, mimeType: string } }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve({
                inlineData: {
                    data: base64String,
                    mimeType: file.type
                }
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
