import type { ExtractStrategicBlueprintOutput } from "@/ai/flows/extract-strategic-blueprint";

export type StrategicBlueprint = ExtractStrategicBlueprintOutput;

export type DraftStatus = 'Draft' | 'In Review' | 'Approved' | 'Rejected';

export type Draft = {
  id: string;
  title: string;
  content: string;
  status: DraftStatus;
  author: string;
  createdAt: string;
  updatedAt: string;
  alignmentScore?: number;
  feedback?: string;
  suggestions?: string[];
  rationale?: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type: 'Internal' | 'External';
  draftId: string;
};

export type UserRole = 'Contributor' | 'Approver' | 'Admin';
