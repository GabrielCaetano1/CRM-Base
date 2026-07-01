import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialty: true,
        createdAt: true,
        _count: {
          select: { appointments: true, medicalRecords: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Erro ao buscar usuarios:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, role, specialty } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "RECEPTIONIST",
        specialty: specialty || null,
      }
    })

    return NextResponse.json(
      { message: "Usuário criado com sucesso", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erro ao registrar usuário:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}