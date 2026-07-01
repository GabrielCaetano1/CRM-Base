import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const patientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos"),
  phone: z.string().min(10, "Telefone é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  medicalHistory: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { cpf: { contains: search } },
        { phone: { contains: search } },
      ]
    } : {}

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { appointments: true, invoices: true }
          }
        }
      }),
      prisma.patient.count({ where })
    ])

    return NextResponse.json({
      patients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = patientSchema.parse(body)

    const existingPatient = await prisma.patient.findUnique({
      where: { cpf: validatedData.cpf }
    })

    if (existingPatient) {
      return NextResponse.json(
        { error: "CPF já cadastrado" },
        { status: 400 }
      )
    }

    const patient = await prisma.patient.create({
      data: {
        ...validatedData,
        email: validatedData.email || null,
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
      }
    })

    return NextResponse.json(
      { message: "Paciente criado com sucesso", patient },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Erro ao criar paciente:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}