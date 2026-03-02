'use client';

import { Spinner } from '@forsyteco/product-ui';

export default function Home() {
  return (
    <main className="p-8 font-sans">
      <h1 className="text-2xl font-bold">Forsyteco Exercises</h1>
      <p className="mt-2">Next.js frontend (web) — part of this Turborepo.</p>
      <p className="mt-2">
        API runs at <code className="rounded bg-black/10 px-1 py-0.5 dark:bg-white/10">http://localhost:8174</code> when you start the api app.
      </p>
    </main>
  );
}
