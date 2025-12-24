import { useState, useRef } from "react";
import { Upload, Loader2, Video, Camera } from "lucide-react";
import { analyzeEspressoShot, type AnalysisResult } from "@/lib/gemini";
import AnalysisResults from "./AnalysisResults";

export default function AnalysisMode() {
    const [status, setStatus] = useState<'idle' | 'analyzing' | 'complete' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    // Debug State
    const [debugLogs, setDebugLogs] = useState<string[]>([]);
    const [showDebug, setShowDebug] = useState(false);
    const debugClickCount = useRef(0);

    const toggleDebug = () => {
        debugClickCount.current += 1;
        if (debugClickCount.current === 3) {
            setShowDebug(prev => !prev);
            debugClickCount.current = 0;
        }
    };

    const addLog = (msg: string) => {
        setDebugLogs(prev => [msg, ...prev].slice(0, 10)); // Keep last 10
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const validateVideo = (file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            // 1. Size Check (100MB limit)
            const MAX_SIZE_MB = 100;
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                reject(new Error(`Video is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Limit is ${MAX_SIZE_MB}MB.`));
                return;
            }

            // 2. Duration Check (60s limit)
            const video = document.createElement('video');
            video.preload = 'metadata';

            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                const duration = video.duration;
                if (duration > 62) { // Allow slight buffer
                    reject(new Error(`Video is too long (${duration.toFixed(0)}s). Please keep it under 60s.`));
                } else {
                    resolve();
                }
            };

            video.onerror = () => {
                window.URL.revokeObjectURL(video.src);
                reject(new Error("Could not load video metadata."));
            };

            video.src = URL.createObjectURL(file);
        });
    };

    const performAnalysis = async (selectedFile: File) => {
        if (!selectedFile.type.startsWith('video/')) {
            const msg = "Error: Not a video file.";
            setErrorMsg(msg);
            addLog(msg);
            return;
        }

        setErrorMsg(null);
        setStatus('analyzing');
        setResult(null);
        addLog(`Starting analysis for ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB)`);

        try {
            // Validate before sending
            await validateVideo(selectedFile);
            addLog("Video validation passed.");

            const data = await analyzeEspressoShot(
                selectedFile,
                {} // Minimal mode: No metadata
            );
            addLog("API Response received.");
            setResult(data);
            setStatus('complete');
        } catch (err: any) {
            console.error(err);
            const msg = err.message || "Analysis failed. Please try again.";
            setErrorMsg(msg);
            addLog(`Error: ${msg}`);
            if (err.cause) addLog(`Cause: ${JSON.stringify(err.cause)}`);
            setStatus('error');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            performAnalysis(e.target.files[0]);
            // Reset input so the same file selection triggers change again if needed
            e.target.value = '';
        }
    };

    const handleReset = () => {
        setResult(null);
        setStatus('idle');
        setErrorMsg(null);
    };

    if (status === 'complete' && result) {
        return (
            <div className="relative w-full min-h-[100dvh] bg-background text-foreground overflow-hidden pt-16 pb-[140px]">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle at center, hsl(var(--background) / 0.12), hsl(var(--background) / 0.92) 55%, hsl(var(--background)))'
                    }}
                />

                <div className="relative z-10 w-full max-w-2xl mx-auto px-4 md:px-8 space-y-6">
                    <div className="flex flex-col items-center gap-2 text-center pb-4">
                        <div className="flex items-center gap-2">
                            <Camera className="w-6 h-6 text-primary" />
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Analysis Complete
                            </h1>
                        </div>
                    </div>
                    <AnalysisResults result={result} />
                    <button
                        onClick={handleReset}
                        className="w-full py-3 bg-secondary/60 text-foreground rounded-xl font-medium hover:bg-secondary transition-colors shadow-[0_12px_30px_-24px_hsl(var(--foreground)/0.35)]"
                    >
                        Analyze Another Shot
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full min-h-[100dvh] bg-background text-foreground overflow-hidden pt-16 pb-[140px]">
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at center, hsl(var(--background) / 0.12), hsl(var(--background) / 0.92) 55%, hsl(var(--background)))'
                }}
            />

            <div className="relative z-10 w-full max-w-2xl mx-auto px-4 md:px-6 space-y-8">
                {/* Debug Overlay */}
                {showDebug && (
                    <div className="fixed top-0 left-0 w-full h-full bg-black/90 text-green-400 font-mono text-xs p-4 overflow-auto z-50 pointer-events-none">
                        <div className="font-bold border-b border-green-500/50 mb-2 pb-1">DEBUG LOGS (Triple tap title to close)</div>
                        {debugLogs.map((log, i) => (
                            <div key={i} className="mb-1 border-b border-white/10 pb-1">{`> ${log}`}</div>
                        ))}
                    </div>
                )}

                {/* Main Content */}
                <div className="w-full space-y-8 flex flex-col transition-all duration-500">
                    {/* Header - Triple Tap for Debug */}
                    <div className="w-full space-y-1 flex flex-col items-center text-center" onClick={toggleDebug}>
                        <div className="flex items-center gap-2">
                            <Camera className="w-6 h-6 text-primary" />
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent select-none cursor-pointer">
                                Visual Shot Analysis
                            </h1>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">
                            Record your extraction flow
                        </p>
                    </div>

                    {/* Primary Action: Camera */}
                    <div className="w-full flex justify-center relative group">
                        <button
                            onClick={() => cameraInputRef.current?.click()}
                            disabled={status === 'analyzing'}
                            className={`w-full aspect-square max-w-[280px] mx-auto rounded-[3rem] shadow-[0_22px_60px_-36px_hsl(var(--foreground)/0.45)] flex flex-col items-center justify-center gap-4 transition-all duration-300 border-4
                                ${status === 'analyzing'
                                    ? 'bg-secondary/20 border-secondary/50 cursor-wait'
                                    : 'bg-secondary/40 hover:bg-secondary/55 border-primary/10 hover:border-primary/25 hover:scale-105 hover:shadow-[0_24px_62px_-30px_hsl(var(--foreground)/0.42)] cursor-pointer active:scale-95'
                                }
                            `}
                        >
                            {status === 'analyzing' ? (
                                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                    <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                                    <span className="block text-lg font-medium text-foreground/80 animate-pulse">Analyzing...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="p-6 bg-primary/10 rounded-full text-primary backdrop-blur-sm shadow-[0_10px_28px_-18px_hsl(var(--foreground)/0.3)] group-hover:scale-110 transition-transform duration-300">
                                        <Video size={48} className="fill-current" />
                                    </div>
                                    <div className="text-center text-foreground space-y-1">
                                        <span className="block font-bold text-2xl tracking-wide group-hover:text-primary transition-colors">Record Shot</span>
                                        <span className="block text-xs font-medium text-muted-foreground uppercase tracking-widest group-hover:text-primary/70 transition-colors">Tap to Start</span>
                                    </div>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Secondary: Upload */}
                    {status !== 'analyzing' && (
                        <div className="flex justify-center">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-2 transition-colors px-4 py-2 rounded-full hover:bg-secondary/40"
                            >
                                <Upload size={14} />
                                <span>Or upload existing video</span>
                            </button>
                        </div>
                    )}

                    {/* Hidden Inputs */}
                    <input
                        type="file"
                        ref={cameraInputRef}
                        className="hidden"
                        accept="video/mp4,video/*"
                        capture="environment"
                        onChange={handleFileSelect}
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="video/*"
                        onChange={handleFileSelect}
                    />

                    {/* Error Message */}
                    {errorMsg && (
                        <div className="flex justify-center w-full">
                            <div className="p-4 bg-rose-500/10 text-rose-500 text-sm rounded-xl text-center border border-rose-500/20 max-w-sm animate-in fade-in slide-in-from-top-2">
                                {errorMsg}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
