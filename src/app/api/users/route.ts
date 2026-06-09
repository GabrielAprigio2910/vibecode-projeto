import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const body = await req.json();

  const user = await prisma.user.create({
    data: {
      email: body.email,
      senha: body.senha,
    },
  });

  return NextResponse.json(user);
}