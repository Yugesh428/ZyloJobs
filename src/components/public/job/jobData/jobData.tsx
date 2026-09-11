export type Job = {
  id: string;
  req: string;
  title: string;
  company: string;
  companyCode: string;
  companyTone: "primary" | "accent" | "info" | "success" | "warning";
  location: string;
  workplace: string;
  salary?: string;
  salaryNote?: string;
  experience?: string;
  postedAgo: string;
  applicants: number;
  badge: string;
  badgeTone: "primary" | "success" | "info" | "warning";
  about: string;
  responsibilities: string[];
  roleType: string;
  sla: string;
  candidatesEvaluated: number;
  matchScore: string;
};

export const JOBS: Job[] = [
  {
    id: "senior-cloud-architect",
    req: "REQ #ZG-8492",
    title: "Senior Cloud Architect",
    company: "Apex Enterprise Solutions",
    companyCode: "APX",
    companyTone: "primary",
    location: "Naxal, Kathmandu",
    workplace: "Hybrid (2 days onsite / 3 days remote)",
    salary: "NPR 220,000 – 320,000 / mo",
    experience: "6+ Years Exp",
    postedAgo: "2 hours ago",
    applicants: 48,
    badge: "Intermediary Vetted",
    badgeTone: "warning",
    about:
      "Apex Enterprise Solutions is collaborating exclusively with ZYLO BRAINS to secure an accomplished Senior Cloud Architect. In this key technical capacity, you will lead the architecture, transition, and operational governance of scalable multi-region AWS and Kubernetes production footprints supporting cross-border fintech workflows.",
    responsibilities: [
      "Architect resilient, highly available multi-tenant AWS cloud infrastructures using Infrastructure as Code (Terraform, CloudFormation).",
      "Collaborate directly with engineering leads to migrate monolithic enterprise core services into containerized microservices on Amazon EKS.",
      "Establish and enforce cloud security posture, IAM boundaries, and cost-optimization governance across all production workloads.",
      "Lead architecture reviews, document runbooks, and mentor senior engineers on cloud-native patterns.",
    ],
    roleType: "Permanent Full-time",
    sla: "48-hr Feedback",
    candidatesEvaluated: 48,
    matchScore: "High Placement Match",
  },
  {
    id: "clinical-nurse-lead",
    req: "REQ #CFH-2201",
    title: "Clinical Nurse Lead (ICU)",
    company: "CareFirst Health Network",
    companyCode: "CFH",
    companyTone: "success",
    location: "Lalitpur",
    workplace: "On-site",
    experience: "5+ Yrs",
    postedAgo: "1 day ago",
    applicants: 29,
    badge: "Direct Placement",
    badgeTone: "info",
    about:
      "CareFirst Health Network is hiring a Clinical Nurse Lead to oversee ICU operations, coordinate shift allocations, and drive patient-safety auditing across our tertiary-care facility in Lalitpur.",
    responsibilities: [
      "Supervise ICU nursing staff, shift rosters, and daily clinical assignments.",
      "Audit patient assessment documentation and lead quality-improvement initiatives.",
      "Coordinate with intensivists on complex case management and escalation protocols.",
      "Mentor junior nursing staff on critical-care best practices.",
    ],
    roleType: "Permanent Full-time",
    sla: "48-hr Feedback",
    candidatesEvaluated: 29,
    matchScore: "Standard Pipeline",
  },
  {
    id: "logistics-supervisor",
    req: "REQ #HLG-4410",
    title: "Logistics & Supply Supervisor",
    company: "Himalayan Freight & Logistics",
    companyCode: "HLG",
    companyTone: "info",
    location: "Bhaktapur / Kathmandu",
    workplace: "On-site",
    salary: "Competitive Package",
    postedAgo: "3 days ago",
    applicants: 41,
    badge: "Intermediary Vetted",
    badgeTone: "warning",
    about:
      "Himalayan Freight & Logistics seeks a Logistics & Supply Supervisor to orchestrate fulfillment throughput, automated inventory routing, and warehouse safety compliance across our Kathmandu valley operations.",
    responsibilities: [
      "Manage daily fulfillment throughput and inventory routing across three warehouse nodes.",
      "Enforce worker safety guidelines and conduct regular compliance audits.",
      "Coordinate with customs brokers on cross-border consignments.",
      "Optimize last-mile delivery routes with our transport partners.",
    ],
    roleType: "Permanent Full-time",
    sla: "48-hr Feedback",
    candidatesEvaluated: 41,
    matchScore: "High Placement Match",
  },
  {
    id: "hotel-operations-manager",
    req: "REQ #SHR-1180",
    title: "Hotel Operations Manager",
    company: "Summit Heritage Resort Group",
    companyCode: "SHR",
    companyTone: "warning",
    location: "Pokhara",
    workplace: "Full-Time Onsite",
    experience: "7+ Yrs Leadership",
    postedAgo: "4 days ago",
    applicants: 31,
    badge: "Priority Fill",
    badgeTone: "warning",
    about:
      "Summit Heritage Resort Group is seeking an experienced Hotel Operations Manager to drive service excellence across our flagship Pokhara property, oversee departmental logistics, and manage VIP guest relations.",
    responsibilities: [
      "Lead front-of-house, F&B, and housekeeping departments.",
      "Oversee guest experience standards and VIP protocol management.",
      "Manage department P&L, vendor contracts, and staffing plans.",
      "Lead seasonal hiring, onboarding, and performance reviews.",
    ],
    roleType: "Permanent Full-time",
    sla: "48-hr Feedback",
    candidatesEvaluated: 31,
    matchScore: "Standard Pipeline",
  },
  {
    id: "lead-devops",
    req: "REQ #VNT-7723",
    title: "Lead DevOps / SRE Engineer",
    company: "Ventura Digital Technologies",
    companyCode: "VNT",
    companyTone: "primary",
    location: "Remote (Kathmandu Core) · Remote",
    workplace: "Remote",
    salary: "NPR 180K – 260K",
    postedAgo: "5 days ago",
    applicants: 22,
    badge: "Intermediary Vetted",
    badgeTone: "warning",
    about:
      "Ventura Digital Technologies is hiring a Lead DevOps / SRE Engineer to own reliability, observability, and deployment automation across a global multi-tenant SaaS platform.",
    responsibilities: [
      "Own production reliability, SLOs, and incident response.",
      "Design and maintain CI/CD pipelines and deployment automation.",
      "Lead observability stack (metrics, logs, tracing) and capacity planning.",
      "Partner with security on compliance and secret-management practices.",
    ],
    roleType: "Permanent Full-time",
    sla: "48-hr Feedback",
    candidatesEvaluated: 22,
    matchScore: "High Placement Match",
  },
];
