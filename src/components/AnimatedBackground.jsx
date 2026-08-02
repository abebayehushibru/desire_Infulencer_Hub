function AnimatedBackground() {
  return (
     <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[var(--color-primary)]/30 blur-3xl animate-blob" />

      <div className="absolute top-20 -right-40 h-[450px] w-[450px] rounded-full bg-[var(--color-secondary)]/25 blur-3xl animate-blob animation-delay-2" />

      <div className="absolute -bottom-40 left-1/2 h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-[var(--color-tertiary)]/25 blur-3xl animate-blob animation-delay-4" />

      <div className="absolute bottom-20 left-20 h-40 w-40 rounded-full bg-[var(--color-tertiary)]/30 blur-2xl animate-float" />

      <div className="absolute top-1/2 right-24 h-32 w-32 rounded-full bg-[var(--color-primary)]/20 blur-2xl animate-float animation-delay-2" />
    </div>
  );
}

export default AnimatedBackground;