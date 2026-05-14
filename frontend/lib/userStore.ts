// ============================================================
// PlaceIQ — Central User Store (localStorage helpers + types)
// ============================================================

// ── Types ────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  email: string;
  degreeType: string;
  department: string;
  year: string;
  targetRole: string;
  targetCompanies: string[];
  placementTimeline: string;
}

export interface ResumeScore {
  overallScore: number;
  relevance: number;
  skills: number;
  experience: number;
  presentation: number;
  keywords: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  summary: string;
  resumeText: string;
  analyzedAt: number;
}

export interface SessionRecord {
  id: string;
  date: number;
  role: string;
  type: string;
  overallScore: number;
  speechScore: number;
  fluencyScore: number;
  contentScore: number;
}

// ── Constants ─────────────────────────────────────────────────

export const DEGREE_TYPES = [
  { id: "B.Tech", label: "B.Tech", emoji: "⚙️" },
  { id: "B.E",    label: "B.E",    emoji: "🔧" },
  { id: "B.Sc",   label: "B.Sc",   emoji: "🔬" },
  { id: "M.Tech", label: "M.Tech", emoji: "🎓" },
  { id: "M.E",    label: "M.E",    emoji: "🏗️" },
  { id: "MBA",    label: "MBA",    emoji: "💼" },
  { id: "Other",  label: "Other",  emoji: "📚" },
];

export const DEPARTMENTS = [
  "Computer Science and Engineering",
  "Information Technology",
  "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Data Science",
  "Others",
];

export const YEARS = [
  "1st Year", "2nd Year", "3rd Year", "4th Year", "Graduated",
];

export const ROLE_MAP: Record<string, string[]> = {
  "Computer Science and Engineering": [
    "Software Development Engineer (SDE)",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "AI/ML Engineer",
    "Data Engineer",
    "DevOps Engineer",
    "Product Engineer",
  ],
  "Information Technology": [
    "Software Developer",
    "Cloud Engineer",
    "System Administrator",
    "Network Engineer",
    "IT Consultant",
    "Cybersecurity Analyst",
  ],
  "Electronics and Communication Engineering": [
    "Embedded Systems Engineer",
    "VLSI Design Engineer",
    "RF/Signal Processing Engineer",
    "Hardware Engineer",
    "IoT Engineer",
  ],
  "Electrical and Electronics Engineering": [
    "Electrical Engineer",
    "Power Systems Engineer",
    "Control Systems Engineer",
    "Automation Engineer",
  ],
  "Mechanical Engineering": [
    "Design Engineer",
    "Production Engineer",
    "Automobile Engineer",
    "Manufacturing Engineer",
    "R&D Engineer",
  ],
  "Civil Engineering": [
    "Site Engineer",
    "Structural Engineer",
    "Project Manager",
    "Urban Planner",
  ],
  "Chemical Engineering": [
    "Process Engineer",
    "Plant Engineer",
    "Quality Control Engineer",
    "R&D Engineer",
  ],
  "Biotechnology": [
    "Research Scientist",
    "Biotech Analyst",
    "Lab Technician",
    "Clinical Research Associate",
  ],
  "Data Science": [
    "Data Scientist",
    "Data Analyst",
    "Machine Learning Engineer",
    "BI Analyst",
    "AI Research Engineer",
  ],
  "Others": [
    "Business Analyst",
    "Product Manager",
    "Management Consultant",
    "Operations Analyst",
  ],
};

export const TOP_COMPANIES = [
  "Google", "Microsoft", "Amazon", "Meta", "Apple",
  "Flipkart", "Infosys", "TCS", "Wipro", "Accenture",
  "Deloitte", "Goldman Sachs", "JP Morgan", "Zomato", "Swiggy",
  "Paytm", "PhonePe", "CRED", "Razorpay", "Atlassian",
  "Salesforce", "Oracle", "SAP", "IBM", "Cisco",
];

export const TIMELINES = [
  { id: "< 3 months",   label: "< 3 months",  desc: "Urgently preparing" },
  { id: "3-6 months",   label: "3-6 months",  desc: "Actively preparing" },
  { id: "6-12 months",  label: "6-12 months", desc: "Building foundation" },
  { id: "> 12 months",  label: "> 1 year",    desc: "Long-term planning" },
];

// ── localStorage helpers ──────────────────────────────────────

const KEY_PROFILE  = "placeiq_profile";
const KEY_RESUME   = "placeiq_resume";
const KEY_SESSIONS = "placeiq_sessions";
const KEY_ONBOARD  = "placeiq_onboarding_complete";

export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveProfile(p: UserProfile): void {
  localStorage.setItem(KEY_PROFILE, JSON.stringify(p));
}

export function getResumeScore(): ResumeScore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_RESUME);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveResumeScore(r: ResumeScore): void {
  localStorage.setItem(KEY_RESUME, JSON.stringify(r));
}

export function getSessions(): SessionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_SESSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function isOnboardingComplete(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY_ONBOARD) === "true";
}

export function markOnboardingComplete(): void {
  localStorage.setItem(KEY_ONBOARD, "true");
}

export function clearUserData(): void {
  [KEY_PROFILE, KEY_RESUME, KEY_SESSIONS, KEY_ONBOARD].forEach(k =>
    localStorage.removeItem(k)
  );
}
