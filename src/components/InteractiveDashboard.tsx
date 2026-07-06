import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck, 
  Clock, 
  MessageSquare,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../lib/apiClient";
import type { Booking } from "../lib/apiClient";

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "Qualified" | "Booked" | "Closed-Won";
  source: string;
  time: string;
  value: string;
  summary: string;
}

export default function InteractiveDashboard({ triggerRefresh }: { triggerRefresh?: number }) {
  const [activeTab, setActiveTab] = useState<"overview" | "leads" | "workflows">("overview");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadsList, setLeadsList] = useState<Lead[]>([
    {
      id: "L-9382",
      name: "Sarah Jenkins",
      email: "sarah@peakgrowth.co",
      company: "Peak Growth Services",
      status: "Closed-Won",
      source: "LeadFlow Widget",
      time: "10 mins ago",
      value: "$14,500/yr",
      summary: "Qualified: Verified annual revenue of $1.2M. Bottleneck is manual appointment scheduling for custom pool installs. AI Agent booked consultation directly."
    },
    {
      id: "L-9381",
      name: "Marcus Vance",
      email: "m.vance@vanceroofing.com",
      company: "Vance Premium Roofing",
      status: "Booked",
      source: "Hero Demo",
      time: "1 hour ago",
      value: "$8,200/yr",
      summary: "Qualified: Needs automated roof estimation and qualification workflow integrated with Zapier. Selected Wednesday 2:00 PM EST slot."
    },
    {
      id: "L-9380",
      name: "Elena Rostova",
      email: "elena@nordichaven.no",
      company: "Nordic Luxury Lodges",
      status: "Qualified",
      source: "LeadFlow Widget",
      time: "3 hours ago",
      value: "$12,000/yr",
      summary: "Qualified: Inquiring about a high-converting automated booking assistant for real estate portfolio. Wants multi-lingual support."
    }
  ]);

  // Read local bookings and dynamically inject them into the dashboard!
  useEffect(() => {
    const fetchLocalBookings = async () => {
      try {
        const bookings = await api.getBookings();
        if (bookings && bookings.length > 0) {
          const formattedBookings: Lead[] = bookings.map((b: Booking, index: number) => ({
            id: b.id || `BK-${index}`,
            name: b.name,
            email: b.email,
            company: b.company || "Independent",
            status: "Booked",
            source: "Book Demo Form",
            time: "Just now",
            value: "$9,600/yr",
            summary: `Qualified Lead: Interested in premium AI solutions. Scheduled for ${b.date} at ${b.time}. Notes: ${b.notes || "None"}`
          }));

          // Merge with existing but prevent duplicates
          setLeadsList(prev => {
            const filteredPrev = prev.filter(p => !formattedBookings.some(fb => fb.name === p.name));
            return [...formattedBookings, ...filteredPrev];
          });
        }
      } catch {
        // Dashboard works fine with seed data when API is unreachable
      }
    };

    fetchLocalBookings();
    const interval = setInterval(fetchLocalBookings, 5000);
    return () => clearInterval(interval);
  }, [triggerRefresh]);

  return (
    <div className="w-full bg-white border border-brand-slate-200 rounded-2xl shadow-xl overflow-hidden font-sans text-brand-navy">
      {/* Header Bar */}
      <div className="px-6 py-4 bg-brand-slate-50 border-b border-brand-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue via-brand-indigo to-brand-violet flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-brand-slate-400 font-semibold block">Flagship Product</span>
            <h4 className="font-bold text-base tracking-tight text-brand-navy">LeadFlow Business OS</h4>
          </div>
        </div>
        
        {/* Navigation Tab Pills */}
        <div className="flex bg-brand-slate-200/75 p-1 rounded-lg self-start sm:self-auto">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${activeTab === "overview" ? "bg-white text-brand-navy shadow-sm" : "text-brand-slate-500 hover:text-brand-navy"}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab("leads")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${activeTab === "leads" ? "bg-white text-brand-navy shadow-sm" : "text-brand-slate-500 hover:text-brand-navy"}`}
          >
            Live Leads ({leadsList.length})
          </button>
          <button 
            onClick={() => setActiveTab("workflows")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${activeTab === "workflows" ? "bg-white text-brand-navy shadow-sm" : "text-brand-slate-500 hover:text-brand-navy"}`}
          >
            AI Agent Settings
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 border border-brand-slate-200/80 rounded-xl bg-brand-slate-50/50 hover:bg-brand-slate-50 transition-colors">
                  <div className="flex justify-between items-start text-brand-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Conversion Rate</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight">34.2%</span>
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-md">+14.2%</span>
                  </div>
                  <p className="mt-1 text-xs text-brand-slate-400">vs. Industry Average 8.4%</p>
                </div>

                <div className="p-5 border border-brand-slate-200/80 rounded-xl bg-brand-slate-50/50 hover:bg-brand-slate-50 transition-colors">
                  <div className="flex justify-between items-start text-brand-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Qualified Leads</span>
                    <Users className="w-4 h-4 text-brand-indigo" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight">{245 + (leadsList.length - 3)}</span>
                    <span className="text-xs text-brand-indigo font-semibold bg-brand-indigo/10 px-1.5 py-0.5 rounded-md">Live Stream</span>
                  </div>
                  <p className="mt-1 text-xs text-brand-slate-400">Auto-qualified by conversational agent</p>
                </div>

                <div className="p-5 border border-brand-slate-200/80 rounded-xl bg-brand-slate-50/50 hover:bg-brand-slate-50 transition-colors">
                  <div className="flex justify-between items-start text-brand-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Estimated Revenue pipeline</span>
                    <DollarSign className="w-4 h-4 text-brand-violet" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight">${((245 + (leadsList.length - 3)) * 8200).toLocaleString()}</span>
                    <span className="text-xs text-brand-violet font-semibold bg-brand-violet/10 px-1.5 py-0.5 rounded-md">Valued</span>
                  </div>
                  <p className="mt-1 text-xs text-brand-slate-400">Weighted high-intent pipeline</p>
                </div>
              </div>

              {/* Central Section - Chart and Activity split */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 border border-brand-slate-200 rounded-xl p-5 bg-white relative overflow-hidden">
                  <h5 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-blue" />
                    AI Interaction Analytics (Last 7 Days)
                  </h5>
                  
                  {/* Decorative chart illustration using SVG so it scales elegantly */}
                  <div className="h-44 w-full flex items-end justify-between pt-4 relative">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                      {[1, 2, 3, 4].map(idx => (
                        <div key={idx} className="w-full border-t border-brand-slate-100" />
                      ))}
                    </div>
                    
                    {/* Simulated SVG Wave Graph */}
                    <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 400 150" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M 0,120 Q 50,70 100,90 T 200,40 T 300,60 T 400,20 L 400,150 L 0,150 Z" 
                        fill="url(#chartGradient)" 
                      />
                      <path 
                        d="M 0,120 Q 50,70 100,90 T 200,40 T 300,60 T 400,20" 
                        fill="none" 
                        stroke="#4F46E5" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                      />
                    </svg>

                    {/* Chart Points Hover Overlays */}
                    <div className="flex justify-between w-full px-2 z-10">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                        <div key={day} className="flex flex-col items-center gap-1 group cursor-pointer">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-brand-navy text-white text-[10px] py-0.5 px-1.5 rounded absolute -top-2 font-mono">
                            {idx === 6 ? "34.2%" : `${24 + idx * 2}%`}
                          </span>
                          <span className="font-mono text-[10px] text-brand-slate-400">{day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between text-xs border-t border-brand-slate-100 pt-3">
                    <span className="text-brand-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Median AI response latency: <strong>1.12 seconds</strong>
                    </span>
                    <span className="text-brand-indigo font-semibold flex items-center gap-1">
                      99.8% System SLA
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Right side activity feed */}
                <div className="lg:col-span-2 border border-brand-slate-200 rounded-xl p-5 bg-white flex flex-col">
                  <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-violet" />
                    Incoming Qualified Leads
                  </h5>

                  <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[180px] no-scrollbar">
                    {leadsList.map((lead) => (
                      <div 
                        key={lead.id}
                        onClick={() => {
                          setSelectedLead(lead);
                          setActiveTab("leads");
                        }}
                        className="p-3 bg-brand-slate-50 hover:bg-brand-slate-100/80 rounded-lg cursor-pointer transition-all border border-brand-slate-200/50 flex items-start gap-3 relative overflow-hidden group"
                      >
                        <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <div className={`mt-0.5 p-1 rounded ${
                          lead.status === "Closed-Won" ? "bg-emerald-50 text-emerald-700" :
                          lead.status === "Booked" ? "bg-brand-blue/5 text-brand-blue" : "bg-purple-50 text-purple-700"
                        }`}>
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-1">
                            <h6 className="font-bold text-xs truncate text-brand-navy group-hover:text-brand-blue transition-colors">
                              {lead.name}
                            </h6>
                            <span className="text-[10px] text-brand-slate-400 whitespace-nowrap">{lead.time}</span>
                          </div>
                          <p className="text-[10px] font-mono text-brand-slate-500 truncate">{lead.company}</p>
                          <div className="mt-1 flex gap-2 items-center">
                            <span className="text-[9px] font-semibold bg-white border border-brand-slate-200 px-1 py-0.2 rounded-full">
                              {lead.status}
                            </span>
                            <span className="text-[9px] text-emerald-700 font-mono font-medium">{lead.value}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setActiveTab("leads")}
                    className="mt-3 text-center text-xs text-brand-indigo font-semibold hover:text-brand-violet transition-colors flex items-center justify-center gap-1 group py-1.5 border border-dashed border-brand-slate-200 hover:border-brand-indigo/30 rounded-lg"
                  >
                    View Pipeline Details
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "leads" && (
            <motion.div 
              key="leads"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Leads Column */}
              <div className="md:col-span-1 border border-brand-slate-200 rounded-xl p-4 bg-white space-y-3 overflow-y-auto max-h-[380px] no-scrollbar">
                <span className="text-[10px] font-mono tracking-wider font-bold text-brand-slate-400 block uppercase mb-1">Live Pipeline Feed</span>
                {leadsList.map((lead) => (
                  <div 
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`p-3 rounded-lg cursor-pointer transition-all border ${
                      selectedLead?.id === lead.id 
                        ? "bg-brand-blue/5 border-brand-blue/30 shadow-sm" 
                        : "bg-brand-slate-50 border-brand-slate-200/50 hover:bg-brand-slate-100"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h6 className="font-bold text-xs">{lead.name}</h6>
                      <span className="text-[9px] font-mono text-brand-slate-400">{lead.time}</span>
                    </div>
                    <p className="text-[10px] font-mono text-brand-slate-500 mt-0.5">{lead.company}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                        lead.status === "Closed-Won" ? "bg-emerald-50 text-emerald-700" :
                        lead.status === "Booked" ? "bg-brand-blue/10 text-brand-blue" : "bg-purple-100 text-purple-700"
                      }`}>
                        {lead.status}
                      </span>
                      <span className="text-[10px] font-semibold font-mono text-brand-navy">{lead.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lead Details Frame */}
              <div className="md:col-span-2 border border-brand-slate-200 rounded-xl p-5 bg-white flex flex-col min-h-[300px]">
                {selectedLead || leadsList[0] ? (() => {
                  const lead = selectedLead || leadsList[0];
                  return (
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-brand-slate-100 pb-4 gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-semibold bg-brand-slate-100 text-brand-slate-600 px-2 py-0.5 rounded-md">
                              Lead ID: {lead.id}
                            </span>
                            <h5 className="font-bold text-lg tracking-tight mt-1 text-brand-navy">{lead.name}</h5>
                            <p className="text-xs text-brand-slate-500 mt-0.5">{lead.email} • {lead.company}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-brand-slate-400 font-medium">Source:</span>
                            <span className="text-xs font-semibold font-mono bg-brand-blue/5 text-brand-blue border border-brand-blue/20 px-2.5 py-1 rounded-lg">
                              {lead.source}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 space-y-4">
                          <div>
                            <span className="text-[10px] font-mono tracking-wider text-brand-slate-400 font-bold block uppercase">AI Conversation Outcome</span>
                            <div className="mt-2 p-4 bg-brand-slate-50/70 border border-brand-slate-200/80 rounded-xl text-xs text-brand-slate-700 leading-relaxed font-sans">
                              {lead.summary}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 border border-brand-slate-100 rounded-lg">
                              <span className="text-[9px] font-mono text-brand-slate-400 block uppercase font-bold">Estimated LTV</span>
                              <span className="text-sm font-bold text-emerald-600 font-mono block mt-1">{lead.value}</span>
                            </div>
                            <div className="p-3 border border-brand-slate-100 rounded-lg">
                              <span className="text-[9px] font-mono text-brand-slate-400 block uppercase font-bold">Engagement Status</span>
                              <span className="text-sm font-bold text-brand-navy block mt-1 flex items-center gap-1">
                                <ShieldCheck className="w-4 h-4 text-brand-indigo inline" />
                                fully Qualified
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-brand-slate-100 pt-4 mt-6 flex flex-wrap gap-2 items-center justify-between">
                        <span className="text-xs text-brand-slate-400">
                          Data verified by VV Networks Security Shield
                        </span>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => alert(`Contacting ${lead.name} via ${lead.email}... (Simulation Mode)`)}
                            className="bg-brand-navy hover:bg-brand-slate-800 text-white font-medium text-xs py-1.5 px-3 rounded-lg transition-all"
                          >
                            Open Contact Hub
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <Users className="w-10 h-10 text-brand-slate-300 mb-2" />
                    <p className="text-sm text-brand-slate-500 font-medium">Select a lead from the list to inspect AI transcript analysis.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "workflows" && (
            <motion.div 
              key="workflows"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="border border-brand-slate-200 rounded-xl p-5 bg-white">
                <h5 className="font-bold text-sm text-brand-navy flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-violet" />
                  LeadFlow Agent Configuration: LeadFlow AI
                </h5>
                <p className="text-xs text-brand-slate-500 mt-1">
                  Adjust behavior variables, integration hooks, and conversation routing targets for your AI lead engine.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-brand-slate-50 border border-brand-slate-200 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-brand-navy">Conversation Style Mode</span>
                      <span className="text-[10px] font-mono bg-brand-violet/10 text-brand-violet font-semibold px-2 py-0.5 rounded">
                        Active: Professional Consultative
                      </span>
                    </div>
                    <div className="w-full bg-brand-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-brand-indigo h-full w-4/5" />
                    </div>
                    <div className="flex justify-between text-[10px] text-brand-slate-400 font-mono">
                      <span>Casual</span>
                      <span>Consultative</span>
                      <span>Aggressive Sales</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-brand-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-brand-navy block">Calendar Integration</span>
                        <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-0.5">
                          <CheckCircle className="w-3 h-3" /> Enabled (Google/Outlook Hubs)
                        </span>
                      </div>
                      <span className="text-xs font-mono text-brand-slate-400">Sync Active</span>
                    </div>

                    <div className="p-4 border border-brand-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-brand-navy block">Dynamic Qualification Hooks</span>
                        <span className="text-[10px] text-brand-indigo font-medium flex items-center gap-0.5 mt-0.5">
                          <Sparkles className="w-3 h-3 animate-pulse" /> Active (Gemini Powered)
                        </span>
                      </div>
                      <span className="text-xs font-mono text-brand-slate-400">4 Filters</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-brand-slate-100 pt-4 flex justify-between items-center text-xs">
                  <span className="text-brand-slate-400">VV Networks LeadFlow Agent Engine v3.2.4-stable</span>
                  <span className="text-brand-indigo font-semibold cursor-pointer hover:underline">Deploy updates to widget</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
