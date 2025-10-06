# **App Name**: AlignmentOS

## Core Features:

- Strategic Blueprint Extraction: Ingest various document types (PDFs, links, text) and extract key strategic elements such as vision, mission, values, objectives, pillars, and taxonomy terms. This blueprint serves as the core reference for alignment scoring. The first cut might need to be semi-manual.
- AI-Powered Alignment Scoring: Utilize a Genkit + Gemini integration and a Super Prompt to score content objects against the Strategic Blueprint. Returns an alignment score (0..1), feedback (what to fix), suggested actions, and rationale in a structured JSON format.
- Role-Based Access Control (RBAC) Workflow: Implement a role-based workflow (Contributor -> Approver -> Admin) to manage content creation, review, and approval processes. Enforce state machine transitions with an audit trail to track all changes and decisions.
- Dual-Track Calendar Management: Maintain separate internal and external communications calendars with optional Google Calendar/Outlook synchronization. Allow users to publish approved content directly to these calendars.
- Comprehensive Reporting & Analytics: Provide dashboards displaying alignment trends, objective coverage, weak areas (gaps), and throughput. Offer org-level and department-level views with drill-down capabilities.
- Draft Content Editor: Provide a rich text editor to create a draft. The drafts are stored in the database.
- Approval queue: Allow the approver role to review, edit and approve drafts submitted by the contributor.

## Style Guidelines:

- Primary: Neutral base (#FFFFFF / #0F0F0F for dark)
- Accent: Deep violet or purple (for brand)
- Success/Warning: Green/Amber
- Body: Inter
- Headings: Space Grotesk
- Modular card-based sections
- Sticky right panel in Draft Editor for AI output
- Calendar in split layout (month view + detail panel)
- Line icons (Lucide or Phosphor)
- Alignment icons: compass/star/target motif
- Simple geometric shapes
- Subtle transitions for: State change (draft → approved)
- AI scoring updates
- Calendar event creation
- Avoid looping or decorative animations.