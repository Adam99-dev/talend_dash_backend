import { Metadata } from "next";
import { SalaryTable } from "@/app/components/features/SalaryTable";
import { getAllSalaries } from "@/lib/backend-data";

export const metadata: Metadata = {
  title: "Software Engineer Salaries | TalentDash",
  description:
    "Browse 50,000+ software engineer salaries across companies and levels. Real data from real engineers. Filter by company, role, location, and level.",
  openGraph: {
    title: "Software Engineer Salaries",
    description: "50,000+ real salary records",
    type: "website",
  },
};

export default async function SalariesPage() {
  const salaries = await getAllSalaries();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Software Engineer Salaries",
    description: "A comprehensive dataset of software engineer salaries across tech companies",
    url: "https://talentdash.com/salaries",
    keywords: "software engineer, salary, compensation, tech salaries",
    creator: {
      "@type": "Organization",
      name: "TalentDash",
    },
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: "https://talentdash.com/api/salaries",
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-8">
        <h1 className="text-h1 mb-2">Salary Data</h1>
        <p className="text-h3 text-text-muted">
          {salaries.length.toLocaleString()} real salary records from engineers worldwide.
        </p>
      </div>

      <SalaryTable initialData={salaries} columns={[]} />
    </div>
  );
}
