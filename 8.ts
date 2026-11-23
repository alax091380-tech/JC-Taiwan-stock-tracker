import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const priceMap: Record<string, number> = {};
    let marketDate = new Date().toISOString().split("T")[0];

    // 1. 抓取臺灣證交所 (TWSE) 上市個股與 ETF 收盤價
    const twseRes = await fetch(
      "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL",
      { cache: "no-store" }
    );
    if (twseRes.ok) {
      const twseData = await twseRes.json();
      if (Array.isArray(twseData)) {
        for (const item of twseData) {
          const code = String(item.Code || "").trim();
          const close = parseFloat(String(item.ClosingPrice || "").replace(/,/g, ""));
          if (code && !isNaN(close) && close > 0) {
            priceMap[code] = close;
          }
        }
        if (twseData[0]?.Date) {
          // 民國年轉西元年 (例如 1151123 -> 2026-11-23)
          const rawDate = String(twseData[0].Date);
          if (rawDate.length === 7) {
            const rocYear = parseInt(rawDate.slice(0, 3), 10) + 1911;
            const mm = rawDate.slice(3, 5);
            const dd = rawDate.slice(5, 7);
            marketDate = `${rocYear}-${mm}-${dd}`;
          }
        }
      }
    }

    // 2. 抓取櫃買中心 (TPEx) 上櫃股票與債券 ETF (如 00937B) 收盤價
    const tpexRes = await fetch(
      "https://www.tpex.org.tw/openapi/v1/tpex_mainboard_quotes",
      { cache: "no-store" }
    );
    if (tpexRes.ok) {
      const tpexData = await tpexRes.json();
      if (Array.isArray(tpexData)) {
        for (const item of tpexData) {
          const code = String(item.SecuritiesCompanyCode || "").trim();
          const close = parseFloat(String(item.Close || "").replace(/,/g, ""));
          if (code && !isNaN(close) && close > 0) {
            priceMap[code] = close;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      date: marketDate,
      prices: priceMap,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "抓取台股報價失敗" },
      { status: 500 }
    );
  }
}