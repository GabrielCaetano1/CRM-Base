"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, CreditCard, TrendingUp, DollarSign } from "lucide-react"

interface Invoice {
  id: string
  amount: number
  description: string
  status: string
  dueDate: string
  paidAt: string | null
  patient: { name: string; phone: string }
}

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  category: string | null
  date: string
}

interface Patient {
  id: string
  name: string
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"invoices" | "transactions">("invoices")
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [invoiceFormData, setInvoiceFormData] = useState({
    patientId: "",
    amount: "",
    description: "",
    dueDate: "",
  })
  const [transactionFormData, setTransactionFormData] = useState({
    type: "INCOME",
    amount: "",
    description: "",
    category: "",
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [invoicesRes, transactionsRes, patientsRes] = await Promise.all([
          fetch("/api/invoices"),
          fetch("/api/transactions"),
          fetch("/api/patients?limit=100"),
        ])

        if (cancelled) return

        const [invoicesData, transactionsData, patientsData] = await Promise.all([
          invoicesRes.json(),
          transactionsRes.json(),
          patientsRes.json(),
        ])

        if (cancelled) return

        setInvoices(invoicesData)
        setTransactions(transactionsData)
        setPatients(patientsData.patients)
      } catch (err) {
        console.error("Erro ao buscar dados financeiros:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => { cancelled = true }
  }, [])

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...invoiceFormData,
          amount: parseFloat(invoiceFormData.amount),
        }),
      })

      if (response.ok) {
        setShowInvoiceForm(false)
        setInvoiceFormData({ patientId: "", amount: "", description: "", dueDate: "" })
        setLoading(true)
      }
    } catch (err) {
      console.error("Erro ao criar fatura:", err)
    }
  }

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...transactionFormData,
          amount: parseFloat(transactionFormData.amount),
        }),
      })

      if (response.ok) {
        setShowTransactionForm(false)
        setTransactionFormData({ type: "INCOME", amount: "", description: "", category: "" })
        setLoading(true)
      }
    } catch (err) {
      console.error("Erro ao criar transacao:", err)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendente"
      case "PAID":
        return "Pago"
      case "OVERDUE":
        return "Atrasado"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "text-green-600 bg-green-50"
      case "OVERDUE":
        return "text-red-600 bg-red-50"
      default:
        return "text-yellow-600 bg-yellow-50"
    }
  }

  const totalPending = invoices
    .filter((inv) => inv.status === "PENDING")
    .reduce((sum, inv) => sum + inv.amount, 0)

  const totalPaid = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">
            Controle de faturas e transacoes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowInvoiceForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Fatura
          </Button>
          <Button onClick={() => setShowTransactionForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transacao
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter((inv) => inv.status === "PENDING").length} pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      {showInvoiceForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Fatura</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvoiceSubmit} className="grid gap-4 md:grid-cols-2">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={invoiceFormData.patientId}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, patientId: e.target.value })}
                required
              >
                <option value="">Selecione o paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                placeholder="Valor (R$)"
                value={invoiceFormData.amount}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, amount: e.target.value })}
                required
              />
              <Input
                placeholder="Descricao"
                value={invoiceFormData.description}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, description: e.target.value })}
                required
              />
              <Input
                type="date"
                placeholder="Data de vencimento"
                value={invoiceFormData.dueDate}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, dueDate: e.target.value })}
                required
              />
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit">Criar Fatura</Button>
                <Button type="button" variant="outline" onClick={() => setShowInvoiceForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showTransactionForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Transacao</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransactionSubmit} className="grid gap-4 md:grid-cols-2">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={transactionFormData.type}
                onChange={(e) => setTransactionFormData({ ...transactionFormData, type: e.target.value })}
                required
              >
                <option value="INCOME">Receita</option>
                <option value="EXPENSE">Despesa</option>
              </select>
              <Input
                type="number"
                placeholder="Valor (R$)"
                value={transactionFormData.amount}
                onChange={(e) => setTransactionFormData({ ...transactionFormData, amount: e.target.value })}
                required
              />
              <Input
                placeholder="Descricao"
                value={transactionFormData.description}
                onChange={(e) => setTransactionFormData({ ...transactionFormData, description: e.target.value })}
                required
              />
              <Input
                placeholder="Categoria (opcional)"
                value={transactionFormData.category}
                onChange={(e) => setTransactionFormData({ ...transactionFormData, category: e.target.value })}
              />
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit">Registrar Transacao</Button>
                <Button type="button" variant="outline" onClick={() => setShowTransactionForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 mb-4">
        <Button
          variant={activeTab === "invoices" ? "default" : "outline"}
          onClick={() => setActiveTab("invoices")}
        >
          Faturas
        </Button>
        <Button
          variant={activeTab === "transactions" ? "default" : "outline"}
          onClick={() => setActiveTab("transactions")}
        >
          Transacoes
        </Button>
      </div>

      {activeTab === "invoices" && (
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando faturas...
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma fatura encontrada
            </div>
          ) : (
            invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{invoice.patient.name}</h3>
                      <p className="text-sm text-muted-foreground">{invoice.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: {new Date(invoice.dueDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        R$ {invoice.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`text-sm px-2 py-1 rounded ${getStatusColor(invoice.status)}`}>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando transacoes...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma transacao encontrada
            </div>
          ) : (
            transactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{transaction.description}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString("pt-BR")}
                      </p>
                      {transaction.category && (
                        <p className="text-xs text-muted-foreground">
                          {transaction.category}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${transaction.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                        {transaction.type === "INCOME" ? "+" : "-"} R$ {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        {transaction.type === "INCOME" ? "Receita" : "Despesa"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}