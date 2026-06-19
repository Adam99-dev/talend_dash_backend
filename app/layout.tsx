import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentDash - Software Engineer Salaries & Compensation",
  description: "Compare software engineer salaries across companies and levels. Real data, real insights for negotiating offers.",
  metadataBase: new URL("https://talentdash.com"),
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "TalentDash - Software Engineer Salaries",
    description: "Compare software engineer salaries across companies and levels.",
    url: "https://talentdash.com",
    siteName: "TalentDash",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TalentDash",
    description: "Compare software engineer salaries",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-border-light bg-bg-surface sticky top-0 z-40 backdrop-blur">
          <nav className="site-nav max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-h3 font-bold text-text-deep hover:text-accent hover:scale-105 transition-colors">
                TalentDash
              </Link>
              <div className="hidden md:flex gap-6">
                <a href="/salaries" className="text-body text-text-body hover:text-accent transition-colors hover:scale-105">
                  Salaries
                </a>
                <a href="/compare" className="text-body text-text-body hover:text-accent transition-colors hover:scale-105">
                  Compare
                </a>
              </div>
            </div>
          </nav>
        </header>

        <main className="min-h-screen bg-bg-app">
          {children}
        </main>

        <footer className="bg-bg-surface border-t border-border-light mt-12">
          <div className="max-w-7xl mx-auto px-6 py-8 text-center text-text-muted text-meta">
            <p>&copy; 2024 TalentDash. Data-driven compensation intelligence.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
