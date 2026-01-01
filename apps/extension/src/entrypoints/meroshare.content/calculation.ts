
import {
  getCurrentClientDetails,
  getCurrentPortfolioApi,
  getCurrentTransactions,
  getCurrentWacc,
  setCachedInsights,
} from "../../lib/storage/meroshare-storage";

// ======================= TYPES =======================

export interface TransactionAnalysis {
  scrip: string;
  totalBoughtQty: number;
  totalSoldQty: number;
  buyCount: number;
  sellCount: number;
  netQty: number;
  turnoverRatio: number; // Sold / Bought (0 = Never sold, 1 = Sold everything)
  firstTransactionDate: number | null;
  lastTransactionDate: number | null;
  activityDurationDays: number;
}

export interface HoldingPerformance {
  scrip: string;
  qty: number;
  avgCost: number;
  ltp: number;
  currentValue: number;
  investmentAmount: number;
  absoluteProfit: number; // Unrealized P&L
  percentProfit: number;
  contributionPercent: number; // % of total portfolio value
  weightInPortfolio: number;   // Same as contribution
  isWinner: boolean;
}

export interface PortfolioHealth {
  score: number; // 0-100 score
  status: "Excellent" | "Good" | "Fair" | "Critical";
  diversityScore: number; // 0-100 (100 = perfectly diverse, 0 = 1 stock)
  concentrationRisk: "High" | "Medium" | "Low";
  winLossRatio: number; // Count(Winners) / Count(Losers)
  profitFactor: number; // Total(Gains) / Total(Losses)
}

export interface TraderPersonality {
  type: string; // e.g., "The HODLer", "The Trader", "The Accumulator"
  description: string;
  churnRate: number; // Portfolio turnover rate
  buySellRatio: number; // # Buys / # Sells
}

export interface AdvancedUserInsights {
  // Current Portfolio Breakdown (ACCURATE - from WACC and LTP)
  portfolio: {
    totalValue: number;           // Current market value (qty × LTP)
    totalInvestment: number;      // Cost basis (qty × WACC avgBuyRate)
    totalUnrealizedPL: number;    // Value - Investment (paper gains/losses)
    totalUnrealizedPLPercent: number;
    dayChange: number;            // Change from previous close
    dayChangePercent: number;
    holdings: HoldingPerformance[];
  };

  // Health & Risk Metrics (ACCURATE - based on current holdings)
  health: PortfolioHealth;

  // Trading Activity Stats (ACCURATE - from transaction count)
  trading: {
    totalTransactions: number;
    totalBuyOrders: number;
    totalSellOrders: number;
    firstTradeDate: string;
    lastTradeDate: string;
    activeDays: number;           // Days since first trade
    tradingDays: number;          // Unique days with trades
    avgTradesPerDay: number;
    mostActiveScrip: string;      // Most trades
    mostActiveScripCount: number; // Number of trades for most active
    mostVolatileScrip: string;    // Highest churn
    favoriteScrip: string;        // Most accumulated
  };

  // Behavioral Analysis (ACCURATE - based on trading patterns)
  personality: TraderPersonality;

  // Win Rate for CURRENT holdings only (ACCURATE)
  winRate: {
    holdingsWinRate: number;      // % of current holdings in profit
    winCount: number;             // Current holdings in profit
    lossCount: number;            // Current holdings in loss
  };

  // Current Portfolio Performance (ACCURATE)
  winners: HoldingPerformance[];
  losers: HoldingPerformance[];
  largestHolding: HoldingPerformance | null;
  bestPerformer: HoldingPerformance | null;
  worstPerformer: HoldingPerformance | null;

  // Summary Stats (ACCURATE)
  summary: {
    totalStocksTraded: number;
    currentlyHolding: number;
  };
}

// ======================= HELPERS =======================

function parseNumber(value: string | number): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return parseFloat(String(value).replace(/,/g, ""));
}

function getDiversificationScore(holdings: HoldingPerformance[], totalValue: number): number {
  // Herfindahl-Hirschman Index (HHI)
  // Sum of squares of percentage weights.
  // HHI ranges from close to 0 to 10,000 (if % is 0-100).
  if (totalValue === 0) return 0;

  let sumSquares = 0;
  holdings.forEach(h => {
    const weight = (h.currentValue / totalValue) * 100;
    sumSquares += (weight * weight);
  });

  // HHI:
  // < 1500: Competitive/Diverse
  // 1500-2500: Moderately Concentrated
  // > 2500: Highly Concentrated

  // Normalize to 0-100 scale where 100 is best (most diverse)
  // Max HHI is 10,000 (1 stock). Min is 0 (infinite stocks).
  // Let's invert it:
  const score = Math.max(0, 100 - (sumSquares / 100));
  return parseFloat(score.toFixed(2));
}

function determinePersonality(buyCount: number, sellCount: number, churnRate: number): TraderPersonality {
  const buySellRatio = sellCount > 0 ? buyCount / sellCount : buyCount;

  let type = "The Investor";
  let description = "Balanced approach. Accumulating wealth steadily.";

  if (buyCount > 50 && churnRate > 0.5) {
    type = "Active Trader";
    description = "You trade frequently and aren't afraid to take profits or cut losses.";
  } else if (buySellRatio > 5 && churnRate < 0.2) {
    type = "Diamond Hands";
    description = "You accumulate stocks and rarely sell. A true long-term believer.";
  } else if (buyCount < 10) {
    type = "The Rookie";
    description = "Just getting started! Building the foundation.";
  } else if (buySellRatio < 1.5) {
    type = "Swing Trader";
    description = "You seek balance, buying and selling regularly to capture short-term moves.";
  }

  return {
    type,
    description,
    churnRate: parseFloat(churnRate.toFixed(2)),
    buySellRatio: parseFloat(buySellRatio.toFixed(2))
  };
}

// ======================= MAIN CALCULATION =======================

export async function generateAdvancedInsights(): Promise<AdvancedUserInsights> {
  const [waccItems, portfolioItems, transactions] = await Promise.all([
    getCurrentWacc(),
    getCurrentPortfolioApi(),
    getCurrentTransactions(),
  ]);

  // Create WACC lookup map for O(1) access
  const waccMap = new Map(waccItems.map(w => [w.scrip, w]));

  // --- 1. Process Transaction History (for trading statistics only) ---
  const txnMap = new Map<string, TransactionAnalysis>();
  let totalBuyOrders = 0;
  let totalSellOrders = 0;
  let firstTradeDateVal = Date.now();
  let lastTradeDateVal = 0;
  const uniqueTradingDays = new Set<string>();

  transactions.forEach((txn) => {
    const scrip = txn.Scrip;
    if (!scrip) return;

    // Date tracking
    const dateStr = txn["Transaction Date"];
    const dateVal = new Date(dateStr).getTime();
    if (dateVal < firstTradeDateVal) firstTradeDateVal = dateVal;
    if (dateVal > lastTradeDateVal) lastTradeDateVal = dateVal;
    uniqueTradingDays.add(dateStr);

    // Quantities only (no price estimation - we don't have historical prices)
    const credit = parseNumber(txn["Credit Quantity"]); // Buy
    const debit = parseNumber(txn["Debit Quantity"]);   // Sell

    if (!txnMap.has(scrip)) {
      txnMap.set(scrip, {
        scrip,
        totalBoughtQty: 0,
        totalSoldQty: 0,
        buyCount: 0,
        sellCount: 0,
        netQty: 0,
        turnoverRatio: 0,
        firstTransactionDate: dateVal,
        lastTransactionDate: dateVal,
        activityDurationDays: 0,
      });
    }

    const entry = txnMap.get(scrip)!;

    if (credit > 0) {
      entry.totalBoughtQty += credit;
      entry.buyCount++;
      totalBuyOrders++;
    }

    if (debit > 0) {
      entry.totalSoldQty += debit;
      entry.sellCount++;
      totalSellOrders++;
    }

    entry.firstTransactionDate = Math.min(entry.firstTransactionDate!, dateVal);
    entry.lastTransactionDate = Math.max(entry.lastTransactionDate!, dateVal);
    entry.netQty = entry.totalBoughtQty - entry.totalSoldQty;
    entry.turnoverRatio = entry.totalBoughtQty > 0 ? entry.totalSoldQty / entry.totalBoughtQty : 0;
    entry.activityDurationDays = (entry.lastTransactionDate! - entry.firstTransactionDate!) / (1000 * 60 * 60 * 24);
  });

  const txnValues = Array.from(txnMap.values());
  const mostActive = [...txnValues].sort((a, b) => (b.buyCount + b.sellCount) - (a.buyCount + a.sellCount))[0];
  const mostVolatile = [...txnValues].sort((a, b) => b.turnoverRatio - a.turnoverRatio)[0];
  const mostFav = [...txnValues].sort((a, b) => b.buyCount - a.buyCount)[0];

  // --- 2. Process Current Portfolio (ACCURATE - using WACC and LTP) ---
  // This is the only P&L we can accurately calculate!
  const holdings: HoldingPerformance[] = [];

  let totalInv = 0;
  let totalVal = 0;
  let totalGrossProfit = 0;
  let totalGrossLoss = 0;
  let winnersCount = 0;
  let losersCount = 0;
  let prevDayTotalVal = 0;

  portfolioItems.forEach(item => {
    const scrip = item.script;
    const qty = parseNumber(item.currentBalance);
    const ltp = parseNumber(item.lastTransactionPrice);
    const prevClose = parseNumber(item.previousClosingPrice);

    // Cost Basis from WACC - this is ACCURATE
    const wacc = waccMap.get(scrip);
    const avgCost = wacc ? wacc.averageBuyRate : 0;

    // These calculations are ACCURATE for current holdings
    const investment = qty * avgCost;
    const currentVal = qty * ltp;
    const profit = currentVal - investment;
    const profitPercent = investment > 0 ? (profit / investment) * 100 : 0;

    const isWinner = profit >= 0;

    if (isWinner) {
      winnersCount++;
      totalGrossProfit += profit;
    } else {
      losersCount++;
      totalGrossLoss += Math.abs(profit);
    }

    totalInv += investment;
    totalVal += currentVal;
    prevDayTotalVal += (qty * prevClose);

    holdings.push({
      scrip,
      qty,
      avgCost,
      ltp,
      currentValue: currentVal,
      investmentAmount: investment,
      absoluteProfit: profit,
      percentProfit: profitPercent,
      contributionPercent: 0,
      weightInPortfolio: 0,
      isWinner
    });
  });

  // Second pass for portfolio weights
  holdings.forEach(h => {
    h.contributionPercent = totalVal > 0 ? (h.currentValue / totalVal) * 100 : 0;
    h.weightInPortfolio = h.contributionPercent;
  });

  // --- 3. Compute Portfolio Metrics (ACCURATE) ---
  const winLossRatio = losersCount > 0 ? winnersCount / losersCount : winnersCount;
  const profitFactor = totalGrossLoss > 0 ? totalGrossProfit / totalGrossLoss : totalGrossProfit > 0 ? 100 : 0;

  const diversityScore = getDiversificationScore(holdings, totalVal);
  let concentrationStatus: "High" | "Medium" | "Low" = "Low";
  if (diversityScore < 40) concentrationStatus = "High";
  else if (diversityScore < 75) concentrationStatus = "Medium";

  // Unrealized P&L percentage (ACCURATE for current holdings)
  const overallReturnPercent = totalInv > 0 ? ((totalVal - totalInv) / totalInv) * 100 : 0;
  const dayChange = totalVal - prevDayTotalVal;
  const dayChangePercent = prevDayTotalVal > 0 ? (dayChange / prevDayTotalVal) * 100 : 0;

  // Health Score (based on current holdings performance)
  const returnScore = Math.min(100, Math.max(0, overallReturnPercent + 20));
  const wrScore = (winnersCount / (holdings.length || 1)) * 100;
  const pfScore = Math.min(100, profitFactor * 20);

  const healthScore = Math.round(
    (returnScore * 0.4) +
    (diversityScore * 0.2) +
    (wrScore * 0.2) +
    (pfScore * 0.2)
  );

  let healthStatus: PortfolioHealth["status"] = "Fair";
  if (healthScore >= 80) healthStatus = "Excellent";
  else if (healthScore >= 60) healthStatus = "Good";
  else if (healthScore < 40) healthStatus = "Critical";

  // Personality (based on trading pattern - ACCURATE)
  const personality = determinePersonality(
    totalBuyOrders,
    totalSellOrders,
    totalBuyOrders > 0 ? totalSellOrders / totalBuyOrders : 0
  );

  // Trading metrics (ACCURATE - just counting)
  const tradingDays = uniqueTradingDays.size;
  const activeDays = Math.ceil((Date.now() - firstTradeDateVal) / (1000 * 60 * 60 * 24));
  const avgTradesPerDay = tradingDays > 0 ? transactions.length / tradingDays : 0;

  // Win rate for CURRENT holdings only (ACCURATE)
  const holdingsWinRate = holdings.length > 0 ? (winnersCount / holdings.length) * 100 : 0;
  const totalStocksTraded = txnMap.size;
  const currentlyHolding = holdings.length;

  // Sorting
  const sortedByPerf = [...holdings].sort((a, b) => b.percentProfit - a.percentProfit);
  const sortedByVal = [...holdings].sort((a, b) => b.currentValue - a.currentValue);

  // Determine best and worst performers with edge case handling
  // If only 1 stock: show as best if profitable, worst if losing (not both!)
  // If 2+ stocks: best is highest %, worst is lowest %
  let bestPerformer: HoldingPerformance | null = null;
  let worstPerformer: HoldingPerformance | null = null;

  if (sortedByPerf.length === 1) {
    // Single stock edge case: only categorize as best OR worst, never both
    const onlyHolding = sortedByPerf[0];
    if (onlyHolding.isWinner) {
      bestPerformer = onlyHolding;
      worstPerformer = null;
    } else {
      bestPerformer = null;
      worstPerformer = onlyHolding;
    }
  } else if (sortedByPerf.length >= 2) {
    // Multiple stocks: first is best, last is worst
    bestPerformer = sortedByPerf[0];
    worstPerformer = sortedByPerf[sortedByPerf.length - 1];
  }

  const insights: AdvancedUserInsights = {
    portfolio: {
      totalValue: parseFloat(totalVal.toFixed(2)),
      totalInvestment: parseFloat(totalInv.toFixed(2)),
      totalUnrealizedPL: parseFloat((totalVal - totalInv).toFixed(2)),
      totalUnrealizedPLPercent: parseFloat(overallReturnPercent.toFixed(2)),
      dayChange: parseFloat(dayChange.toFixed(2)),
      dayChangePercent: parseFloat(dayChangePercent.toFixed(2)),
      holdings: sortedByPerf,
    },
    health: {
      score: healthScore,
      status: healthStatus,
      diversityScore,
      concentrationRisk: concentrationStatus,
      winLossRatio: parseFloat(winLossRatio.toFixed(2)),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
    },
    trading: {
      totalTransactions: transactions.length,
      totalBuyOrders,
      totalSellOrders,
      firstTradeDate: new Date(firstTradeDateVal).toISOString(),
      lastTradeDate: new Date(lastTradeDateVal).toISOString(),
      activeDays,
      tradingDays,
      avgTradesPerDay: parseFloat(avgTradesPerDay.toFixed(2)),
      mostActiveScrip: mostActive?.scrip || "N/A",
      mostActiveScripCount: mostActive ? (mostActive.buyCount + mostActive.sellCount) : 0,
      mostVolatileScrip: mostVolatile?.scrip || "N/A",
      favoriteScrip: mostFav?.scrip || "N/A",
    },
    personality,
    winRate: {
      holdingsWinRate: parseFloat(holdingsWinRate.toFixed(2)),
      winCount: winnersCount,
      lossCount: losersCount,
    },
    winners: holdings.filter(h => h.isWinner),
    losers: holdings.filter(h => !h.isWinner),
    largestHolding: sortedByVal[0] || null,
    bestPerformer,
    worstPerformer,
    summary: {
      totalStocksTraded,
      currentlyHolding,
    },
  };

  // Cache the insights for current client
  const client = await getCurrentClientDetails();
  if (client) {
    await setCachedInsights(client.demat, insights);
  }

  return insights;
}