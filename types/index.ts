
export type AppType = 'ai_software' | 'autonomous_agent' | 'task_bot' | 'dev_tool';

export interface Agent {
    name: string;
    repo: string;
    description: string | null;
    stars: number;
    last_update: string;
    created_at: string;
    trend: string | null;
    votes?: number;
    downvotes?: number;
    category?: string;
    velocity?: number;

    // AI-Built Software & Agent Discovery Fields
    app_type?: AppType;
    demo_url?: string;
    website_url?: string;
    built_with?: string[];
    capabilities?: string[];
    tagline?: string;

    // Pulse Score Metrics
    pulse_score?: number;
    growth_score?: number;
    activity_score?: number;
    popularity_score?: number;
    trust_score?: number;

    // Quality Gate & Curation
    is_verified?: boolean;
    is_visible?: boolean;
    quality_score?: number;
    ai_summary?: string;

    // Extended Metadata
    readme_length?: number;
    has_releases?: boolean;
    license?: string | null;
    language?: string | null;
    topics?: string[];
}

