import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "dashboard"

    if (type === "dashboard") {
      const [
        totalPatients,
        totalDoctors,
        todayAppointments,
        pendingInvoices,
        monthlyIncome,
        monthlyExpenses,
      ] = await Promise.all([
        prisma.patient.count(),
        prisma.user.count({ where: { role: "DOCTOR" } }),
        prisma.appointment.count({
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        }),
        prisma.invoice.count({ where: { status: "PENDING" } }),
        prisma.transaction.aggregate({
          where: {
            type: "INCOME",
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          },
          _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
          where: {
            type: "EXPENSE",
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          },
          _sum: { amount: true }
        }),
      ])

      return NextResponse.json({
        totalPatients,
        totalDoctors,
        todayAppointments,
        pendingInvoices,
        monthlyIncome: monthlyIncome._sum.amount || 0,
        monthlyExpenses: monthlyExpenses._sum.amount || 0,
      })
    }

    if (type === "appointments-by-day") {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const appointments = await prisma.appointment.groupBy({
        by: ["date"],
        where: {
          date: { gte: thirtyDaysAgo }
        },
        _count: true,
        orderBy: { date: "asc" }
      })

      return NextResponse.json(appointments)
    }

    if (type === "financial-summary") {
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const transactions = await prisma.transaction.groupBy({
        by: ["type"],
        where: {
          date: { gte: sixMonthsAgo }
        },
        _sum: { amount: true },
        _count: true,
      })

      return NextResponse.json(transactions)
    }

    return NextResponse.json({ error: "Tipo de relatório inválido" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao gerar relatório:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}