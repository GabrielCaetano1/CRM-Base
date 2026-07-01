import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 40) + '...')

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Limpando banco de dados...')
  await prisma.transaction.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.medicalRecord.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.user.deleteMany()

  const adminPass = await bcrypt.hash('admin123', 12)
  const medicoPass = await bcrypt.hash('medico123', 12)
  const recepPass = await bcrypt.hash('recepcionista123', 12)

  console.log('Criando usuarios...')
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Carlos Mendes',
      email: 'admin@clinica.com',
      password: adminPass,
      role: 'ADMIN',
      specialty: 'Diretor Clinico',
    },
  })

  const drJoao = await prisma.user.create({
    data: {
      name: 'Dr. Joao Silva',
      email: 'joao.silva@clinica.com',
      password: medicoPass,
      role: 'DOCTOR',
      specialty: 'Clinico Geral',
    },
  })

  const drAna = await prisma.user.create({
    data: {
      name: 'Dra. Ana Costa',
      email: 'ana.costa@clinica.com',
      password: medicoPass,
      role: 'DOCTOR',
      specialty: 'Pediatria',
    },
  })

  const maria = await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria.santos@clinica.com',
      password: recepPass,
      role: 'RECEPTIONIST',
    },
  })

  const pedro = await prisma.user.create({
    data: {
      name: 'Pedro Oliveira',
      email: 'pedro.oliveira@clinica.com',
      password: recepPass,
      role: 'RECEPTIONIST',
    },
  })

  console.log('Criando pacientes...')
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        name: 'Fernanda Lima',
        cpf: '12345678901',
        phone: '(11) 99876-5432',
        email: 'fernanda.lima@email.com',
        birthDate: new Date('1985-03-15'),
        gender: 'F',
        address: 'Rua das Flores, 123 - Sao Paulo, SP',
        medicalHistory: 'Hipertensao arterial controlada. Alergia a penicilina.',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Roberto Almeida',
        cpf: '23456789012',
        phone: '(11) 98765-4321',
        email: 'roberto.almeida@email.com',
        birthDate: new Date('1972-07-22'),
        gender: 'M',
        address: 'Av. Paulista, 1000 - Sao Paulo, SP',
        medicalHistory: 'Diabetes tipo 2. Uso de Metformina 500mg.',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Mariana Ferreira',
        cpf: '34567890123',
        phone: '(11) 97654-3210',
        email: 'mariana.f@email.com',
        birthDate: new Date('1990-11-08'),
        gender: 'F',
        address: 'Rua Augusta, 500 - Sao Paulo, SP',
        medicalHistory: 'Nenhuma condicao previa relevante.',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Jose Pereira',
        cpf: '45678901234',
        phone: '(11) 96543-2109',
        email: 'jose.pereira@email.com',
        birthDate: new Date('1958-01-30'),
        gender: 'M',
        address: 'Rua da Consolacao, 800 - Sao Paulo, SP',
        medicalHistory: 'Insuficiencia cardiaca. Uso de Losartana e Furosemida.',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Camila Rodrigues',
        cpf: '56789012345',
        phone: '(11) 95432-1098',
        email: 'camila.r@email.com',
        birthDate: new Date('1995-06-12'),
        gender: 'F',
        address: 'Rua Oscar Freire, 300 - Sao Paulo, SP',
        medicalHistory: 'Asma leve. Usa Salbutamol sob demanda.',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Lucas Fernandes',
        cpf: '67890123456',
        phone: '(11) 94321-0987',
        email: 'lucas.f@email.com',
        birthDate: new Date('2000-09-05'),
        gender: 'M',
        address: 'Rua Haddock Lobo, 600 - Sao Paulo, SP',
        medicalHistory: 'Nenhuma condicao previa relevante.',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Patricia Gomes',
        cpf: '78901234567',
        phone: '(11) 93210-9876',
        email: 'patricia.g@email.com',
        birthDate: new Date('1978-12-20'),
        gender: 'F',
        address: 'Rua Bela Cintra, 900 - Sao Paulo, SP',
        medicalHistory: 'Hipotireoidismo. Uso de Levotiroxina 50mcg.',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Ricardo Souza',
        cpf: '89012345678',
        phone: '(11) 92109-8765',
        email: 'ricardo.s@email.com',
        birthDate: new Date('1965-04-18'),
        gender: 'M',
        address: 'Rua da Liberdade, 200 - Sao Paulo, SP',
        medicalHistory: 'Colesterol alto. Uso de Sinvastatina.',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Ana Beatriz',
        cpf: '90123456789',
        phone: '(11) 91098-7654',
        email: 'ana.b@email.com',
        birthDate: new Date('2018-02-14'),
        gender: 'F',
        address: 'Rua Bela Cintra, 450 - Sao Paulo, SP',
        medicalHistory: 'Nenhuma condicao previa relevante.',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Marcos Ribeiro',
        cpf: '01234567890',
        phone: '(11) 90987-6543',
        email: 'marcos.r@email.com',
        birthDate: new Date('1982-08-25'),
        gender: 'M',
        address: 'Av. Brasil, 1500 - Sao Paulo, SP',
        medicalHistory: 'Gastrite. Uso de Omeprazol 20mg.',
      },
    }),
  ])

  console.log('Criando agendamentos...')
  const today = new Date()
  const appointments = []

  const hours = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00']

  for (let i = 0; i < 20; i++) {
    const daysOffset = Math.floor(Math.random() * 14) - 7
    const appointmentDate = new Date(today)
    appointmentDate.setDate(today.getDate() + daysOffset)

    const randomHour = hours[Math.floor(Math.random() * hours.length)]
    const randomStatus = daysOffset < 0 ? 'COMPLETED' : ['SCHEDULED', 'CONFIRMED'][Math.floor(Math.random() * 2)] as 'SCHEDULED' | 'CONFIRMED'
    const randomPatient = patients[Math.floor(Math.random() * patients.length)]
    const randomDoctor = [drJoao, drAna][Math.floor(Math.random() * 2)]

    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        time: randomHour,
        status: randomStatus,
        patientId: randomPatient.id,
        doctorId: randomDoctor.id,
      },
    })
    appointments.push(appointment)
  }

  console.log('Criando prontuarios...')
  const diagnoses = [
    'Resfriado comum. Prescrito repouso e hidratacao.',
    'Hipertensao arterial. Ajuste de medicacao.',
    'Dor lombar aguda. Prescrito anti-inflamatorio.',
    'Check-up de rotina. Exames laboratoriais solicitados.',
    'Gripe viral. Prescrito antitetrmico e repouso.',
    'Avaliacao pediatrica. Crianca dentro do padrao normal.',
    'Retorno para acompanhamento de diabetes.',
    'Consulta de rotina. Sem alteracoes significativas.',
  ]
  const prescriptions = [
    'Dipirona 500mg - 1 comprimido de 6/6h por 5 dias',
    'Losartana 50mg - 1 comprimido ao dia',
    'Ibuprofeno 600mg - 1 comprimido de 8/8h por 7 dias',
    'Paracetamol 750mg - 1 comprimido de 6/6h se dor',
    'Amoxicilina 500mg - 1 comprimido de 8/8h por 10 dias',
    'Omeprazol 20mg - 1 capsula em jejum',
    'Metformina 500mg - 1 comprimido ao dia',
    null,
  ]

  for (let i = 0; i < Math.min(appointments.length, 12); i++) {
    const apt = appointments[i]
    await prisma.medicalRecord.create({
      data: {
        diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
        prescription: prescriptions[Math.floor(Math.random() * prescriptions.length)],
        notes: 'Paciente orientado sobre importancia da medicacao continua.',
        patientId: apt.patientId,
        doctorId: apt.doctorId,
        appointmentId: apt.id,
      },
    })
  }

  console.log('Criando faturas...')
  const descriptions = [
    'Consulta de rotina',
    'Retorno medico',
    'Exames laboratoriais',
    'Consulta pediatrica',
    'Check-up completo',
    'Consulta de emergencia',
    'Retorno de exames',
    'Avaliacao medica',
  ]

  for (let i = 0; i < 15; i++) {
    const randomPatient = patients[Math.floor(Math.random() * patients.length)]
    const dueDate = new Date(today)
    dueDate.setDate(today.getDate() + Math.floor(Math.random() * 30) - 10)

    const status = ['PENDING', 'PAID', 'OVERDUE'][Math.floor(Math.random() * 3)] as 'PENDING' | 'PAID' | 'OVERDUE'

    const invoice = await prisma.invoice.create({
      data: {
        amount: Math.floor(Math.random() * 400) + 100,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        status,
        dueDate,
        patientId: randomPatient.id,
      },
    })

    if (invoice.status === 'PAID') {
      await prisma.transaction.create({
        data: {
          type: 'INCOME',
          amount: invoice.amount,
          description: `Pagamento: ${invoice.description}`,
          category: 'Consultas',
          invoiceId: invoice.id,
        },
      })
    }
  }

  console.log('Criando transacoes...')
  const incomeCategories = ['Consultas', 'Exames', 'Procedimentos']
  const expenseCategories = ['Aluguel', 'Equipamentos', 'Material de escritorio', 'Manutencao', 'Utilidades']

  for (let i = 0; i < 10; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - Math.floor(Math.random() * 30))

    await prisma.transaction.create({
      data: {
        type: 'INCOME',
        amount: Math.floor(Math.random() * 500) + 150,
        description: `Receita de ${incomeCategories[Math.floor(Math.random() * incomeCategories.length)]}`,
        category: incomeCategories[Math.floor(Math.random() * incomeCategories.length)],
        date,
      },
    })
  }

  for (let i = 0; i < 5; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - Math.floor(Math.random() * 30))

    await prisma.transaction.create({
      data: {
        type: 'EXPENSE',
        amount: Math.floor(Math.random() * 2000) + 500,
        description: `Despesa com ${expenseCategories[Math.floor(Math.random() * expenseCategories.length)]}`,
        category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
        date,
      },
    })
  }

  console.log('\nBanco populado com sucesso!')
  console.log(`  - 5 usuarios (1 admin, 2 medicos, 2 recepcionistas)`)
  console.log(`  - ${patients.length} pacientes`)
  console.log(`  - ${appointments.length} agendamentos`)
  console.log(`  - 12 prontuarios`)
  console.log(`  - 15 faturas`)
  console.log(`  - 15 transacoes`)
}

main()
  .catch((e) => {
    console.error('Erro ao popular banco:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })