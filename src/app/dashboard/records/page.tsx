"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, User, Calendar, Stethoscope } from "lucide-react"

interface MedicalRecord {
  id: string
  diagnosis: string
  prescription: string | null
  notes: string | null
  createdAt: string
  patient: { name: string; cpf: string }
  doctor: { name: string; specialty: string | null }
  appointment: { date: string; time: string } | null
}

interface Patient {
  id: string
  name: string
}

interface Doctor {
  id: string
  name: string
}

interface Appointment {
  id: string
  date: string
  time: string
}

export default function RecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState("")
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    appointmentId: "",
    diagnosis: "",
    prescription: "",
    notes: "",
  })

  useEffect(() => {
    fetchRecords()
    fetchPatients()
    fetchDoctors()
  }, [])

  useEffect(() => {
    if (formData.patientId) {
      fetchAppointments(formData.patientId)
    }
  }, [formData.patientId])

  const fetchRecords = async () => {
    try {
      const response = await fetch("/api/medical-records")
      const data = await response.json()
      setRecords(data)
    } catch (error) {
      console.error("Erro ao buscar prontuários:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/patients?limit=100")
      const data = await response.json()
      setPatients(data.patients)
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/auth/register")
      const data = await response.json()
      setDoctors(data.filter((u: Doctor & { role?: string }) => u.role === "DOCTOR"))
    } catch (error) {
      console.error("Erro ao buscar médicos:", error)
    }
  }

  const fetchAppointments = async (patientId: string) => {
    try {
      const response = await fetch(`/api/appointments?patientId=${patientId}&status=SCHEDULED`)
      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/medical-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          patientId: "",
          doctorId: "",
          appointmentId: "",
          diagnosis: "",
          prescription: "",
          notes: "",
        })
        fetchRecords()
      }
    } catch (error) {
      console.error("Erro ao criar prontuário:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prontuário Eletrônico</h1>
          <p className="text-muted-foreground">
            Registros médicos dos pacientes
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Registro
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Registro Médico</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                required
              >
                <option value="">Selecione o paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                required
              >
                <option value="">Selecione o médico</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
              {appointments.length > 0 && (
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.appointmentId}
                  onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
                >
                  <option value="">Selecione a consulta (opcional)</option>
                  {appointments.map((appointment) => (
                    <option key={appointment.id} value={appointment.id}>
                      {new Date(appointment.date).toLocaleDateString("pt-BR")} - {appointment.time}
                    </option>
                  ))}
                </select>
              )}
              <textarea
                placeholder="Diagnóstico"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-2"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                required
              />
              <textarea
                placeholder="Prescrição médica"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-2"
                value={formData.prescription}
                onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
              />
              <textarea
                placeholder="Observações adicionais"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit">Salvar Registro</Button>
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
            Carregando prontuários...
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum registro encontrado
          </div>
        ) : (
          records.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">{record.patient.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        CPF: {record.patient.cpf}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(record.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-3 w-3" />
                      {record.doctor.name}
                      {record.doctor.specialty && ` - ${record.doctor.specialty}`}
                    </span>
                    {record.appointment && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(record.appointment.date).toLocaleDateString("pt-BR")} - {record.appointment.time}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium">Diagnóstico:</p>
                    <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                  </div>
                  {record.prescription && (
                    <div>
                      <p className="text-sm font-medium">Prescrição:</p>
                      <p className="text-sm text-muted-foreground">{record.prescription}</p>
                    </div>
                  )}
                  {record.notes && (
                    <div>
                      <p className="text-sm font-medium">Observações:</p>
                      <p className="text-sm text-muted-foreground">{record.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}