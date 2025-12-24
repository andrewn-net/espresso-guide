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
    video.preload = 'auto'; // Ensure video data is loaded
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) throw new Error("Could not get canvas context");

    const fileUrl = URL.createObjectURL(videoFile);
    video.src = fileUrl;

    const frames: string[] = [];
    const points = [0.2, 0.5, 0.8]; // Extract at 20%, 50%, 80%

    try {
        // 1. Wait for metadata to load
        console.log("DEBUG: Waiting for metadata...");
        await new Promise<void>((resolve, reject) => {
            video.onloadedmetadata = () => resolve();
            video.onerror = (e) => reject(new Error("Video load error: " + e));
            setTimeout(() => reject(new Error("Timeout waiting for video metadata")), 10000);
        });

        console.log("DEBUG: Metadata loaded.", video.duration, video.videoWidth, video.videoHeight);

        // Validate duration
        if (!video.duration || !isFinite(video.duration)) {
            throw new Error("Invalid video duration");
        }

        // Setup canvas (downscale for API efficiency)
        canvas.width = Math.floor((video.videoWidth || 1920) / 4);
        canvas.height = Math.floor((video.videoHeight || 1080) / 4);

        // 2. Wait for video to be ready to play (data loaded)
        console.log("DEBUG: Waiting for video data to load...");
        await new Promise<void>((resolve, reject) => {
            if (video.readyState >= 2) { // HAVE_CURRENT_DATA or better
                resolve();
            } else {
                video.onloadeddata = () => resolve();
                video.onerror = reject;
                setTimeout(() => reject(new Error("Timeout waiting for video data")), 10000);
            }
        });

        console.log("DEBUG: Video data loaded, ready to seek");

        // 3. Loop through timepoints sequentially
        for (const point of points) {
            const time = video.duration * point;
            console.log(`DEBUG: Seeking to ${time.toFixed(2)}s...`);

            // Set up the seeked listener BEFORE changing currentTime
            const seekPromise = new Promise<void>((resolve, reject) => {
                const onSeeked = () => {
                    video.removeEventListener('seeked', onSeeked);
                    resolve();
                };
                const onError = (e: Event) => {
                    video.removeEventListener('error', onError);
                    reject(new Error("Seek error: " + e));
                };

                video.addEventListener('seeked', onSeeked);
                video.addEventListener('error', onError);

                // Longer timeout for seeking
                setTimeout(() => {
                    video.removeEventListener('seeked', onSeeked);
                    video.removeEventListener('error', onError);
                    reject(new Error(`Timeout waiting for seek to ${time.toFixed(2)}s`));
                }, 8000);
            });

            video.currentTime = time;
            await seekPromise;

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

        // Provide helpful error messages
        if (errorMessage.includes('Timeout waiting for seek')) {
            throw new Error('Video processing timed out. Try a shorter or simpler video file.');
        }
        if (errorMessage.includes('Timeout waiting for video')) {
            throw new Error('Video failed to load. Check your internet connection or try a different file.');
        }
        if (errorMessage.includes('Invalid video duration')) {
            throw new Error('Unable to read video. The file may be corrupted or in an unsupported format.');
        }

        throw new Error(errorMessage);
    }
}
