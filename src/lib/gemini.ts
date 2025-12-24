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
    metadata: AnalysisMetadata
): Promise<AnalysisResult> {
    // CONFIGURATION: 
    // Set to true = Use Gemma 3 (via Frame Extraction)
    // Set to false = Use Gemini 2.5 Flash (via Video File)
    const USE_GEMMA_MODEL = true;

    try {
        console.log("Extracting frames from video...");
        const frames = await extractFrames(file);
        console.log(`Extracted ${frames.length} frames`);

        // Prepare frames for API
        const frameData = frames.map(base64 => ({
            data: base64,
            mimeType: "image/jpeg"
        }));

        console.log("Sending to serverless API...");

        // Call our serverless function instead of Gemini directly
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                frames: frameData,
                metadata,
                useGemma: USE_GEMMA_MODEL
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const result = await response.json() as AnalysisResult;
        console.log("Analysis complete:", result);

        return result;

    } catch (error: any) {
        console.error("Error analyzing shot:", error);
        const errorMessage = error.message || 'Analysis failed';
        throw new Error(errorMessage);
    }
}
