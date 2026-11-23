"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  RefreshCw,
  Plus,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Table as TableIcon,
  History,
  Download,
  RotateCcw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

interface InitialHolding {
  id: string;
  name: string;
  apiCode: string; // 對應 TWSE / TPEx 官方代號
  initShares: number;
  initAvgPrice: number;
  dailyPrices: Record<string, number>;
}

interface Transaction {
  id: string;
  date: string;
  stockName: string;
  apiCode: string;
  type: "初次購入" | "買入" | "賣出";
  shares: number;
  price: number;
  note: string;
}

// 完整匯入你 Excel 中的 25 檔持股明細與歷史收盤價
const DEFAULT_HOLDINGS: InitialHolding[] = [
  { id: "1", name: "聯電 2303", apiCode: "2303", initShares: 10000, initAvgPrice: 126.2232, dailyPrices: { "2026-11-20": 80.3, "2026-11-23": 88.3 } },
  { id: "2", name: "鴻海 2317", apiCode: "2317", initShares: 60628, initAvgPrice: 101, dailyPrices: { "2026-11-20": 210, "2026-11-23": 206 } },
  { id: "3", name: "佳世達 2352", apiCode: "2352", initShares: 33043, initAvgPrice: 33.86224011137003, dailyPrices: { "2026-11-20": 23.6, "2026-11-23": 23.7 } },
  { id: "4", name: "友達 2409", apiCode: "2409", initShares: 181463, initAvgPrice: 18.60000110215305, dailyPrices: { "2026-11-20": 23.25, "2026-11-23": 24.1 } },
  { id: "5", name: "臺企銀 2834", apiCode: "2834", initShares: 44155, initAvgPrice: 11.89862982674669, dailyPrices: { "2026-11-20": 16.2, "2026-11-23": 16.05 } },
  { id: "6", name: "國泰金 2882", apiCode: "2882", initShares: 567, initAvgPrice: 43.44973544973545, dailyPrices: { "2026-11-20": 96.9, "2026-11-23": 95 } },
  { id: "7", name: "國泰特 2882A", apiCode: "2882A", initShares: 1049, initAvgPrice: 60, dailyPrices: { "2026-11-20": 59.8, "2026-11-23": 59.3 } },
  { id: "8", name: "開發金 2883", apiCode: "2883", initShares: 50500, initAvgPrice: 13.06930693069307, dailyPrices: { "2026-11-20": 29.9, "2026-11-23": 29.6 } },
  { id: "9", name: "元大金 2885", apiCode: "2885", initShares: 39348, initAvgPrice: 21.33462946020128, dailyPrices: { "2026-11-20": 59.3, "2026-11-23": 58.4 } },
  { id: "10", name: "第一金 2892", apiCode: "2892", initShares: 34960, initAvgPrice: 24.6466533180778, dailyPrices: { "2026-11-20": 37.6, "2026-11-23": 37.65 } },
  { id: "11", name: "佰鴻 3031", apiCode: "3031", initShares: 40000, initAvgPrice: 16.5, dailyPrices: { "2026-11-20": 21.65, "2026-11-23": 22.3 } },
  { id: "12", name: "群創 3481", apiCode: "3481", initShares: 220000, initAvgPrice: 14.7, dailyPrices: { "2026-11-20": 29.95, "2026-11-23": 30.25 } },
  { id: "13", name: "富采 3714", apiCode: "3714", initShares: 30000, initAvgPrice: 49.15, dailyPrices: { "2026-11-20": 68.6, "2026-11-23": 68.6 } },
  { id: "14", name: "華興 6164", apiCode: "6164", initShares: 16438, initAvgPrice: 13.31281177758851, dailyPrices: { "2026-11-20": 9.31, "2026-11-23": 9.58 } },
  { id: "15", name: "中信上游 0941", apiCode: "00941", initShares: 100000, initAvgPrice: 15, dailyPrices: { "2026-11-20": 21.86, "2026-11-23": 21.39 } },
  { id: "16", name: "元大台灣 0050", apiCode: "0050", initShares: 26000, initAvgPrice: 50.80769230769231, dailyPrices: { "2026-11-20": 84.45, "2026-11-23": 87 } },
  { id: "17", name: "富邦旗艦50 9802", apiCode: "009802", initShares: 40000, initAvgPrice: 10, dailyPrices: { "2026-11-20": 14.96, "2026-11-23": 15.22 } },
  { id: "18", name: "凱基台灣50 9816", apiCode: "009816", initShares: 10000, initAvgPrice: 11.43, dailyPrices: { "2026-11-20": 12.6, "2026-11-23": 12.88 } },
  { id: "19", name: "統一全球創新 988A", apiCode: "00988A", initShares: 10000, initAvgPrice: 15.6522, dailyPrices: { "2026-11-20": 11.64, "2026-11-23": 11.75 } },
  { id: "20", name: "統一升級50 403A", apiCode: "00403A", initShares: 40000, initAvgPrice: 9.99, dailyPrices: { "2026-11-20": 7.02, "2026-11-23": 7.31 } },
  { id: "21", name: "群益台灣精選高息 0919", apiCode: "00919", initShares: 15000, initAvgPrice: 28.74, dailyPrices: { "2026-11-20": 27.49, "2026-11-23": 27.12 } },
  { id: "22", name: "台積電 2330", apiCode: "2330", initShares: 465, initAvgPrice: 1964.516129032258, dailyPrices: { "2026-11-20": 2000, "2026-11-23": 2030 } },
  { id: "23", name: "復華台灣科技 00929", apiCode: "00929", initShares: 25000, initAvgPrice: 15, dailyPrices: { "2026-11-20": 21.07, "2026-11-23": 21.71 } },
  { id: "24", name: "群益ESG投等債20+ 00937B", apiCode: "00937B", initShares: 20000, initAvgPrice: 15, dailyPrices: { "2026-11-20": 14.17, "2026-11-23": 14.2 } },
  { id: "25", name: "南亞 1303", apiCode: "1303", initShares: 2084, initAvgPrice: 57, dailyPrices: { "2026-11-20": 206, "2026-11-23": 226.5 } },
];

const DEFAULT_DATES = ["2026-11-20", "2026-11-23"];

export default function PortfolioDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "charts">("overview");
  const [holdings, setHoldings] = useState<InitialHolding[]>(DEFAULT_HOLDINGS);
  const [dates, setDates] = useState<string[]>(DEFAULT_DATES);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncMsg, setLastSyncMsg] = useState<string>("");

  // 新增交易表單狀態
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [txStockName, setTxStockName] = useState<string>("聯電 2303");
  const [txApiCode, setTxApiCode] = useState<string>("2303");
  const [txType, setTxType] = useState<"初次購入" | "買入" | "賣出">("買入");
  const [txShares, setTxShares] = useState<string>("");
  const [txPrice, setTxPrice] = useState<string>("");
  const [txNote, setTxNote] = useState<string>("");

  // 讀取瀏覽器儲存的資料
  useEffect(() => {
    const savedHoldings = localStorage.getItem("jc_holdings_v1");
    const savedDates = localStorage.getItem("jc_dates_v1");
    const savedTx = localStorage.getItem("jc_tx_v1");
    if (savedHoldings) setHoldings(JSON.parse(savedHoldings));
    if (savedDates) setDates(JSON.parse(savedDates));
    if (savedTx) setTransactions(JSON.parse(savedTx));
  }, []);

  // 自動儲存至瀏覽器
  useEffect(() => {
    localStorage.setItem("jc_holdings_v1", JSON.stringify(holdings));
    localStorage.setItem("jc_dates_v1", JSON.stringify(dates));
    localStorage.setItem("jc_tx_v1", JSON.stringify(transactions));
  }, [holdings, dates, transactions]);

  // 串接 TWSE & TPEx 抓取最新收盤價
  const syncLatestPrices = async () => {
    setIsSyncing(true);
    setLastSyncMsg("正在向臺灣證交所與櫃買中心抓取最新收盤價...");
    try {
      const res = await fetch("/api/prices");
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const marketDate: string = data.date;
      const priceMap: Record<string, number> = data.prices;
      let updatedCount = 0;

      const updatedHoldings = holdings.map((h) => {
        const latestPrice = priceMap[h.apiCode];
        if (latestPrice && latestPrice > 0) {
          updatedCount++;
          return {
            ...h,
            dailyPrices: {
              ...h.dailyPrices,
              [marketDate]: latestPrice,
            },
          };
        }
        return h;
      });

      setHoldings(updatedHoldings);
      if (!dates.includes(marketDate)) {
        setDates([...dates, marketDate].sort());
      }
      setLastSyncMsg(`同步完成（交易日 ${marketDate}），共更新 ${updatedCount} 檔最新收盤價！`);
    } catch (err: any) {
      setLastSyncMsg(`更新失敗：${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // 依照 Excel 公式計算每檔持股的即時數值
  const computedData = useMemo(() => {
    // 1. 計算每檔股票的即時持股數、加權均價、成本總額、最新收盤價、市值、未實現損益
    const stockRows = holdings.map((h) => {
      const initBuyTx = transactions.filter((t) => t.stockName === h.name && t.type === "初次購入");
      const buyTx = transactions.filter((t) => t.stockName === h.name && t.type === "買入");
      const sellTx = transactions.filter((t) => t.stockName === h.name && t.type === "賣出");

      const baseShares = h.initShares + initBuyTx.reduce((s, t) => s + t.shares, 0);
      const baseCost = h.initShares * h.initAvgPrice + initBuyTx.reduce((s, t) => s + t.shares * t.price, 0);
      const baseAvgPrice = baseShares > 0 ? baseCost / baseShares : 0;

      const addShares = buyTx.reduce((s, t) => s + t.shares, 0);
      const addCost = buyTx.reduce((s, t) => s + t.shares * t.price, 0);
      const soldShares = sellTx.reduce((s, t) => s + t.shares, 0);

      const currentShares = baseShares + addShares - soldShares;
      const currentAvgPrice =
        baseShares + addShares > 0 ? (baseCost + addCost) / (baseShares + addShares) : 0;
      const currentCost = currentShares > 0 ? Math.round(currentShares * currentAvgPrice) : 0;

      // 取得最新一筆非空收盤價 (模擬 Excel LOOKUP 公式)
      const sortedPriceDates = Object.keys(h.dailyPrices).sort();
      const latestDate = sortedPriceDates[sortedPriceDates.length - 1];
      const latestPrice = latestDate ? h.dailyPrices[latestDate] : 0;

      const marketValue = latestPrice > 0 ? Math.round(currentShares * latestPrice) : 0;
      const unrealizedPnL = latestPrice > 0 && currentAvgPrice > 0 ? marketValue - currentCost : 0;
      const roi = currentCost > 0 ? unrealizedPnL / currentCost : 0;

      return {
        ...h,
        baseShares,
        baseAvgPrice,
        currentShares,
        currentAvgPrice,
        currentCost,
        latestPrice,
        marketValue,
        unrealizedPnL,
        roi,
        weight: 0,
      };
    });

    const totalCost = stockRows.reduce((s, r) => s + r.currentCost, 0);
    const totalMarketValue = stockRows.reduce((s, r) => s + r.marketValue, 0);
    const totalUnrealizedPnL = stockRows.reduce((s, r) => s + r.unrealizedPnL, 0);
    const totalRoi = totalCost > 0 ? totalUnrealizedPnL / totalCost : 0;

    stockRows.forEach((r) => {
      r.weight = totalMarketValue > 0 ? r.marketValue / totalMarketValue : 0;
    });

    // 2. 計算交易紀錄手續費、證交稅與已實現損益 (對齊 Excel 公式)
    const computedTx = transactions.map((t) => {
      const amount = Math.round(t.shares * t.price);
      const buyFee = Math.round(amount * 0.001425);
      const sellTax = t.type === "賣出" ? Math.round(amount * 0.003) : 0;
      const totalFee = buyFee + sellTax;

      const targetStock = stockRows.find((r) => r.name === t.stockName);
      const holdAvgPrice = targetStock ? targetStock.currentAvgPrice : 0;
      const realizedPnL =
        t.type === "賣出" ? Math.round((t.price - holdAvgPrice) * t.shares - totalFee) : 0;

      return {
        ...t,
        amount,
        totalFee,
        holdAvgPrice,
        realizedPnL,
      };
    });

    const totalRealizedPnL = computedTx.reduce((s, t) => s + t.realizedPnL, 0);

    // 3. 計算每日總市值與前一日損益變動
    const dailyTotals = dates.map((d, idx) => {
      const dayValue = stockRows.reduce((s, r) => s + r.currentShares * (r.dailyPrices[d] || 0), 0);
      const activeCost = stockRows.reduce((s, r) => (r.dailyPrices[d] > 0 ? s + r.currentCost : s), 0);
      const dayPnL = dayValue - activeCost;
      const prevValue =
        idx > 0
          ? stockRows.reduce((s, r) => s + r.currentShares * (r.dailyPrices[dates[idx - 1]] || 0), 0)
          : 0;
      const prevCost =
        idx > 0
          ? stockRows.reduce((s, r) => (r.dailyPrices[dates[idx - 1]] > 0 ? s + r.currentCost : s), 0)
          : 0;
      const prevPnL = prevValue - prevCost;
      const dailyChange = idx > 0 ? dayPnL - prevPnL : 0;

      return {
        date: d,
        dayValue: Math.round(dayValue),
        dayPnL: Math.round(dayPnL),
        dailyChange: Math.round(dailyChange),
      };
    });

    const latestDailyChange =
      dailyTotals.length > 0 ? dailyTotals[dailyTotals.length - 1].dailyChange : 0;

    return {
      stockRows,
      totalCost,
      totalMarketValue,
      totalUnrealizedPnL,
      totalRoi,
      totalRealizedPnL,
      latestDailyChange,
      computedTx,
      dailyTotals,
    };
  }, [holdings, transactions, dates]);

  // 新增買賣紀錄
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const shares = parseFloat(txShares);
    const price = parseFloat(txPrice);
    if (!txStockName.trim() || isNaN(shares) || shares <= 0 || isNaN(price) || price <= 0) return;

    // 若是「初次購入」且持股表尚無此檔股票，自動新增至持股總覽
    const exists = holdings.some((h) => h.name === txStockName.trim());
    if (!exists) {
      const extractedCode = txApiCode.trim() || txStockName.trim().split(" ").pop() || "";
      setHoldings([
        ...holdings,
        {
          id: Date.now().toString(),
          name: txStockName.trim(),
          apiCode: extractedCode,
          initShares: 0,
          initAvgPrice: 0,
          dailyPrices: {},
        },
      ]);
    }

    const newTx: Transaction = {
      id: Date.now().toString(),
      date: txDate,
      stockName: txStockName.trim(),
      apiCode: txApiCode.trim(),
      type: txType,
      shares,
      price,
      note: txNote.trim(),
    };

    setTransactions([...transactions, newTx]);
    setTxShares("");
    setTxPrice("");
    setTxNote("");
  };

  // 手動修改某一格的收盤價
  const handleManualPriceEdit = (stockId: string, date: string, val: string) => {
    const num = parseFloat(val);
    setHoldings(
      holdings.map((h) => {
        if (h.id !== stockId) return h;
        const nextPrices = { ...h.dailyPrices };
        if (isNaN(num) || num <= 0) {
          delete nextPrices[date];
        } else {
          nextPrices[date] = num;
        }
        return { ...h, dailyPrices: nextPrices };
      })
    );
  };

  // 重置回初始 Excel 資料
  const handleReset = () => {
    if (confirm("確定要重置回原始 Excel 的 25 檔持股資料嗎？")) {
      setHoldings(DEFAULT_HOLDINGS);
      setDates(DEFAULT_DATES);
      setTransactions([]);
      localStorage.removeItem("jc_holdings_v1");
      localStorage.removeItem("jc_dates_v1");
      localStorage.removeItem("jc_tx_v1");
    }
  };

  const fmtNum = (n: number) => Math.round(n).toLocaleString("zh-TW");
  const fmtPrice = (n: number) => (n ? n.toLocaleString("zh-TW", { maximumFractionDigits: 2 }) : "-");
  const fmtPct = (n: number) => `${(n * 100).toFixed(2)}%`;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* 頂部導覽列 */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              JC 台股投資組合 — 每日收盤與持股連動追蹤表
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              串接臺灣證交所 (TWSE) 與櫃買中心 (TPEx) 每日收盤行情 • 自動計算加權成本與稅費損益
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={syncLatestPrices}
              disabled={isSyncing}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "同步報價中..." : "一鍵更新台股最新收盤價"}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-xs transition"
              title="還原回 Excel 原始狀態"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重置預設值
            </button>
          </div>
        </div>
        {lastSyncMsg && (
          <div className="bg-slate-800 border-t border-slate-700 px-4 py-1.5 text-center text-xs text-emerald-300">
            {lastSyncMsg}
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-6 space-y-6">
        {/* 6 張 KPI 總覽卡片 (對齊 Excel 第 4~5 列) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">目前總投入成本 (NTD)</div>
            <div className="text-lg font-bold text-slate-900 mt-1">{fmtNum(computedData.totalCost)}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">最新總市值 (NTD)</div>
            <div className="text-lg font-bold text-blue-700 mt-1">{fmtNum(computedData.totalMarketValue)}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">帳面未實現損益 (NTD)</div>
            <div
              className={`text-lg font-bold mt-1 flex items-center gap-1 ${
                computedData.totalUnrealizedPnL >= 0 ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {computedData.totalUnrealizedPnL >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {computedData.totalUnrealizedPnL >= 0 ? "+" : ""}
              {fmtNum(computedData.totalUnrealizedPnL)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">整體報酬率 (%)</div>
            <div
              className={`text-lg font-bold mt-1 ${
                computedData.totalRoi >= 0 ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {computedData.totalRoi >= 0 ? "+" : ""}
              {fmtPct(computedData.totalRoi)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">最近一日損益變動</div>
            <div
              className={`text-lg font-bold mt-1 ${
                computedData.latestDailyChange >= 0 ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {computedData.latestDailyChange >= 0 ? "+" : ""}
              {fmtNum(computedData.latestDailyChange)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">累計已實現損益 (NTD)</div>
            <div
              className={`text-lg font-bold mt-1 ${
                computedData.totalRealizedPnL >= 0 ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {computedData.totalRealizedPnL >= 0 ? "+" : ""}
              {fmtNum(computedData.totalRealizedPnL)}
            </div>
          </div>
        </div>

        {/* 分頁切換標籤 (對應 Excel 3 個主要工作表) */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <TableIcon className="w-4 h-4" />
            每日持股損益總覽 ({computedData.stockRows.length})
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === "transactions"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <History className="w-4 h-4" />
            買賣交易紀錄 ({computedData.computedTx.length})
          </button>
          <button
            onClick={() => setActiveTab("charts")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === "charts"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            視覺化分析圖表
          </button>
        </div>

        {/* 分頁 1：每日持股損益總覽 */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-800 text-white text-xs uppercase">
                  <tr>
                    <th className="py-3 px-3 sticky left-0 bg-slate-800 z-10 whitespace-nowrap">股票名稱</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">目前持股數</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">目前均價</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">目前成本總額</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap bg-slate-700">最新收盤價</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">最新總市值</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">未實現損益</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">報酬率 (%)</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">持股佔比</th>
                    {dates.map((d) => (
                      <th key={d} className="py-3 px-3 text-right whitespace-nowrap bg-slate-700/80">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {computedData.stockRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 sticky left-0 bg-white z-10 whitespace-nowrap border-r border-slate-100">
                        {row.name}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">{fmtNum(row.currentShares)}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{fmtPrice(row.currentAvgPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{fmtNum(row.currentCost)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700 bg-blue-50/40">
                        {fmtPrice(row.latestPrice)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">{fmtNum(row.marketValue)}</td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-semibold ${
                          row.unrealizedPnL >= 0 ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {row.unrealizedPnL >= 0 ? "+" : ""}
                        {fmtNum(row.unrealizedPnL)}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono ${
                          row.roi >= 0 ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {row.roi >= 0 ? "+" : ""}
                        {fmtPct(row.roi)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">{fmtPct(row.weight)}</td>
                      {dates.map((d) => (
                        <td key={d} className="py-1.5 px-2 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={row.dailyPrices[d] ?? ""}
                            onChange={(e) => handleManualPriceEdit(row.id, d, e.target.value)}
                            className="w-20 text-right font-mono text-xs border border-slate-200 rounded px-1.5 py-1 focus:outline-none focus:border-blue-500"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td className="py-3 px-3 sticky left-0 bg-slate-100 z-10">總計 / 每日總市值</td>
                    <td className="py-3 px-3"></td>
                    <td className="py-3 px-3"></td>
                    <td className="py-3 px-3 text-right font-mono">{fmtNum(computedData.totalCost)}</td>
                    <td className="py-3 px-3"></td>
                    <td className="py-3 px-3 text-right font-mono text-blue-700">{fmtNum(computedData.totalMarketValue)}</td>
                    <td
                      className={`py-3 px-3 text-right font-mono ${
                        computedData.totalUnrealizedPnL >= 0 ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {computedData.totalUnrealizedPnL >= 0 ? "+" : ""}
                      {fmtNum(computedData.totalUnrealizedPnL)}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono ${
                        computedData.totalRoi >= 0 ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {computedData.totalRoi >= 0 ? "+" : ""}
                      {fmtPct(computedData.totalRoi)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">100.00%</td>
                    {computedData.dailyTotals.map((dt) => (
                      <td key={dt.date} className="py-3 px-3 text-right font-mono text-xs">
                        {fmtNum(dt.dayValue)}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 分頁 2：買賣交易紀錄 */}
        {activeTab === "transactions" && (
          <div className="space-y-6">
            <form
              onSubmit={handleAddTransaction}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-7 gap-3 items-end"
            >
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">交易日期</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">買賣別</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-sm bg-white"
                >
                  <option value="買入">買入 (加碼)</option>
                  <option value="賣出">賣出 (減碼)</option>
                  <option value="初次購入">初次購入 (新股)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">股票名稱與代號</label>
                {txType === "初次購入" ? (
                  <input
                    type="text"
                    placeholder="例如：緯創 3231"
                    value={txStockName}
                    onChange={(e) => setTxStockName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-sm"
                    required
                  />
                ) : (
                  <select
                    value={txStockName}
                    onChange={(e) => {
                      setTxStockName(e.target.value);
                      const found = holdings.find((h) => h.name === e.target.value);
                      if (found) setTxApiCode(found.apiCode);
                    }}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-sm bg-white"
                  >
                    {holdings.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {txType === "初次購入" && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">證交所官方代號</label>
                  <input
                    type="text"
                    placeholder="如 3231 或 00919"
                    value={txApiCode}
                    onChange={(e) => setTxApiCode(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-sm"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">成交股數</label>
                <input
                  type="number"
                  placeholder="1000"
                  value={txShares}
                  onChange={(e) => setTxShares(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">成交單價</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="105.5"
                  value={txPrice}
                  onChange={(e) => setTxPrice(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium transition"
                >
                  <Plus className="w-4 h-4" />
                  新增交易
                </button>
              </div>
            </form>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-800 text-white text-xs">
                  <tr>
                    <th className="py-3 px-4">交易日期</th>
                    <th className="py-3 px-4">股票名稱</th>
                    <th className="py-3 px-4">買賣別</th>
                    <th className="py-3 px-4 text-right">成交股數</th>
                    <th className="py-3 px-4 text-right">成交單價</th>
                    <th className="py-3 px-4 text-right">成交金額</th>
                    <th className="py-3 px-4 text-right">交易費用(估算)</th>
                    <th className="py-3 px-4 text-right">當時持有均價</th>
                    <th className="py-3 px-4 text-right">已實現損益</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {computedData.computedTx.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        尚無買賣交易紀錄，請由上方表單新增「初次購入」、「買入」或「賣出」。
                      </td>
                    </tr>
                  ) : (
                    computedData.computedTx.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono">{t.date}</td>
                        <td className="py-2.5 px-4 font-semibold">{t.stockName}</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              t.type === "賣出"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono">{fmtNum(t.shares)}</td>
                        <td className="py-2.5 px-4 text-right font-mono">{fmtPrice(t.price)}</td>
                        <td className="py-2.5 px-4 text-right font-mono">{fmtNum(t.amount)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-500">{fmtNum(t.totalFee)}</td>
                        <td className="py-2.5 px-4 text-right font-mono">{fmtPrice(t.holdAvgPrice)}</td>
                        <td
                          className={`py-2.5 px-4 text-right font-mono font-semibold ${
                            t.realizedPnL >= 0 ? "text-red-600" : "text-emerald-600"
                          }`}
                        >
                          {t.type === "賣出" ? `${t.realizedPnL >= 0 ? "+" : ""}${fmtNum(t.realizedPnL)}` : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 分頁 3：視覺化分析圖表 (對齊 Excel 第三頁兩張長條圖) */}
        {activeTab === "charts" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-800 mb-4">
                各檔持股：目前成本總額 vs. 最新總市值 (NTD)
              </h2>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={computedData.stockRows}
                    margin={{ top: 10, right: 20, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}萬`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(val: number) => `${fmtNum(val)} 元`} />
                    <Legend verticalAlign="top" />
                    <Bar dataKey="currentCost" name="目前成本總額" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="marketValue" name="最新總市值" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-800 mb-4">
                各檔持股帳面未實現損益 (NTD)
              </h2>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={computedData.stockRows}
                    margin={{ top: 10, right: 20, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}萬`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(val: number) => `${fmtNum(val)} 元`} />
                    <ReferenceLine y={0} stroke="#475569" />
                    <Bar dataKey="unrealizedPnL" name="未實現損益" radius={[4, 4, 0, 0]}>
                      {computedData.stockRows.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.unrealizedPnL >= 0 ? "#dc2626" : "#059669"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}