import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  doctorId: z.string().min(1, "Médico é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Horário é obrigatório"),
  notes: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get("date")
    const doctorId = searchParams.get("doctorId")
    const patientId = searchParams.get("patientId")
    const status = searchParams.get("status")

    const where: Record<string, unknown> = {}

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      where.date = { gte: startDate, lt: endDate }
    }

    if (doctorId) where.doctorId = doctorId
    if (patientId) where.patientId = patientId
    if (status) where.status = status

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, phone: true } },
        doctor: { select: { id: true, name: true, specialty: true } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }]
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = appointmentSchema.parse(body)

    const appointmentDate = new Date(validatedData.date)

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: validatedData.doctorId,
        date: appointmentDate,
        time: validatedData.time,
        status: { not: "CANCELLED" }
      }
    })

    if (existingAppointment) {
      return NextResponse.json(
        { error: "Horário já ocupado para este médico" },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        ...validatedData,
        date: appointmentDate,
      },
      include: {
        patient: { select: { name: true, phone: true } },
        doctor: { select: { name: true } },
      }
    })

    return NextResponse.json(
      { message: "Agendamento criado com sucesso", appointment },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Erro ao criar agendamento:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}