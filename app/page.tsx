import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TalentDash - Find Your Worth",
  description: "Discover real software engineer salaries and compensation packages across leading tech companies.",
};

export default function Home() {
  return (
    <div className="page-container max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="text-h1 mb-4">Know Your Worth</h1>
        <p className="text-h3 text-text-muted mb-8">
          Real salaries from real engineers across leading tech companies.
        </p>
        <Link href="/salaries" className="btn-primary inline-block">
          Explore Salaries
        </Link>
      </div>

      <div className="feature-grid grid md:grid-cols-3 gap-8 mt-16">
        <div className="card text-center">
          <h3 className="text-h3 mb-3">50K+ Records</h3>
          <p className="text-text-muted">
            Real compensation data from engineers worldwide
          </p>
        </div>
        <div className="card text-center">
          <h3 className="text-h3 mb-3">Compare Easy</h3>
          <p className="text-text-muted">
            Side-by-side salary comparisons across companies
          </p>
        </div>
        <div className="card text-center">
          <h3 className="text-h3 mb-3">Data-Driven</h3>
          <p className="text-text-muted">
            Negotiating power backed by real market data
          </p>
        </div>
      </div>
    </div>
  );
}
