import { useState } from 'react';
import { Coffee, AlertCircle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { analyzeEspressoShot } from '@/utils/calculations';
import type { DialInInput, DialInRecommendation } from '@/types';
import { useStore } from '@/store/useStore';
import { BookOpen } from 'lucide-react';

export default function DialInMode() {
    const [input, setInput] = useState<DialInInput>({
        dose: 18,
        yield: 36,
        time: 27
    });

    const [recommendation, setRecommendation] = useState<DialInRecommendation | null>(null);
    const { addBrewProfile } = useStore();
    const [isSaved, setIsSaved] = useState(false);

    const handleAnalyze = () => {
        const result = analyzeEspressoShot(input);
        setRecommendation(result);
        setIsSaved(false);
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

                {/* Input Section - Optimized for Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Dose Control Card */}
                    <div className="bg-secondary/30 backdrop-blur-xl p-4 rounded-2xl border border-border/50 shadow-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Dose</label>
                            <div className="text-2xl font-black text-primary tabular-nums">
                                {input.dose.toFixed(1)}<span className="text-xs font-medium ml-0.5">g</span>
                            </div>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="25"
                            step="0.1"
                            value={input.dose}
                            onChange={(e) => setInput({ ...input, dose: parseFloat(e.target.value) })}
                            className="w-full h-1.5 bg-background/50 rounded-full appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setInput({ ...input, dose: Math.max(10, input.dose - 0.1) })}
                                className="flex-1 py-2 bg-background/40 hover:bg-background/60 rounded-xl text-lg font-bold transition-all active:scale-95"
                            >
                                −
                            </button>
                            <button
                                onClick={() => setInput({ ...input, dose: Math.min(25, input.dose + 0.1) })}
                                className="flex-1 py-2 bg-background/40 hover:bg-background/60 rounded-xl text-lg font-bold transition-all active:scale-95"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Yield Control Card */}
                    <div className="bg-secondary/30 backdrop-blur-xl p-4 rounded-2xl border border-border/50 shadow-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Yield</label>
                            <div className="text-2xl font-black text-primary tabular-nums">
                                {input.yield.toFixed(1)}<span className="text-xs font-medium ml-0.5">g</span>
                            </div>
                        </div>
                        <input
                            type="range"
                            min="20"
                            max="60"
                            step="0.1"
                            value={input.yield}
                            onChange={(e) => setInput({ ...input, yield: parseFloat(e.target.value) })}
                            className="w-full h-1.5 bg-background/50 rounded-full appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setInput({ ...input, yield: Math.max(20, input.yield - 0.5) })}
                                className="flex-1 py-2 bg-background/40 hover:bg-background/60 rounded-xl text-lg font-bold transition-all active:scale-95"
                            >
                                −
                            </button>
                            <button
                                onClick={() => setInput({ ...input, yield: Math.min(60, input.yield + 0.5) })}
                                className="flex-1 py-2 bg-background/40 hover:bg-background/60 rounded-xl text-lg font-bold transition-all active:scale-95"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Time Control Card */}
                    <div className="bg-secondary/30 backdrop-blur-xl p-4 rounded-2xl border border-border/50 shadow-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Time</label>
                            <div className="text-2xl font-black text-primary tabular-nums">
                                {input.time}<span className="text-xs font-medium ml-0.5">s</span>
                            </div>
                        </div>
                        <input
                            type="range"
                            min="15"
                            max="45"
                            step="1"
                            value={input.time}
                            onChange={(e) => setInput({ ...input, time: parseInt(e.target.value) })}
                            className="w-full h-1.5 bg-background/50 rounded-full appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setInput({ ...input, time: Math.max(15, input.time - 1) })}
                                className="flex-1 py-2 bg-background/40 hover:bg-background/60 rounded-xl text-lg font-bold transition-all active:scale-95"
                            >
                                −
                            </button>
                            <button
                                onClick={() => setInput({ ...input, time: Math.min(45, input.time + 1) })}
                                className="flex-1 py-2 bg-background/40 hover:bg-background/60 rounded-xl text-lg font-bold transition-all active:scale-95"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dashboard - Ratio and Main Buttons */}
                <div className="bg-secondary/40 backdrop-blur-xl p-4 rounded-3xl border border-border/50 space-y-4">
                    <div className="flex items-center justify-center gap-8 py-2">
                        <div className="text-center">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Ratio</div>
                            <div className="text-3xl font-black text-primary tabular-nums">1:{ratio}</div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleAnalyze}
                            className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-[0_12px_30px_-12px_rgba(16,185,129,0.5)] active:scale-[0.98]"
                        >
                            Analyze Shot
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-6 py-4 bg-secondary text-foreground rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-secondary/80 transition-all active:scale-[0.98]"
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

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => {
                                            const beanName = prompt('Bean Name and Roast Date?', '');
                                            const grind = prompt('Grind Setting?', '');
                                            if (beanName && grind) {
                                                addBrewProfile({
                                                    beanName,
                                                    grindSetting: grind,
                                                    dose: input.dose,
                                                    expectedYield: input.yield,
                                                    expectedTime: input.time,
                                                    notes: recommendation.diagnosis === 'perfect' ? 'Ideal Profile' : recommendation.explanation
                                                });
                                                setIsSaved(true);
                                            }
                                        }}
                                        disabled={isSaved}
                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-bold transition-all ${isSaved
                                            ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                                            : 'bg-primary text-primary-foreground shadow-lg hover:opacity-90'
                                            }`}
                                    >
                                        <BookOpen size={18} />
                                        {isSaved ? 'Profile Saved' : 'Save as Brew Profile'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
