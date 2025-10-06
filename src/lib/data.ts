export const alignmentTrendData = [
  { date: 'Jan', score: 65 },
  { date: 'Feb', score: 68 },
  { date: 'Mar', score: 72 },
  { date: 'Apr', score: 70 },
  { date: 'May', score: 75 },
  { date: 'Jun', score: 82 },
  { date: 'Jul', score: 85 },
];

export const objectiveCoverageData = [
    { objective: "Growth", coverage: 80, fill: "var(--color-chart-1)" },
    { objective: "Innovation", coverage: 95, fill: "var(--color-chart-2)" },
    { objective: "Efficiency", coverage: 60, fill: "var(--color-chart-3)" },
    { objective: "Culture", coverage: 75, fill: "var(--color-chart-4)" },
    { objective: "Brand", coverage: 85, fill: "var(--color-chart-5)" },
];

export const chartConfig = {
    score: {
      label: "Alignment Score",
    },
    coverage: {
        label: "Coverage (%)",
    },
    ...objectiveCoverageData.reduce((acc, { objective, fill }) => {
        acc[objective] = { label: objective, color: fill };
        return acc;
    }, {})
} satisfies import("recharts").ChartConfig;
