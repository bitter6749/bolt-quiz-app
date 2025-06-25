'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { LoginButton } from '@/components/auth/LoginButton'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { GraduationCap, Menu } from 'lucide-react'
import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function Navbar() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const NavLinks = () => (
    <>
      {session && (
        <>
          <Link
            href="/dashboard"
            className="transition-colors hover:text-foreground/80 text-foreground font-medium"
            onClick={() => setIsOpen(false)}
          >
            ダッシュボード
          </Link>
          <Link
            href="/history"
            className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium"
            onClick={() => setIsOpen(false)}
          >
            履歴
          </Link>
          {session.user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium"
              onClick={() => setIsOpen(false)}
            >
              管理者
            </Link>
          )}
        </>
      )}
    </>
  )

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">QuizAI</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLinks />
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <div className="hidden md:block">
            <LoginButton />
          </div>
          
          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>メニュー</SheetTitle>
                  <SheetDescription>
                    ナビゲーションメニュー
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6">
                  <NavLinks />
                  <div className="pt-4 border-t">
                    <LoginButton />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}