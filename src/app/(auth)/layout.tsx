import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-white px-6 py-4">
        <Link href="/" className="flex items-center w-fit">
          <Image src="/SkilledVisitsAcademyNEW.png" alt="Skilled Visits Academy" width={180} height={48} className="h-10 w-auto" />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
      <footer className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted-foreground)]">
        © {new Date().getFullYear()} Skilled Visits Academy. All rights reserved.
      </footer>
    </div>
  )
}
