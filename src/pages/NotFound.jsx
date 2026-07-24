import { Link, useNavigate } from "react-router-dom";

const   NotFound=()=> {
  const navegate=useNavigate()
  return (
    <div className="min-h-full flex-1 flex items-center justify-center bg-[var(--color-primary)] text-white py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[var(--color-tertiary)]">
          404
        </h1>

        <h2 className="mt-2 text-lg font-semibold">
          Page Not Found
        </h2>

        <p className="mt-1 text-sm text-gray-300">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <button
         onClick={()=>{navegate(-1)}}
          className="inline-block mt-4 px-6 py-3 rounded-lg bg-[var(--color-tertiary)] text-[var(--color-primary)] font-semibold hover:opacity-90"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

export default NotFound