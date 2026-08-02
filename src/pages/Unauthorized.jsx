export default function Unauthorized() {
  return (
    <div className="min-h-full my-auto py-12 flex items-center justify-center bg-[var(--color-primary)] text-white">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-[var(--color-tertiary)]">
          403
        </h1>

        <h2 className="mt-4 text-3xl font-semibold">
          Unauthorized
        </h2>

        <p className="mt-2 text-gray-300">
          You don't have permission to access this page.
        </p>

        <a
          href="/"
          className="inline-block mt-6 px-6 py-3 rounded-lg bg-[var(--color-tertiary)] text-[var(--color-primary)] font-semibold"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}