import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  timeout: 60000,
});

const params = (startDate, endDate) => ({
  ...(startDate && { start_date: startDate }),
  ...(endDate && { end_date: endDate }),
});

export const fetchHealth = () => api.get("/health").then((r) => r.data);

export const fetchKpis = (startDate, endDate) =>
  api.get("/summary/kpis", { params: params(startDate, endDate) }).then((r) => r.data);

export const fetchMonthlySales = (startDate, endDate) =>
  api.get("/summary/monthly-sales", { params: params(startDate, endDate) }).then((r) => r.data);

export const fetchTopProducts = (startDate, endDate, limit = 10) =>
  api.get("/summary/top-products", { params: { ...params(startDate, endDate), limit } }).then((r) => r.data);

export const fetchRfmSegments = (startDate, endDate) =>
  api.get("/customers/rfm-segments", { params: params(startDate, endDate) }).then((r) => r.data);

export const fetchSegmentStats = (startDate, endDate) =>
  api.get("/customers/segment-stats", { params: params(startDate, endDate) }).then((r) => r.data);

export const fetchGeoMap = (startDate, endDate) =>
  api.get("/geographic/map", { params: params(startDate, endDate) }).then((r) => r.data);

export const fetchTopCountries = (startDate, endDate, limit = 10) =>
  api.get("/geographic/top-countries", { params: { ...params(startDate, endDate), limit } }).then((r) => r.data);

export const fetchForecast = (startDate, endDate, periods = 30) =>
  api.get("/forecast/generate", { params: { ...params(startDate, endDate), periods } }).then((r) => r.data);

export const fetchBasketSummary = (startDate, endDate) =>
  api.get("/basket/summary", { params: params(startDate, endDate) }).then((r) => r.data);

export const fetchCohortRetention = (startDate, endDate) =>
  api.get("/cohort/retention", { params: params(startDate, endDate) }).then((r) => r.data);

export const forecastCsvUrl = (startDate, endDate, periods = 30) => {
  const base = import.meta.env.VITE_API_URL || "/api/v1";
  const p = new URLSearchParams({ periods: String(periods) });
  if (startDate) p.set("start_date", startDate);
  if (endDate) p.set("end_date", endDate);
  return `${base}/forecast/export-csv?${p.toString()}`;
};
