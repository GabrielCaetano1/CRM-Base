"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash2, Phone, Mail } from "lucide-react"

interface Patient {
  id: string
  name: string
  cpf: string
  phone: string
  email: string | null
  birthDate: string | null
  gender: string | null
  _count: {
    appointments: number
    invoices: number
  }
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    birthDate: "",
    gender: "",
    address: "",
    medicalHistory: "",
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await fetch(`/api/patients?search=${search}`)
      const data = await response.json()
      setPatients(data.patients)
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          name: "",
          cpf: "",
          phone: "",
          email: "",
          birthDate: "",
          gender: "",
          address: "",
          medicalHistory: "",
        })
        fetchPatients()
      }
    } catch (error) {
      console.error("Erro ao criar paciente:", error)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    fetchPatients()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie os cadastros de pacientes
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nome, CPF ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                placeholder="CPF"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                required
              />
              <Input
                placeholder="Telefone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <Input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                placeholder="Data de nascimento"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="">Selecione o gênero</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="O">Outro</option>
              </select>
              <Input
                placeholder="Endereço"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="md:col-span-2"
              />
              <textarea
                placeholder="Histórico médico"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-2"
                value={formData.medicalHistory}
                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              />
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit">Salvar</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando pacientes...
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum paciente encontrado
          </div>
        ) : (
          patients.map((patient) => (
            <Card key={patient.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      CPF: {patient.cpf}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </span>
                      {patient.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {patient.email}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {patient._count.appointments} agendamentos | {patient._count.invoices} faturas
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}