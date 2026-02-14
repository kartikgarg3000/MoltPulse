
export interface Agent {
    name: string;
    repo: string;
    description: string | null;
    stars: number;
    last_update: string;
    created_at: string;
    trend: string | null;
    votes?: number;
    category?: string;
    velocity?: number;

    // Pulse Score Metrics
    pulse_score?: number;
    growth_score?: number;
    activity_score?: number;
    popularity_score?: number;
    trust_score?: number;
}
