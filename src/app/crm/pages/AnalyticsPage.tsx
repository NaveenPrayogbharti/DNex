import { useState, useEffect } from 'react';
import { CRMNavbar } from '../components/CRMNavbar';
import { fetchAnalytics } from '../services/analyticsService';
import { CASE_STATUSES } from '../services/caseService';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

const GOLD = '#C9963C';
const COLORS = ['#C9963C', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="crm-page"><CRMNavbar title="Analytics" /><div className="crm-spinner" /></div>;
  if (!data)   return <div className="crm-page"><CRMNavbar title="Analytics" /><div className="crm-empty"><div className="crm-empty__title">Failed to load analytics</div></div></div>;

  const revenueData = Object.entries(data.revenueByMonth).map(([month, revenue]) => ({ month, revenue }));
  const serviceData = Object.entries(data.byService).map(([name, count]) => ({ name, count }));
  const priorityData = Object.entries(data.byPriority).map(([name, value]) => ({ name, value }));
  const funnelData = (data.funnel as Array<{ stage: string; count: number }>).filter(f => f.count > 0);

  const TooltipStyle = {
    contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' },
    labelStyle: { color: '#fff' },
    itemStyle: { color: GOLD },
  };

  return (
    <div className="crm-page">
      <CRMNavbar title="Analytics" subtitle="Detailed insights into your CRM performance" />
      <div className="crm-page__content">

        {/* KPI Summary */}
        <div className="crm-cards" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))' }}>
          {[
            { label: 'Total Cases',       value: data.totalCases,          icon: '📁' },
            { label: 'Conversion Rate',   value: `${data.conversionRate}%`, icon: '🎯' },
            { label: 'Total Revenue',     value: `₹${data.totalRevenue.toLocaleString()}`, icon: '💰' },
            { label: 'Pending Revenue',   value: `₹${data.pendingRevenue.toLocaleString()}`, icon: '⏳' },
            { label: 'This Month Cases',  value: data.thisMonthCases,      icon: '📅' },
            { label: 'Task Completion',   value: `${data.taskCompletionRate}%`, icon: '✅' },
            { label: 'Total Tasks',       value: data.totalTasks,          icon: '📋' },
            { label: 'Overdue Tasks',     value: data.overdueTasks,        icon: '⚠️' },
          ].map((c, i) => (
            <div key={i} className="crm-card">
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>{c.icon}</div>
              <div className="crm-card__value">{c.value}</div>
              <div className="crm-card__label">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Revenue Trend */}
        <div className="crm-chart-card">
          <div className="crm-chart-card__title">💹 Revenue Trend (by Month)</div>
          {revenueData.length === 0 ? (
            <div className="crm-empty"><div className="crm-empty__sub">No payment data yet</div></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip {...TooltipStyle} />
                <Line type="monotone" dataKey="revenue" stroke={GOLD} strokeWidth={2} dot={{ fill: GOLD }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Stage Funnel + Service Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="crm-chart-card">
            <div className="crm-chart-card__title">🔻 Conversion Funnel</div>
            {funnelData.length === 0 ? (
              <div className="crm-empty"><div className="crm-empty__sub">No case data yet</div></div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis type="category" dataKey="stage" width={140} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip {...TooltipStyle} />
                  <Bar dataKey="count" fill={GOLD} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="crm-chart-card">
            <div className="crm-chart-card__title">🏢 Cases by Service</div>
            {serviceData.length === 0 ? (
              <div className="crm-empty"><div className="crm-empty__sub">No data yet</div></div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={serviceData} cx="50%" cy="45%" outerRadius={100}
                    dataKey="count" nameKey="name">
                    {serviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...TooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Priority breakdown */}
        <div className="crm-chart-card">
          <div className="crm-chart-card__title">🚨 Cases by Priority</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip {...TooltipStyle} />
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {priorityData.map((entry, i) => {
                  const c = entry.name === 'urgent' ? '#ef4444' : entry.name === 'high' ? '#f97316' : entry.name === 'medium' ? '#f59e0b' : '#94a3b8';
                  return <Cell key={i} fill={c} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
