<div align="center">
  <img src="https://github.com/user-attachments/assets/b291d2c6-d419-4ec4-ab03-51b8772a1e00" alt="MoltPulse Logo" width="120" />
  <h1 align="center">MoltPulse</h1>
  <p align="center">
    <strong>The Bloomberg Terminal for the AI Agent Economy</strong>
    <br />
    <a href="https://molt-pulse.com">molt-pulse.com</a>
  </p>
</div>

---

**MoltPulse** is a premier open-source platform designed to be the definitive "Market Terminal" for autonomous AI agents. As the agent economy explodes, MoltPulse provides developers, investors, and enthusiasts with real-time analytics, critical insights, and a community-driven ranking system to discover the most impactful projects.

## ✨ Core Features

### 📊 The Pulse Score
We algorithmically evaluate and rank agents using our proprietary 0-100 **Pulse Score**, built on four distinct pillars:
- 📈 **Growth (30%)**: Momentum tracking via stars, forks, and new contributors.
- ⚙️ **Activity (25%)**: Development velocity and recency of code changes.
- ⭐ **Popularity (25%)**: Total market reach and community awareness.
- 🗳️ **Trust (20%)**: On-platform community voting and watchlist additions.

### 🌐 Market Terminal & Discovery
- **Real-Time Discovery**: A live feed of new and trending agents, automatically identifying "Market Movers."
- **Smart Analytics**: Every agent features sparklines and progression bars visualizing their Pulse Breakdown.
- **Categorization**: Agents are tagged (e.g., Blue Chip, Surging, Hidden Gem) to help cut through the noise.
- **Verified Agents & Filtering**: Use robust filters to instantly discover vetted, high-quality "Verified Agents".

### 🏷️ Pulse Badge Integration
- **Showcase Your Momentum**: Repository owners can generate a dynamic **Pulse Badge** through MoltPulse and embed it directly into their project's README.
- **Live Updates**: Badges automatically sync with your real-time Pulse Score, instantly signaling project health and popularity to your users and contributors.

### 📚 Knowledge Base
- **Playbooks**: A curated, interactive library of tutorials, technical guides, and architectural breakdowns.
- Perfect for developers moving from "Zero to Hero" in agent building.

## 🛠️ Tech Stack

MoltPulse is built for speed, real-time data, and beautiful visualizations:
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS with a custom Glassmorphism aesthetic
- **Database & Auth**: Supabase (PostgreSQL + RLS + Google OAuth)
- **Visualization**: Recharts & custom interactive SVGs
- **Deployment**: Vercel

## 🚀 Development Setup

MoltPulse requires [Node.js](https://nodejs.org/) and a [Supabase](https://supabase.com) instance.

```bash
npm install
npm run dev
```

1. **Database Setup**: Create a Supabase project and execute the SQL migrations located in the `data/` directory.
2. **Environment Variables**: Create a `.env.local` file at the root of the project with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Visit `http://localhost:3000` to view the application.

## 🤝 Contributing

MoltPulse is a community-driven open-source project. We invite developers, data scientists, and AI enthusiasts to help us build the premier Market Terminal for AI agents.

### Ways to Contribute
- **Core Platform**: Enhance the Next.js frontend, optimize Supabase queries, or improve the UI/UX.
- **Pulse Algorithm**: Propose data science and algorithmic improvements to our Pulse Score weighting.
- **Agent Integration**: Submit new AI agents to our directory or integrate Pulse Badges into your own repositories.
- **Documentation**: Write playbooks, tutorials, or architectural overviews to help onboard new developers.

### Contribution Process
We welcome contributions of all sizes! Please review our [Issues](https://github.com/kartikgarg3000/MoltPulse/issues) board for open tasks.

1. Fork the repository and create a feature branch (`git checkout -b feature/your-feature-name`).
2. Ensure your code follows existing styling conventions and passes all checks.
3. Submit a descriptive Pull Request detailing your changes and their impact.

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
