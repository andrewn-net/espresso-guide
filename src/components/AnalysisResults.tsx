import type { AnalysisResult } from "@/lib/gemini";
import { CheckCircle, AlertTriangle, Droplets, Clock } from "lucide-react";

interface AnalysisResultsProps {
    result: AnalysisResult;
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-emerald-500 dark:text-emerald-400";
        if (score >= 70) return "text-amber-500 dark:text-amber-400";
        return "text-rose-500 dark:text-rose-400";
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* Score Card - Now in a box */}
            <div className="bg-card p-8 rounded-3xl shadow-sm border border-border/50 text-center space-y-2">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                    Extraction Score
                </div>
                <div className={`text-7xl font-black ${getScoreColor(result.score)} tracking-tighter`}>
                    {result.score}
                </div>
            </div>

            {/* Description - Now underneath */}
            <div className="text-center space-y-4">
                <p className="text-lg font-medium leading-relaxed text-foreground">
                    {result.flowRateObservations}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                    {result.channeling && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                            <AlertTriangle size={12} /> Channeling Detected
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-secondary text-secondary-foreground">
                        <Clock size={12} /> Flow: {result.flowStart}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-secondary text-secondary-foreground">
                        <Droplets size={12} /> Blonding: {result.blondingStart}
                    </span>
                </div>
            </div>

            {/* Actionable Advice */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest pl-2">Adjustments</h3>
                {result.advice.map((tip, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50">
                        <div className="mt-1 bg-primary/20 text-primary p-1.5 rounded-full shrink-0">
                            <CheckCircle size={14} />
                        </div>
                        <span className="text-sm font-medium text-foreground/90 leading-relaxed">{tip}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
