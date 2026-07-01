"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  Calendar,
  FileText,
  CreditCard,
  UserCog,
  BarChart3,
  LayoutDashboard,
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Pacientes",
    href: "/dashboard/patients",
    icon: Users,
  },
  {
    title: "Agendamentos",
    href: "/dashboard/appointments",
    icon: Calendar,
  },
  {
    title: "Prontuário",
    href: "/dashboard/records",
    icon: FileText,
  },
  {
    title: "Financeiro",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Equipe",
    href: "/dashboard/team",
    icon: UserCog,
  },
  {
    title: "Relatórios",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-primary">Clínica CRM</h1>
        <p className="text-sm text-muted-foreground">Sistema de Gestão</p>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}