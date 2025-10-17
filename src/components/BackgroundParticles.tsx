import { Key, Projector } from 'lucide-react';

export default function BackgroundParticles() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
      
      {/* Animated Particles - Keys */}
      <div className="absolute top-[10%] left-[15%] animate-float-slow opacity-20">
        <Key className="h-8 w-8 text-primary rotate-45" />
      </div>
      <div className="absolute top-[70%] left-[10%] animate-float-delayed opacity-15">
        <Key className="h-6 w-6 text-primary/60 -rotate-12" />
      </div>
      <div className="absolute top-[30%] right-[20%] animate-float opacity-25">
        <Key className="h-10 w-10 text-primary/70 rotate-12" />
      </div>
      <div className="absolute bottom-[20%] right-[15%] animate-float-slow opacity-20">
        <Key className="h-7 w-7 text-primary rotate-90" />
      </div>
      
      {/* Animated Particles - Projectors */}
      <div className="absolute top-[50%] left-[5%] animate-float-delayed opacity-20">
        <Projector className="h-9 w-9 text-accent-foreground/30" />
      </div>
      <div className="absolute top-[15%] right-[10%] animate-float-slow opacity-25">
        <Projector className="h-8 w-8 text-accent-foreground/40 rotate-12" />
      </div>
      <div className="absolute bottom-[30%] left-[25%] animate-float opacity-15">
        <Projector className="h-7 w-7 text-accent-foreground/30 -rotate-6" />
      </div>
      <div className="absolute bottom-[15%] right-[30%] animate-float-delayed opacity-20">
        <Projector className="h-10 w-10 text-accent-foreground/35 rotate-45" />
      </div>

      {/* Decorative Circles */}
      <div className="absolute top-[20%] left-[40%] w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-[20%] right-[40%] w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse-slower" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
    </div>
  );
}
