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
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-6px); }
      }
      .anim-fade-up   { animation: hero-fade-up .7s ease-out both; }
      .anim-fade-up-2 { animation: hero-fade-up .7s ease-out .12s both; }
      .anim-fade-up-3 { animation: hero-fade-up .7s ease-out .24s both; }
      .anim-fade-up-4 { animation: hero-fade-up .7s ease-out .36s both; }
      .anim-fade-in   { animation: hero-fade-in .8s ease-out .5s both; }
      .anim-float     { animation: float 6s ease-in-out infinite; }
      .anim-float-2   { animation: float 6s ease-in-out 1s infinite; }
      .anim-float-3   { animation: float 6s ease-in-out 2s infinite; }
    `}</style>

    {/* ── Hero ── */}
    <section className="relative overflow-hidden">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(var(--cta), .05) 0%, transparent 70%)" }} />

      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-6 lg:pt-28 lg:pb-8">
        <div className="anim-fade-up inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] text-xs text-[rgb(var(--copy-secondary))] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--success))] animate-pulse" />
          Free &middot; Private &middot; Open journal
        </div>

        <h1 className="anim-fade-up-2 font-serif text-[clamp(2.5rem,6vw,4.75rem)] font-bold leading-[1.06] tracking-tight max-w-3xl">
          Write freely.
          <br />
          Reflect deeply.
        </h1>

        <p className="anim-fade-up-3 mt-5 text-lg lg:text-xl text-[rgb(var(--copy-secondary))] max-w-lg leading-relaxed mx-auto">
          A calm, personal journal to organize your thoughts, track your moods, and grow at your own pace.
        </p>

        <div className="anim-fade-up-4 flex items-center justify-center gap-3 mt-8">
          <NavLink to="/signup" className="px-6 py-2.5 rounded-lg text-[15px] font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
            Get started free &rarr;
          </NavLink>
          <NavLink to="/login" className="px-5 py-2.5 rounded-lg text-[15px] font-medium border border-[rgb(var(--border))] text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--surface))] hover:border-[rgb(var(--copy-muted))] transition-all">
            I have an account
          </NavLink>
        </div>

        {/* Feature chips */}
        <div className="anim-fade-in flex items-center justify-center flex-wrap gap-2 mt-10">
          {["Notebooks & notes", "Mood tracking", "Tags", "Private by default", "Free forever"].map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[rgb(var(--surface))] border border-[rgb(var(--border))] text-[rgb(var(--copy-secondary))]"
            >
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className="flex-shrink-0">
                <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="rgb(var(--cta))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>

    {/* ── Faux App Preview ── */}
    <section className="anim-fade-in px-4 lg:px-10 xl:px-20 pt-10 pb-24 w-full">
      <div className="max-w-6xl mx-auto rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] shadow-2xl overflow-hidden ring-1 ring-black/[.03]">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]">
          <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <span className="w-3 h-3 rounded-full bg-[#28C840]" />
          <span className="ml-4 text-[11px] text-[rgb(var(--copy-muted))] font-medium">Pine &mdash; My Notes</span>
        </div>
        <div className="flex min-h-[380px]">
          {/* Sidebar */}
          <div className="w-52 border-r border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3 hidden md:flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6 px-1">
                <img src={Pine} alt="" className="w-5 h-5" />
                <span className="text-xs font-bold text-[rgb(var(--copy-primary))]">Pine</span>
              </div>
              {[
                { label: "Home", active: false },
                { label: "Notes", active: true },
                { label: "Notebooks", active: false },
                { label: "Tags", active: false },
                { label: "Moods", active: false },
                { label: "Archives", active: false },
              ].map((item) => (
                <div key={item.label} className={`text-[12px] px-2.5 py-[6px] rounded-md mb-0.5 ${item.active ? "bg-[rgb(var(--background))] text-[rgb(var(--copy-primary))] font-medium shadow-sm" : "text-[rgb(var(--copy-muted))]"}`}>
                  {item.label}
                </div>
              ))}
            </div>
            <div className="text-[11px] text-[rgb(var(--copy-muted))] px-2">Settings</div>
          </div>

          {/* Main */}
          <div className="flex-1 p-6">
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <div className="text-xl font-serif font-bold text-[rgb(var(--copy-primary))]">My Notes</div>
                <div className="text-xs text-[rgb(var(--copy-muted))] mt-0.5">5 notes &middot; 1,847 words total</div>
              </div>
              <div className="px-3 py-1.5 rounded-md text-xs font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))]">+ New note</div>
            </div>
            {[
              { color: "#FF5722", title: "Morning walk by the river", mood: "😌", chapter: "Daily Life", date: "Today", words: "342" },
              { color: "#2196F3", title: "Ideas for the weekend trip", mood: "😊", chapter: "Travel Log", date: "Yesterday", words: "189" },
              { color: "#4CAF50", title: "Reflecting on last month", mood: "💭", chapter: "Growth", date: "Dec 18", words: "521" },
              { color: "#9C27B0", title: "Books that changed my perspective", mood: "🔥", chapter: "Reading", date: "Dec 15", words: "415" },
              { color: "#FF9800", title: "Gratitude for small things", mood: "🌿", chapter: "Daily Life", date: "Dec 12", words: "380" },
            ].map((entry, i) => (
              <div key={entry.title} className={`flex items-center gap-3 py-3 border-b border-[rgb(var(--border))] last:border-b-0 ${i < 3 ? (i === 0 ? "anim-float" : i === 1 ? "anim-float-2" : "anim-float-3") : ""}`} style={i < 3 ? { animationDuration: "6s" } : undefined}>
                <span className="w-[3px] h-8 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-[rgb(var(--copy-primary))] truncate">{entry.title}</span>
                    <span className="text-xs">{entry.mood}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[rgb(var(--copy-muted))]">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: entry.color + "15", color: entry.color }}>{entry.chapter}</span>
                    <span>{entry.date}</span>
                    <span>&middot;</span>
                    <span>{entry.words} words</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right panel — entry preview */}
          <div className="w-72 border-l border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5 hidden lg:block">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-[3px] h-5 rounded-full bg-[#FF5722]" />
              <span className="text-sm font-serif font-semibold text-[rgb(var(--copy-primary))]">Morning walk by the river</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: "#FF572215", color: "#FF5722" }}>Daily Life</span>
              <span className="text-[10px] text-[rgb(var(--copy-muted))]">Today</span>
              <span className="text-xs">😌</span>
            </div>
            <div className="text-xs text-[rgb(var(--copy-secondary))] leading-relaxed">
              The mist was still hanging low over the water when I stepped out. There's something about early mornings that makes the world feel brand new — the quiet, the cool air, the way light filters through the trees...
            </div>
            <div className="mt-4 flex gap-1.5">
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium border" style={{ borderColor: "#FF572240", backgroundColor: "#FF57220a", color: "#FF5722" }}>personal</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium border" style={{ borderColor: "#4CAF5040", backgroundColor: "#4CAF500a", color: "#4CAF50" }}>nature</span>
            </div>
            <div className="mt-4 pt-3 border-t border-[rgb(var(--border))]">
              <div className="text-[10px] text-[rgb(var(--copy-muted))]">342 words &middot; 2 min read</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Footer ── */}
    <footer className="mt-auto text-center py-8 text-xs text-[rgb(var(--copy-muted))] border-t border-[rgb(var(--border))]">
      <div className="flex items-center justify-center gap-2 mb-1">
        <img src={Pine} alt="" className="w-4 h-4 opacity-40" />
        <span>Pine</span>
      </div>
      <div>&copy; {new Date().getFullYear()} &middot; Free forever &middot; No ads</div>
    </footer>
  </div>
);

export default Hero;
