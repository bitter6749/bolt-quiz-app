'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { LoginButton } from '@/components/auth/LoginButton'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { GraduationCap, Home, History, Settings, Shield } from 'lucide-react'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <GraduationCap className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">QuizAI</span>
          </Link>
          {session && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/dashboard"
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/history"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                History
              </Link>
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Admin
                </Link>
              )}
            </nav>
          )}
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Mobile menu button could go here */}
          </div>
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            <LoginButton />
          </nav>
        </div>
      </div>
    </nav>
  )
}