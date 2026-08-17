import { z } from "zod";
import { checkAllowance } from "@/lib/allowance";

const schema = z.object({
  remainingCents: z.number().int().nonnegative(),
  cartTotalCents: z.number().int().nonnegative(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid cart totals" }, { status: 400 });
  const result = checkAllowance(parsed.data.remainingCents, parsed.data.cartTotalCents);
  return Response.json(result, { status: result.allowed ? 200 : 422 });
}
