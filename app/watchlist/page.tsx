import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    Star, ArrowRight, LayoutGrid, TrendingUp, TrendingDown,
    Bell, BellOff, Zap, CheckCheck, ExternalLink, AlertTriangle, Minus
} from 'lucide-react';
import WatchlistButton from '@/components/WatchlistButton';

export const revalidate = 0;

// ── SQL migration reminder (run in Supabase before deploying) ─────────────────
// ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS alert_on_surge BOOLEAN NOT NULL DEFAULT true;
// ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS surge_threshold INTEGER NOT NULL DEFAULT 10;
// ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS last_pulse INTEGER;
// CREATE TABLE IF NOT EXISTS watchlist_alerts ( ... ); -- see implementation_plan.md
// ─────────────────────────────────────────────────────────────────────────────

export default async function WatchlistPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect('/login');

    // ── 1. Fetch watchlist rows with joined agent data ─────────────────────────
    const { data: watchlistRows } = await supabase
        .from('watchlist')
        .select(`
            id,
            agent_repo,
            alert_on_surge,
            surge_threshold,
            last_pulse,
            agents:agents!inner (
                repo, name, description, stars, category,
                last_update, pulse_score, velocity,
                is_verified, votes, downvotes
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // ── 2. Fetch unread alerts ─────────────────────────────────────────────────
    const { data: unreadAlerts } = await supabase
        .from('watchlist_alerts')
        .select('id, agent_repo, message, old_pulse, new_pulse, created_at')
        .eq('user_id', user.id)
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(20);

    const agents = (watchlistRows ?? []).map((w: any) => ({
        ...w.agents,
        watchlist_id: w.id,
        alert_on_surge: w.alert_on_surge ?? true,
        surge_threshold: w.surge_threshold ?? 10,
        last_pulse: w.last_pulse ?? null,
    }));

    const alerts = unreadAlerts ?? [];
    const unreadCount = alerts.length;

    // ── Helper ─────────────────────────────────────────────────────────────────
    const getDelta = (agent: any) => {
        if (agent.last_pulse === null || agent.pulse_score === undefined) return null;
        return Math.round(agent.pulse_score) - agent.last_pulse;
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 space-y-10 animate-in fade-in duration-500">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                        <Star className="text-yellow-500 fill-yellow-500" size={22} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white">My Watchlist</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {agents.length} agent{agents.length !== 1 ? 's' : ''} tracked
                            {unreadCount > 0 && (
                                <span className="ml-2 inline-flex items-center gap-1 text-yellow-400 font-bold">
                                    · {unreadCount} new alert{unreadCount !== 1 ? 's' : ''}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <Link
                    href="/agents"
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm font-bold text-gray-300 hover:bg-white/10 transition-all"
                >
                    <LayoutGrid size={15} />
                    Browse Directory
                </Link>
            </header>

            {/* ── Zone A: Unread Surge Alerts ──────────────────────────────── */}
            {alerts.length > 0 && (
                <AlertBanner alerts={alerts} supabaseUserId={user.id} />
            )}

            {/* ── Zone B: Watchlist Grid ───────────────────────────────────── */}
            {agents.length === 0 ? (
                <EmptyState />
            ) : (
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
                        <Zap size={13} />
                        <span>Tracked Agents</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {agents.map((agent: any) => {
                            const delta = getDelta(agent);
                            const [owner, repoName] = agent.repo.split('/');
                            return (
                                <WatchedAgentCard
                                    key={agent.repo}
                                    agent={agent}
                                    delta={delta}
                                    owner={owner}
                                    repoName={repoName}
                                />
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── Zone C: Alert Settings ───────────────────────────────────── */}
            {agents.length > 0 && (
                <AlertSettingsPanel />
            )}
        </div>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function AlertBanner({ alerts, supabaseUserId }: { alerts: any[], supabaseUserId: string }) {
    return (
        <section className="glass rounded-2xl border border-yellow-500/20 bg-yellow-500/5 overflow-hidden">
            {/* Header row */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-yellow-500/15">
                <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
                    <Bell size={15} className="fill-yellow-400/30" />
                    {alerts.length} Surge Alert{alerts.length !== 1 ? 's' : ''}
                </div>
                {/* Mark all read form */}
                <MarkAllReadButton />
            </div>

            {/* Alert rows */}
            <div className="divide-y divide-white/5">
                {alerts.map((alert) => {
                    const [owner, repoName] = alert.agent_repo.split('/');
                    const delta = (alert.new_pulse ?? 0) - (alert.old_pulse ?? 0);
                    return (
                        <div key={alert.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/3 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-md bg-green-500/15 flex items-center justify-center shrink-0">
                                    <TrendingUp size={13} className="text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{alert.message}</p>
                                    <p className="text-[11px] text-gray-500 font-mono">
                                        {new Date(alert.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={`/agents/${owner}/${repoName}`}
                                className="shrink-0 flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                View <ExternalLink size={11} />
                            </Link>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

// Server action wrapper — reads all are done client-side via the route
function MarkAllReadButton() {
    return (
        <form action="/api/watchlist-alerts/mark-read" method="POST">
            <button
                type="submit"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white font-bold transition-colors px-3 py-1.5 rounded-full hover:bg-white/10"
            >
                <CheckCheck size={13} />
                Mark all read
            </button>
        </form>
    );
}

function WatchedAgentCard({
    agent, delta, owner, repoName
}: {
    agent: any; delta: number | null; owner: string; repoName: string;
}) {
    const hasDelta = delta !== null;
    const isPositive = hasDelta && delta > 0;
    const isNegative = hasDelta && delta < 0;

    return (
        <div className="glass border border-white/10 hover:border-white/20 rounded-xl p-5 transition-all duration-200 flex flex-col gap-4">
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <Link href={`/agents/${owner}/${repoName}`} className="group/title">
                        <h3 className="font-bold text-white group-hover/title:text-blue-400 transition-colors truncate">
                            {agent.name}
                        </h3>
                    </Link>
                    <p className="text-[11px] text-gray-500 font-mono truncate mt-0.5">{agent.repo}</p>
                </div>

                {/* Pulse + Delta */}
                <div className="flex flex-col items-end shrink-0">
                    {agent.pulse_score !== undefined && (
                        <div className="text-xl font-black text-white">
                            {Math.round(agent.pulse_score)}
                        </div>
                    )}
                    {hasDelta && delta !== 0 && (
                        <div className={`flex items-center gap-0.5 text-[11px] font-bold font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {isPositive ? '+' : ''}{delta}
                        </div>
                    )}
                    {hasDelta && delta === 0 && (
                        <div className="flex items-center gap-0.5 text-[11px] font-bold font-mono text-gray-600">
                            <Minus size={10} /> 0
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            {agent.description && (
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{agent.description}</p>
            )}

            {/* Bottom row */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-3 text-[11px] text-gray-500 font-mono">
                    <span className="flex items-center gap-1">
                        <Star size={10} className="text-yellow-500" />
                        {(agent.stars ?? 0).toLocaleString()}
                    </span>
                    {agent.category && (
                        <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] font-bold">
                            {agent.category}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <AlertToggleButton
                        watchlistId={agent.watchlist_id}
                        enabled={agent.alert_on_surge}
                    />
                    <WatchlistButton repo={agent.repo} variant="remove" />
                </div>
            </div>
        </div>
    );
}

// Inline alert toggle — simple anchor to the toggle API
function AlertToggleButton({ watchlistId, enabled }: { watchlistId: string; enabled: boolean }) {
    return (
        <form action={`/api/watchlist-alerts/toggle`} method="POST">
            <input type="hidden" name="watchlistId" value={watchlistId} />
            <input type="hidden" name="enabled" value={String(!enabled)} />
            <button
                type="submit"
                title={enabled ? 'Disable surge alerts for this agent' : 'Enable surge alerts for this agent'}
                className={`p-1.5 rounded-md border transition-all ${
                    enabled
                        ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20'
                        : 'text-gray-600 bg-white/5 border-white/5 hover:text-gray-400'
                }`}
            >
                {enabled ? <Bell size={13} /> : <BellOff size={13} />}
            </button>
        </form>
    );
}

function AlertSettingsPanel() {
    return (
        <section className="glass rounded-2xl border border-white/10 p-6 space-y-5">
            <div className="flex items-center gap-2">
                <Bell size={16} className="text-blue-400" />
                <h2 className="font-bold text-white text-sm uppercase tracking-widest">Alert Preferences</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Surge threshold info */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Surge Threshold</p>
                    <p className="text-2xl font-black text-white">10 <span className="text-sm text-gray-500 font-normal">pts</span></p>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                        You'll be alerted when an agent's Pulse Score jumps by ≥ 10 points since the last check.
                        Per-agent overrides coming soon.
                    </p>
                </div>

                {/* How alerts work */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">How It Works</p>
                    <ul className="text-[11px] text-gray-500 space-y-1.5 leading-relaxed">
                        <li className="flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">↑</span>
                            Surge alerts fire when pulse jumps past your threshold
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-0.5">🔔</span>
                            Alerts appear here in your dashboard instantly
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-400 mt-0.5">✉</span>
                            Email digests coming soon — toggle alert per agent using 🔔
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
}

function EmptyState() {
    return (
        <div className="py-32 text-center glass rounded-[3rem] border border-dashed border-white/10 space-y-8">
            <div className="flex justify-center">
                <div className="w-20 h-20 bg-yellow-500/5 rounded-full flex items-center justify-center border border-yellow-500/10">
                    <Star className="text-yellow-500/40" size={32} />
                </div>
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Nothing tracked yet</h2>
                <p className="text-gray-500 max-w-sm mx-auto text-sm">
                    Hit the ★ on any agent to watch it. You'll see pulse deltas and surge alerts right here.
                </p>
            </div>
            <Link
                href="/agents"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all group"
            >
                Browse Directory
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
