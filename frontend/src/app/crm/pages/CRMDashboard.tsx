import { useState, useEffect } from 'react';
import { CRMNavbar } from '../components/CRMNavbar';
import { fetchAnalytics } from '../services/analyticsService';
import { getCaseStats } from '../services/caseService';
import {
  TrendingUp, Users, DollarSign, CheckCircle,
  AlertTriangle, Clock, Target, Award,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts';
import { useNavigate } from 'react-router';

const GOLD = '#C9963C';
const COLORS = ['#C9963C', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export function CRMDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [a, s] = await Promise.all([fetchAnalytics(), getCaseStats()]);
        setAnalytics(a);
        setStats(s);
      } catch (err) {
        console.error('[CRMDashboard] Error loading data:', err);
        // Try loading each independently so partial data still shows
        fetchAnalytics().then(setAnalytics).catch(e => console.error('analytics:', e));
        getCaseStats().then(setStats).catch(e => console.error('stats:', e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const topCards = [
    {
      icon: <Users size={22} />,
      label: 'Total Cases',
      value: stats?.total ?? 0,
      iconBg: 'rgba(59,130,246,0.15)',
      iconColor: '#3b82f6',
    },
    {
      icon: <TrendingUp size={22} />,
      label: 'Conversion Rate',
      value: analytics ? `${analytics.conversionRate}%` : '—',
      iconBg: 'rgba(16,185,129,0.15)',
      iconColor: '#10b981',
    },
    {
      icon: <DollarSign size={22} />,
      label: 'Total Revenue',
      value: analytics ? `₹${analytics.totalRevenue.toLocaleString()}` : '—',
      iconBg: 'rgba(201,150,60,0.15)',
      iconColor: GOLD,
    },
    {
      icon: <CheckCircle size={22} />,
      label: 'Completed',
      value: stats?.statusCounts?.['Completed'] ?? 0,
      iconBg: 'rgba(16,185,129,0.15)',
      iconColor: '#10b981',
    },
    {
      icon: <AlertTriangle size={22} />,
      label: 'Urgent Cases',
      value: stats?.urgent ?? 0,
      iconBg: 'rgba(239,68,68,0.15)',
      iconColor: '#ef4444',
    },
    {
      icon: <Clock size={22} />,
      label: 'Pending Revenue',
      value: analytics ? `₹${analytics.pendingRevenue.toLocaleString()}` : '—',
      iconBg: 'rgba(245,158,11,0.15)',
      iconColor: '#f59e0b',
    },
    {
      icon: <Target size={22} />,
      label: 'Tasks Done',
      value: analytics ? `${analytics.taskCompletionRate}%` : '—',
      iconBg: 'rgba(139,92,246,0.15)',
      iconColor: '#8b5cf6',
    },
    {
      icon: <Award size={22} />,
      label: 'This Month',
      value: analytics?.thisMonthCases ?? 0,
      iconBg: 'rgba(6,182,212,0.15)',
      iconColor: '#06b6d4',
    },
  ];

  const revenueData = analytics
    ? Object.entries(analytics.revenueByMonth).map(([month, amt]) => ({
        month,
        revenue: amt as number,
      }))
    : [];

  const serviceData = analytics
    ? Object.entries(analytics.byService).map(([name, count]) => ({ name, count: count as number }))
    : [];

  const funnelTop5 = analytics?.funnel?.slice(0, 8) ?? [];

  if (loading) {
    return (
      <div className="crm-page">
        <CRMNavbar title="Dashboard" subtitle="Loading..." />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
          <div className="crm-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="crm-page">
      <CRMNavbar
        title="CRM Dashboard"
        subtitle="Real-time overview of your sales pipeline"
        onNewCase={() => navigate('/crm/cases')}
      />

      <div className="crm-page__content">
        {/* KPI Cards */}
        <div className="crm-cards" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))' }}>
          {topCards.map((c, i) => (
            <div key={i} className="crm-card">
              <div className="crm-card__icon" style={{ backgroundColor: c.iconBg, color: c.iconColor }}>
                {c.icon}
              </div>
              <div className="crm-card__value">{c.value}</div>
              <div className="crm-card__label">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Revenue chart */}
          <div className="crm-chart-card">
            <div className="crm-chart-card__title">📈 Revenue by Month</div>
            {revenueData.length === 0 ? (
              <div className="crm-empty"><div className="crm-empty__sub">No payment data yet</div></div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    labelStyle={{ color: '#1e293b', fontWeight: 600 }}
                    itemStyle={{ color: GOLD }}
                  />
                  <Bar dataKey="revenue" fill={GOLD} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Service distribution */}
          <div className="crm-chart-card">
            <div className="crm-chart-card__title">🥧 Cases by Service</div>
            {serviceData.length === 0 ? (
              <div className="crm-empty"><div className="crm-empty__sub">No data yet</div></div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={serviceData} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="name" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {serviceData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="crm-chart-card">
          <div className="crm-chart-card__title">🔻 Stage Drop-off Funnel</div>
          <div className="crm-funnel">
            {funnelTop5.map((item: any, i: number) => {
              const max = Math.max(...funnelTop5.map((f: any) => f.count), 1);
              const pct = Math.round((item.count / max) * 100);
              return (
                <div key={i} className="crm-funnel__row">
                  <div className="crm-funnel__label">{item.stage}</div>
                  <div className="crm-funnel__bar-wrap">
                    <div
                      className="crm-funnel__bar"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${GOLD}, #3b82f6)` }}
                    >
                      <span style={{ fontSize: '11px', color: '#fff', fontWeight: 700 }}>{item.count}</span>
                    </div>
                  </div>
                  <div className="crm-funnel__count">{item.count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick status breakdown */}
        <div className="crm-chart-card">
          <div className="crm-chart-card__title">📊 Status Distribution</div>
          {stats?.statusCounts && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {Object.entries(stats.statusCounts)
                .filter(([_, v]) => (v as number) > 0)
                .map(([status, count]) => (
                  <div
                    key={status}
                    style={{
                      background: '#f8fafc', border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: '8px', padding: '12px 16px', minWidth: '140px',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/crm/cases?status=${encodeURIComponent(status)}`)}
                  >
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>{count as number}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{status}</div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
