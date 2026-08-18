import { z } from "zod";
import { getPrisma } from "@/lib/prisma";

const lookupSchema = z.object({
  employeeId: z.string().trim().min(1),
  companyEmail: z.string().trim().email(),
});

export async function POST(request: Request) {
  try {
    const parsed = lookupSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Enter a valid employee ID and company email." }, { status: 400 });

    const employee = await getPrisma().employee.findFirst({
      where: { employeeId: parsed.data.employeeId, email: parsed.data.companyEmail.toLowerCase() },
      include: { allowances: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (!employee || employee.employmentStatus !== "ACTIVE") {
      return Response.json({ error: "We could not verify an active employee with those details." }, { status: 401 });
    }

    const allowance = employee.allowances[0];
    const remainingCents = Math.max(0, (allowance?.amountCents ?? 0) - (allowance?.usedCents ?? 0));
    return Response.json({
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      position: employee.position,
      level: employee.level,
      allowanceCents: allowance?.amountCents ?? 0,
      usedCents: allowance?.usedCents ?? 0,
      remainingCents,
      expiresAt: allowance?.expiresAt ?? null,
    });
  } catch (error) {
    console.error("Employee lookup failed", error);
    return Response.json({ error: "Employee data is not connected yet. Please contact the store administrator." }, { status: 503 });
  }
}
