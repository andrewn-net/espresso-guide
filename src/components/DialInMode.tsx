import { useState } from 'react';
import { Coffee, AlertCircle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { analyzeEspressoShot } from '@/utils/calculations';
import type { DialInInput, DialInRecommendation } from '@/types';

export default function DialInMode() {
    const [input, setInput] = useState<DialInInput>({
        dose: 18,
        yield: 36,
        time: 27,
        grindSetting: 5
    });

    const [recommendation, setRecommendation] = useState<DialInRecommendation | null>(null);

    const handleAnalyze = () => {
        const result = analyzeEspressoShot(input);
        setRecommendation(result);
    };

    const handleReset = () => {
        setInput({ dose: 18, yield: 36, time: 27, grindSetting: 5 });
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
        <div className="w-full min-h-[100dvh] flex items-center justify-center p-3 md:p-6 bg-background">
            <div className="w-full max-w-2xl space-y-3 pb-24 pt-4">
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
                <div className="bg-secondary/30 backdrop-blur-xl p-3 md:p-6 rounded-2xl border border-border/50 shadow-xl space-y-3">
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
                                className="flex-shrink-0 w-11 h-11 rounded-full bg-secondary hover:bg-secondary/80 active:scale-95 transition-all flex items-center justify-center text-foreground font-bold text-xl"
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
                                className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <button
                                onClick={() => setInput({ ...input, dose: Math.min(25, input.dose + 0.5) })}
                                className="flex-shrink-0 w-11 h-11 rounded-full bg-secondary hover:bg-secondary/80 active:scale-95 transition-all flex items-center justify-center text-foreground font-bold text-xl"
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
                                className="flex-shrink-0 w-11 h-11 rounded-full bg-secondary hover:bg-secondary/80 active:scale-95 transition-all flex items-center justify-center text-foreground font-bold text-xl"
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
                                className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <button
                                onClick={() => setInput({ ...input, yield: Math.min(60, input.yield + 1) })}
                                className="flex-shrink-0 w-11 h-11 rounded-full bg-secondary hover:bg-secondary/80 active:scale-95 transition-all flex items-center justify-center text-foreground font-bold text-xl"
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
                                className="flex-shrink-0 w-11 h-11 rounded-full bg-secondary hover:bg-secondary/80 active:scale-95 transition-all flex items-center justify-center text-foreground font-bold text-xl"
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
                                className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <button
                                onClick={() => setInput({ ...input, time: Math.min(40, input.time + 1) })}
                                className="flex-shrink-0 w-11 h-11 rounded-full bg-secondary hover:bg-secondary/80 active:scale-95 transition-all flex items-center justify-center text-foreground font-bold text-xl"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Grind Setting Control */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-muted-foreground">
                                Grind Setting
                            </label>
                            <div className="text-2xl md:text-3xl font-bold text-primary tabular-nums">
                                {input.grindSetting.toFixed(1)}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setInput({ ...input, grindSetting: Math.max(1, input.grindSetting - 0.1) })}
                                className="flex-shrink-0 w-11 h-11 rounded-full bg-secondary hover:bg-secondary/80 active:scale-95 transition-all flex items-center justify-center text-foreground font-bold text-xl"
                            >
                                −
                            </button>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="0.1"
                                value={input.grindSetting}
                                onChange={(e) => setInput({ ...input, grindSetting: parseFloat(e.target.value) })}
                                className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <button
                                onClick={() => setInput({ ...input, grindSetting: Math.min(10, input.grindSetting + 0.1) })}
                                className="flex-shrink-0 w-11 h-11 rounded-full bg-secondary hover:bg-secondary/80 active:scale-95 transition-all flex items-center justify-center text-foreground font-bold text-xl"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Current Ratio Display */}
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
                            className="flex-1 px-4 py-2.5 bg-emerald-400 text-white rounded-lg font-semibold hover:bg-emerald-500 transition-all shadow-lg hover:shadow-xl text-sm"
                        >
                            Analyze Shot
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2.5 bg-rose-400 text-white rounded-lg font-semibold hover:bg-rose-500 transition-all text-sm"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Results Card */}
                {recommendation && (
                    <div className={`backdrop-blur-xl p-3 md:p-6 rounded-2xl border shadow-xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 ${getSeverityBg(recommendation.severityLevel)}`}>
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
