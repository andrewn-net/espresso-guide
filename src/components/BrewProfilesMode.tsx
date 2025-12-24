import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { BookOpen, Plus, Trash2, Calendar, Gauge, Beaker, Timer, Info, Save, X, LogIn, LogOut, Cloud, CloudOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function BrewProfilesMode() {
    const { brewProfiles, addBrewProfile, removeBrewProfile, user, signOut } = useStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newProfile, setNewProfile] = useState({
        beanName: '',
        roastDate: '',
        grindSetting: '',
        dose: 18,
        expectedYield: 36,
        expectedTime: 27,
        notes: ''
    });

    const handleSignIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) console.error('Auth error:', error.message);
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addBrewProfile(newProfile);
        setIsAdding(false);
        setNewProfile({
            beanName: '',
            roastDate: '',
            grindSetting: '',
            dose: 18,
            expectedYield: 36,
            expectedTime: 27,
            notes: ''
        });
    };

    return (
        <div className="relative w-full min-h-[100dvh] bg-background text-foreground overflow-y-auto pt-16 pb-[140px]">
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at center, hsl(var(--background) / 0.12), hsl(var(--background) / 0.92) 55%, hsl(var(--background)))'
                }}
            />

            <div className="relative z-10 w-full max-w-2xl mx-auto px-4 md:px-6 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-primary" />
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Brew Profiles
                        </h1>
                    </div>
                </div>

                {/* Auth & Sync Status */}
                <div className="bg-secondary/40 backdrop-blur-xl rounded-2xl border border-border/50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${user ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                            {user ? <Cloud size={20} /> : <CloudOff size={20} />}
                        </div>
                        <div>
                            <p className="text-sm font-bold">{user ? 'Cloud Sync Active' : 'Local Only'}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                {user ? `Signed in as ${user.email}` : 'Sign in to save across devices'}
                            </p>
                        </div>
                    </div>
                    {user ? (
                        <button
                            onClick={signOut}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-xl text-xs font-bold transition-all"
                        >
                            <LogOut size={14} />
                            Sign Out
                        </button>
                    ) : (
                        <button
                            onClick={handleSignIn}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-all"
                        >
                            <LogIn size={14} />
                            Sign In
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">My Beans</h2>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-xs font-bold"
                    >
                        {isAdding ? <X size={14} /> : <Plus size={14} />}
                        {isAdding ? 'Cancel' : 'Add New Bean'}
                    </button>
                </div>

                {/* Add Profile Form */}
                {isAdding && (
                    <form onSubmit={handleAdd} className="bg-secondary/40 backdrop-blur-xl rounded-2xl border border-border/50 p-5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Bean Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. St. Ali House Blend"
                                    value={newProfile.beanName}
                                    onChange={e => setNewProfile({ ...newProfile, beanName: e.target.value })}
                                    className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Roast Date</label>
                                <input
                                    type="date"
                                    value={newProfile.roastDate}
                                    onChange={e => setNewProfile({ ...newProfile, roastDate: e.target.value })}
                                    className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Grind Setting</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. 3.9 on Varia VS3"
                                    value={newProfile.grindSetting}
                                    onChange={e => setNewProfile({ ...newProfile, grindSetting: e.target.value })}
                                    className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dose (g)</label>
                                    <div className="flex items-center gap-3 bg-background/50 border border-border/50 rounded-2xl p-1">
                                        <button
                                            type="button"
                                            onClick={() => setNewProfile({ ...newProfile, dose: Math.max(0, parseFloat((newProfile.dose - 0.1).toFixed(1))) })}
                                            className="w-12 h-12 flex items-center justify-center bg-secondary/50 rounded-xl text-xl font-bold active:scale-90 transition-all"
                                        >
                                            −
                                        </button>
                                        <div className="flex-1 text-center font-black text-lg tabular-nums">{newProfile.dose.toFixed(1)}</div>
                                        <button
                                            type="button"
                                            onClick={() => setNewProfile({ ...newProfile, dose: parseFloat((newProfile.dose + 0.1).toFixed(1)) })}
                                            className="w-12 h-12 flex items-center justify-center bg-secondary/50 rounded-xl text-xl font-bold active:scale-90 transition-all"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Yield (g)</label>
                                    <div className="flex items-center gap-3 bg-background/50 border border-border/50 rounded-2xl p-1">
                                        <button
                                            type="button"
                                            onClick={() => setNewProfile({ ...newProfile, expectedYield: Math.max(0, parseFloat((newProfile.expectedYield - 0.5).toFixed(1))) })}
                                            className="w-12 h-12 flex items-center justify-center bg-secondary/50 rounded-xl text-xl font-bold active:scale-90 transition-all"
                                        >
                                            −
                                        </button>
                                        <div className="flex-1 text-center font-black text-lg tabular-nums">{newProfile.expectedYield.toFixed(1)}</div>
                                        <button
                                            type="button"
                                            onClick={() => setNewProfile({ ...newProfile, expectedYield: parseFloat((newProfile.expectedYield + 0.5).toFixed(1)) })}
                                            className="w-12 h-12 flex items-center justify-center bg-secondary/50 rounded-xl text-xl font-bold active:scale-90 transition-all"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Time (s)</label>
                                    <div className="flex items-center gap-3 bg-background/50 border border-border/50 rounded-2xl p-1">
                                        <button
                                            type="button"
                                            onClick={() => setNewProfile({ ...newProfile, expectedTime: Math.max(0, newProfile.expectedTime - 1) })}
                                            className="w-12 h-12 flex items-center justify-center bg-secondary/50 rounded-xl text-xl font-bold active:scale-90 transition-all"
                                        >
                                            −
                                        </button>
                                        <div className="flex-1 text-center font-black text-lg tabular-nums">{newProfile.expectedTime}</div>
                                        <button
                                            type="button"
                                            onClick={() => setNewProfile({ ...newProfile, expectedTime: newProfile.expectedTime + 1 })}
                                            className="w-12 h-12 flex items-center justify-center bg-secondary/50 rounded-xl text-xl font-bold active:scale-90 transition-all"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Flavor Notes / Feedback</label>
                            <textarea
                                placeholder="Tastes like blueberry and jasmine..."
                                value={newProfile.notes}
                                onChange={e => setNewProfile({ ...newProfile, notes: e.target.value })}
                                className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            Save Profile
                        </button>
                    </form>
                )}

                {/* Profiles List */}
                <div className="space-y-4">
                    {brewProfiles.length === 0 ? (
                        <div className="text-center py-20 bg-secondary/20 border-2 border-dashed border-border/50 rounded-3xl">
                            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">No brew profiles saved yet.</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Add your first bean to start tracking.</p>
                        </div>
                    ) : (
                        brewProfiles.map(profile => (
                            <div key={profile.id} className="group bg-secondary/30 backdrop-blur-md rounded-2xl border border-border/50 p-5 space-y-4 hover:bg-secondary/40 transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-foreground">{profile.beanName}</h3>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            {profile.roastDate && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    Roast: {new Date(profile.roastDate).toLocaleDateString()}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Info size={12} />
                                                Updated: {new Date(profile.lastUpdated).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeBrewProfile(profile.id)}
                                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-background/40 rounded-xl p-3 border border-border/30 hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-muted-foreground mb-1">
                                            <Gauge size={12} className="text-primary" />
                                            Grind
                                        </div>
                                        <div className="text-sm font-bold text-primary truncate">
                                            {profile.grindSetting}
                                        </div>
                                    </div>
                                    <div className="bg-background/40 rounded-xl p-3 border border-border/30 hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-muted-foreground mb-1">
                                            <Beaker size={12} className="text-primary" />
                                            Dose / Yield
                                        </div>
                                        <div className="text-sm font-bold">
                                            {profile.dose}g <span className="text-muted-foreground mx-1">→</span> {profile.expectedYield}g
                                        </div>
                                    </div>
                                    <div className="bg-background/40 rounded-xl p-3 border border-border/30 hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-muted-foreground mb-1">
                                            <Timer size={12} className="text-primary" />
                                            Time
                                        </div>
                                        <div className="text-sm font-bold">
                                            {profile.expectedTime}s
                                        </div>
                                    </div>
                                    <div className="bg-background/40 rounded-xl p-3 border border-border/30 hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-muted-foreground mb-1">
                                            <Beaker size={12} className="text-primary" />
                                            Ratio
                                        </div>
                                        <div className="text-sm font-bold">
                                            1:{(profile.expectedYield / profile.dose).toFixed(1)}
                                        </div>
                                    </div>
                                </div>

                                {profile.notes && (
                                    <div className="text-sm text-foreground/80 italic bg-background/20 rounded-xl p-3 border border-border/10">
                                        "{profile.notes}"
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
