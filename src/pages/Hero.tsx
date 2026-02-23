import { NavLink } from "react-router-dom";
import Pine from "../assets/pine-transparent.png";

const Hero = () => (
  <div className="min-h-screen flex flex-col bg-[rgb(var(--background))] text-[rgb(var(--copy-primary))]">
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
      @keyframes bar-grow { from { width: 0; } }
      @keyframes grain-drift {
        0%   { transform: translate(0,0); }
        50%  { transform: translate(-2%,-1%); }
        100% { transform: translate(0,0); }
      }
      .anim-fade-up   { animation: hero-fade-up .7s ease-out both; }
      .anim-fade-up-2 { animation: hero-fade-up .7s ease-out .12s both; }
      .anim-fade-up-3 { animation: hero-fade-up .7s ease-out .24s both; }
      .anim-fade-up-4 { animation: hero-fade-up .7s ease-out .36s both; }
      .anim-fade-in   { animation: hero-fade-in .8s ease-out .5s both; }
      .anim-float     { animation: float 6s ease-in-out infinite; }
      .anim-float-2   { animation: float 6s ease-in-out 1s infinite; }
      .anim-float-3   { animation: float 6s ease-in-out 2s infinite; }
      .anim-bar-grow  { animation: bar-grow .8s ease-out both; }
      .bento-card {
        transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
      }
      .bento-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 32px -8px rgba(var(--cta), .10), 0 4px 12px -2px rgba(0,0,0,.05);
        border-color: rgba(var(--cta), .2);
      }
    `}</style>

    {/* ── Nav ── */}
    <header className="flex items-center justify-between px-6 lg:px-16 xl:px-24 h-14 border-b border-[rgb(var(--border))] backdrop-blur-sm bg-[rgba(var(--background),.85)] sticky top-0 z-50">
      <NavLink to="/" className="flex items-center gap-2">
        <img src={Pine} alt="Pine" className="w-6 h-6" />
        <span className="font-serif text-[15px] font-bold">Pine</span>
      </NavLink>
      <div className="flex items-center gap-5 text-sm">
        <NavLink to="/login" className="text-[rgb(var(--copy-secondary))] hover:text-[rgb(var(--copy-primary))] transition-colors">Log in</NavLink>
        <NavLink to="/signup" className="px-3.5 py-1.5 rounded-md font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-colors">Get Pine free</NavLink>
      </div>
    </header>

    {/* ── Hero ── */}
    <section className="relative overflow-hidden">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(var(--cta), .05) 0%, transparent 70%)" }} />

      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-6 lg:pt-28 lg:pb-8">
        <div className="anim-fade-up inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] text-xs text-[rgb(var(--copy-secondary))] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--success))] animate-pulse" />
          Free &middot; Private &middot; 19 themes
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
      </div>
    </section>

    {/* ── Faux App Preview — full width ── */}
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

    {/* ── Features headline ── */}
    <section className="px-6 text-center mb-14">
      <h2 className="font-serif text-3xl lg:text-4xl font-bold tracking-tight">
        Everything you need,<br />nothing you don't
      </h2>
      <p className="mt-3 text-[rgb(var(--copy-secondary))] text-base max-w-md mx-auto">
        Built for people who think better when they write.
      </p>
    </section>

    {/* ── Bento features — wider ── */}
    <section className="px-4 lg:px-10 xl:px-20 pb-24 w-full">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Wide: Chapters */}
        <div className="bento-card md:col-span-2 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8 overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--cta))] mb-2">Notebooks & Notes</p>
          <h3 className="font-serif text-xl font-semibold mb-1.5">Structure your thinking</h3>
          <p className="text-sm text-[rgb(var(--copy-secondary))] leading-relaxed max-w-sm mb-6">
            Group notes into notebooks, tag them with labels. Your journal, your structure.
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {[
              { color: "#FF5722", title: "Travel Log", count: 12, icon: "✈️" },
              { color: "#2196F3", title: "Work Notes", count: 8, icon: "💼" },
              { color: "#9C27B0", title: "Reading", count: 5, icon: "📚" },
              { color: "#4CAF50", title: "Growth", count: 14, icon: "🌱" },
              { color: "#FF9800", title: "Gratitude", count: 9, icon: "🙏" },
            ].map((ch) => (
              <div key={ch.title} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 min-w-[120px] hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default">
                <div className="w-full h-1 rounded-full mb-3" style={{ backgroundColor: ch.color }} />
                <div className="text-lg mb-1">{ch.icon}</div>
                <div className="text-xs font-semibold text-[rgb(var(--copy-primary))]">{ch.title}</div>
                <div className="text-[10px] text-[rgb(var(--copy-muted))]">{ch.count} notes</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tall: Moods */}
        <div className="bento-card row-span-2 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--warning))] mb-2">Moods</p>
            <h3 className="font-serif text-xl font-semibold mb-1.5">Capture how you feel</h3>
            <p className="text-sm text-[rgb(var(--copy-secondary))] leading-relaxed">
              Tag entries with emotions. See patterns emerge over time.
            </p>
          </div>
          <div className="mt-8 space-y-3">
            {[
              { emoji: "😌", name: "Calm", color: "#4CAF50", width: "75%" },
              { emoji: "😊", name: "Happy", color: "#FF9800", width: "60%" },
              { emoji: "🔥", name: "Driven", color: "#FF5722", width: "45%" },
              { emoji: "💭", name: "Reflective", color: "#9C27B0", width: "90%" },
              { emoji: "🌿", name: "Peaceful", color: "#8BC34A", width: "55%" },
            ].map((m, i) => (
              <div key={m.name} className="flex items-center gap-2.5">
                <span className="text-base w-5 text-center">{m.emoji}</span>
                <span className="text-[11px] text-[rgb(var(--copy-muted))] w-16">{m.name}</span>
                <div className="flex-1 h-2 bg-[rgb(var(--card))] rounded-full overflow-hidden">
                  <div className="h-full rounded-full anim-bar-grow" style={{ backgroundColor: m.color, width: m.width, animationDelay: `${i * 0.12}s` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collections */}
        <div className="bento-card rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--success))] mb-2">Tags</p>
          <h3 className="font-serif text-xl font-semibold mb-1.5">Tag & revisit</h3>
          <p className="text-sm text-[rgb(var(--copy-secondary))] leading-relaxed mb-4">Color-coded tags to find anything instantly.</p>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "personal", color: "#FF5722" },
              { name: "ideas", color: "#2196F3" },
              { name: "goals", color: "#4CAF50" },
              { name: "memories", color: "#9C27B0" },
              { name: "gratitude", color: "#FF9800" },
              { name: "health", color: "#E91E63" },
            ].map((t) => (
              <span key={t.name} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all hover:scale-105 cursor-default" style={{ borderColor: t.color + "40", backgroundColor: t.color + "0a", color: t.color }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                {t.name}
              </span>
            ))}
          </div>
        </div>

        {/* Themes */}
        <div className="bento-card rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--accent))] mb-2">Themes</p>
          <h3 className="font-serif text-xl font-semibold mb-1.5">Make it yours</h3>
          <p className="text-sm text-[rgb(var(--copy-secondary))] leading-relaxed mb-4">19 hand-crafted themes. Write in the mood that suits you.</p>
          <div className="flex gap-2">
            {[
              { colors: ["#fcfaf5", "#f7f4ee", "#3a352f", "#a88b6c"], name: "Clean Girl" },
              { colors: ["#080810", "#121220", "#f0eeff", "#ff69b4"], name: "Y2K Dark" },
              { colors: ["#fdfaf3", "#f7f1e6", "#483c30", "#8b7355"], name: "Cottage" },
              { colors: ["#f5f8f4", "#ebf2e9", "#374437", "#6e876e"], name: "Sage" },
              { colors: ["#fffafc", "#fff0f8", "#5f324b", "#ff82b4"], name: "Y2K Pink" },
              { colors: ["#120c19", "#1c1426", "#f8f0ff", "#b478ff"], name: "Grape" },
            ].map((swatch, i) => (
              <div key={i} className="group cursor-default">
                <div className="w-8 h-12 rounded-lg overflow-hidden border border-[rgb(var(--border))] shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all">
                  {swatch.colors.map((color, j) => (
                    <div key={j} className="h-1/4" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <div className="text-[10px] text-[rgb(var(--copy-muted))] text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{swatch.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ── Social proof — full width bar ── */}
    <section className="border-y border-[rgb(var(--border))] bg-[rgb(var(--surface))] py-8">
      <div className="flex items-center justify-center gap-10 flex-wrap text-[rgb(var(--copy-muted))] text-sm px-6">
        <div><span className="text-2xl font-bold text-[rgb(var(--copy-primary))]">19</span> <span className="text-xs">themes</span></div>
        <div className="w-px h-6 bg-[rgb(var(--border))]" />
        <div><span className="text-2xl font-bold text-[rgb(var(--copy-primary))]">100%</span> <span className="text-xs">free</span></div>
        <div className="w-px h-6 bg-[rgb(var(--border))]" />
        <div><span className="text-2xl font-bold text-[rgb(var(--copy-primary))]">0</span> <span className="text-xs">ads, ever</span></div>
        <div className="w-px h-6 bg-[rgb(var(--border))]" />
        <div><span className="text-2xl font-bold text-[rgb(var(--copy-primary))]">Private</span> <span className="text-xs">by default</span></div>
      </div>
    </section>

    {/* ── Bottom CTA ── */}
    <section className="relative text-center px-6 py-24 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(var(--cta), .06) 0%, transparent 70%)" }} />
      <div className="relative z-10 max-w-md mx-auto">
        <img src={Pine} alt="" className="w-12 h-12 mx-auto mb-6" />
        <h2 className="font-serif text-3xl lg:text-4xl font-bold tracking-tight mb-3">Start writing today</h2>
        <p className="text-[rgb(var(--copy-secondary))] mb-8 text-base leading-relaxed">
          Free forever. No credit card. No ads.<br />Your thoughts deserve a home.
        </p>
        <NavLink to="/signup" className="inline-block px-7 py-3 rounded-xl text-base font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
          Get Pine free &rarr;
        </NavLink>
      </div>
    </section>

    {/* ── Footer ── */}
    <footer className="text-center py-8 text-xs text-[rgb(var(--copy-muted))] border-t border-[rgb(var(--border))]">
      <div className="flex items-center justify-center gap-2 mb-2">
        <img src={Pine} alt="" className="w-4 h-4 opacity-40" />
        <span>Pine</span>
      </div>
      <div>&copy; {new Date().getFullYear()} Pine &middot; Made with care</div>
    </footer>
  </div>
);

export default Hero;
