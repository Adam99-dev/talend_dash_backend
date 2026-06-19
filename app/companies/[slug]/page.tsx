import { Metadata } from "next";
import Link from "next/link";
import { getCompanyData, getAllSalaries } from "@/lib/backend-data";
import { LevelBadge, StatusBadge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import { formatCurrency } from "@/app/lib/currency";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCompanyData(slug);

  if (!data) {
    return {
      title: "Company Not Found",
    };
  }

  return {
    title: `${data.company.name} Software Engineer Salaries | TalentDash`,
    description: `Browse ${data.salaries.length} salary records for ${data.company.name}. See real compensation data by level and location.`,
    openGraph: {
      title: `${data.company.name} Salaries`,
      description: `Real salary data for ${data.company.name}`,
    },
  };
}

export async function generateStaticParams() {
  const salaries = await getAllSalaries();
  const companies = Array.from(
    new Map(salaries.map((s) => [s.company.slug, s.company])).values()
  );

  return companies.map((company) => ({
    slug: company.slug,
  }));
}

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCompanyData(slug);

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-h1 mb-4">Company Not Found</h1>
        <p className="text-text-muted mb-8">
          The company you're looking for doesn't exist.
        </p>
        <Link href="/salaries">
          <Button>Back to Salaries</Button>
        </Link>
      </div>
    );
  }

  const { company, salaries } = data;
  const medianTC = salaries.reduce((acc, s) => acc + s.totalComp, 0) / salaries.length;
  const maxTC = Math.max(...salaries.map((s) => s.totalComp));
  const minTC = Math.min(...salaries.map((s) => s.totalComp));

  const levelCounts = Object.entries(
    salaries.reduce(
      (acc, s) => {
        acc[s.level] = (acc[s.level] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    )
  ).sort();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: `https://talentdash.com/companies/${slug}`,
    industry: company.industry,
    foundingDate: company.founded_year,
    numberOfEmployees: company.headcount_range,
    jobLocation: company.headquarters,
    jobPostings: {
      "@type": "JobPosting",
      title: "Software Engineer",
      jobLocation: company.headquarters,
      baseSalary: {
        "@type": "PriceSpecification",
        priceCurrency: "USD",
        price: formatCurrency(medianTC, "USD"),
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="mb-8">
        <Link href="/salaries" className="text-accent hover:underline text-label mb-4 block">
          ← Back to Salaries
        </Link>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-h1 mb-2">{company.name}</h1>
            <div className="flex gap-4 flex-wrap">
              {company.industry && (
                <span className="badge bg-bg-hover text-text-deep">
                  {company.industry}
                </span>
              )}
              {company.founded_year && (
                <span className="text-text-muted text-body">
                  Founded {company.founded_year}
                </span>
              )}
              {company.headcount_range && (
                <span className="text-text-muted text-body">
                  {company.headcount_range} employees
                </span>
              )}
              {company.headquarters && (
                <span className="text-text-muted text-body">
                  📍 {company.headquarters}
                </span>
              )}
            </div>
          </div>
          <Link href={`/compare?c1=${slug}`}>
            <Button>Compare</Button>
          </Link>
        </div>
      </div>

      {/* Compensation Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-text-muted text-label mb-2">Median Total Comp</p>
          <p className="text-salary-lg text-data-blue">
            {formatCurrency(medianTC, "INR")}
          </p>
        </div>
        <div className="card">
          <p className="text-text-muted text-label mb-2">Range</p>
          <p className="text-body">
            {formatCurrency(minTC, "INR")} – {formatCurrency(maxTC, "INR")}
          </p>
        </div>
        <div className="card">
          <p className="text-text-muted text-label mb-2">Records</p>
          <p className="text-body">{salaries.length} salary entries</p>
        </div>
      </div>

      {/* Level Distribution */}
      <div className="card mb-8">
        <h3 className="text-h3 mb-6">Level Distribution</h3>
        <div className="space-y-3">
          {levelCounts.map(([level, count]) => {
            const percentage = (count / salaries.length) * 100;
            return (
              <div key={level}>
                <div className="flex items-center justify-between mb-2">
                  <LevelBadge level={level} />
                  <span className="text-text-muted text-label">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-bg-hover rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-accent h-full rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Salary Table */}
      <div className="card">
        <h3 className="text-h3 mb-6">Salary Records</h3>
        <div className="table-container">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Role</th>
                <th className="table-header-cell">Level</th>
                <th className="table-header-cell">Location</th>
                <th className="table-header-cell">Experience</th>
                <th className="table-header-cell">Base</th>
                <th className="table-header-cell">Bonus</th>
                <th className="table-header-cell">Stock</th>
                <th className="table-header-cell">Total Comp</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((record) => (
                <tr key={record.id} className="table-row">
                  <td className="table-cell">{record.role}</td>
                  <td className="table-cell">
                    <LevelBadge level={record.level} />
                  </td>
                  <td className="table-cell">{record.location}</td>
                  <td className="table-cell">{record.experienceYears} yrs</td>
                  <td className="table-cell">{formatCurrency(record.baseSalary, "INR")}</td>
                  <td className="table-cell">
                    {record.bonus === 0 ? "—" : formatCurrency(record.bonus, "INR")}
                  </td>
                  <td className="table-cell">
                    {record.stock === 0 ? "—" : formatCurrency(record.stock, "INR")}
                  </td>
                  <td className="table-cell total-comp">
                    {formatCurrency(record.totalComp, "INR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
