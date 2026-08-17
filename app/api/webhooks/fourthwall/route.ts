import { createHmac, timingSafeEqual } from "node:crypto";
import { incrementExcelUsedBudget } from "@/lib/excel-writeback";

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-fourthwall-hmac-sha256") || "";
  const secret = process.env.FOURTHWALL_WEBHOOK_SECRET || "";
  const expected = createHmac("sha256", secret).update(raw).digest("base64");
  const valid = secret && signature && Buffer.byteLength(signature) === Buffer.byteLength(expected) && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return Response.json({ error: "Invalid signature" }, { status: 401 });
  const event = JSON.parse(raw) as { id?: string; type?: string; data?: { id?: string; metadata?: Record<string, string>; amounts?: { subtotal?: { value?: number } } } };
  if (!event.id) return Response.json({ error: "Missing event id" }, { status: 400 });
  if (event.type === "ORDER_PLACED" && event.data?.metadata?.employee_id && event.data.id) {
    const amountCents = Math.round((event.data.amounts?.subtotal?.value || 0) * 100);
    await incrementExcelUsedBudget({ employeeId: event.data.metadata.employee_id, amountCents, orderId: event.data.id });
  }
  return Response.json({ received: true, eventId: event.id, type: event.type });
}
