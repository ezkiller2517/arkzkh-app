import type { Draft } from './types';

export const initialDrafts: Draft[] = [
  {
    id: 'draft-1',
    title: 'Q3 Marketing Strategy',
    content: 'Our focus for Q3 will be on expanding our market reach through targeted digital campaigns. We will leverage our new brand messaging to engage with a wider audience. The main goal is to increase lead generation by 20%.',
    status: 'Approved',
    author: 'Alex Chen',
    createdAt: '2024-07-15T10:00:00Z',
    updatedAt: '2024-07-18T14:30:00Z',
    alignmentScore: 0.85,
  },
  {
    id: 'draft-2',
    title: 'New Feature Launch Announcement',
    content: 'Announcing the launch of our new AI-powered analytics module. This feature provides users with deeper insights into their data. We need to create a blog post and social media content.',
    status: 'In Review',
    author: 'Samantha Bee',
    createdAt: '2024-07-20T09:00:00Z',
    updatedAt: '2024-07-21T11:20:00Z',
    alignmentScore: 0.92,
  },
  {
    id: 'draft-3',
    title: 'Internal Memo: Company Offsite',
    content: 'This is a memo regarding the upcoming company offsite event. Please RSVP by the end of the week. More details about the agenda and location will be shared soon.',
    status: 'Draft',
    author: 'Chris Davis',
    createdAt: '2024-07-22T16:45:00Z',
    updatedAt: '2024-07-22T16:45:00Z',
  },
];

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
