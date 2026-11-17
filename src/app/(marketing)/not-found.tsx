import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-gradient-to-b from-[#eaf3ff] to-white py-24">
      <div className="mx-auto max-w-[640px] px-4 text-center">
        <span className="kicker">Error 404</span>
        <h1 className="mt-3 font-heading text-[clamp(2rem,5vw,3rem)] font-extrabold text-ink">Page not found</h1>
        <p className="mt-3 text-slate">The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="inline-flex h-12 items-center justify-center rounded-full bg-red px-7 font-heading font-semibold text-white hover:bg-red-dark">
            Back to Home
          </Link>
          <Link href="/shop" className="inline-flex h-12 items-center justify-center rounded-full border-2 border-[#c9d8f2] px-7 font-heading font-semibold text-blue hover:border-blue">
            Browse the Shop
          </Link>
        </div>
      </div>
    </section>
  );
}
