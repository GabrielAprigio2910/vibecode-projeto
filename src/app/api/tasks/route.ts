import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const userId = Number(
    searchParams.get("userId")
  );

  const tasks = await prisma.task.findMany({
    where: {
      userId,
    },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const body = await req.json();

  const task = await prisma.task.create({
    data: {
      title: body.title,
      status: body.status,
      userId: body.userId,
    },
  });

  return NextResponse.json(task);
}