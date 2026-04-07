import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="flex flex-col items-center gap-4 text-center"
        style={{ animation: 'fadeUp 0.8s ease both' }}
      >
        <Image
          src="/favicon.png"
          alt="vihaan vulpala"
          width={64}
          height={64}
          className="rounded-xl opacity-90"
        />
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-serif tracking-tight text-gray-800">
            you took a wrong turn.
          </h1>
          <p className="text-sm font-sans text-gray-400 italic">
            this page doesn&apos;t exist.
          </p>
        </div>
        <Link href="/" className="text-sm font-sans text-gray-400 underline underline-offset-4">
          take me home
        </Link>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
