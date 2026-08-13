import { FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | MoltPulse',
  description: 'MoltPulse Terms of Service — rules and guidelines for using the platform.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 space-y-10 animate-in fade-in duration-500">
      <header className="space-y-4 border-b border-white/10 pb-8">
        <div className="flex items-center gap-3 text-blue-400">
          <FileText size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Legal</span>
        </div>
        <h1 className="text-4xl font-black text-white">Terms of Service</h1>
        <p className="text-sm text-gray-500">Last updated: August 2026</p>
      </header>

      <div className="space-y-8 text-gray-400 leading-relaxed text-sm">

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using MoltPulse (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">2. Description of Service</h2>
          <p>
            MoltPulse is an open-source analytics platform that tracks, ranks, and provides insights on autonomous AI agent repositories. We aggregate publicly available data from GitHub and community interactions to compute Pulse Scores.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">3. User Accounts</h2>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>You may sign in using Google OAuth to access personalized features (watchlists, voting, profile).</li>
            <li>You are responsible for maintaining the security of your account.</li>
            <li>You must not impersonate other users or misrepresent your identity.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">4. Acceptable Use</h2>
          <p>When using MoltPulse, you agree not to:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Submit fraudulent or misleading agent repositories.</li>
            <li>Manipulate Pulse Scores, votes, or watchlist counts through automated means.</li>
            <li>Scrape or harvest data from the platform beyond reasonable personal use.</li>
            <li>Attempt to gain unauthorized access to any part of the Platform.</li>
            <li>Use the Platform for any unlawful or harmful purpose.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">5. Submissions</h2>
          <p>
            When you submit an AI agent repository for inclusion, you confirm that the repository is publicly available and that you have the right to suggest its listing. MoltPulse reserves the right to accept, reject, or remove any submission at its discretion.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">6. Intellectual Property</h2>
          <p>
            MoltPulse is released under the <strong className="text-gray-300">MIT License</strong>. The Pulse Score algorithm, branding, and original content are the property of MoltPulse. Repository data displayed on the platform belongs to its respective owners.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">7. Disclaimer</h2>
          <p>
            The Platform is provided <strong className="text-gray-300">&quot;as is&quot;</strong> without warranties of any kind. Pulse Scores are algorithmic estimates and should not be used as the sole basis for investment or business decisions. We are not responsible for the accuracy, completeness, or reliability of third-party repository data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">8. Limitation of Liability</h2>
          <p>
            MoltPulse and its contributors shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the Platform after changes are posted constitutes acceptance of the revised terms. Material changes will be communicated via the Platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">10. Contact</h2>
          <p>
            For questions regarding these Terms, please open an issue on our{' '}
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
