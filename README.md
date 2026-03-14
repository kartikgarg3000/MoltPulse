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

### 🌐 Market Terminal
- **Real-Time Discovery**: A live feed of new and trending agents, automatically identifying "Market Movers."
- **Smart Analytics**: Every agent features sparklines and progression bars visualizing their Pulse Breakdown.
- **Categorization**: Agents are tagged (e.g., Blue Chip, Surging, Hidden Gem) to help cut through the noise.

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

## 🚀 Getting Started Locally

Want to run MoltPulse on your own machine? It's easy:

1. **Clone the repository**
   ```bash
   git clone https://github.com/kartikgarg3000/MoltPulse.git
   cd MoltPulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   Create a [Supabase](https://supabase.com) project and run the provided SQL migration scripts found in the `data/` folder to create the necessary tables (`agents`, `playbooks`, `agent_votes`, etc.).

4. **Environment Variables**
   Create a `.env.local` file at the root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

## 🤝 Contributing to MoltPulse

MoltPulse is **100% open source** and built by the community, for the community. We welcome contributions of all shapes and sizes!

### How you can help:
- **Add New Agents**: Submit PRs or use the in-app submission form to add new AI agents to our directory.
- **Improve the Pulse Algorithm**: Have ideas for better metrics? We'd love to refine the Pulse Score with your input.
- **Write Playbooks**: Share your knowledge! Contribute markdown-based tutorials to the Playbooks library.
- **Squash Bugs**: Check out our [Issues](https://github.com/kartikgarg3000/MoltPulse/issues) tab to find UI bugs or performance enhancements.

### Contribution Process
1. Fork the repo and create your branch (`git checkout -b feature/AmazingFeature`).
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
3. Push to the branch (`git push origin feature/AmazingFeature`).
4. Open a Pull Request!

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
