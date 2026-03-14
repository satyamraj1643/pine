import { NavLink } from "react-router-dom";
import Navbar from "../components/Navbar";
import Pine from "../assets/pine-transparent.png";

const Hero = () => (
  <div className="min-h-screen flex flex-col bg-[rgb(var(--background))] text-[rgb(var(--copy-primary))]">
    <Navbar />
    <style>{`
      @keyframes hero-fade-up {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes hero-fade-in {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .anim-fade-up   { animation: hero-fade-up .7s ease-out both; }
      .anim-fade-up-2 { animation: hero-fade-up .7s ease-out .12s both; }
      .anim-fade-up-3 { animation: hero-fade-up .7s ease-out .24s both; }
      .anim-fade-in   { animation: hero-fade-in .8s ease-out .5s both; }
      .anim-fade-in-2 { animation: hero-fade-in .8s ease-out .7s both; }
    `}</style>

    {/* ── Hero ── */}
    <section className="relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(var(--cta), .04) 0%, transparent 70%)" }} />

      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-8 lg:pt-32 lg:pb-12">
        <h1 className="anim-fade-up font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.08] tracking-tight max-w-2xl">
          Your thoughts,
          <br />
          beautifully organized.
        </h1>

        <p className="anim-fade-up-2 mt-6 text-base lg:text-lg text-[rgb(var(--copy-secondary))] max-w-md leading-relaxed mx-auto">
          Pine is a personal journal built for clarity. Write notes, track your moods, and reflect on what matters — all in one calm space.
        </p>

        <div className="anim-fade-up-3 flex items-center justify-center gap-3 mt-10">
          <NavLink to="/signup" className="px-7 py-3 rounded-lg text-[15px] font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
            Start writing
          </NavLink>
          <NavLink to="/login" className="px-6 py-3 rounded-lg text-[15px] font-medium border border-[rgb(var(--border))] text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--surface))] hover:border-[rgb(var(--copy-muted))] transition-all">
            Sign in
          </NavLink>
        </div>
      </div>
    </section>

    {/* ── App Preview ── */}
    <section className="anim-fade-in px-4 lg:px-10 xl:px-20 pt-6 pb-20 w-full">
      <div className="max-w-5xl mx-auto rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] shadow-2xl overflow-hidden ring-1 ring-black/[.03]">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        </div>

        <div className="flex min-h-[380px]">
          {/* Sidebar — matches real SideBar.tsx structure */}
          <div className="w-[200px] border-r border-[rgb(var(--border))] bg-[rgb(var(--surface))] hidden md:flex flex-col">
            <div className="flex-1 px-2.5 pt-4">
              {/* Workspace header */}
              <div className="flex items-center gap-2.5 mb-5 px-3">
                <img src={Pine} alt="" className="w-5 h-5" />
                <span className="text-[14px] font-bold text-[rgb(var(--copy-primary))] tracking-tight">Pine</span>
              </div>

              {/* New note button */}
              <div className="flex items-center gap-2.5 px-3 py-2 mb-5 rounded-lg bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                <span className="text-[13px] font-medium">New note</span>
              </div>

              {/* Main nav */}
              <div className="space-y-0.5">
                {[
                  { label: "Home", active: true, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
                  { label: "Notes", active: false, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg> },
                  { label: "Notebooks", active: false, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg> },
                  { label: "Favorites", active: false, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> },
                ].map((item) => (
                  <div key={item.label} className={`flex items-center gap-2.5 text-[13px] px-3 py-[7px] rounded-md ${item.active ? "bg-[rgb(var(--copy-primary))]/[0.08] text-[rgb(var(--copy-primary))] font-medium" : "text-[rgb(var(--copy-secondary))]"}`}>
                    {item.icon}
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Organize group */}
              <div className="mt-6 mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--copy-muted))]">Organize</div>
              <div className="space-y-0.5">
                {[
                  { label: "Tags", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg> },
                  { label: "Moods", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg> },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5 text-[13px] px-3 py-[7px] rounded-md text-[rgb(var(--copy-secondary))]">
                    {item.icon}
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Insights group */}
              <div className="mt-6 mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--copy-muted))]">Insights</div>
              <div className="space-y-0.5">
                {[
                  { label: "Reflect", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> },
                  { label: "Archive", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></svg> },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5 text-[13px] px-3 py-[7px] rounded-md text-[rgb(var(--copy-secondary))]">
                    {item.icon}
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* User profile */}
            <div className="px-2.5 pb-4 pt-3 border-t border-[rgb(var(--border))]">
              <div className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-[rgb(var(--cta))] flex items-center justify-center text-[11px] font-bold text-[rgb(var(--cta-text))]">S</div>
                <span className="text-[13px] text-[rgb(var(--copy-secondary))]">Satyam</span>
              </div>
            </div>
          </div>

          {/* Main content — mirrors Home.tsx dashboard */}
          <div className="flex-1 px-8 py-8 max-w-2xl">
            {/* Greeting */}
            <div className="mb-6">
              <h2 className="text-xl font-serif font-bold text-[rgb(var(--copy-primary))]">Good morning, Satyam</h2>
              <p className="text-[12px] text-[rgb(var(--copy-muted))] mt-0.5">Saturday, March 14, 2026</p>
            </div>

            {/* Quick write */}
            <div className="mb-8 border border-dashed border-[rgb(var(--border))] rounded-lg px-4 py-3 text-[13px] text-[rgb(var(--copy-muted))] cursor-pointer hover:border-[rgb(var(--copy-muted))] transition-colors">
              Write a new note...
            </div>

            {/* Recent notes */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--copy-muted))]">Recent notes</span>
                <span className="text-[11px] text-[rgb(var(--cta))] cursor-pointer">View all</span>
              </div>
              <div className="space-y-0.5">
                {[
                  { title: "Morning walk by the river", notebook: "Daily Life", time: "2h ago", color: "#FF5722", starred: true },
                  { title: "Ideas for the weekend trip", notebook: "Travel Log", time: "1d ago", color: "#2196F3", starred: false },
                  { title: "Reflecting on last month", notebook: "Growth", time: "3d ago", color: "#4CAF50", starred: false },
                  { title: "Books that changed my perspective", notebook: "Reading", time: "5d ago", color: "#9C27B0", starred: true },
                ].map((note) => (
                  <div key={note.title} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-[rgb(var(--surface))] transition-colors cursor-pointer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--copy-muted))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="text-[13px] text-[rgb(var(--copy-primary))] truncate flex-1">{note.title}</span>
                    {note.starred && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="rgb(var(--warning))" stroke="rgb(var(--warning))" strokeWidth="1.5" className="flex-shrink-0">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    )}
                    <span className="text-[11px] text-[rgb(var(--copy-muted))] flex-shrink-0" style={{ color: note.color }}>{note.notebook}</span>
                    <span className="text-[11px] text-[rgb(var(--copy-muted))] flex-shrink-0">{note.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notebooks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--copy-muted))]">Notebooks</span>
                <span className="text-[11px] text-[rgb(var(--cta))] cursor-pointer">View all</span>
              </div>
              <div className="space-y-0.5">
                {[
                  { title: "Daily Life", notes: 12, color: "#FF5722", starred: false },
                  { title: "Travel Log", notes: 5, color: "#2196F3", starred: true },
                  { title: "Growth", notes: 8, color: "#4CAF50", starred: false },
                ].map((nb) => (
                  <div key={nb.title} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-[rgb(var(--surface))] transition-colors cursor-pointer">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: nb.color }} />
                    <span className="text-[13px] text-[rgb(var(--copy-primary))] flex-1">{nb.title}</span>
                    {nb.starred && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="rgb(var(--warning))" stroke="rgb(var(--warning))" strokeWidth="1.5" className="flex-shrink-0">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    )}
                    <span className="text-[11px] text-[rgb(var(--copy-muted))] flex-shrink-0">{nb.notes} notes</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Features ── */}
    <section className="anim-fade-in-2 px-6 lg:px-10 xl:px-20 py-20 w-full">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-serif text-2xl lg:text-3xl font-bold tracking-tight">Everything you need to journal consistently</h2>
          <p className="mt-3 text-sm lg:text-base text-[rgb(var(--copy-secondary))] max-w-lg mx-auto leading-relaxed">
            Simple tools designed to help you build a lasting writing habit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Notebooks & Notes",
              desc: "Organize entries into notebooks. Keep daily reflections, travel logs, or creative writing neatly separated.",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--cta))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              ),
            },
            {
              title: "Mood Tracking",
              desc: "Log how you feel with each entry. Spot patterns over time and understand what shapes your days.",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--cta))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              ),
            },
            {
              title: "Tags & Search",
              desc: "Tag entries with topics that matter to you. Find any note instantly with full-text search.",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--cta))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              ),
            },
            {
              title: "Private by Default",
              desc: "Your journal is yours alone. No social features, no public profiles, no data selling. Ever.",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--cta))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ),
            },
            {
              title: "AI Reflection",
              desc: "Get thoughtful prompts and gentle insights powered by AI to help you write deeper entries.",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--cta))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ),
            },
            {
              title: "Export Anywhere",
              desc: "Download your entries as PDF or text whenever you want. Your data is never locked in.",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--cta))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              ),
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-[rgb(var(--copy-muted))] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[rgb(var(--surface))] border border-[rgb(var(--border))] flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-sm font-semibold text-[rgb(var(--copy-primary))] mb-1.5">{feature.title}</h3>
              <p className="text-[13px] text-[rgb(var(--copy-secondary))] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="px-6 lg:px-10 xl:px-20 py-20 w-full">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-2xl lg:text-3xl font-bold tracking-tight">Start your journal today</h2>
        <p className="mt-3 text-sm lg:text-base text-[rgb(var(--copy-secondary))] max-w-md mx-auto leading-relaxed">
          No credit card required. Your first entry is just a click away.
        </p>
        <div className="mt-8">
          <NavLink to="/signup" className="inline-block px-8 py-3 rounded-lg text-[15px] font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
            Create your account
          </NavLink>
        </div>
      </div>
    </section>

    {/* ── Footer ── */}
    <footer className="mt-auto text-center py-10 text-xs text-[rgb(var(--copy-muted))] border-t border-[rgb(var(--border))]">
      <div className="flex items-center justify-center gap-2 mb-2">
        <img src={Pine} alt="" className="w-4 h-4 opacity-40" />
        <span className="font-medium">Pine</span>
      </div>
      <div>&copy; {new Date().getFullYear()} Pine</div>
    </footer>
  </div>
);

export default Hero;
