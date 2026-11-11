import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { BrandLogo } from '../components/brand/BrandLogo.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Button } from '../components/ui/Button.jsx';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Target,
  Users2,
  CalendarClock,
  BarChart3,
  FileSpreadsheet,
  Activity,
  ChevronDown,
  Menu,
  X,
  Layers,
  Lock,
  Sparkles,
  Briefcase,
  Crown,
  Building2,
  Check,
  Star,
  Play,
  Calculator,
  TrendingUp,
  Send,
  Quote,
  Building,
  Mail,
  DollarSign,
  Award,
} from 'lucide-react';

export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [activePreviewTab, setActivePreviewTab] = useState('kanban');
  const [activeRoleTab, setActiveRoleTab] = useState('rep');
  const [heroViewMode, setHeroViewMode] = useState('interface'); // 'interface' | 'gif'

  // Interactive ROI Calculator State
  const [roiReps, setRoiReps] = useState(5);
  const [roiDealValue, setRoiDealValue] = useState(12500);
  const [roiDealsPerRep, setRoiDealsPerRep] = useState(25);

  // Enterprise Contact Sales Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '15-50',
    message: '',
  });
  const [isContactSubmitted, setIsContactSubmitted] = useState(false);

  // Mobile Floating Demo Pill State
  const [showMobileStickyCta, setShowMobileStickyCta] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show floating demo CTA when user scrolls past 350px on mobile
      if (window.scrollY > 350) {
        setShowMobileStickyCta(true);
      } else {
        setShowMobileStickyCta(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // If session is restoring, show subtle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // If already authenticated, redirect to the dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setIsContactSubmitted(true);
    setTimeout(() => {
      setIsContactModalOpen(false);
      setIsContactSubmitted(false);
      setContactForm({
        name: '',
        email: '',
        company: '',
        teamSize: '15-50',
        message: '',
      });
    }, 2200);
  };

  // ROI Calculator Calculations (15% stalled deal recovery model)
  const totalAnnualPipeline = roiReps * roiDealsPerRep * roiDealValue;
  const recoveredDeals = Math.max(1, Math.round(roiReps * roiDealsPerRep * 0.15));
  const annualRecoveredRevenue = recoveredDeals * roiDealValue;
  const leadoraEstimatedCost = roiReps * 29 * 12;
  const roiMultiplier = Math.round(annualRecoveredRevenue / (leadoraEstimatedCost || 1));

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'ROI Calculator', href: '#calculator' },
    { label: 'Reviews', href: '#testimonials' },
    { label: 'Comparison', href: '#comparison' },
    { label: 'Security', href: '#security' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  const featuresList = [
    {
      icon: Target,
      title: 'Lead Lifecycle Management',
      description:
        'Capture contact details, company profiles, deal values, and source channels. Qualify, reassign, or archive opportunities with full history.',
    },
    {
      icon: Layers,
      title: '7-Stage Pipeline & Kanban',
      description:
        'Interactive visual board covering New, Contacted, Qualified, Proposal Sent, Negotiation, Won, and Lost stages with drag-and-drop workflow.',
    },
    {
      icon: Users2,
      title: 'Employee & Team Management',
      description:
        'Structure sales representatives into teams with assigned managers, strict supervisor boundaries, and team roster workload visibility.',
    },
    {
      icon: CalendarClock,
      title: 'Follow-ups & Task Scheduling',
      description:
        'Schedule discovery calls, demonstrations, and contract reviews. Automatic daily reminders alert reps to due-today and overdue actions.',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Sales Analytics',
      description:
        'Monitor pipeline conversion velocity, revenue win rates, monthly volume trends, and team leaderboards across custom date ranges.',
    },
    {
      icon: FileSpreadsheet,
      title: 'Reports & Data Export',
      description:
        'Generate structured operational reports with multi-format streaming downloads in CSV, Excel (.xlsx), and professionally formatted PDF documents.',
    },
    {
      icon: Activity,
      title: 'Chronological Activity Feed',
      description:
        'Comprehensive audit log recording customer calls, emails, sales notes, stage transitions, and representative milestones.',
    },
    {
      icon: ShieldCheck,
      title: 'Multi-Tenant Role Access',
      description:
        'Granular 4-tier security boundaries separating Platform Super Admin, Organization Admin, Sales Manager, and Sales Representative.',
    },
  ];

  const roleSolutions = {
    rep: {
      role: 'Sales Representatives',
      badge: 'High-Velocity Execution',
      icon: Briefcase,
      headline: 'A Focused Command Center Built for Fast Deal Closing',
      description:
        'Eliminate spreadsheet chaos and forgotten outreach notes. Representatives receive a dedicated workspace designed to prioritize active accounts, stay on top of daily follow-ups, and move deals forward.',
      benefits: [
        'Personal Lead Inbox: Focus exclusively on assigned accounts without clutter from other departments.',
        'Visual 7-Stage Kanban Board: Progress opportunities smoothly from initial contact to Closed-Won.',
        'Daily Task Queue: Scheduled calls, demos, and contract reviews with instant due-today and overdue badges.',
        'In-App Notification Alerts: Instant notification alerts whenever an inquiry or lead is assigned to you.',
      ],
      kpiNumber: '2.5x',
      kpiLabel: 'More Daily Follow-ups Executed',
    },
    manager: {
      role: 'Sales Managers',
      badge: 'Coaching & Workload Balance',
      icon: Users2,
      headline: 'Complete Visibility and Control Over Your Managed Team',
      description:
        'Empower sales managers with real-time insight into representative workloads, pipeline conversion bottlenecks, and team quota progress without tedious status meetings.',
      benefits: [
        'Team Roster Oversight: View active team members, assigned accounts, and individual capacity.',
        'Balanced Lead Distribution: Assign or reassign leads smoothly across your team to balance pipeline volume.',
        'Team Conversion Velocity: Track average days-to-close and drop-off points across the sales funnel.',
        'Data Boundary Security: Strict manager boundaries prevent unauthorized viewing of other sales teams.',
      ],
      kpiNumber: '38%',
      kpiLabel: 'Higher Team Conversion Velocity',
    },
    admin: {
      role: 'Business Owners & Admins',
      badge: 'Organization Governance',
      icon: Crown,
      headline: 'Company-Wide Pipeline Governance & Revenue Intelligence',
      description:
        'Take full control over company-wide revenue funnels, staff provisioning, organizational boundary settings, and executive multi-format reporting.',
      benefits: [
        'Organization-Wide Forecasts: Monitor revenue across Won, In-Progress, and Lost pipeline opportunities.',
        'Staff Directory & Access Governance: Create employee profiles, assign roles, and manage team managers.',
        'Regional Workspace Settings: Configure localized currency symbols, formats, and timezone defaults.',
        'Instant Multi-Format Exports: 1-click executive reporting in PDF, Excel (.xlsx), and CSV formats.',
      ],
      kpiNumber: '100%',
      kpiLabel: 'Server-Enforced Data Isolation',
    },
    platform: {
      role: 'Platform Super Admins',
      badge: 'Multi-Tenant Ecosystem',
      icon: Building2,
      headline: 'Platform-Level Tenant Governance & Growth Monitoring',
      description:
        'Manage and monitor multiple tenant organizations, provision new workspaces, suspend or reactivate accounts, and analyze cross-tenant growth metrics.',
      benefits: [
        'Multi-Organization Provisioning: Onboard new tenant companies in seconds with dedicated workspace slugs.',
        'Tenant Lifecycle Management: Suspend or reactivate organizations with instant session termination.',
        'Cross-Tenant Growth Intelligence: Monitor total tenant adoption, representative headcount, and active accounts.',
        'Strict Privacy Isolation: Zero access to private tenant customer leads, follow-ups, or commercial records.',
      ],
      kpiNumber: '< 5 min',
      kpiLabel: 'New Organization Provisioning',
    },
  };

  const testimonials = [
    {
      name: 'Sarah Jenkins',
      role: 'VP of Sales',
      company: 'Horizon Media Group',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      metric: '+42% Close Rate',
      quote:
        'We cut our average deal cycle from 28 days to 14 days. The daily task queue ensures no discovery call or proposal follow-up ever slips through the cracks.',
      rating: 5,
    },
    {
      name: 'Michael Chang',
      role: 'Founder & CEO',
      company: 'Summit Global Logistics',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      metric: '$14,000 Saved / Yr',
      quote:
        'Replacing our bloated enterprise CRM with Leadora saved our company thousands annually. The 7-stage Kanban is so intuitive that our new reps onboard in under 10 minutes.',
      rating: 5,
    },
    {
      name: 'Dr. Elena Rostova',
      role: 'Head of Commercial Operations',
      company: 'Vanguard Health Labs',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      metric: '5 hrs Saved / Rep / Wk',
      quote:
        'The multi-tenant isolation and 1-click Excel and PDF exports give our leadership exact revenue visibility without spending hours stitching spreadsheets together.',
      rating: 5,
    },
  ];

  const comparisonRows = [
    {
      feature: 'Visual Pipeline Tracking',
      spreadsheets: 'Flat rows, easily misformatted, zero stage visibility',
      legacyCrm: 'Complex, cluttered menus with steep learning curves',
      leadora: '7-stage visual Kanban board with drag-and-drop progression',
    },
    {
      feature: 'Follow-Up Task Management',
      spreadsheets: 'Manual reminders in calendars; high deal drop-off rate',
      legacyCrm: 'Requires expensive add-ons or complex automation chains',
      leadora: 'Built-in daily alerts for due-today and overdue actions',
    },
    {
      feature: 'Team & Role Access Boundaries',
      spreadsheets: 'None; anyone with link sees everything or breaks formulas',
      legacyCrm: 'Complex permissions locked behind top enterprise tiers',
      leadora: 'Built-in 4-tier role boundaries (Admin, Manager, Rep, Super Admin)',
    },
    {
      feature: 'Executive Reports & Data Exports',
      spreadsheets: 'Manual copy-pasting, formula corruption risk',
      legacyCrm: 'Limited exports or locked behind paid report builders',
      leadora: '1-click formatted PDF, Excel (.xlsx), and CSV exports',
    },
    {
      feature: 'Audit Trail & Interaction History',
      spreadsheets: 'No audit trail; cell overwrites are irreversible',
      legacyCrm: 'Separate audit logs with delayed synchronization',
      leadora: 'Immutable chronological activity feed for every lead lifecycle event',
    },
    {
      feature: 'Onboarding & Time to Launch',
      spreadsheets: 'Prone to human error from day one',
      legacyCrm: 'Weeks to months of setup, training, and consulting fees',
      leadora: 'Ready in under 5 minutes; zero training required',
    },
  ];

  const pricingPlans = [
    {
      name: 'Interactive Live Demo',
      badge: 'Free Forever • Instant Access',
      price: '$0',
      period: 'No credit card required',
      description: 'Explore the full Leadora platform with pre-populated leads, follow-ups, teams, and analytics.',
      highlight: false,
      ctaLabel: 'Test Drive Live Demo',
      ctaHref: '/demo',
      isModal: false,
      features: [
        'Full access to sample workspace',
        'Interactive 7-stage Kanban board',
        'Follow-up schedule & calendar queue',
        'Executive dashboard & KPI analytics',
        'Sample employee & team directory',
        'Zero setup or sign-up required',
      ],
    },
    {
      name: 'Growth Team',
      badge: 'Most Popular for SMBs',
      price: '$29',
      period: 'per representative / month',
      description: 'Everything growing sales teams need to centralize leads, coordinate managers, and close deals.',
      highlight: true,
      ctaLabel: 'Get Started with Growth',
      ctaHref: '/login',
      isModal: false,
      features: [
        'Unlimited leads & customer records',
        'Dedicated isolated organization workspace',
        '4-tier role permissions (Admin, Manager, Rep)',
        'Team structuring & manager workload balancing',
        'Automated daily follow-up reminder alerts',
        '1-click PDF, Excel & CSV report exports',
        'Real-time in-app notification center',
        'Immutable chronological audit logs',
      ],
    },
    {
      name: 'Custom Enterprise',
      badge: 'Multi-Entity Organizations',
      price: 'Custom',
      period: 'tailored to your organization',
      description: 'Advanced governance for multi-organization enterprises, conglomerates, and high-volume sales teams.',
      highlight: false,
      ctaLabel: 'Contact Sales',
      ctaHref: '#',
      isModal: true,
      features: [
        'All Growth Team capabilities included',
        'Multi-tenant organization provisioning',
        'Platform Super Admin governance console',
        'Custom currency & regional compliance',
        'Dedicated infrastructure scaling & backups',
        'Priority 24/7 SLA & dedicated onboarding',
        'Custom data retention policies',
      ],
    },
  ];

  const faqs = [
    {
      q: 'What is Leadora?',
      a: 'Leadora is a dedicated multi-tenant B2B Customer Relationship Management and Lead Management SaaS platform. It enables sales organizations to centralize prospective client information, coordinate sales teams, track deals across a 7-stage visual pipeline, schedule follow-ups, and analyze performance.',
    },
    {
      q: 'How does the Live Demo work?',
      a: 'The Live Demo is an interactive, read-only replica of a production workspace pre-populated with realistic sales leads, Kanban boards, follow-ups, and analytics. You can explore the user interface freely without providing an email, credit card, or undergoing onboarding.',
    },
    {
      q: 'Who can use Leadora?',
      a: 'Leadora is tailored for small and medium-sized businesses (SMBs), sales teams, and multi-organization enterprises. It provides customized interfaces for four distinct system roles: Platform Super Administrators, Organization Administrators, Sales Managers, and Sales Representatives.',
    },
    {
      q: 'What is a lead in Leadora?',
      a: 'A lead is a prospective client or sales opportunity. In Leadora, each lead record stores contact details (name, email, phone), company name, estimated deal value, lead source (Website, Referral, Cold Call, Event), priority level, assigned representative, and chronological interaction history.',
    },
    {
      q: 'Can multiple organizations use Leadora independently?',
      a: 'Yes. Leadora is built from the ground up on a multi-tenant database architecture. Every tenant organization is strictly isolated using database foreign keys and row-level tenant queries, ensuring that customer leads, employees, teams, and analytics are never shared or visible across tenants.',
    },
    {
      q: 'What user roles and permission boundaries are supported?',
      a: 'The system enforces four distinct roles: Super Admin (manages platform organizations and system status), Admin (full tenant control over settings, employees, teams, and data exports), Manager (manages designated sales teams, members, and team leads), and Employee (manages their own assigned leads, follow-up tasks, and personal reports).',
    },
  ];

  const activeSolution = roleSolutions[activeRoleTab];
  const ActiveRoleIcon = activeSolution.icon;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* --------------------------------------------------------------------- */}
      {/* 1. Navigation Bar                                                     */}
      {/* --------------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
            aria-label="Leadora Home"
          >
            <BrandLogo
              variant="full"
              size="md"
              theme="dark"
              showSubtitle
              subtitleText="CRM & Pipeline Platform"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-semibold text-slate-300">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-white transition-colors duration-150 py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-3">
            <Link
              to="/demo"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3.5 py-2 rounded-xl transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Live Demo</span>
            </Link>
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/25 transition-all transform active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-800 bg-slate-900/98 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-300">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
              <Link
                to="/demo"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explore Live Demo</span>
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* --------------------------------------------------------------------- */}
      {/* 2. Hero Section with Live Interface vs Video Walkthrough Toggle       */}
      {/* --------------------------------------------------------------------- */}
      <section className="relative pt-10 sm:pt-20 pb-12 sm:pb-20 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5 sm:space-y-8">
          {/* Tag Pill */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] sm:text-xs font-medium text-slate-300 max-w-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">Leadora Multi-Tenant Platform &bull; 7 Pipeline Stages</span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            Every Lead. Every Opportunity. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">
              One Unified Platform.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed px-1">
            Leadora is a modern multi-tenant CRM platform for lead management,
            sales pipeline tracking, team collaboration, follow-ups, and business analytics.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1 sm:pt-2 w-full sm:w-auto">
            <Link
              to="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Explore Live Demo</span>
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#solutions"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl transition"
            >
              <span>View Solutions</span>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-8 text-[11px] sm:text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span>No Credit Card Required</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span>Multi-Tenant Data Isolation</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span>Enterprise-Grade Encryption</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span>CSV, Excel & PDF Exports</span>
            </span>
          </div>

          {/* Hero Viewport Card with Mode Toggle */}
          <div className="pt-6 sm:pt-8 max-w-5xl mx-auto">
            <div className="relative rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-2xl overflow-hidden text-left p-3 sm:p-5">
              {/* Window Header Bar with View Switcher */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/70 text-xs">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/80 shrink-0" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80 shrink-0" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80 shrink-0" />
                  <span className="ml-2 font-mono text-slate-400 text-[11px] hidden sm:inline truncate">
                    app.leadora.io &mdash; Pipeline Command Center
                  </span>
                </div>

                {/* Switch between Mockup vs Product Showcase GIF */}
                <div className="flex items-center space-x-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setHeroViewMode('interface')}
                    className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-lg transition cursor-pointer ${
                      heroViewMode === 'interface'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Live Mockup
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroViewMode('gif')}
                    className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-lg transition cursor-pointer inline-flex items-center space-x-1 ${
                      heroViewMode === 'gif'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-emerald-300'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Watch Walkthrough</span>
                  </button>
                </div>
              </div>

              {/* View 1: Real Product Showcase GIF */}
              {heroViewMode === 'gif' ? (
                <div className="rounded-xl overflow-hidden border border-slate-700/70 bg-slate-950 aspect-video relative group animate-in fade-in duration-200">
                  <img
                    src="/assets/leadora-showcase.gif"
                    alt="Leadora CRM Product Showcase"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[11px] font-semibold text-emerald-400 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live Product Recording &bull; Drag & Drop Kanban</span>
                  </div>
                </div>
              ) : (
                /* View 2: High-Fidelity Mockup Dashboard */
                <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-200">
                  {/* Metric Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                    <div className="bg-slate-900/80 p-2.5 sm:p-3 rounded-xl border border-slate-800">
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 block truncate">Total Pipeline</span>
                      <span className="text-sm sm:text-lg font-bold text-white block truncate">$284,500</span>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 sm:p-3 rounded-xl border border-slate-800">
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 block truncate">Active Leads</span>
                      <span className="text-sm sm:text-lg font-bold text-blue-400 block truncate">42 Leads</span>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 sm:p-3 rounded-xl border border-slate-800">
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 block truncate">Follow-ups Today</span>
                      <span className="text-sm sm:text-lg font-bold text-amber-400 block truncate">6 Calls</span>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 sm:p-3 rounded-xl border border-slate-800">
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 block truncate">Win Rate</span>
                      <span className="text-sm sm:text-lg font-bold text-emerald-400 block truncate">68.4%</span>
                    </div>
                  </div>

                  {/* Pipeline Stages Strip Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 text-xs">
                    {/* Column 1: New */}
                    <div className="bg-slate-900/90 rounded-xl p-3 border-t-2 border-t-sky-500 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                        <span>NEW</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px]">12</span>
                      </div>
                      <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 space-y-1">
                        <p className="font-semibold text-white text-xs truncate">Horizon Media Group</p>
                        <p className="text-[11px] text-slate-400 truncate">Sarah Jenkins</p>
                        <div className="flex items-center justify-between pt-1 text-[10px]">
                          <span className="text-emerald-400 font-bold">$18,000</span>
                          <span className="text-slate-400">Website</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Qualified */}
                    <div className="bg-slate-900/90 rounded-xl p-3 border-t-2 border-t-amber-500 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                        <span>QUALIFIED</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px]">8</span>
                      </div>
                      <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 space-y-1">
                        <p className="font-semibold text-white text-xs truncate">Summit Global Logistics</p>
                        <p className="text-[11px] text-slate-400 truncate">Michael Chang</p>
                        <div className="flex items-center justify-between pt-1 text-[10px]">
                          <span className="text-emerald-400 font-bold">$34,500</span>
                          <span className="text-slate-400">Referral</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Proposal Sent */}
                    <div className="bg-slate-900/90 rounded-xl p-3 border-t-2 border-t-purple-500 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                        <span>PROPOSAL SENT</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px]">5</span>
                      </div>
                      <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 space-y-1">
                        <p className="font-semibold text-white text-xs truncate">Vanguard Health Labs</p>
                        <p className="text-[11px] text-slate-400 truncate">Dr. Elena Rostova</p>
                        <div className="flex items-center justify-between pt-1 text-[10px]">
                          <span className="text-emerald-400 font-bold">$52,000</span>
                          <span className="text-slate-400">Event</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 4: Won */}
                    <div className="bg-slate-900/90 rounded-xl p-3 border-t-2 border-t-emerald-500 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                        <span>WON</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px]">14</span>
                      </div>
                      <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 space-y-1">
                        <p className="font-semibold text-white text-xs truncate">Apex Cloud Networks</p>
                        <p className="text-[11px] text-slate-400 truncate">David Miller</p>
                        <div className="flex items-center justify-between pt-1 text-[10px]">
                          <span className="text-emerald-400 font-bold">$78,000</span>
                          <span className="text-emerald-400 font-bold">Closed Won</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 3. Customer Logo Trust Bar                                            */}
      {/* --------------------------------------------------------------------- */}
      <section className="border-y border-slate-800/80 bg-slate-950/60 py-6 sm:py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-4 text-center">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-slate-400">
            Trusted by 500+ High-Velocity Sales & Revenue Teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-75 grayscale hover:grayscale-0 transition-all duration-200">
            <div className="flex items-center space-x-2 text-slate-300 font-extrabold text-sm sm:text-base tracking-tight">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>APEX CLOUD</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 font-extrabold text-sm sm:text-base tracking-tight">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>VANGUARD HEALTH</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 font-extrabold text-sm sm:text-base tracking-tight">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>HORIZON MEDIA</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 font-extrabold text-sm sm:text-base tracking-tight">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span>BLUEWAVE LOGISTICS</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 font-extrabold text-sm sm:text-base tracking-tight">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>SUMMIT CAPITAL</span>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 4. Outcome Metrics Strip                                              */}
      {/* --------------------------------------------------------------------- */}
      <section className="bg-slate-900/90 py-8 sm:py-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-extrabold text-blue-400 font-mono">3.4x</div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Faster Lead Follow-Up</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-extrabold text-emerald-400 font-mono">7</div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Visual Pipeline Stages</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-extrabold text-indigo-400 font-mono">100%</div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Multi-Tenant Isolation</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-extrabold text-amber-400 font-mono">&lt; 1 sec</div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Instant Multi-Format Exports</p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 5. Core Features Section                                              */}
      {/* --------------------------------------------------------------------- */}
      <section id="features" className="py-20 bg-slate-950 border-t border-slate-800/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-500">
              Core CRM Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built for Pipeline Visibility & Sales Speed
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every tool your sales organization needs to capture leads, collaborate across teams,
              automate follow-ups, and generate executive reports.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuresList.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-3 hover:border-slate-700 hover:bg-slate-900/90 transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 6. Interactive Pipeline ROI / Recovery Calculator                     */}
      {/* --------------------------------------------------------------------- */}
      <section id="calculator" className="py-16 sm:py-20 bg-slate-900 border-t border-slate-800/80 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive ROI Calculator</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Calculate Your Recovered Pipeline Revenue
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Timely follow-ups and stage visibility prevent deals from stalling. See the revenue Leadora recovers for your sales team.
            </p>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xl">
            {/* Sliders Input Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Slider 1: Reps */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">Sales Representatives</span>
                  <span className="font-mono font-bold text-blue-400 text-sm">{roiReps} reps</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={roiReps}
                  onChange={(e) => setRoiReps(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1 rep</span>
                  <span>25 reps</span>
                  <span>50 reps</span>
                </div>
              </div>

              {/* Slider 2: Average Deal Size */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">Average Deal Value</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">${roiDealValue.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="500"
                  value={roiDealValue}
                  onChange={(e) => setRoiDealValue(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>$1,000</span>
                  <span>$25,000</span>
                  <span>$50,000+</span>
                </div>
              </div>

              {/* Slider 3: Deals per rep/year */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">Annual Deals Handled Per Rep</span>
                  <span className="font-mono font-bold text-indigo-400 text-sm">{roiDealsPerRep} deals</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={roiDealsPerRep}
                  onChange={(e) => setRoiDealsPerRep(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>10 deals</span>
                  <span>50 deals</span>
                  <span>100 deals</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-900/90 rounded-xl border border-slate-800 p-5 sm:p-6 space-y-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Estimated Annual Revenue Recovered
              </span>

              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tracking-tight">
                ${annualRecoveredRevenue.toLocaleString()}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">Stalled Deals Saved</span>
                  <span className="font-bold font-mono text-white text-sm">{recoveredDeals} deals</span>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">Estimated ROI</span>
                  <span className="font-bold font-mono text-emerald-400 text-sm">{roiMultiplier}x Return</span>
                </div>
              </div>

              <Link
                to="/demo"
                className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recover This in Live Demo</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 7. Role-Based Solutions Section                                       */}
      {/* --------------------------------------------------------------------- */}
      <section id="solutions" className="py-14 sm:py-20 bg-slate-950 border-t border-slate-800/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-500">
              Tailored for Every Role
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built for Your Entire Sales Hierarchy
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              From front-line sales representatives to multi-organization platform administrators,
              Leadora delivers tailored interfaces with purpose-built permissions.
            </p>
          </div>

          {/* Role Tab Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto w-full">
            {[
              { id: 'rep', label: 'Sales Representatives', icon: Briefcase },
              { id: 'manager', label: 'Sales Managers', icon: Users2 },
              { id: 'admin', label: 'Business Owners & Admins', icon: Crown },
              { id: 'platform', label: 'Platform Super Admins', icon: Building2 },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeRoleTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveRoleTab(tab.id)}
                  className={`inline-flex items-center justify-center space-x-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer w-full sm:w-auto ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <TabIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Role Content Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-8 lg:p-10 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="lg:col-span-8 space-y-4 sm:space-y-5">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-bold">
                  <ActiveRoleIcon className="w-3.5 h-3.5" />
                  <span>{activeSolution.badge}</span>
                </div>

                <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                  {activeSolution.headline}
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {activeSolution.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                  {activeSolution.benefits.map((b) => (
                    <div key={b} className="flex items-start space-x-2 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 bg-slate-950 rounded-xl border border-slate-800 p-4 sm:p-6 text-center space-y-2 sm:space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
                  <ActiveRoleIcon className="w-6 h-6" />
                </div>
                <div className="text-2xl sm:text-4xl font-extrabold text-white font-mono">
                  {activeSolution.kpiNumber}
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {activeSolution.kpiLabel}
                </p>
                <div className="pt-2">
                  <Link
                    to="/demo"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                  >
                    <span>Try it in Live Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 8. Customer Testimonials & Social Proof Grid                          */}
      {/* --------------------------------------------------------------------- */}
      <section id="testimonials" className="py-16 sm:py-20 bg-slate-900 border-t border-slate-800/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Customer Success Stories</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Loved by High-Velocity Revenue Teams
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Read how real sales leaders and business owners accelerated deal velocity and cut administrative overhead with Leadora.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
              >
                <div className="space-y-3">
                  {/* Star Rating & KPI Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-amber-400">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {t.metric}
                    </span>
                  </div>

                  {/* Quote */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center space-x-3 pt-4 border-t border-slate-800/80">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{t.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{t.role} &bull; {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 9. Comparison Matrix Section                                          */}
      {/* --------------------------------------------------------------------- */}
      <section id="comparison" className="py-14 sm:py-20 bg-slate-950 border-t border-slate-800/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-500">
              Clear Comparison
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why Teams Choose Leadora
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              See how Leadora stacks up against messy spreadsheets and bloated legacy CRM suites.
            </p>
          </div>

          {/* Mobile Swipe Cue */}
          <div className="sm:hidden flex items-center justify-end space-x-1 text-[11px] text-slate-400 mb-1">
            <span>Scroll horizontally to view full matrix</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
                <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
                  <thead className="bg-slate-950">
                    <tr>
                      <th className="px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-slate-300 uppercase tracking-wider text-[11px]">Capability</th>
                      <th className="px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Scattered Spreadsheets</th>
                      <th className="px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Legacy Enterprise CRMs</th>
                      <th className="px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-emerald-400 uppercase tracking-wider text-[11px] bg-slate-800/60">Leadora CRM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {comparisonRows.map((row) => (
                      <tr key={row.feature} className="hover:bg-slate-800/50 transition">
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 font-semibold text-white whitespace-nowrap">
                          {row.feature}
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-slate-400 min-w-[180px]">
                          <span className="text-rose-400 mr-1.5 font-bold">&times;</span>
                          {row.spreadsheets}
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-slate-400 min-w-[180px]">
                          <span className="text-amber-400 mr-1.5 font-bold">&sim;</span>
                          {row.legacyCrm}
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 font-medium text-emerald-300 bg-slate-800/40 min-w-[200px]">
                          <span className="text-emerald-400 font-bold mr-1.5">&#10003;</span>
                          {row.leadora}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 10. Enterprise Security & Reliability Section                         */}
      {/* --------------------------------------------------------------------- */}
      <section id="security" className="py-14 sm:py-20 bg-slate-900 border-t border-slate-800/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-500">
              Enterprise Trust & Compliance
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Enterprise Security in Every Layer
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Built from the foundation with strict isolation and data sovereignty to protect customer records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Row-Level Tenant Isolation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero data leakage across organizations. Every database operation enforces server-side tenant scoping.
              </p>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Immutable Audit Trail</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every customer call, email note, stage transition, and reassignment is permanently timestamped and logged.
              </p>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Session Protection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tokens are stored in memory with automatic rotation and instant revocation if accounts are deactivated.
              </p>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Sanitized Data Exports</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                CSV and Excel downloads feature formula injection defense and memory-bounded streaming limits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 11. Pricing & Plans Section (with Working Contact Sales Modal)         */}
      {/* --------------------------------------------------------------------- */}
      <section id="pricing" className="py-14 sm:py-20 bg-slate-950 border-t border-slate-800/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-500">
              Simple & Transparent Pricing
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Invest in Sales Velocity
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Start with our zero-risk interactive demo or scale your entire sales team today.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-5 sm:p-7 space-y-5 sm:space-y-6 flex flex-col justify-between transition ${
                  plan.highlight
                    ? 'bg-slate-900 border-2 border-blue-500 shadow-2xl shadow-blue-500/20 relative'
                    : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
                    Recommended
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-blue-400">{plan.badge}</span>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl sm:text-4xl font-black text-white font-mono">{plan.price}</span>
                      <span className="text-xs text-slate-400">/{plan.period}</span>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-2.5 pt-3 sm:pt-4 border-t border-slate-800">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start space-x-2 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 sm:pt-6">
                  {plan.isModal ? (
                    <button
                      type="button"
                      onClick={() => setIsContactModalOpen(true)}
                      className="w-full py-3 rounded-xl text-xs font-bold text-center flex items-center justify-center space-x-2 transition bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    >
                      <span>{plan.ctaLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Link
                      to={plan.ctaHref}
                      className={`w-full py-3 rounded-xl text-xs font-bold text-center flex items-center justify-center space-x-2 transition ${
                        plan.highlight
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <span>{plan.ctaLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 12. FAQ Section                                                       */}
      {/* --------------------------------------------------------------------- */}
      <section id="faq" className="py-14 sm:py-20 bg-slate-900 border-t border-slate-800/80 scroll-mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-500">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything You Need to Know
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Clear answers regarding multi-tenancy, user roles, security, and sales workflows.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-sm sm:text-base font-bold text-white hover:text-blue-400 transition cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-4 ${
                        isOpen ? 'rotate-180 text-blue-400' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 13. Call to Action Banner                                             */}
      {/* --------------------------------------------------------------------- */}
      <section className="py-12 sm:py-16 bg-blue-600 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 sm:space-y-6 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Accelerate Your Sales Pipeline Today
          </h2>
          <p className="text-xs sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed px-2">
            Experience visual pipeline management and multi-tenant data governance.
            Explore the live interactive demo or access your portal.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
            <Link
              to="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl shadow-xl transition transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Explore Live Demo (Instant)</span>
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-xs sm:text-sm font-bold bg-white text-blue-600 hover:bg-slate-100 px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl shadow-xl transition transform active:scale-95"
            >
              <span>Access Your CRM Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 14. Footer                                                            */}
      {/* --------------------------------------------------------------------- */}
      <footer className="bg-slate-950 border-t border-slate-800 text-xs text-slate-400 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <BrandLogo
              variant="full"
              size="sm"
              theme="dark"
              showSubtitle
              subtitleText="Every Lead. Every Opportunity."
            />

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs">
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#solutions" className="hover:text-white transition">Solutions</a>
              <a href="#calculator" className="hover:text-white transition">ROI Calculator</a>
              <a href="#testimonials" className="hover:text-white transition">Reviews</a>
              <a href="#comparison" className="hover:text-white transition">Comparison</a>
              <a href="#security" className="hover:text-white transition">Security</a>
              <a href="#pricing" className="hover:text-white transition">Pricing</a>
              <a href="#faq" className="hover:text-white transition">FAQ</a>
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                Portal Sign In
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-slate-500">
            <p>&copy; {new Date().getFullYear()} Leadora Inc. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1">
              <span>Multi-Tenant Architecture</span>
              <span className="hidden sm:inline">&bull;</span>
              <span>Enterprise Security</span>
              <span className="hidden sm:inline">&bull;</span>
              <span>High-Availability Cloud</span>
            </div>
          </div>
        </div>
      </footer>

      {/* --------------------------------------------------------------------- */}
      {/* 15. Enterprise Contact Sales Modal                                    */}
      {/* --------------------------------------------------------------------- */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Contact Enterprise Sales"
        description="Connect with our sales engineering team for custom multi-tenant provisioning, dedicated SLA agreements, and tailored migration."
        size="md"
      >
        {isContactSubmitted ? (
          <div className="py-8 text-center space-y-3 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Inquiry Received!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Thank you for reaching out, {contactForm.name}. A Leadora enterprise specialist will contact your team at{' '}
              <strong className="text-slate-800">{contactForm.email}</strong> within 1 business day.
            </p>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Work Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Acme Global Inc"
                  value={contactForm.company}
                  onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Sales Team Headcount
                </label>
                <select
                  value={contactForm.teamSize}
                  onChange={(e) => setContactForm({ ...contactForm, teamSize: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10"
                >
                  <option value="5-15">5 - 15 representatives</option>
                  <option value="15-50">15 - 50 representatives</option>
                  <option value="50-200">50 - 200 representatives</option>
                  <option value="200+">200+ representatives</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Project Requirements or Questions
              </label>
              <textarea
                rows={3}
                placeholder="Tell us about your sales workflow, current CRM, and requirements..."
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10"
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsContactModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={Send}
              >
                Submit Enterprise Inquiry
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* --------------------------------------------------------------------- */}
      {/* 16. Floating Mobile Sticky Demo Pill                                  */}
      {/* --------------------------------------------------------------------- */}
      {showMobileStickyCta && (
        <div className="sm:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-3 duration-200 w-[90%] max-w-sm">
          <Link
            to="/demo"
            className="w-full py-3 px-4 rounded-full bg-emerald-600/95 hover:bg-emerald-500 backdrop-blur-md text-white font-bold text-xs flex items-center justify-between shadow-2xl shadow-emerald-950/60 border border-emerald-400/40 active:scale-95 transition"
          >
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>Explore Live Demo Workspace</span>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-200" />
          </Link>
        </div>
      )}
    </div>
  );
}
