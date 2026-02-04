import { ReactNode } from 'react';
import { Camera, ShieldCheck } from 'lucide-react';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-industrial-bg text-industrial-text font-sans antialiased selection:bg-brand-accent/30">

            {/* Header */}
            <header className="border-b border-industrial-border bg-industrial-surface/50 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-tr from-brand-accent to-emerald-400 p-1.5 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Filter<span className="text-brand-accent">Wiz</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-1 bg-industrial-bg px-3 py-1 rounded-full border border-industrial-border/50">
                            <ShieldCheck className="w-3 h-3 text-brand-accent" />
                            <span className="text-[10px] font-medium text-industrial-muted uppercase tracking-wider">Sticker Shield™ Ativo</span>
                        </div>
                        <span className="bg-industrial-surface border border-industrial-border px-2 py-0.5 rounded text-[10px] font-mono text-industrial-muted">
                            PRO
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-6">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-industrial-border py-4 mt-8">
                <div className="text-center text-xs text-industrial-muted">
                    <p>© 2026 FilterWiz PRO. Engine v2.4 (Sticker Shield™ Enabled)</p>
                </div>
            </footer>
        </div>
    );
}
