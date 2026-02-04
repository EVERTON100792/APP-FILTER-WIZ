import type { ReactNode } from 'react';
import { Camera, ShieldCheck } from 'lucide-react';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-industrial-bg text-industrial-text font-sans antialiased selection:bg-brand-accent/30 selection:text-white">

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 border-b-industrial-border/0">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-brand-accent/50 blur-lg rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-industrial-surface border border-industrial-border p-2 rounded-xl shadow-2xl">
                                <Camera className="w-5 h-5 text-brand-accent" />
                            </div>
                        </div>
                        <h1 className="font-bold text-xl tracking-tight text-white flex items-center gap-1 neon-text">
                            Filter
                            <span className="text-brand-accent">Wiz</span>
                            <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-1.5 py-0.5 rounded ml-1 border border-brand-accent/20">PRO</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-1.5 bg-industrial-surface/50 px-3 py-1.5 rounded-full border border-industrial-border/50 backdrop-blur-md">
                            <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
                            <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Sticker Shield™ v13</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - Added top padding for fixed header */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 pt-24">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-industrial-border py-8 mt-12 bg-industrial-surface/30">
                <div className="text-center">
                    <p className="text-xs text-industrial-muted uppercase tracking-widest mb-2">Engine v2.4 • High Performance</p>
                    <p className="text-[10px] text-gray-600">© 2026 FilterWiz PRO</p>
                </div>
            </footer>
        </div>
    );
}
