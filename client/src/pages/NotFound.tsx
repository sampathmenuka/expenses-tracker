import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-lg shadow-xl border border-[#154734]/15 bg-[#fffdf8]/90 backdrop-blur-md rounded-3xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-[#d6805d]/20 rounded-full animate-pulse" />
            <AlertCircle className="relative h-16 w-16 text-[#d6805d]" />
          </div>
        </div>

        <h1 className="text-4xl font-serif font-bold text-[#154734] mb-2">404</h1>

        <h2 className="text-xl font-serif font-semibold text-[#315542] mb-4">
          Page Not Found
        </h2>

        <p className="text-[#6c756d] mb-8 leading-relaxed text-sm">
          Sorry, the page you are looking for doesn't exist.
          <br />
          It may have been moved or deleted.
        </p>

        <div className="flex justify-center">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 bg-[#154734] hover:bg-[#0f392a] text-[#fffaf0] px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4 mr-1" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
