"use server";

import { OrderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidatePath } from "next/cache";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function setOrderStatus(
  id: string,
  status: OrderStatus
): Promise<ActionResult> {
  await requireAdmin();
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return { ok: true };
}