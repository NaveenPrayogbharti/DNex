import { useState, useEffect } from 'react';
import { AdminNavbar } from '../components/AdminNavbar';
import { DashboardCards } from '../components/DashboardCards';
import { InquiryTable } from '../components/InquiryTable';
import { InquiryModal } from '../components/InquiryModal';
import { fetchInquiries, getInquiryStats } from '../services/inquiryService';
import type { Inquiry } from '../services/inquiryService';
import { Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

const GOLD = '#C9963C';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, inProgress: 0, closed: 0 });
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statsData, inquiriesData] = await Promise.all([
        getInquiryStats(),
        fetchInquiries(),
      ]);
      setStats(statsData);
      setRecentInquiries(inquiriesData.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="admin-page">
      <AdminNavbar title="Dashboard" subtitle="Overview of all inquiries and activity" />

      <div className="admin-page__content">
        {/* Stats Cards */}
        <DashboardCards stats={stats} />

        {/* Recent Inquiries */}
        <div className="admin-page__section">
          <div className="admin-page__section-header">
            <div className="admin-page__section-title-group">
              <Clock size={20} style={{ color: GOLD }} />
              <h2 className="admin-page__section-title">Recent Inquiries</h2>
            </div>
            <button
              className="admin-page__view-all-btn"
              onClick={() => navigate('/admin/inquiries')}
              style={{ color: GOLD }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <InquiryTable
            inquiries={recentInquiries}
            onViewDetail={setSelectedInquiry}
            onStatusChange={loadData}
            loading={loading}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <InquiryModal
        inquiry={selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        onUpdate={loadData}
      />
    </div>
  );
}
