export default function Title({ titel, disc, children }) {
  return (
    <div className="flex w-full items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-primary">{titel}</h1>
        {disc && <p className="mt-1 text-sm text-gray-500">{disc}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
