'use client';

import Link from "next/link";
import { Activity } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-gray-200 flex flex-col items-center justify-center p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400 mb-3">
          <Activity className="w-3 h-3 text-emerald-400" />
          Live Market Metrics
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-2">
          Thermal Trend
        </h1>

        <p className="text-gray-400 text-sm md:text-base max-w-md leading-relaxed mb-8">
          This is not financial advice. This is simply to view hot themes that are moving and setups using a custom built scoring algorithm.
        </p>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none">
          <Link
            href="/hot_themes"
            className="px-5 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"          >
            View Hot Themes
          </Link>
          <Link
            href="/breakouts"
            className="px-5 py-2 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors"          >
            View Breakouts
          </Link>
          <Link
            href="/pullbacks"
            className="px-5 py-2 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors"          >
            View Pullbacks
          </Link>
        </div>
      </div>
    </main>
  );
}
