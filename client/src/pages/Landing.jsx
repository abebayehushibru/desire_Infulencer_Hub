import { Link } from "react-router-dom";
import {
  Megaphone,
  Users,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import logo from "../assets/logo1.png";
import hero from "../assets/hero.png";

// ── Stat pill ────────────────────────────────────────────────────────────────
function Stat({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-extrabold text-white">{value}</p>
      <p className="mt-1 text-sm text-white/70">{label}</p>
    </div>
  );
}

// ── Feature card ─────────────────────────────────────────────────────────────
function Feature({ icon: Icon, title, description, color }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
      >
        <Icon size={22} />
      </div>
      <h3 className="mb-2 text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}

// ── Testimonial card ─────────────────────────────────────────────────────────
function Testimonial({ name, role, quote }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-3 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="mb-4 text-sm leading-relaxed text-gray-600">&ldquo;{quote}&rdquo;</p>
      <div>
        <p className="text-sm font-semibold text-gray-900">{name}</p>
        <p className="text-xs text-gray-400">{role}</p>
      </div>
    </div>
  );
}

// ── Main Landing page ────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 font-[Inter,sans-serif]">

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl">
              <img src={logo} alt="InfluenceHub" className="h-full w-full object-contain" />
            </div>
            <span className="text-lg font-bold text-primary">influenceHub</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-gray-600 transition hover:text-primary">Features</a>
            <a href="#how" className="text-sm text-gray-600 transition hover:text-primary">How it works</a>
            <a href="#testimonials" className="text-sm text-gray-600 transition hover:text-primary">Testimonials</a>
          </nav>

          {/* CTA buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/5"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-gradient-to-r from-primary to-secondary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-primary py-24 text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-tertiary/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Text */}
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90">
                <Zap size={12} className="fill-tertiary text-tertiary" />
                Africa&apos;s #1 Influencer Marketing Platform
              </span>
              <h1 className="mb-6 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Connect Brands
                <br />
                with <span className="text-tertiary">Influencers</span>
                <br />
                That Convert
              </h1>
              <p className="mb-8 max-w-lg text-lg leading-relaxed text-white/80">
                Manage campaigns, track conversions, and grow revenue — all in
                one powerful platform built for modern marketers.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-tertiary px-7 py-3.5 text-sm font-bold text-primary shadow-lg transition hover:opacity-90"
                >
                  Start for free
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Log in to dashboard
                </Link>
              </div>
            </div>

            {/* Hero image */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-white/10 blur-2xl" />
                <img
                  src={hero}
                  alt="Platform preview"
                  className="relative max-h-[420px] w-full rounded-3xl object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 gap-6 rounded-2xl border border-white/10 bg-white/5 p-8 sm:grid-cols-4">
            <Stat value="10k+" label="Active influencers" />
            <Stat value="500+" label="Brands & businesses" />
            <Stat value="2M+" label="Campaign impressions" />
            <Stat value="98%" label="Client satisfaction" />
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-extrabold text-gray-900">
              Everything you need to run campaigns
            </h2>
            <p className="mx-auto max-w-xl text-gray-500">
              From discovery to payment — InfluenceHub handles every step of the influencer marketing lifecycle.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={Megaphone}
              title="Campaign Management"
              description="Create, manage and track campaigns end-to-end with full visibility on performance."
              color="bg-blue-100 text-blue-600"
            />
            <Feature
              icon={Users}
              title="Influencer Discovery"
              description="Search and filter thousands of verified influencers by niche, reach and engagement."
              color="bg-violet-100 text-violet-600"
            />
            <Feature
              icon={BarChart3}
              title="Analytics & Reporting"
              description="Real-time dashboards, conversion tracking and ROI reports at your fingertips."
              color="bg-green-100 text-green-600"
            />
            <Feature
              icon={ShieldCheck}
              title="Secure Payments"
              description="Automated payouts, milestone-based releases and full transaction history."
              color="bg-orange-100 text-orange-600"
            />
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how" className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-extrabold text-gray-900">
              How it works
            </h2>
            <p className="text-gray-500">Three simple steps to launch your first campaign.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create your account",
                desc: "Sign up as a business or influencer in under two minutes.",
                icon: Zap,
              },
              {
                step: "02",
                title: "Launch a campaign",
                desc: "Set your goals, budget and target audience. We match you with the right influencers.",
                icon: Megaphone,
              },
              {
                step: "03",
                title: "Track & grow",
                desc: "Monitor clicks, conversions and earnings live. Scale what works.",
                icon: TrendingUp,
              },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
                  <Icon size={26} className="text-white" />
                </div>
                <span className="mb-1 text-xs font-bold tracking-widest text-tertiary">STEP {step}</span>
                <h3 className="mb-2 text-base font-semibold text-gray-900">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-extrabold text-gray-900">
              Trusted by marketers across Africa
            </h2>
            <p className="text-gray-500">Real results from real users.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Testimonial
              name="Selam T."
              role="Marketing Manager, Addis Ababa"
              quote="InfluenceHub cut our campaign setup time from days to minutes. The influencer matching is incredibly accurate."
            />
            <Testimonial
              name="Kaleb M."
              role="Content Creator — Gold Influencer"
              quote="I get paid faster and can see exactly how my content performs. It's changed how I work with brands."
            />
            <Testimonial
              name="Hana B."
              role="E-commerce Business Owner"
              quote="Our conversion rate tripled in the first quarter after switching to InfluenceHub. Highly recommend."
            />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-primary to-secondary py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-extrabold text-white">
            Ready to grow with influence?
          </h2>
          <p className="mb-8 text-white/80">
            Join thousands of brands and creators already on the platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-tertiary px-8 py-3.5 text-sm font-bold text-primary transition hover:opacity-90"
            >
              Create free account
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <img src={logo} alt="InfluenceHub" className="h-7 w-7 rounded-lg object-contain" />
              <span className="text-sm font-bold text-primary">influenceHub</span>
            </div>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} InfluenceHub. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-xs text-gray-400 transition hover:text-primary">Privacy</a>
              <a href="#" className="text-xs text-gray-400 transition hover:text-primary">Terms</a>
              <a href="#" className="text-xs text-gray-400 transition hover:text-primary">Contact</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
