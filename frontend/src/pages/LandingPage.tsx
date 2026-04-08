import { SiteNav } from '../components/SiteNav';
import { InfoCard } from '../components/InfoCard';
import { CookieBanner } from '../components/CookieBanner';

export function LandingPage() {
  return (
    <>
      <SiteNav />
      <main className="container py-4 pb-5">
        <h1>Havyn Command Center</h1>
        <p className="lead">Simple, secure tracking for residents, donors, and safehouse operations.</p>
        <div className="row g-3 mt-2">
          <InfoCard title="Resident Safety" text="See active cases, risks, and follow-up tasks in one place." />
          <InfoCard title="Donor Trust" text="Track contributions and show impact through clear summaries." />
          <InfoCard title="Team Clarity" text="Keep events, appointments, forms, and to-dos organized." />
        </div>
      </main>
      <CookieBanner />
    </>
  );
}
