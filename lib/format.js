export function formatIDR(n) {
  const v = Math.round(Number(n) || 0);
  return "Rp" + v.toLocaleString("id-ID");
}
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
export function monthKeyOf(dateStr) {
  return (dateStr || "").slice(0, 7);
}
export function currentMonthKey() {
  return todayISO().slice(0, 7);
}
export function daysBetween(a, b) {
  return Math.ceil((new Date(b) - new Date(a)) / 86400000);
}
export function fmtDateShort(d) {
  try {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return d;
  }
}
