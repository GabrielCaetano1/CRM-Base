"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, Calendar, CreditCard } from "lucide-react"

interface DashboardData {
  totalPatients: number
  totalDoctors: number
  todayAppointments: number
  pendingInvoices: number
  monthlyIncome: number
  monthlyExpenses: number
}

export default function ReportsPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/reports?type=dashboard")
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando relatórios...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Erro ao carregar dados dos relatórios</p>
      </div>
    )
  }

  const profit = data.monthlyIncome - data.monthlyExpenses

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">
          Análises e indicadores da clínica
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPatients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Médicos Ativos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalDoctors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.todayAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturas Pendentes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingInvoices}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {data.monthlyIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {data.monthlyExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Lucro do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="font-medium">Pacientes Cadastrados</span>
              <span className="text-2xl font-bold">{data.totalPatients}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="font-medium">Médicos na Equipe</span>
              <span className="text-2xl font-bold">{data.totalDoctors}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="font-medium">Consultas Realizadas (Mês)</span>
              <span className="text-2xl font-bold">{data.todayAppointments * 30}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="font-medium">Ticket Médio por Consulta</span>
              <span className="text-2xl font-bold">
                R$ {data.todayAppointments > 0 
                  ? (data.monthlyIncome / (data.todayAppointments * 30 || 1)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                  : "0,00"
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}