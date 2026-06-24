import pandas as pd
import numpy as np
import uuid
from datetime import datetime, timedelta, timezone
import yfinance as yf
from typing import Dict, List
import DatabaseManager;

class ThemeHeatScoreCalculator:
  """
  id, theme, breakout_score, pullback_score,
  return_1_months, return_3_months, return_6_months,
  stocks_analyzed, created_at, last_updated
  """

  def __init__(self, themes: dict):
    self.themes = themes

  # Fetch stock data
  def getStockData(self, symbol, days=180):
    endDate = datetime.now()
    startDate = endDate - timedelta(days=days+30)
    try:
      df = yf.download(symbol, start=startDate, end=endDate, progress=False)
      if len(df) < 50:
        return None
      return df
    except Exception as e:
      print(f"Error fetching stock data for {symbol}: {e}")
      return None

  # Stock-level metrics
  def calculateStockMetrics(self, df):
    close = df["Close"].squeeze()
    volume = df["Volume"].squeeze()

    current = float(close.iloc[-1])

    def pct(days):
      if len(close) >= days:
        return (current - float(close.iloc[-days])) / float(close.iloc[-days]) * 100
      return 0

    return1 = pct(21)
    return3 = pct(63)
    return6 = pct(126)

    ema10 = close.ewm(span=10).mean().iloc[-1]
    ema20 = close.ewm(span=20).mean().iloc[-1]
    ema50 = close.ewm(span=50).mean().iloc[-1]

    # --- Breakout Structure ---
    prior_run_score = max(0, min(100, return3 * 1.2))

    # 3. Range contraction (tight consolidation)
    high20 = close.rolling(20).max().iloc[-1]
    low20 = close.rolling(20).min().iloc[-1]

    distance_from_high = (
      (high20 - current) / high20
    ) * 100

    near_high_score = max(0, 100 - distance_from_high * 8)

    range_pct = ((high20 - low20) / low20) * 100
    range_score = max(0, 100 - range_pct * 3)

    # 4. Volume contraction (key missing piece you had broken)
    vol10 = volume.tail(10).mean()
    vol50 = volume.tail(50).mean()

    volume_ratio = vol10 / vol50
    breakout_volume_score = max(0, min(100, (1.2 - volume_ratio) * 250))

    # 5. Higher low structure (trend confirmation)
    sma20 = close.rolling(20).mean().iloc[-1]

    higher_low_score = 100 if current > sma20 else 0

    """
    Breakout score is calculated using the following weights:
    30% on Prior Run Up
    25% on near highs
    20% on Volume Dryup
    15% on Range Contraction
    10% on building higher lows
    """
    breakout_score = (
      0.30 * prior_run_score +
      0.25 * near_high_score +
      0.20 * breakout_volume_score +
      0.15 * range_score +
      0.10 * higher_low_score
    )
    breakout_score = max(0, min(100, breakout_score))

    # pullback structure
    run_up_score = max(0, min(100, return3 * 1.5))

    dist_ema20 = (current - ema20) / ema20 * 100

    pullback_depth_score = max(
      0,
      100 - abs(dist_ema20) * 10
    )

    ema_cluster_score = 100 - (
      (abs(current - ema10) / current) * 100 * 0.2 +
      (abs(current - ema20) / current) * 100 * 0.5 +
      (abs(current - ema50) / current) * 100 * 0.3
    ) * 10
    ema_cluster_score = max(0, min(100, ema_cluster_score))

    vol10 = volume.tail(10).mean()
    vol50 = volume.tail(50).mean()

    volume_ratio = vol10 / vol50

    pullback_volume_score = max(
      0,
      min(100, (1.2 - volume_ratio) * 250)
    )

    """
    Pullback score is calculated using the following weights:
    45% on Prior Run Up
    20% on pullback depth
    20% on EMA Cluster
    15% on Volume dryup
    """
    pullback_score = (
      0.45 * run_up_score +
      0.20 * pullback_depth_score +
      0.20 * ema_cluster_score +
      0.15 * pullback_volume_score
    )

    pullback_score = max(0, min(100, pullback_score))

    return {
      "return1": return1,
      "return3": return3,
      "return6": return6,
      "pullback_score": pullback_score,
      "breakout_score": breakout_score
    }

  def calculateThemeScores(self, themeName: str, symbols: List[str]) -> Dict:
    stockMetrics = []
    analyzed = []

    for sym in symbols:
      df = self.getStockData(sym)
      if df is not None:
        metrics = self.calculateStockMetrics(df)
        stockMetrics.append(metrics)
        analyzed.append(sym)

    if not stockMetrics:
      return None

    scores_pb = [m["pullback_score"] for m in stockMetrics]
    scores_bo = [m["breakout_score"] for m in stockMetrics]

    pullback_score = np.mean(scores_pb) * (0.5 + 0.5 * sum(1 for s in scores_pb if s >= 70) / len(scores_pb))
    breakout_score = np.mean(scores_bo) * (0.5 + 0.5 * sum(1 for s in scores_bo if s >= 70) / len(scores_bo))

    # avg returns (display only)
    avg_return1 = float(np.median([m["return1"] for m in stockMetrics]))
    avg_return3 = float(np.median([m["return3"] for m in stockMetrics]))
    avg_return6 = float(np.median([m["return6"] for m in stockMetrics]))

    """
    Hot theme score weights:
    - 10% on 1M→3M acceleration (immediate burst)
    - 10% on 1M→6M acceleration (recent vs long-term baseline)
    - 10% on 3M→6M acceleration (sustained medium-term buildup)
    - 30% on 1-month returns
    - 20% on 3-month returns
    - 20% on 6-month returns (dampened)
    """
    hot_theme_score = max(0, (
      0.10 * np.tanh(max(0, avg_return1 - avg_return3) / 10) * 100 +
      0.10 * np.tanh(max(0, avg_return1 - avg_return6) / 15) * 100 +
      0.10 * np.tanh(max(0, avg_return3 - avg_return6) / 15) * 100 +
      0.30 * np.tanh(avg_return1 / 15) * 100 +
      0.20 * np.tanh(avg_return3 / 30) * 100 +
      0.20 * np.tanh(avg_return6 / 50) * 100
    ))

    return {
      "theme": themeName,

      "hot_theme_score": hot_theme_score,
      "pullback_score": pullback_score,
      "breakout_score": breakout_score,

      "return_1_months": avg_return1,
      "return_3_months": avg_return3,
      "return_6_months": avg_return6,

      "stocks_analyzed": analyzed,
      "created_at": datetime.now(timezone.utc).isoformat(),
    }

  # Ranking output
  def getRankings(self):
    existing_data = DatabaseManager.getFromDB();
    current_scores = {row["theme"]: row for row in existing_data} if existing_data else {};

    results = []
    for name, symbols in self.themes.items():
      print(f"Analyzing {name}...");
      
      existing_score = current_scores.get(name, {});

      score = self.calculateThemeScores(name, symbols);

      if score:
        score["previous_hot_theme_score"] = existing_score.get("hot_theme_score", 0);
        score["previous_pullback_score"] = existing_score.get("pullback_score", 0);
        score["previous_breakout_score"] = existing_score.get("breakout_score", 0);

        results.append(score)

    return results
