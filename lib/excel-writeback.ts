export async function incrementExcelUsedBudget(input: {
  employeeId: string;
  amountCents: number;
  orderId: string;
}) {
  const endpoint = process.env.EXCEL_WRITEBACK_URL;
  const secret = process.env.EXCEL_SYNC_SECRET;
  if (!endpoint || !secret) return { skipped: true as const };
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-excel-sync-secret": secret },
    body: JSON.stringify({
      employeeId: input.employeeId,
      incrementUsedBudgetCents: Math.max(0, Math.round(input.amountCents)),
      orderId: input.orderId,
      idempotencyKey: `fourthwall-order:${input.orderId}`,
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Excel write-back failed: ${response.status}`);
  return response.json();
}
