import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const invoiceSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  amount: z.number().positive("Valor deve ser positivo"),
  description: z.string().min(1, "Descrição é obrigatória"),
  dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get("patientId")
    const status = searchParams.get("status")

    const where: Record<string, unknown> = {}

    if (patientId) where.patientId = patientId
    if (status) where.status = status

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, phone: true } },
        transactions: true,
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Erro ao buscar faturas:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = invoiceSchema.parse(body)

    const invoice = await prisma.invoice.create({
      data: {
        ...validatedData,
        dueDate: new Date(validatedData.dueDate),
      },
      include: {
        patient: { select: { name: true } },
      }
    })

    return NextResponse.json(
      { message: "Fatura criada com sucesso", invoice },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Erro ao criar fatura:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}