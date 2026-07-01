"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, UserCog, Mail, Shield } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  specialty: string | null
  createdAt: string
  _count: {
    appointments: number
    medicalRecords: number
  }
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "RECEPTIONIST",
    specialty: "",
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/auth/register")
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error("Erro ao buscar equipe:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "RECEPTIONIST",
          specialty: "",
        })
        fetchMembers()
      }
    } catch (error) {
      console.error("Erro ao criar membro:", error)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrador"
      case "DOCTOR":
        return "Médico"
      case "RECEPTIONIST":
        return "Recepcionista"
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "text-purple-600 bg-purple-50"
      case "DOCTOR":
        return "text-blue-600 bg-blue-50"
      case "RECEPTIONIST":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie médicos, recepcionistas e administradores
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Membro
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Membro da Equipe</CardTitle>
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
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                placeholder="Senha"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                <option value="RECEPTIONIST">Recepcionista</option>
                <option value="DOCTOR">Médico</option>
                <option value="ADMIN">Administrador</option>
              </select>
              {formData.role === "DOCTOR" && (
                <Input
                  placeholder="Especialidade"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                />
              )}
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit">Criar Membro</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Carregando equipe...
          </div>
        ) : members.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Nenhum membro encontrado
          </div>
        ) : (
          members.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-medium">{member.name}</h3>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getRoleColor(member.role)}`}>
                      {getRoleLabel(member.role)}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </p>
                    {member.specialty && (
                      <p className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {member.specialty}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {member._count.appointments} agendamentos | {member._count.medicalRecords} prontuários
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