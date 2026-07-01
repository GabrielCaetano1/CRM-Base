import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const medicalRecordSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  doctorId: z.string().min(1, "Médico é obrigatório"),
  appointmentId: z.string().optional(),
  diagnosis: z.string().min(1, "Diagnóstico é obrigatório"),
  prescription: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get("patientId")
    const doctorId = searchParams.get("doctorId")

    const where: Record<string, unknown> = {}

    if (patientId) where.patientId = patientId
    if (doctorId) where.doctorId = doctorId

    const records = await prisma.medicalRecord.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, cpf: true } },
        doctor: { select: { id: true, name: true, specialty: true } },
        appointment: { select: { id: true, date: true, time: true } },
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error("Erro ao buscar prontuários:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = medicalRecordSchema.parse(body)

    const record = await prisma.medicalRecord.create({
      data: validatedData,
      include: {
        patient: { select: { name: true } },
        doctor: { select: { name: true } },
      }
    })

    if (validatedData.appointmentId) {
      await prisma.appointment.update({
        where: { id: validatedData.appointmentId },
        data: { status: "COMPLETED" }
      })
    }

    return NextResponse.json(
      { message: "Prontuário criado com sucesso", record },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Erro ao criar prontuário:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}