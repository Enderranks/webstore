import { z } from "zod";
import { getPrisma } from "@/lib/prisma";

const employeeSchema = z.object({
  employeeId: z.string().trim().min(1),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().email(),
  employmentStatus: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED"]).default("ACTIVE"),
  team: z.string().trim().default("Underline Corporate"),
  department: z.string().trim().default("Operations"),
  position: z.string().trim().optional(),
  level: z.string().trim().optional(),
  annualAllowanceCents: z.number().int().nonnegative().default(0),
  allowanceExpiresAt: z.string().datetime().optional(),
  hireDate: z.string().datetime().optional(),
});

const payloadSchema = z.object({ source: z.string().default("excel"), rows: z.array(employeeSchema).min(1).max(5000) });

export async function POST(request: Request) {
  if (!process.env.EXCEL_SYNC_SECRET || request.headers.get("x-excel-sync-secret") !== process.env.EXCEL_SYNC_SECRET) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = payloadSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid employee payload", details: parsed.error.flatten() }, { status: 400 });
  const result = { imported: 0, deactivated: 0 };
  const prisma = getPrisma();
  for (const row of parsed.data.rows) {
    const handle = row.team.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const team = await prisma.team.upsert({ where: { handle }, update: { name: row.team }, create: { name: row.team, handle } });
    const department = await prisma.department.upsert({ where: { name: row.department }, update: {}, create: { name: row.department } });
    const employee = await prisma.employee.upsert({ where: { employeeId: row.employeeId }, update: { firstName: row.firstName, lastName: row.lastName, email: row.email.toLowerCase(), employmentStatus: row.employmentStatus, position: row.position, level: row.level, hireDate: row.hireDate ? new Date(row.hireDate) : undefined }, create: { employeeId: row.employeeId, firstName: row.firstName, lastName: row.lastName, email: row.email.toLowerCase(), employmentStatus: row.employmentStatus, position: row.position, level: row.level, hireDate: row.hireDate ? new Date(row.hireDate) : undefined } });
    await prisma.employeeTeam.upsert({ where: { employeeId_teamId: { employeeId: employee.id, teamId: team.id } }, update: {}, create: { employeeId: employee.id, teamId: team.id } });
    await prisma.employeeDepartment.upsert({ where: { employeeId_departmentId: { employeeId: employee.id, departmentId: department.id } }, update: {}, create: { employeeId: employee.id, departmentId: department.id } });
    const current = await prisma.employeeAllowance.findFirst({ where: { employeeId: employee.id }, orderBy: { createdAt: "desc" } });
    const allowance = { amountCents: row.annualAllowanceCents, expiresAt: row.allowanceExpiresAt ? new Date(row.allowanceExpiresAt) : undefined };
    if (current) await prisma.employeeAllowance.update({ where: { id: current.id }, data: allowance }); else await prisma.employeeAllowance.create({ data: { employeeId: employee.id, ...allowance } });
    result.imported += 1;
    if (row.employmentStatus !== "ACTIVE") result.deactivated += 1;
  }
  return Response.json(result);
}
