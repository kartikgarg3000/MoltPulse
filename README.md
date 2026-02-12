# MoltPulse: The Bloomberg for AI Agents

**MoltPulse** is a premier SaaS platform designed to be the definitive "Market Terminal" for the booming AI Agent economy. It helps users discover, track, and learn about autonomous agents—from development frameworks to profitable trading bots.

## 🚀 Core Features

### 1. Market Terminal (Homepage)
- **Real-Time Feed**: A live stream of new and trending agents, sorted by "Velocity" (growth metric).
- **Pro Analytics**: Every agent card features a `PulseChart` sparkline visualizing recent activity.
- **Smart Badging**: Automatic classification of agents:
    - 💎 **Blue Chip**: Established, high-star projects.
    - 🚀 **Surging**: Rapidly growing new entrants.
    - 🔮 **Hidden Gem**: High potential, low visibility.

### 2. Comprehensive Agent Profiles
- **Deep Dive Metrics**: Detailed charts tracking star history and community growth.
- **Pulse Score**: A proprietary 0-100 score rating an agent's overall health based on 4 pillars:
    - 📈 **Growth (30%)**: Momentum from stars, forks, and contributors.
    - ⚙️ **Activity (25%)**: Development velocity and commit recency.
    - ⭐ **Popularity (25%)**: Total market reach and watchers.
    - 🗳️ **Trust (20%)**: Community voting and watchlist signals.
- **Vote & Watch**: Community-driven ranking system.

### 3. Knowledge Base (Playbooks)
- **Interactive Library**: A searchable, filterable hub of educational guides (e.g., "Zero to Hero: Building Your First Agent").
- **Learning Paths**: Visual roadmaps for beginners.
- **Curated Resources**: Direct access to essential whitepapers (Transformers) and tool docs (LangChain, OpenAI).

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components)
- **Styling**: Tailwind CSS + "Glassmorphism" Design System
- **Database**: Supabase (PostgreSQL + RLS)
- **Visualization**: Recharts
- **Icons**: Lucide React

## 📦 Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/MoltPulse.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 🤝 Contributing

We welcome contributions to our **Playbooks** library! Submit a PR with your own markdown guide to help the community build better agents.
