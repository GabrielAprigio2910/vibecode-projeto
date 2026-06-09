import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(
      body.prompt
    );

    return NextResponse.json({
      response: result.response.text(),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        response:
          "Erro ao consultar a IA.",
      },
      {
        status: 500,
      }
    );
  }
}