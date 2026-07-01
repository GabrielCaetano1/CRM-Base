import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive("Valor deve ser positivo"),
  description: z.string().min(1, "Descrição é obrigatória"),
  category: z.string().optional(),
  invoiceId: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: Record<string, unknown> = {}

    if (type) where.type = type
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        invoice: { select: { id: true, description: true } },
      },
      orderBy: { date: "desc" }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Erro ao buscar transações:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = transactionSchema.parse(body)

    const transaction = await prisma.transaction.create({
      data: validatedData,
      include: {
        invoice: { select: { id: true, description: true } },
      }
    })

    return NextResponse.json(
      { message: "Transação criada com sucesso", transaction },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Erro ao criar transação:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}