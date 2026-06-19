import { Suspense } from "react";
import CompareClient from "./CompareClient";

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="page-container max-w-7xl mx-auto px-6 py-8">
          <div className="card text-center py-12">
            <p className="text-text-muted">Loading comparison...</p>
          </div>
        </div>
      }
    >
      <CompareClient />
    </Suspense>
  );
}