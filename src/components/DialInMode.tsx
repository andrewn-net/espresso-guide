import { useState } from 'react';
import { Coffee, AlertCircle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { analyzeEspressoShot } from '@/utils/calculations';
import type { DialInInput, DialInRecommendation } from '@/types';

export default function DialInMode() {
    const [input, setInput] = useState<DialInInput>({
        dose: 18,
        yield: 36,
        time: 27
    });

    const [recommendation, setRecommendation] = useState<DialInRecommendation | null>(null);

    const handleAnalyze = () => {
        const result = analyzeEspressoShot(input);
        setRecommendation(result);
    };

    const handleReset = () => {
        setInput({ dose: 18, yield: 36, time: 27 });
        setRecommendation(null);
    };

    const getSeverityColor = (level: DialInRecommendation['severityLevel']) => {
        switch (level) {
            case 'good': return 'text-green-500';
            case 'minor': return 'text-yellow-500';
            case 'major': return 'text-red-500';
            default: return 'text-muted-foreground';
        }
    };

    const getSeverityBg = (level: DialInRecommendation['severityLevel']) => {
        switch (level) {
            case 'good': return 'bg-green-500/10 border-green-500/20';
            case 'minor': return 'bg-yellow-500/10 border-yellow-500/20';
            case 'major': return 'bg-red-500/10 border-red-500/20';
            default: return 'bg-secondary/50';
        }
    };

    const getIcon = (diagnosis: DialInRecommendation['diagnosis']) => {
        switch (diagnosis) {
            case 'perfect': return <CheckCircle className="w-8 h-8 text-green-500" />;
            case 'under-extracted': return <TrendingUp className="w-8 h-8 text-yellow-500" />;
            case 'over-extracted': return <TrendingDown className="w-8 h-8 text-red-500" />;
            case 'ratio-off': return <AlertCircle className="w-8 h-8 text-yellow-500" />;
        }
    };

    const ratio = (input.yield / input.dose).toFixed(2);

    return (
        <div className="relative w-full min-h-[100dvh] bg-background text-foreground overflow-hidden pt-16 pb-[140px]">
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at center, hsl(var(--background) / 0.12), hsl(var(--background) / 0.92) 55%, hsl(var(--background)))'
                }}
            />

            <div className="relative z-10 w-full max-w-2xl mx-auto px-3 md:px-6 space-y-4">
                {/* Header - Compact */}
                <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5">
                        <Coffee className="w-6 h-6 text-primary" />
                        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Dial In Your Shot
                        </h1>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">
                        Enter your espresso parameters
                    </p>
                </div>

                {/* Input Card */}
                <div className="bg-secondary/30 backdrop-blur-xl p-3 md:p-6 rounded-2xl border border-border/50 shadow-[0_18px_44px_-30px_hsl(var(--foreground)/0.35)] space-y-3">
                    <h2 className="text-base md:text-xl font-semibold text-foreground">Shot Parameters</h2>

                    {/* Dose Control */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-muted-foreground">
                                Dose
                            </label>
                            <div className="text-2xl md:text-3xl font-bold text-primary tabular-nums">
                                {input.dose.toFixed(1)}<span className="text-sm text-muted-foreground ml-1">g</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setInput({ ...input, dose: Math.max(10, input.dose - 0.5) })}
                                className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 transition-colors flex items-center justify-center text-foreground font-bold text-xl shadow-[0_6px_16px_-10px_hsl(var(--foreground)/0.3)]"
                            >
                                −
                            </button>
                            <input
                                type="range"
                                min="10"
                                max="25"
                                step="0.1"
                                value={input.dose}
                                onChange={(e) => setInput({ ...input, dose: parseFloat(e.target.value) })}
                                className="flex-1 h-3 bg-gradient-to-b from-secondary/60 to-secondary rounded-full appearance-none cursor-pointer accent-primary shadow-inner"
                                style={{
                                    background: `linear-gradient(to right, rgba(70, 70, 70, 0.85) 0%, rgba(210, 210, 210, 0.6) ${((input.dose - 10) / (25 - 10)) * 100}%, hsl(var(--secondary)) ${((input.dose - 10) / (25 - 10)) * 100}%, hsl(var(--secondary)) 100%)`,
                                }}
                            />
                            <button
                                onClick={() => setInput({ ...input, dose: Math.min(25, input.dose + 0.5) })}
                                className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 transition-colors flex items-center justify-center text-foreground font-bold text-xl shadow-[0_6px_16px_-10px_hsl(var(--foreground)/0.3)]"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Yield Control */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-muted-foreground">
                                Yield
                            </label>
                            <div className="text-2xl md:text-3xl font-bold text-primary tabular-nums">
                                {input.yield.toFixed(1)}<span className="text-sm text-muted-foreground ml-1">g</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setInput({ ...input, yield: Math.max(20, input.yield - 1) })}
                                className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 transition-colors flex items-center justify-center text-foreground font-bold text-xl shadow-[0_6px_16px_-10px_hsl(var(--foreground)/0.3)]"
                            >
                                −
                            </button>
                            <input
                                type="range"
                                min="20"
                                max="60"
                                step="0.1"
                                value={input.yield}
                                onChange={(e) => setInput({ ...input, yield: parseFloat(e.target.value) })}
                                className="flex-1 h-3 bg-gradient-to-b from-secondary/60 to-secondary rounded-full appearance-none cursor-pointer accent-primary shadow-inner"
                                style={{
                                    background: `linear-gradient(to right, rgba(70, 70, 70, 0.85) 0%, rgba(210, 210, 210, 0.6) ${((input.yield - 20) / (60 - 20)) * 100}%, hsl(var(--secondary)) ${((input.yield - 20) / (60 - 20)) * 100}%, hsl(var(--secondary)) 100%)`,
                                }}
                            />
                            <button
                                onClick={() => setInput({ ...input, yield: Math.min(60, input.yield + 1) })}
                                className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 transition-colors flex items-center justify-center text-foreground font-bold text-xl shadow-[0_6px_16px_-10px_hsl(var(--foreground)/0.3)]"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Time Control */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-muted-foreground">
                                Time
                            </label>
                            <div className="text-2xl md:text-3xl font-bold text-primary tabular-nums">
                                {input.time}<span className="text-sm text-muted-foreground ml-1">s</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setInput({ ...input, time: Math.max(15, input.time - 1) })}
                                className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 transition-colors flex items-center justify-center text-foreground font-bold text-xl shadow-[0_6px_16px_-10px_hsl(var(--foreground)/0.3)]"
                            >
                                −
                            </button>
                            <input
                                type="range"
                                min="15"
                                max="40"
                                step="1"
                                value={input.time}
                                onChange={(e) => setInput({ ...input, time: parseInt(e.target.value) })}
                                className="flex-1 h-3 bg-gradient-to-b from-secondary/60 to-secondary rounded-full appearance-none cursor-pointer accent-primary shadow-inner"
                                style={{
                                    background: `linear-gradient(to right, rgba(70, 70, 70, 0.85) 0%, rgba(210, 210, 210, 0.6) ${((input.time - 15) / (40 - 15)) * 100}%, hsl(var(--secondary)) ${((input.time - 15) / (40 - 15)) * 100}%, hsl(var(--secondary)) 100%)`,
                                }}
                            />
                            <button
                                onClick={() => setInput({ ...input, time: Math.min(40, input.time + 1) })}
                                className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 transition-colors flex items-center justify-center text-foreground font-bold text-xl shadow-[0_6px_16px_-10px_hsl(var(--foreground)/0.3)]"
                            >
                                +
                            </button>
                        </div>
                    </div>



                    <div className="bg-background/50 p-2.5 rounded-lg border border-border">
                        <div className="text-center">
                            <div className="text-xs text-muted-foreground">Ratio</div>
                            <div className="text-xl md:text-2xl font-bold text-primary">1:{ratio}</div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleAnalyze}
                            className="flex-1 px-4 py-2.5 bg-emerald-400 text-white rounded-lg font-semibold hover:bg-emerald-500 transition-all shadow-[0_10px_30px_-18px_rgba(16,185,129,0.7)] text-sm"
                        >
                            Analyze Shot
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2.5 bg-rose-400 text-white rounded-lg font-semibold hover:bg-rose-500 transition-all shadow-[0_10px_26px_-20px_rgba(244,63,94,0.7)] text-sm"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Results Card */}
                {recommendation && (
                    <div className={`backdrop-blur-xl p-3 md:p-6 rounded-2xl border shadow-[0_18px_44px_-30px_hsl(var(--foreground)/0.35)] space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 ${getSeverityBg(recommendation.severityLevel)}`}>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex-shrink-0">
                                {getIcon(recommendation.diagnosis)}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div>
                                    <h3 className={`text-lg md:text-xl font-bold ${getSeverityColor(recommendation.severityLevel)}`}>
                                        {recommendation.diagnosis === 'perfect' && 'Perfect Shot!'}
                                        {recommendation.diagnosis === 'under-extracted' && 'Under-Extracted'}
                                        {recommendation.diagnosis === 'over-extracted' && 'Over-Extracted'}
                                        {recommendation.diagnosis === 'ratio-off' && 'Ratio Adjustment Needed'}
                                    </h3>
                                    <p className="text-xs md:text-sm text-foreground/80 mt-1">{recommendation.explanation}</p>
                                </div>

                                {/* Grind Adjustment */}
                                <div className="bg-background/40 p-2.5 rounded-lg border border-border/50">
                                    <div className="text-xs font-semibold text-foreground mb-0.5">Grind Adjustment</div>
                                    <div className="text-xs text-foreground/90">{recommendation.grindAdjustment.message}</div>
                                </div>

                                {/* Dose Adjustment (if applicable) */}
                                {recommendation.doseAdjustment && (
                                    <div className="bg-background/40 p-2.5 rounded-lg border border-border/50">
                                        <div className="text-xs font-semibold text-foreground mb-0.5">Optional: Dose Adjustment</div>
                                        <div className="text-xs text-foreground/90">{recommendation.doseAdjustment.message}</div>
                                    </div>
                                )}

                                {/* Taste Profile */}
                                <div className="bg-background/40 p-2.5 rounded-lg border border-border/50">
                                    <div className="text-xs font-semibold text-foreground mb-0.5">Expected Taste</div>
                                    <div className="text-xs text-foreground/90 italic">{recommendation.tasteProfile}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
