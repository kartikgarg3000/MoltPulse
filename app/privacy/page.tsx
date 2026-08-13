import { Shield } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | MoltPulse',
  description: 'MoltPulse Privacy Policy — how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 space-y-10 animate-in fade-in duration-500">
      <header className="space-y-4 border-b border-white/10 pb-8">
        <div className="flex items-center gap-3 text-blue-400">
          <Shield size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Legal</span>
        </div>
        <h1 className="text-4xl font-black text-white">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: August 2026</p>
      </header>

      <div className="space-y-8 text-gray-400 leading-relaxed text-sm">

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">1. Introduction</h2>
          <p>
            MoltPulse (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the <strong className="text-gray-300">molt-pulse.com</strong> website. This page informs you of our policies regarding the collection, use, and disclosure of personal information when you use our platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">2. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li><strong className="text-gray-300">Account Data:</strong> When you sign in via Google OAuth, we receive your name, email address, and profile picture from your Google account.</li>
            <li><strong className="text-gray-300">Usage Data:</strong> We collect anonymized analytics data such as pages visited, time on site, and general interaction patterns through Vercel Analytics and Google Analytics.</li>
            <li><strong className="text-gray-300">Public GitHub Data:</strong> We collect publicly available repository metadata (stars, forks, descriptions, commit activity) via the GitHub API. No private repository data is accessed.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>To provide and maintain the MoltPulse platform.</li>
            <li>To enable personalized features such as watchlists, voting, and profile pages.</li>
            <li>To compute Pulse Scores and quality metrics for listed AI agents.</li>
            <li>To improve and optimize the user experience through aggregated analytics.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">4. Data Sharing</h2>
          <p>
            We <strong className="text-white">do not sell</strong> your personal data to third parties. We may share anonymized, aggregated data with analytics providers (Vercel, Google) solely to improve the platform. Your email and account data are never shared externally.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">5. Data Storage & Security</h2>
          <p>
            Your data is stored securely on Supabase (hosted on AWS) with Row Level Security (RLS) policies enforced at the database level. We use HTTPS encryption for all data in transit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">6. Cookies</h2>
          <p>
            We use essential cookies for authentication sessions. Analytics services may use their own cookies to track anonymized usage. You can disable cookies in your browser settings, though some features may not function properly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Access the personal data we hold about you.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Opt out of non-essential analytics tracking.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">8. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, please open an issue on our{' '}
            <a href="https://github.com/kartikgarg3000/MoltPulse" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              GitHub repository
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
