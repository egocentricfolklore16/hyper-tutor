// ILLUSTRATIVE PLACEHOLDER DATA — replace with real figures before public launch.
export const announcement = {
  text: 'Exam season is here: build your WAEC, NECO or JAMB roadmap in 5 minutes',
  link: 'Start free →',
};

export const courses = [
  ['WAEC Physics Mastery', 'Exams', 'Mechanics, waves, electricity and modern physics with Socratic practice on every topic.', '312'],
  ['JAMB UTME Use of English', 'Exams', 'Lexis, structure, comprehension and oral forms, with timed mock sections.', '289'],
  ['NECO Mathematics Essentials', 'Exams', 'Number, algebra, geometry and statistics broken into 21-day roadmaps.', '267'],
  ['ICAN Taxation Foundations', 'Professional', 'Core tax principles, computations and compliance explained step by step.', '244'],
  ['ACCA Financial Reporting Sprint', 'Professional', 'Standards, statements and exam technique in focused daily sessions.', '231'],
  ['Intro to Microeconomics', 'University', 'Demand, supply, elasticity and market structures with real-world examples.', '218'],
  ['Nigerian Tax System Explained', 'Professional', 'Income tax, VAT, company tax and administration, from first principles.', '205'],
  ['Python for Beginners', 'Skills', 'Variables to functions to small projects, one concept at a time.', '198'],
  ['HTML & CSS in 14 Days', 'Skills', 'Build and style real pages with a daily practice ticket.', '184'],
  ['JavaScript Fundamentals', 'Skills', 'Logic, DOM and async basics with instant quiz feedback.', '176'],
  ['Chemistry: Organic Basics', 'Exams', 'Functional groups, reactions and mechanisms, with spaced flashcards.', '169'],
  ['Study Skills & Memory', 'Skills', 'Pomodoro, active recall and spaced repetition that actually work.', '158'],
] as const;

export const testimonials = [
  { quote: "The tutor didn't give me the answer. It asked me one question and suddenly I understood why I'd been wrong for weeks.", name: 'Ada N.', role: 'SS3 student, Lagos', accent: 'sunshine' },
  { quote: 'I set my exam date and it built the whole timetable around my lectures. I just follow the plan.', name: 'Emeka O.', role: '200L Economics', accent: 'sky' },
  { quote: 'Ten focused minutes a day beat my old all-night cramming. The streak keeps me honest.', name: 'Zainab I.', role: 'Accounting graduate preparing for professional exams', accent: 'coral' },
  { quote: 'My class can finally see which topics everyone is struggling with before the test, not after.', name: 'Mr. Bello', role: 'Secondary school teacher', accent: 'violet' },
  { quote: 'Flashcards, notes and quizzes in one place. I stopped juggling five apps.', name: 'Kelechi A.', role: 'Self-taught developer', accent: 'orange' },
] as const;

export const activityTemplates = [
  { name: 'Amaka O.', action: 'completed a 25-minute focus session', icon: 'Timer' },
  { name: 'Tunde A.', action: 'reached a 14-day streak', icon: 'Flame' },
  { name: 'Chioma E.', action: 'scored 92% on Quizicle: Organic Chemistry', icon: 'CheckCircle2' },
  { name: 'Ibrahim S.', action: 'joined the study group SS3 Physics Squad', icon: 'Users' },
  { name: 'Ngozi M.', action: 'created the course ICAN Taxation', icon: 'BookOpen' },
  { name: 'Segun B.', action: 'unlocked the Note Maker achievement', icon: 'Award' },
  { name: 'Fatima K.', action: 'reviewed 40 flashcards', icon: 'Layers' },
] as const;

export const partners = ['Lagos Scholars Hub', 'Unity Tutorial Centre', 'Northgate College', 'Delta Study Circle', 'Campus Learning Club'];
export const pricingPlans = [
  {
    name: 'Free',
    price: '₦0',
    note: null,
    features: ['Access to core study tools', 'Standard AI tutor response', 'Basic progress tracking'],
    action: 'Current Plan',
  },
  {
    name: 'Pro',
    price: '₦2,500',
    note: 'Placeholder price - subject to confirmation',
    features: ['Everything in Free', 'Unlimited AI Socratic guidance', 'Advanced Analytics & Gaps diagnosis', 'Priority study session access'],
    action: 'Upgrade to Pro',
  },
  {
    name: 'Elite',
    price: '₦5,000',
    note: 'Placeholder price - subject to confirmation',
    features: ['Everything in Pro', '1-on-1 AI Tutoring custom agents', 'Unlimited practice quizzes & flashcards', '24/7 Priority support'],
    action: 'Upgrade to Elite',
  },
] as const;
export const searchCourses = courses.map((course) => course[0]);
