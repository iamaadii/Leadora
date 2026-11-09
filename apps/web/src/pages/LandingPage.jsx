import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { BrandLogo } from '../components/brand/BrandLogo.jsx';
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
  Globe,
  TrendingUp,
  Clock,
} from 'lucide-react';

export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [activePreviewTab, setActivePreviewTab] = useState('kanban');

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

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'Preview', href: '#preview' },
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

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Create Your Organization',
      description:
        'Set up your isolated multi-tenant organization workspace with localized currency defaults and regional timezone settings.',
    },
    {
      step: '02',
      title: 'Add Your Sales Team',
      description:
        'Invite sales managers and representatives, assign staff to specific teams, and enforce organizational boundary rules.',
    },
    {
      step: '03',
      title: 'Manage & Assign Leads',
      description:
        'Capture leads from web, referral, or outreach channels. Assign leads to representatives with instant in-app notifications.',
    },
    {
      step: '04',
      title: 'Schedule Follow-ups',
      description:
        'Keep deals moving forward by scheduling follow-up calls and meetings with automated due-today and overdue reminder alerts.',
    },
    {
      step: '05',
      title: 'Track Performance & Export',
      description:
        'Gain real-time visibility into conversion funnels and rep performance, then export executive reports in PDF, Excel, or CSV.',
    },
  ];

  const faqs = [
    {
      q: 'What is Leadora?',
      a: 'Leadora is a dedicated multi-tenant B2B Customer Relationship Management and Lead Management SaaS platform. It enables sales organizations to centralize prospective client information, coordinate sales teams, track deals across a 7-stage visual pipeline, schedule follow-ups, and analyze performance.',
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
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-300">
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
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-900/98 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
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
      {/* 2. Hero Section                                                       */}
      {/* --------------------------------------------------------------------- */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6 sm:space-y-8">
          {/* Tag Pill */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Leadora Multi-Tenant SaaS &bull; 7 Pipeline Stages</span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            Every Lead. Every Opportunity. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">
              One Unified Platform.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Leadora is a modern multi-tenant CRM platform for lead management,
            sales pipeline tracking, team collaboration, follow-ups, and business analytics.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-sm font-semibold bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 px-6 py-3.5 rounded-xl transition"
            >
              <span>Explore Features</span>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Multi-Tenant Data Isolation</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Argon2 Password Hashing</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>CSV, Excel & PDF Exports</span>
            </span>
          </div>

          {/* Actual Application Interface Mockup Card */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="relative rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-2xl overflow-hidden text-left p-3 sm:p-5">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/70 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-slate-400 text-[11px] hidden sm:inline">
                    app.leadora.io &mdash; Pipeline Kanban
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-semibold border border-blue-500/30">
                    Acme Sales Corp &bull; USD ($)
                  </span>
                </div>
              </div>

              {/* Mockup Dashboard Content */}
              <div className="space-y-4">
                {/* Metric Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Pipeline</span>
                    <span className="text-base sm:text-lg font-bold text-white">$284,500</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Active Leads</span>
                    <span className="text-base sm:text-lg font-bold text-blue-400">42 Opportunities</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Follow-ups Today</span>
                    <span className="text-base sm:text-lg font-bold text-amber-400">6 Calls / Demos</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Win Rate</span>
                    <span className="text-base sm:text-lg font-bold text-emerald-400">68.4%</span>
                  </div>
                </div>

                {/* Pipeline Stages Strip Preview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                  {/* Column 1: New */}
                  <div className="bg-slate-900/90 rounded-xl p-3 border-t-2 border-t-sky-500 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                      <span>NEW</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px]">12</span>
                    </div>
                    <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 space-y-1">
                      <p className="font-semibold text-white text-xs">Horizon Media Group</p>
                      <p className="text-[11px] text-slate-400">Sarah Jenkins</p>
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
                      <p className="font-semibold text-white text-xs">Summit Global Logistics</p>
                      <p className="text-[11px] text-slate-400">Michael Chang</p>
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
                      <p className="font-semibold text-white text-xs">Vanguard Health Labs</p>
                      <p className="text-[11px] text-slate-400">Dr. Elena Rostova</p>
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
                      <p className="font-semibold text-white text-xs">Apex Cloud Networks</p>
                      <p className="text-[11px] text-slate-400">David Miller</p>
                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <span className="text-emerald-400 font-bold">$78,000</span>
                        <span className="text-emerald-400 font-bold">Closed Won</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 3. Features Section                                                   */}
      {/* --------------------------------------------------------------------- */}
      <section id="features" className="py-20 bg-slate-950 border-t border-slate-800/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-500">
              Core CRM Features
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built for Pipeline Visibility & Sales Speed
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every tool your sales team needs to capture leads, collaborate across teams,
              automate follow-ups, and generate executive reports.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuresList.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-3 hover:border-slate-700 hover:bg-slate-900/90 transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">
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
      {/* 4. How It Works Section                                               */}
      {/* --------------------------------------------------------------------- */}
      <section id="how-it-works" className="py-20 bg-slate-900 border-t border-slate-800/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-500">
              Streamlined Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              How Leadora Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              From workspace setup to executive analytics in five straightforward steps.
            </p>
          </div>

          {/* Steps Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {howItWorksSteps.map((s) => (
              <div
                key={s.step}
                className="bg-slate-950/60 rounded-2xl border border-slate-800 p-5 space-y-3 relative overflow-hidden"
              >
                <div className="text-2xl font-black text-blue-500/60 font-mono">
                  {s.step}
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 5. Benefits Section                                                   */}
      {/* --------------------------------------------------------------------- */}
      <section id="benefits" className="py-20 bg-slate-950 border-t border-slate-800/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-500">
              Business Impact
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why High-Growth Teams Choose Leadora
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Designed specifically to resolve the operational bottlenecks that slow sales cycles down.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Benefit 1 */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Centralize Customer Information</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Eliminate scattered spreadsheets and unrecorded outreach notes. Maintain one
                authoritative contact profile with company context, value estimation, and complete
                interaction logs.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
                <Users2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Coordinate Sales Teams</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empower sales managers with team-level oversight, balanced representative workloads,
                and unambiguous lead assignment without cross-team data leaks.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Track Progress & Conversion Velocity</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visually track prospective opportunities across 7 stages. Automated daily reminders
                ensure discovery calls and contract negotiations never slip past due dates.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Zero Task Neglect</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                In-app notification alerts automatically inform representatives of new leads and
                approaching follow-ups. Unread badges keep priorities front and center.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Instant Multi-Format Exports</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stream real-time exports of sales leads, conversions, representative metrics, and
                activity feeds directly into CSV, Excel, or formatted PDF documents.
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600/10 text-rose-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Multi-Tenant Data Isolation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Each organization operates in complete isolation. Row-level tenant filters, Argon2id
                password hashing, and HttpOnly JWT refresh rotation safeguard every account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 6. Product Preview Section                                            */}
      {/* --------------------------------------------------------------------- */}
      <section id="preview" className="py-20 bg-slate-900 border-t border-slate-800/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-500">
              Interactive Preview
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Authentic Application Workspaces
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Explore the actual interfaces sales reps and managers use every day.
            </p>
          </div>

          {/* View Tab Switcher */}
          <div className="flex justify-center">
            <div className="inline-flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActivePreviewTab('kanban')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  activePreviewTab === 'kanban'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pipeline Kanban
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('analytics')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  activePreviewTab === 'analytics'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Executive Analytics
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('exports')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  activePreviewTab === 'exports'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Exports & Reports
              </button>
            </div>
          </div>

          {/* Tab Views */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 max-w-4xl mx-auto">
            {activePreviewTab === 'kanban' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <span className="font-bold text-white">Visual 7-Stage Pipeline Board</span>
                  <span className="text-slate-400 text-[11px]">HTML5 Drag & Drop Enabled</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between font-bold text-slate-300">
                      <span>CONTACTED</span>
                      <span className="text-slate-500 font-mono">$42,000</span>
                    </div>
                    <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                      <p className="font-bold text-white text-xs">Atlas Robotics</p>
                      <p className="text-[11px] text-slate-400">Marcus Vance</p>
                      <span className="text-emerald-400 font-bold block pt-1">$22,000</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between font-bold text-slate-300">
                      <span>NEGOTIATION</span>
                      <span className="text-slate-500 font-mono">$65,000</span>
                    </div>
                    <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                      <p className="font-bold text-white text-xs">AeroDynamics Inc</p>
                      <p className="text-[11px] text-slate-400">Rebecca Stone</p>
                      <span className="text-emerald-400 font-bold block pt-1">$65,000</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between font-bold text-slate-300">
                      <span>WON</span>
                      <span className="text-slate-500 font-mono">$112,000</span>
                    </div>
                    <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                      <p className="font-bold text-white text-xs">BlueWave Maritime</p>
                      <p className="text-[11px] text-slate-400">Jason Reed</p>
                      <span className="text-emerald-400 font-bold block pt-1">$112,000</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'analytics' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <span className="font-bold text-white">Conversion & Revenue Velocity</span>
                  <span className="text-slate-400 text-[11px]">Real-Time Aggregates</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Won Revenue</span>
                    <span className="text-base font-bold text-emerald-400">$318,400</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Avg Deal Size</span>
                    <span className="text-base font-bold text-white">$24,492</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Lead Velocity</span>
                    <span className="text-base font-bold text-blue-400">+28.4%</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Completed Tasks</span>
                    <span className="text-base font-bold text-indigo-400">142</span>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'exports' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <span className="font-bold text-white">Export & Download Engine</span>
                  <span className="text-slate-400 text-[11px]">Zero Background Queues</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-center">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-blue-400 font-bold block text-sm">CSV Format</span>
                    <p className="text-[11px] text-slate-400">Instant spreadsheet ingestion and BI integration.</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-bold block text-sm">Excel (.xlsx)</span>
                    <p className="text-[11px] text-slate-400">Styled header rows, auto-width, and financial formatting.</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-rose-400 font-bold block text-sm">PDF Reports</span>
                    <p className="text-[11px] text-slate-400">Executive PDF layout with summary KPI cards and page counts.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 7. FAQ Section                                                        */}
      {/* --------------------------------------------------------------------- */}
      <section id="faq" className="py-20 bg-slate-950 border-t border-slate-800/80 scroll-mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
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
                  className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-bold text-white hover:text-blue-400 transition"
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
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 animate-in fade-in duration-150">
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
      {/* 8. Call to Action Banner                                              */}
      {/* --------------------------------------------------------------------- */}
      <section className="py-16 bg-blue-600 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Accelerate Your Sales Pipeline Today
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
            Sign in to your organization workspace or contact your system administrator
            to experience visual sales pipeline management.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-sm font-bold bg-white text-blue-600 hover:bg-slate-100 px-7 py-3.5 rounded-xl shadow-xl transition transform active:scale-95"
            >
              <span>Access Your CRM Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 9. Footer                                                             */}
      {/* --------------------------------------------------------------------- */}
      <footer className="bg-slate-950 border-t border-slate-800 text-xs text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <BrandLogo
              variant="full"
              size="sm"
              theme="dark"
              showSubtitle
              subtitleText="Every Lead. Every Opportunity."
            />

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
              <a href="#benefits" className="hover:text-white transition">Benefits</a>
              <a href="#faq" className="hover:text-white transition">FAQ</a>
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                Portal Sign In
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>&copy; {new Date().getFullYear()} Leadora Inc. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <span>Multi-Tenant Architecture</span>
              <span>&bull;</span>
              <span>Argon2 Security</span>
              <span>&bull;</span>
              <span>PostgreSQL 16</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
