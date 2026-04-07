'use client'

import Image from 'next/image'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="flex flex-col items-center gap-4"
        style={{
          animation: 'fadeUp 0.8s ease both',
        }}
      >
        <Image
          src="/favicon.png"
          alt="vihaan vulpala"
          width={64}
          height={64}
          className="rounded-xl opacity-90"
          style={{ animation: 'fadeUp 0.6s ease both' }}
          priority
        />
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-gray-800">
            vihaan vulpala
          </h1>
          <p className="text-sm font-sans text-gray-400 italic">
            under construction. check back soon.
          </p>
        </div>
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
