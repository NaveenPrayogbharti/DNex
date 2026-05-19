import { Inbox, PhoneCall, Clock, CheckCircle2, TrendingUp, ArrowUpRight } from 'lucide-react';

const GOLD = '#C9963C';

interface DashboardCardsProps {
  stats: {
    total: number;
    new: number;
    contacted: number;
    inProgress: number;
    closed: number;
  };
}

export function DashboardCards({ stats }: DashboardCardsProps) {
  const cards = [
    {
      label: 'Total Inquiries',
      value: stats.total,
      icon: Inbox,
      gradient: 'linear-gradient(135deg, #0A1628, #1a2d4a)',
      iconBg: 'rgba(201, 150, 60, 0.15)',
      iconColor: GOLD,
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'New Inquiries',
      value: stats.new,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #059669, #10b981)',
      iconBg: 'rgba(255,255,255,0.2)',
      iconColor: '#fff',
      trend: `${stats.total > 0 ? Math.round((stats.new / stats.total) * 100) : 0}%`,
      trendUp: true,
    },
    {
      label: 'Contacted',
      value: stats.contacted,
      icon: PhoneCall,
      gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
      iconBg: 'rgba(255,255,255,0.2)',
      iconColor: '#fff',
      trend: `${stats.total > 0 ? Math.round((stats.contacted / stats.total) * 100) : 0}%`,
      trendUp: true,
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
      iconBg: 'rgba(255,255,255,0.2)',
      iconColor: '#fff',
      trend: `${stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%`,
      trendUp: false,
    },
    {
      label: 'Closed',
      value: stats.closed,
      icon: CheckCircle2,
      gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
      iconBg: 'rgba(255,255,255,0.2)',
      iconColor: '#fff',
      trend: `${stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0}%`,
      trendUp: true,
    },
  ];

  return (
    <div className="admin-dashboard-cards">
      {cards.map((card) => (
        <div
          key={card.label}
          className="admin-dashboard-card"
          style={{ background: card.gradient }}
        >
          <div className="admin-dashboard-card__top">
            <div
              className="admin-dashboard-card__icon"
              style={{ backgroundColor: card.iconBg }}
            >
              <card.icon size={20} style={{ color: card.iconColor }} />
            </div>
            <div className="admin-dashboard-card__trend" data-up={card.trendUp}>
              <ArrowUpRight size={12} />
              <span>{card.trend}</span>
            </div>
          </div>
          <div className="admin-dashboard-card__value">{card.value}</div>
          <div className="admin-dashboard-card__label">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
