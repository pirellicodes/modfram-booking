"use client";

import { RadarShapeChart } from "@/components/charts/radar-shape-chart";

export default function TestChartsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Test Charts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <RadarShapeChart />
      </div>
    </div>
  );
}
