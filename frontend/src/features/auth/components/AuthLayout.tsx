import * as React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="relative overflow-hidden rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl dark:bg-black/20 dark:border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
          
          <div className="relative p-8 space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                {title}
              </h1>
              {subtitle && (
                <p className="text-muted-foreground text-sm">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ECHOSPHERE. Secure & Encrypted.</p>
        </div>
      </div>

      {/* Aesthetic Signature */}
      <div className="absolute bottom-6 right-8 text-right hidden md:block animate-in slide-in-from-right-10 duration-700 delay-300">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-1 font-light">
          Designed & Built by
        </p>
        <div className="group cursor-default">
          <h3 className="text-xl font-medium bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105 origin-right">
            Developer
          </h3>
          <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 transition-all duration-500 ease-out ml-auto" />
        </div>
      </div>
    </div>
  );
}
