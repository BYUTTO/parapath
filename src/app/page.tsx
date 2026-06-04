import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, LayoutDashboard, CheckSquare, Unlock } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-accent" />
          <span className="font-display font-semibold text-lg tracking-tight">ParaPath</span>
        </div>
        <div className="flex gap-2">
          <Link href="/admin"><Button variant="outline" size="sm">Admin</Button></Link>
          <Link href="/supervisor"><Button variant="outline" size="sm">Supervisor</Button></Link>
          <Link href="/para"><Button size="sm" className="bg-accent hover:bg-accent-hover text-white">Para View</Button></Link>
        </div>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
          BYU Technology Transfer Office
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 max-w-2xl">
          Job-embedded training for paraprofessionals —{" "}
          <span className="text-accent">with duties unlocked as competency is proven.</span>
        </h1>
        <p className="text-lg text-inkmute mb-8 max-w-xl">
          46% of paraprofessionals report dissatisfaction with one-time training events. ParaPath
          replaces them with 5–10 minute scenario-based modules on a 30/60/90-day track, with
          duties unlocking only after demonstrated competency.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/admin">
            <Button size="lg" variant="outline">See admin dashboard →</Button>
          </Link>
          <Link href="/para">
            <Button size="lg" className="bg-accent hover:bg-accent-hover text-white">See para experience →</Button>
          </Link>
        </div>
      </section>

      <section className="border-t bg-card px-6 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Feature icon={<BookOpen className="h-5 w-5 text-accent" />} title="5–10 minute scenario modules" description="Evidence-based video scenarios: de-escalation, first aid, autism support, FERPA, PBS. Designed for on-the-job completion between duties." />
          <Feature icon={<Unlock className="h-5 w-5 text-amber" />} title="Duty-unlock track" description="Paras can't be assigned lunchroom supervision until they complete the choking module. Duties unlock automatically on the 30/60/90-day track." />
          <Feature icon={<LayoutDashboard className="h-5 w-5 text-accent" />} title="Supervisor dashboard" description="Special ed directors see every para's completion status, overdue flags, and cleared duties across the whole district — in one screen." />
          <Feature icon={<CheckSquare className="h-5 w-5 text-inkmute" />} title="Compliance tracking" description="Automated overdue flags at 30, 60, and 90 days. No more chasing sign-in sheets or spreadsheets — the system surfaces noncompliance before an incident." />
        </div>
      </section>

      <section className="px-6 py-8 border-t text-center">
        <p className="text-sm text-inkmute max-w-lg mx-auto">
          Built on peer-reviewed research documenting that one-time training events fail to produce lasting competency gains in paraprofessionals serving students with disabilities.
        </p>
      </section>
    </main>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-inkmute">{description}</p>
      </div>
    </div>
  );
}
