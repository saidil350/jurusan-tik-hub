import { Key, Projector } from 'lucide-react';

export default function BackgroundParticles() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Enhanced Gradient Background with semantic tokens */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(1200px 600px at 80% 10%, hsl(var(--primary) / 0.18), transparent 60%),\n             radial-gradient(900px 500px at 10% 85%, hsl(var(--accent) / 0.22), transparent 55%)',
        }}
      />

      {/* Animated Particles - Keys */}
      <div className="absolute top-[10%] left-[15%] animate-float-slow opacity-40">
        <Key className="h-10 w-10 text-primary rotate-45" />
      </div>
      <div className="absolute top-[70%] left-[12%] animate-float-delayed opacity-35">
        <Key className="h-7 w-7 text-primary/80 -rotate-12" />
      </div>
      <div className="absolute top-[32%] right-[18%] animate-float opacity-45">
        <Key className="h-12 w-12 text-primary/90 rotate-12" />
      </div>
      <div className="absolute bottom-[18%] right-[14%] animate-float-slow opacity-40">
        <Key className="h-8 w-8 text-primary rotate-90" />
      </div>
      
      {/* Animated Particles - Projectors */}
      <div className="absolute top-[52%] left-[6%] animate-float-delayed opacity-40">
        <Projector className="h-11 w-11 text-accent-foreground/50" />
      </div>
      <div className="absolute top-[14%] right-[12%] animate-float-slow opacity-45">
        <Projector className="h-10 w-10 text-accent-foreground/60 rotate-12" />
      </div>
      <div className="absolute bottom-[32%] left-[26%] animate-float opacity-35">
        <Projector className="h-9 w-9 text-accent-foreground/50 -rotate-6" />
      </div>
      <div className="absolute bottom-[12%] right-[28%] animate-float-delayed opacity-40">
        <Projector className="h-12 w-12 text-accent-foreground/55 rotate-45" />
      </div>

      {/* Soft glow orbs */}
      <div className="absolute top-[22%] left-[42%] w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-[18%] right-[42%] w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slower" />
      
      {/* Grid Pattern with higher visibility */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.06]" />

      {/* Small twinkle particles */}
      <span className="absolute top-[8%] left-[35%] w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse-slow" />
      <span className="absolute top-[28%] left-[8%] w-1 h-1 rounded-full bg-primary/40 animate-pulse-slower" />
      <span className="absolute top-[58%] left-[48%] w-1.5 h-1.5 rounded-full bg-accent-foreground/30 animate-pulse-slow" />
      <span className="absolute top-[76%] left-[22%] w-1 h-1 rounded-full bg-primary/40 animate-pulse-slower" />
      <span className="absolute top-[18%] right-[28%] w-1.5 h-1.5 rounded-full bg-accent-foreground/30 animate-pulse-slow" />
      <span className="absolute bottom-[28%] right-[12%] w-1 h-1 rounded-full bg-primary/40 animate-pulse-slower" />
    </div>
  );
}

