import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  Award, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Flame,
  Layers, LayoutDashboard, Menu, MessageCircleQuestion, Moon, NotebookPen,
  Pause, Play, Search, Sun, Target, Trophy, Users, X, ArrowUp, Timer,
  Bookmark, TrendingUp, ShieldCheck, Zap, Globe2, Mail,
  Share2, ArrowRight,
} from 'lucide-react';
import { announcement, courses, partners, pricingPlans, searchCourses, testimonials } from './content';
import { submitWaitlistEmail } from './api';
import { track } from './analytics';
import { useTheme } from './hooks/useTheme';
import { useReveal } from './hooks/useReveal';
import { useCountUp } from './hooks/useCountUp';
import { useActivityFeed } from './hooks/useActivityFeed';
import { useScrollLock } from './hooks/useScrollLock';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { HyperOwl } from '../components/mascot/HyperOwl';
import owlWingsUpWebp from '../assets/mascot/owl-wings-up.webp';
import profilePhoto from '../../poeple/Screenshot 2026-11-20 134041.png';

const AUTH_URL = 'https://tutor-iota-silk.vercel.app/login';

function setOwlThinking(active: boolean) {
  window.dispatchEvent(new CustomEvent('owl:thinking', { detail: { active } }));
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a className="logo" href="#top" aria-label="Hyper Tutor home">
      <img src="/images/lumo.png" alt="" width="32" height="32" />
      {!compact && <span>Hyper Tutor</span>}
    </a>
  );
}

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useReveal<HTMLDivElement>();
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

function Announcement() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    try { setHidden(localStorage.getItem('ht-announcement-dismissed') !== null); } catch { /* ignore */ }
  }, []);
  if (hidden) return null;
  const dismiss = () => {
    setHidden(true);
    try { localStorage.setItem('ht-announcement-dismissed', String(Date.now())); } catch { /* ignore */ }
  };
  return (
    <div className="announcement" role="region" aria-label="Announcement">
      <div className="announcement-inner">
        <span className="announcement-text"><span aria-hidden="true">🦉</span>{announcement.text}</span>
        <a href={AUTH_URL}>{announcement.link}</a>
        <button className="icon-button" onClick={dismiss} aria-label="Dismiss announcement"><X size={18} /></button>
      </div>
    </div>
  );
}

function Navbar() {
  const { dark, toggle } = useTheme();
  const [menu, setMenu] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        event.preventDefault(); setSearch(true);
      }
      if (event.key === 'Escape') { setMenu(null); setDrawer(false); setSearch(false); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  useScrollLock(drawer);
  const openMenu = (name: string) => { setMenu(menu === name ? null : name); track('nav_item_open', { name }); };
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <nav className="nav-inner" aria-label="Primary">
          <Logo />
          <div className="desktop-nav">
            {['Product', 'Learners', 'Schools & Teams', 'Resources'].map((name) => (
              <button key={name} className="nav-link" aria-haspopup="true" aria-expanded={menu === name}
                onMouseEnter={() => setTimeout(() => setMenu(name), 150)} onClick={() => openMenu(name)}>{name}</button>
            ))}
            <a className="nav-link" href="#pricing">Pricing</a>
          </div>
          <div className="nav-actions">
            <button className="search-button" onClick={() => setSearch(true)} aria-label="Search courses"><Search size={17} /><span>Search courses…</span><kbd>/</kbd></button>
            <button className="icon-button theme-button" onClick={toggle} aria-label={dark ? 'Use light mode' : 'Use dark mode'}>{dark ? <Sun /> : <Moon />}</button>
            <a className="sign-in" href={AUTH_URL}>Sign in</a>
            <a className="primary-button nav-signup" href={AUTH_URL}>Sign up</a>
            <button className="icon-button menu-button" onClick={() => setDrawer(true)} aria-label="Open menu"><Menu /></button>
          </div>
        </nav>
        {menu && (
          <div className="mega-menu" role="menu" onMouseLeave={() => setMenu(null)}>
            <div className="mega-columns">
              {['Learn', 'Practise', 'Stay motivated'].map((column, index) => (
                <div key={column}>
                  <h3>{column}</h3>
                  {[
                    index === 0 ? ['Courses', 'Tell the AI your goal. Get a full roadmap.', BookOpen] :
                    index === 1 ? ['Quizicle', 'Adaptive quizzes that find your weak spots.', CheckCircle2] :
                    ['Streaks & XP', 'Show up daily. Level up.', Flame],
                    index === 0 ? ['Socratic Tutor', 'Guided questions that make you think.', MessageCircleQuestion] :
                    index === 1 ? ['Flashcards', 'Spaced repetition that remembers for you.', Layers] :
                    ['Daily Quests', 'Small goals with real rewards.', Target],
                    index === 0 ? ['Study Environment', 'Roadmap, notes, quizzes and timer in one place.', LayoutDashboard] :
                    index === 1 ? ['Notes & Library', 'AI-organised notes that never get lost.', NotebookPen] :
                    ['Achievements', 'Badges for your wins.', Trophy],
                  ].map((item) => {
                    const Icon = item[2] as typeof BookOpen;
                    return <a href="#platform" role="menuitem" className="mega-item" key={item[0] as string}><span className="mega-icon"><Icon size={18} /></span><span><b>{item[0] as string}</b><small>{item[1] as string}</small></span></a>;
                  })}
                </div>
              ))}
            </div>
            <a className="mega-footer" href="#platform">See all features →</a>
          </div>
        )}
      </header>
      {drawer && (
        <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="drawer-header"><Logo /><button className="icon-button" onClick={() => setDrawer(false)} aria-label="Close menu"><X /></button></div>
          <button className="drawer-search" onClick={() => { setDrawer(false); setSearch(true); }}><Search size={18} />Search courses…</button>
          {['Product', 'Learners', 'Schools & Teams', 'Resources'].map((name) => (
            <details key={name}><summary>{name}</summary><div className="drawer-links"><a href="#platform">Courses</a><a href="#audience">For your level</a><a href="#stories">Success stories</a></div></details>
          ))}
          <a className="drawer-row" href="#pricing">Pricing</a>
          <div className="drawer-actions"><a className="outline-button" href={AUTH_URL}>Sign in</a><a className="primary-button" href={AUTH_URL}>Sign up</a></div>
        </div>
      )}
      {search && <SearchModal onClose={() => setSearch(false)} />}
    </>
  );
}

function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const results = searchCourses.filter((name) => name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="search-modal" role="dialog" aria-modal="true" aria-label="Search courses">
        <div className="search-modal-input"><Search size={20} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search course topics…" /><button className="icon-button" onClick={onClose} aria-label="Close search"><X /></button></div>
        <div className="search-results">{results.map((name) => <button key={name} onClick={() => { onClose(); document.querySelector('#featured')?.scrollIntoView(); }}>{name}<ArrowRight size={16} /></button>)}</div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-circle circle-left" /><div className="hero-circle circle-right" />
      <Reveal className="hero-stack">
        <div className="eyebrow">New: courses built by AI, scheduled around your life</div>
        <h1 id="hero-title">Learning still starts with <span className="you">you<svg viewBox="0 0 180 18" aria-hidden="true"><path d="M3 13C46 3 132 3 177 11" /></svg></span></h1>
        <p className="hero-subhead">Hyper Tutor is the AI study platform that asks the right questions, builds your roadmap and keeps you showing up, whether you are chasing JAMB, a degree, or your next professional exam.</p>
        <div id="signup" className="email-capture email-hero"><a className="primary-button" href={AUTH_URL}>Start learning free</a></div>
        <button className="outline-button install-cta" onClick={() => document.querySelector('#install-card')?.scrollIntoView({ behavior: 'smooth' })}>Install the app</button>
        <p className="trust-copy">Free forever plan. No card needed. Works on any phone.</p>
        <p className="google-copy">or continue with <a href={AUTH_URL}>Google</a></p>
      </Reveal>
      <div className="hero-showcase">
        <HyperOwl className="hero-owl" pose="wings-up" size={320} />
        <Reveal className="walkthrough"><ProductWalkthrough /></Reveal>
      </div>
    </section>
  );
}

function ProductWalkthrough() {
  const [playing, setPlaying] = useState(true);
  return (
    <div className="browser-frame" aria-hidden="true">
      <div className="browser-bar"><span /><span /><span /><b>hypertutor.com.ng/courses</b></div>
      <div className="mock-app">
        <aside><Logo compact /><span /><span /><span /></aside>
        <main>
          <div className="mock-heading"><b>Create course</b><span>Saved</span></div>
          <div className="typed-title">WAEC Physics</div>
          <div className="chip-row"><b>Exam: WAEC</b><b>Level: SS3</b><b>Date: May</b></div>
          <div className="chat-row"><div className="chat tutor">Which topic makes you most nervous: waves, electricity or mechanics?</div><div className="chat learner">Electricity</div><div className="chat tutor">What happens to current when resistance increases?</div></div>
          <div className="roadmap"><div><b>Mon</b><i>Ohm’s Law<small>45 min</small></i></div><div><b>Tue</b><i>Series & Parallel<small>45 min</small></i></div><div><b>Wed</b><i>Electrical Power<small>45 min</small></i></div></div>
          <div className="pomodoro"><div className="pomodoro-ring">24:59</div><div className="xp"><b>Level 8</b><span><i /></span></div><div className="streak">🔥 +1 day</div></div>
        </main>
      </div>
      <button className="mock-control" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause product walkthrough' : 'Play product walkthrough'}>{playing ? <Pause /> : <Play />}</button>
      <span className="sr-only">Animated preview of creating a WAEC Physics course, answering Socratic questions, following a roadmap and starting a Pomodoro session.</span>
    </div>
  );
}

function ActivityBand() {
  const items = useActivityFeed();
  const iconMap = { Timer, Flame, CheckCircle2, Users, BookOpen, Award, Layers };
  return (
    <section className="activity-section" aria-labelledby="activity-title">
      <Reveal className="activity-grid">
        <div>
          <p className="ticker-label" id="activity-title"><span />Live from the Hyper Tutor community</p>
          <div className="ticker" aria-label="Illustrative community activity until real data is connected" title="Illustrative activity">
            {items.map((item, index) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap];
              return (
                <div className="activity-card" key={`${item.name}-${index}`}>
                  <img className={`avatar avatar-${index % 5}`} src={profilePhoto} alt="" />
                  <div><b>{item.name}</b> {item.action}<small>{index + 1} min ago</small></div>
                  <Icon size={18} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="stats">
          <Stat value="200M+" label="learners we're here to reach" />
          <Stat value="5 min" label="to a full course roadmap" />
          <Stat value="24/7" label="Socratic tutor, on any phone" />
        </div>
      </Reveal>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const target = value.startsWith('200') ? 200 : value.startsWith('5') ? 5 : value.startsWith('24') ? 24 : value.startsWith('1M') ? 1 : value.startsWith('85') ? 85 : 0;
  const { ref, value: count } = useCountUp(target);
  const display = value === '200M+' ? `${count}M+` : value === '5 min' ? `${count} min` : value === '24/7' ? '24/7' : value === '1M+' ? `${count}M+` : value === '85%' ? `${count}%` : value;
  return <div ref={ref} className="stat"><strong>{display}</strong><p>{label}</p><small>Illustrative</small></div>;
}

function AdaptiveSection() {
  const modes = ['Socratic', 'Worked example', 'Quiz me', 'Flashcards'] as const;
  const [mode, setMode] = useState<(typeof modes)[number]>('Socratic');
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    let index = 0;
    const timer = window.setInterval(() => {
      index = (index + 1) % modes.length;
      setMode(modes[index]);
    }, 6000);
    return () => clearInterval(timer);
  }, []);
  const interact = (value: (typeof modes)[number]) => { setMode(value); setFlipped(false); };
  return (
    <section className="section" id="how-it-works" aria-labelledby="adaptive-title">
      <Reveal className="two-column adaptive-grid">
        <div className="section-copy">
          <p className="kicker">Adaptive engine</p>
          <h2 id="adaptive-title">Let Hyper Tutor pick how you learn</h2>
          <p>Some topics need a worked example. Some need a hard question. Some need a flashcard at exactly the right moment. Our adaptive engine blends Socratic questioning, spaced repetition and practice quizzes to match your level, your gaps and your learning style.</p>
          <div className="button-row"><a className="primary-button" href={AUTH_URL}>Get started for free</a><a className="text-link" href="#how-it-works">See how it works →</a></div>
        </div>
        <div className="adaptive-card">
          <div className="meters"><span><b>Quality</b><i style={{ width: mode === 'Worked example' ? '92%' : '78%' }} /></span><span><b>Speed</b><i style={{ width: mode === 'Flashcards' ? '88%' : '65%' }} /></span><span><b>Effort</b><i style={{ width: mode === 'Socratic' ? '86%' : '70%' }} /></span></div>
          <div className="mode-tabs" role="tablist" aria-label="Learning modes">
            {modes.map((item) => <button role="tab" aria-selected={mode === item} key={item} onClick={() => interact(item)}>{item}</button>)}
          </div>
          <div className="mode-preview" key={mode}>
            {mode === 'Socratic' && <><div className="chat tutor">Why might a bigger load slow a motor down?</div><div className="reply-chip">It changes the current…</div><div className="chat tutor">What does that change do to the resistance effect?</div></>}
            {mode === 'Worked example' && <ol className="worked-example"><li>Power is P = VI</li><li>A larger load needs more I</li><li>Current increase creates extra losses</li><li>Available shaft speed falls</li></ol>}
            {mode === 'Quiz me' && <div className="quiz-options">{['A: It has less resistance', 'B: It draws more current', 'C: It stores more voltage'].map((option, index) => <button key={option} className={index === 1 ? 'correct' : index === 0 ? 'wrong' : ''} onClick={() => undefined}>{option}</button>)}</div>}
            {mode === 'Flashcards' && <button className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)} aria-label="Flip flashcard"><span>{flipped ? 'It increases motor current and losses.' : 'Why does a bigger load slow a motor down?'}</span></button>}
          </div>
          <HyperOwl className="adaptive-owl" pose="thinking" size={200} followCursor={false} />
        </div>
      </Reveal>
    </section>
  );
}

function PlatformSection() {
  return (
    <section className="section soft-section" id="platform" aria-labelledby="platform-title">
      <Reveal><p className="kicker centered">Built for real study</p><h2 className="section-title" id="platform-title">The Hyper Tutor platform</h2></Reveal>
      <div className="platform-grid">
        <Reveal className="platform-card mint-card">
          <div className="coded-roadmap"><div className="roadmap-top"><b>Day 3 of 21</b><span>68%</span></div><div className="week-grid">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => <div key={day}><b>{day}</b>{index < 4 && <i>{['Ohm’s Law', 'Circuits', 'Power', 'Review'][index]}</i>}</div>)}</div></div>
          <h3>Courses</h3><p>Tell the AI what you want to master. It interviews you, then builds a day-by-day roadmap around your real schedule.</p>
          <div className="card-links"><a href="/features/courses">Learn more</a><a href="#pricing">See plans and pricing</a></div>
        </Reveal>
        <Reveal className="platform-card violet-card">
          <div className="coded-chat"><div className="chat tutor">How does a stronger load change the motor’s current?</div><div className="chat learner">Does it require more energy?</div><span className="gap-chip">Knowledge gap spotted: Ohm’s Law vs power</span><div className="quick-actions"><b>Make a study plan</b><b>Schedule session</b><b>Practice questions</b></div></div>
          <h3>Socratic Companion</h3><p>A tutor that asks before it tells. It finds misconceptions, builds your understanding and never does your homework for you.</p>
          <div className="card-links"><a href="/features/socratic-companion">Learn more</a><a href="#pricing">See plans and pricing</a></div>
        </Reveal>
      </div>
    </section>
  );
}

function MoreWaysSection() {
  const tiles = [
    ['Study Environment', 'Roadmap, resources, notes, flashcards, quizzes and a focus timer in one calm workspace.', 'Explore the Study Environment', 'mint'],
    ['Quizicle', 'Adaptive quizzes that get harder as you get better and loop back to what you missed.', 'Explore Quizicle', 'coral'],
    ['Knowledge Gap Radar', 'We spot the topics you keep tripping on and bring them back at the right time.', 'Explore Knowledge Gaps', 'violet'],
    ['Academic Integrity', 'Built-in guardrails: guidance, hints and feedback, never a finished essay to copy.', 'Explore Integrity', 'sunshine'],
    ['Focus Rooms', 'Study alongside friends in live Pomodoro rooms. Cameras off, motivation on.', 'Explore Focus Rooms', 'sky'],
  ] as const;
  return (
    <section className="section" aria-labelledby="more-title">
      <Reveal><p className="kicker centered">One platform, many ways forward</p><h2 className="section-title" id="more-title">More ways to learn on Hyper Tutor</h2></Reveal>
      <div className="bento-grid">{tiles.map(([title, copy, link, accent], index) => (
        <Reveal className={`feature-tile tile-${index + 1} accent-${accent}`} key={title}>
          <div className="tile-visual">{index === 0 ? <div className="study-tools"><b>24:59</b><span>Notes</span><span>Flashcards</span><span>Quizicle</span></div> : index === 1 ? <div className="quiz-visual"><b>Question 7 of 12</b><i><span /></i><div><em /><em /><em /></div></div> : index === 2 ? <svg viewBox="0 0 180 140" aria-hidden="true"><polygon points="90,12 158,55 145,125 35,125 22,55" fill="none" stroke="currentColor" /><circle cx="90" cy="82" r="5" /><circle cx="145" cy="125" r="5" /><circle cx="35" cy="125" r="5" /></svg> : index === 3 ? <div className="shield-visual"><ShieldCheck /><small>Guidance, not a finished essay</small></div> : <div className="focus-visual"><span>AO</span><span>TN</span><span>CE</span><b>25:00</b></div>}</div>
          <h3>{title}</h3><p>{copy}</p><a href="#platform">{link} →</a>
        </Reveal>
      ))}</div>
    </section>
  );
}

function AudienceSection() {
  const tabs = [
    { name: 'Secondary school', bullets: ['Exam roadmaps for WAEC, NECO and JAMB', 'A tutor that explains like a patient teacher', 'Past-question style practice', 'Parent progress reports'], visual: 'JAMB countdown' },
    { name: 'University', bullets: ['Semester planners that respect your timetable', 'Notes and flashcards generated from your lecture material', 'Group study rooms', 'Deadline reminders that actually work'], visual: 'Semester plan' },
    { name: 'Professionals', bullets: ['Short daily sessions for busy schedules', 'Exam prep for ICAN, ACCA, CITN and more', 'Spaced repetition so it sticks', 'Progress you can prove'], visual: 'ICAN progress' },
    { name: 'Schools & teams', bullets: ['Class dashboards and knowledge-gap heatmaps', 'Assignments with integrity guardrails', 'Parent and teacher views', 'Roster import and bulk onboarding'], visual: 'Class heatmap' },
  ] as const;
  const [tab, setTab] = useState(0);
  const current = tabs[tab];
  return (
    <section className="section soft-section" id="audience" aria-labelledby="audience-title">
      <Reveal className="audience-heading"><p className="kicker centered">Choose your route</p><h2 id="audience-title">Whatever you're studying for, you can learn it on Hyper Tutor</h2><a className="primary-button" href={AUTH_URL}>Start free</a></Reveal>
      <div className="audience-tabs" role="tablist" aria-label="Audience">
        {tabs.map((item, index) => <button role="tab" aria-selected={tab === index} key={item.name} onClick={() => { setTab(index); track('audience_tab_change', { tab: item.name }); }}>{item.name}</button>)}
      </div>
      <Reveal className="audience-panel" key={current.name}>
        <ul>{current.bullets.map((bullet) => <li key={bullet}><CheckCircle2 />{bullet}</li>)}</ul>
        <div className="audience-visual"><span className="visual-label">{current.visual}</span>{tab === 0 && <><b>112 days left</b><div className="plan-row">Physics · 45 min</div><div className="plan-row">English · 30 min</div></>}{tab === 1 && <><b>Semester 4</b><div className="progress-line"><i style={{ width: '72%' }} /></div><div className="plan-row">Economics · Mon 3 PM</div></>}{tab === 2 && <><b>Taxation 68%</b><div className="progress-line violet-progress"><i style={{ width: '68%' }} /></div><div className="plan-row">Next module · Revenue</div></>}{tab === 3 && <><b>Class knowledge gaps</b><div className="heatmap">{[1,2,3,4,5,6,7,8,9].map((n) => <i className={`heat-${n % 3}`} key={n} />)}</div></>}</div>
      </Reveal>
      <div className="audience-cta">{tab === 3 ? <><a className="primary-button" href="/contact?type=schools">Start a school trial</a><a className="text-link" href="/contact">Talk to us</a></> : <a className="primary-button" href={AUTH_URL}>Start free</a>}</div>
    </section>
  );
}

function PricingTeaser() {
  return (
    <section className="pricing-teaser" id="pricing" aria-labelledby="pricing-title">
      <Reveal><p className="kicker centered">Simple pricing</p><h2 className="section-title" id="pricing-title">Start small. Learn as far as you want.</h2></Reveal>
      <div className="pricing-grid">
        {pricingPlans.map(({ name, price, note, features, action }) => (
          <Reveal className="price-card" key={name}>
            <h3>{name}</h3>
            <strong>{price}<span> /month</span></strong>
            {note && <small>{note}</small>}
            <ul className="price-features">{features.map((feature) => <li key={feature}><CheckCircle2 aria-hidden="true" />{feature}</li>)}</ul>
            <a className={name === 'Pro' ? 'primary-button' : 'outline-button'} href={AUTH_URL}>{action}</a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setSlide((value) => (value + 1) % testimonials.length), 8000);
    return () => clearInterval(timer);
  }, [paused]);
  const current = testimonials[slide];
  const move = (delta: number) => setSlide((value) => (value + delta + testimonials.length) % testimonials.length);
  return (
    <section className="section" id="testimonials" aria-labelledby="testimonial-title" aria-roledescription="carousel">
      <Reveal><p className="kicker centered">Illustrative stories</p><h2 className="section-title" id="testimonial-title">What learners say</h2></Reveal>
      <div className="testimonial-card" tabIndex={0} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
        onKeyDown={(event) => { if (event.key === 'ArrowLeft') move(-1); if (event.key === 'ArrowRight') move(1); }} aria-live="polite">
        <div className="quote-mark">“</div><blockquote key={slide}>{current.quote}</blockquote>
        <div className="quote-person"><img className={`avatar avatar-${slide}`} src={profilePhoto} alt="" /><div><b>{current.name}</b><small>{current.role}</small></div></div>
      </div>
      <div className="carousel-controls"><button className="icon-button" onClick={() => move(-1)} aria-label="Previous testimonial"><ChevronLeft /></button><div className="dots">{testimonials.map((_, index) => <button aria-label={`Show testimonial ${index + 1}`} aria-current={slide === index} key={index} onClick={() => setSlide(index)} />)}</div><button className="icon-button" onClick={() => move(1)} aria-label="Next testimonial"><ChevronRight /></button></div>
      <div className="proof-stats"><Stat value="1M+" label="study sessions completed" /><Stat value="85%" label="of learners improved quiz scores in 30 days" /></div>
    </section>
  );
}

function TrustedBy() {
  return (
    <section className="trust-section" aria-labelledby="trust-title">
      <h3 id="trust-title">Learners from these communities study with Hyper Tutor</h3>
      {/* These generic badges are placeholders; replace real partner logos only with written permission. */}
      <div className="partner-marquee"><div>{[...partners, ...partners].map((partner, index) => <span key={`${partner}-${index}`}><b>{partner.split(' ').map((word) => word[0]).join('').slice(0, 2)}</b>{partner}</span>)}</div></div>
    </section>
  );
}

function StoriesSection() {
  const stories = [
    { tag: 'Student', title: 'From 48% to 81% in mock Physics in six weeks', summary: 'An SS3 learner turned weak topics into a daily roadmap.', slug: 'physics-mock-improvement' },
    { tag: 'Teacher/School', title: 'How a tutorial centre cut revision planning time in half', summary: 'A teacher group moved from spreadsheets to shared class plans.', slug: 'tutorial-centre-planning' },
    { tag: 'Professional', title: 'Passing a professional taxation paper while working full time', summary: 'Short, scheduled sessions made a busy study week manageable.', slug: 'taxation-working-professional' },
  ] as const;
  return (
    <section className="section soft-section" id="stories" aria-labelledby="stories-title">
      <Reveal><p className="kicker centered">Illustrative placeholder stories</p><h2 className="section-title" id="stories-title">Success stories</h2></Reveal>
      <div className="stories-grid">
        <Reveal className="featured-story"><div className="story-art"><img src="/images/lumo.png" alt="" width="220" height="220" /><span>+33 points</span></div><p>Featured learner story</p><h3>From confusion to confidence in one exam term</h3><p>A two-line look at how a clearer study plan changed the way a learner practised.</p><a className="primary-button" href="/stories/featured">Read story</a></Reveal>
        <div className="story-list">{stories.map((story) => <a className="story-row" href={`/stories/${story.slug}`} key={story.slug}><span className="story-tag">{story.tag}</span><div><h3>{story.title}</h3><p>{story.summary}</p></div><span className="story-arrow"><ArrowRight /></span></a>)}</div>
      </div>
    </section>
  );
}

function FeaturedCourses() {
  const [filter, setFilter] = useState('All');
  const [saved, setSaved] = useState<string[]>([]);
  const filtered = filter === 'All' ? courses : courses.filter((course) => course[1] === filter);
  const toggleSaved = (title: string) => setSaved((items) => items.includes(title) ? items.filter((item) => item !== title) : [...items, title]);
  return (
    <section className="section" id="featured" aria-labelledby="featured-title">
      <Reveal><p className="kicker centered">Ready-made roadmaps</p><h2 className="section-title" id="featured-title">Popular courses this week</h2></Reveal>
      <div className="course-filters" role="group" aria-label="Filter courses">{['All', 'Exams', 'University', 'Professional', 'Skills'].map((item) => <button aria-pressed={filter === item} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>
      <div className="course-grid">{filtered.map((course, index) => (
        <article className="course-card" key={course[0]} onClick={() => track('course_card_click', { course: course[0] })}>
          <div className={`course-strip accent-${index % 5}`} />
          <small>Hyper Tutor Team / Community</small><h3>{course[0]}</h3><p>{course[2]}</p>
          <div className="course-footer"><span><TrendingUp size={14} />+{course[3]} new learners</span><b>{course[1]}</b><button className="icon-button" aria-label={`Bookmark ${course[0]}`} aria-pressed={saved.includes(course[0])} onClick={(event) => { event.stopPropagation(); toggleSaved(course[0]); }}><Bookmark fill={saved.includes(course[0]) ? 'currentColor' : 'none'} /></button></div>
        </article>
      ))}</div>
      <a className="browse-link" href="/courses">Browse all courses →</a>
    </section>
  );
}

function CommunityCTA() {
  return (
    <section className="section community-section" aria-labelledby="community-title">
      <Reveal className="community-panel">
        <div className="community-copy"><p>Built by learners, for learners</p><h2 id="community-title">Join the largest study community Africa has seen</h2><p>Every streak, every quiz and every study group makes the community stronger. Create your free account, find your people and level up together.</p><div className="email-capture"><a className="primary-button" href={AUTH_URL}>Create my free account</a></div></div>
        <div className="collage"><div className="float-card badge-flame" aria-hidden="true">🔥 14-day streak</div><div className="float-card leaderboard" aria-hidden="true"><b>Leaderboard</b><span>1 Ada</span><span>2 Emeka</span><span>3 Zainab</span></div><div className="float-card group" aria-hidden="true">👥 SS3 Physics Squad</div><div className="float-card quest" aria-hidden="true">✓ Daily quest complete +20 XP</div><div className="float-card achievement" aria-hidden="true">🏅 7-day spark</div><HyperOwl className="community-owl" pose="wings-up" size={260} followCursor={false} /></div>
      </Reveal>
    </section>
  );
}

function NewsletterBox() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMessage('Enter a valid email address.'); return; }
    const result = await submitWaitlistEmail(email.trim().toLowerCase(), 'footer-newsletter');
    setMessage(result.ok ? "You're subscribed." : 'Please try again.');
    if (result.ok) {
      setOwlThinking(false);
      window.dispatchEvent(new Event('owl:happy'));
    }
  };
  return <div className="newsletter"><h3>The Hyper Tutor study digest</h3><p>Study tips, exam strategies and product news. Twice a month. Straight to your inbox.</p><form onSubmit={submit} onFocusCapture={() => setOwlThinking(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOwlThinking(false); }}><label className="sr-only" htmlFor="footer-email">Email address</label><input id="footer-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" /><button className="primary-button">Subscribe</button></form><small role="status">{message}</small></div>;
}

function Footer() {
  const columns = [
    ['Product', ['Courses', 'Socratic Companion', 'Study Environment', 'Quizicle', 'Flashcards', 'Notes & Library', 'Daily Quests', 'Achievements', 'Community', 'Pricing', 'All features']],
    ['Learners', ['Secondary school', 'University', 'Professionals', 'WAEC', 'NECO', 'JAMB UTME', 'ICAN', 'ACCA', 'Install the app', 'Study guides']],
    ['Support', ['Help centre', 'Community forum', 'Contact us', 'System status', 'Parent guide', 'Teacher guide', 'Sitemap']],
    ['Company', ['About', 'Why Hyper Tutor', 'Success stories', 'Blog', 'Careers', 'Partners', 'Press', 'Trust & safety']],
  ] as const;
  return (
    <footer className="footer">
      <div className="footer-top"><div><Logo /><p className="footer-blurb">A calm, personal study platform for ambitious learners across Africa and beyond.</p></div><NewsletterBox /></div>
      <div className="footer-grid">{columns.map(([heading, links]) => <div key={heading}><h3>{heading}</h3>{links.map((link) => <a key={link} href="#top">{link}</a>)}</div>)}</div>
      <div className="footer-bottom"><span>© 2026 Hyper Tutor. All rights reserved.</span><div className="legal"><a href="/terms">Terms</a><a href="/privacy">Privacy</a><button>Cookie settings</button><a href="/privacy">Do not share my personal information</a></div><div className="socials" aria-label="Social links"><a href="https://linkedin.com" aria-label="LinkedIn" rel="noopener noreferrer" target="_blank"><Share2 /></a><a href="https://instagram.com" aria-label="Instagram" rel="noopener noreferrer" target="_blank"><Globe2 /></a><a href="https://youtube.com" aria-label="YouTube" rel="noopener noreferrer" target="_blank"><Play /></a><a href="https://x.com" aria-label="X" rel="noopener noreferrer" target="_blank"><X /></a><a href="https://wa.me" aria-label="WhatsApp" rel="noopener noreferrer" target="_blank"><Mail /></a></div></div>
    </footer>
  );
}

function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const { available, install } = useInstallPrompt();
  useEffect(() => {
    if (!available) return;
    const timer = window.setTimeout(() => setVisible(true), 8000);
    return () => clearTimeout(timer);
  }, [available]);
  if (!visible) return null;
  return <aside id="install-card" className="install-banner"><img src="/images/lumo.png" alt="" width="48" height="48" /><div><b>Install Hyper Tutor</b><span><i>Faster access</i><i>Works offline</i><i>Notifications</i></span></div><button className="text-link" onClick={() => setVisible(false)}>Not now</button><button className="primary-button" onClick={() => { void install(); setVisible(false); }}>Install</button></aside>;
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const onScroll = () => setVisible(window.scrollY > 800); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, []);
  if (!visible) return null;
  return <button className="back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top"><ArrowUp /></button>;
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => { const max = document.documentElement.scrollHeight - window.innerHeight; setProgress(max > 0 ? window.scrollY / max : 0); frame = 0; };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, []);
  return <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />;
}

function Consent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { try { setVisible(localStorage.getItem('ht-cookie-choice') === null); } catch { setVisible(true); } }, []);
  const choose = (choice: string) => { try { localStorage.setItem('ht-cookie-choice', choice); } catch { /* ignore */ } setVisible(false); };
  if (!visible) return null;
  return <div className="consent-strip" role="region" aria-label="Cookie consent"><p>We use essential and optional cookies to improve your study experience.</p><button className="outline-button" onClick={() => choose('manage')}>Manage</button><button className="primary-button" onClick={() => choose('accepted')}>Accept</button></div>;
}

export function Landing() {
  useEffect(() => {
    const jsonLd = [
      { '@context': 'https://schema.org', '@type': 'Organization', name: 'Hyper Tutor', url: 'https://hypertutor.com.ng/' },
      { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Hyper Tutor', url: 'https://hypertutor.com.ng/', potentialAction: { '@type': 'SearchAction', target: 'https://hypertutor.com.ng/?q={search_term_string}', 'query-input': 'required name=search_term_string' } },
      { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Hyper Tutor', applicationCategory: 'EducationalApplication', offers: { '@type': 'Offer', priceCurrency: 'NGN', price: '0' } },
    ];
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, []);
  return (
    <>
      <link rel="preload" as="image" href={owlWingsUpWebp} type="image/webp" />
      <ScrollProgress /><Announcement /><Navbar />
      <main id="main"><Hero /><ActivityBand /><AdaptiveSection /><PlatformSection /><MoreWaysSection /><AudienceSection /><PricingTeaser /><Testimonials /><TrustedBy /><StoriesSection /><FeaturedCourses /><CommunityCTA /></main>
      <Footer /><InstallBanner /><BackToTop /><Consent />
    </>
  );
}
