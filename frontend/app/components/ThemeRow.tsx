'use client';

import {TrendingUp, TrendingDown, Clock, ArrowUp, ArrowDown} from "lucide-react";

type ThemeItem = any;

function RankBadge({ rankChange }: { rankChange : number | null }) {
  if (rankChange === null) return (
    <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider font-bold">
      NEW
    </span>
  );

  if (rankChange == 0) return (
    <span className="text-[10px] text-gray-600 font-mono">—</span>
  );
  if (rankChange > 0) return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      <ArrowUp className="w-2.5 h-2.5" />{rankChange}
    </span>
  );
  if (rankChange < 0) return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">
      <ArrowDown className="w-2.5 h-2.5" />{Math.abs(rankChange)}
    </span>
  )
}

export default function ThemeRow({
  item, 
  index, 
  mode, 
  previousRank
}: {
  item: ThemeItem; 
  index: number; 
  mode: "hot_themes" | "breakouts" | "pullbacks"
  previousRank? : number
}) {
  const score = mode === "hot_themes" ? item.hot_theme_score : mode === "breakouts" ? item.breakout_score : item.pullback_score;
  const isTop = index === 0;
  const showSymbols = 5;
  const remainingSymbols = item.stocks_analyzed.length - showSymbols;
  const rankChange = previousRank !== undefined ? previousRank -index : null;

  const isMarketTheme = (theme : string) => {
    return theme == "Broad Market";
  }

  const getHeatBadge = (score : number) => {
    if (score >= 85) return 'bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
    if (score >= 70) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (score >= 40) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/10 text-red-400 border-red-500/30';
  };

  return (
    <div
      className={`rounded-2xl bg-white/[0.02] border transition-all duration-300 hover:bg-white/[0.04] ${
        isTop
          ? 'border-orange-500/30 shadow-[0_4px_30px_rgba(249,115,22,0.08)]'
          : 'border-white/5 hover:border-white/10'
      }`}
    >

      {/* DESKTOP */}
      <div className="hidden md:grid grid-cols-12 gap-4 items-start px-6 py-4">

        {/* Theme */}
        <div className="col-span-3 flex flex-col">
          <div className="flex items-center gap-3 mb-1.5">
            <span className={`text-sm font-bold w-5 ${isTop ? 'text-orange-400' : 'text-gray-600'}`}>
              {index + 1}
            </span>
            <div className="font-bold text-base text-gray-100 flex items-center gap-2">
              {item.theme}
              
              <RankBadge rankChange={rankChange} />

              {/* HOT LABEL */}
              {isTop && !isMarketTheme(item.theme) && (
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-orange-500/20 text-orange-400 uppercase tracking-widest">
                  Hot
                </span>
              )}

              {/* BENCHMARK LABEL */}
              {isMarketTheme(item.theme) && (
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-500/20 text-blue-400 uppercase tracking-widest border border-blue-500/30">
                  Benchmark
                </span>
              )}
            </div>
          </div>

          {/* DESKTOP SYMBOLS */}
          <div className="flex flex-wrap gap-1 ml-8">
            {item.stocks_analyzed.slice(0, showSymbols).map((symbol : string) => (
              <span key={symbol} className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-white/5 text-gray-400 border border-white/5">
                {symbol}
              </span>
            ))}
            {remainingSymbols > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-mono text-gray-600">+{remainingSymbols}</span>
            )}
          </div>
        </div>
      
        {/* Score */}
        <div className="col-span-2 flex justify-center">
          <div className={`flex items-center justify-center h-10 w-14 rounded-xl border font-bold text-lg font-mono ${getHeatBadge(score)}`}>
            {score.toFixed(1)}
          </div>
        </div>

        {/* 1M */}
        <div className="col-span-2 flex justify-end">
          <div className={`flex items-center gap-1 font-mono font-bold text-base ${item.return_1_months >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {item.return_1_months >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {item.return_1_months > 0 ? '+' : ''}{item.return_1_months.toFixed(1)}%
          </div>
        </div>

        {/* 3M */}
        <div className="col-span-2 flex justify-end">
          <div className={`flex items-center gap-1 font-mono font-bold text-base ${item.return_3_months >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {item.return_3_months >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {item.return_3_months > 0 ? '+' : ''}{item.return_3_months.toFixed(1)}%
          </div>
        </div>

        {/* 6M */}
        <div className="col-span-2 flex justify-end">
          <div className={`flex items-center gap-1 font-mono font-bold text-base ${item.return_6_months >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {item.return_6_months >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {item.return_6_months > 0 ? '+' : ''}{item.return_6_months.toFixed(1)}%
          </div>
        </div>

        {/* Updated */}
        <div className="col-span-1 flex items-center text-[10px] text-gray-500 font-mono">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(item.created_at).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-bold ${isTop ? 'text-orange-400' : 'text-gray-600'}`}>
              #{index + 1}
            </span>

            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-100 text-sm">{item.theme}</span>

              {/* RANK */}
              <RankBadge rankChange={rankChange} />

              {/* HOT LABEL */}
              {isTop && !isMarketTheme(item.theme) && (
                <span className="px-1 py-[1px] rounded text-[8px] bg-orange-500/20 text-orange-400 uppercase tracking-widest">
                  Hot
                </span>
              )}

              {/* BENCHMARK LABEL */}
              {isMarketTheme(item.theme) && (
                <span className="px-1 py-[1px] rounded text-[8px] bg-blue-500/20 text-blue-400 uppercase tracking-widest border border-blue-500/30">
                  Benchmark
                </span>
              )}
            </div>
          </div>


          <div className={`flex items-center justify-center h-9 w-12 rounded-lg border font-bold text-base font-mono ${getHeatBadge(score)}`}>
            {score.toFixed(1)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          {/* 1M */}
          <div className="bg-white/[0.03] rounded-lg p-2">
            <div className="text-[10px] text-gray-500 uppercase mb-1">1M</div>
            <div className={`flex items-center gap-1 font-mono font-bold text-sm ${item.return_1_months >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.return_1_months >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {item.return_1_months > 0 ? '+' : ''}{item.return_1_months.toFixed(1)}%
            </div>
          </div>

          {/* 3M */}
          <div className="bg-white/[0.03] rounded-lg p-2">
            <div className="text-[10px] text-gray-500 uppercase mb-1">3M</div>
            <div className={`flex items-center gap-1 font-mono font-bold text-sm ${item.return_3_months >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.return_3_months >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {item.return_3_months > 0 ? '+' : ''}{item.return_3_months.toFixed(1)}%
            </div>
          </div>

          {/* 6M */}
          <div className="bg-white/[0.03] rounded-lg p-2">
            <div className="text-[10px] text-gray-500 uppercase mb-1">6M</div>
            <div className={`flex items-center gap-1 font-mono font-bold text-sm ${item.return_6_months >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.return_6_months >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {item.return_6_months > 0 ? '+' : ''}{item.return_6_months.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Updated */}
        <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-3">
          <Clock className="w-3 h-3" />
          {new Date(item.created_at).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>

        {/* Symbols */}
        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-white/5">
          {item.stocks_analyzed.slice(0, showSymbols).map((symbol : string) => (
            <span key={symbol} className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-white/5 text-gray-400 border border-white/5">
              {symbol}
            </span>
          ))}
          {remainingSymbols > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono text-gray-600">+{remainingSymbols} more</span>
          )}
        </div>
      </div>
    </div>
  );
}