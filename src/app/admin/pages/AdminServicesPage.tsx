import { useState, useEffect } from 'react';
import { AdminNavbar } from '../components/AdminNavbar';
import { Briefcase, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { getStoredServices, saveStoredServices, ServiceItem } from '../../../lib/servicesStore';

const GOLD = '#C9963C';
const NAVY = '#0A1628';

export function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    setServices(getStoredServices());
  }, []);

  const openModal = (service?: ServiceItem) => {
    if (service) {
      setEditingService(service);
      setTitle(service.title);
      setDescription(service.description);
      setActive(service.active);
    } else {
      setEditingService(null);
      setTitle('');
      setDescription('');
      setActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    let updated: ServiceItem[];
    if (editingService) {
      updated = services.map(s => s.id === editingService.id ? { ...s, title, description, active } : s);
    } else {
      const newService: ServiceItem = {
        id: Date.now().toString(),
        title,
        description,
        active
      };
      updated = [...services, newService];
    }
    setServices(updated);
    saveStoredServices(updated);
    setIsModalOpen(false);
    alert('Service saved successfully!');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this service?')) {
      const updated = services.filter(s => s.id !== id);
      setServices(updated);
      saveStoredServices(updated);
    }
  };

  const toggleStatus = (id: string) => {
    const updated = services.map(s => s.id === id ? { ...s, active: !s.active } : s);
    setServices(updated);
    saveStoredServices(updated);
  };

  return (
    <div className="admin-page">
      <AdminNavbar title="Services" subtitle="Manage your website services" />
      
      <div className="admin-page__content">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>Services List</h2>
          <button 
            onClick={() => openModal()}
            style={{ 
              background: GOLD, color: '#fff', border: 'none', 
              padding: '10px 20px', borderRadius: '4px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
            }}
          >
            <Plus size={18} /> Add Service
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service.id} className="admin-table__row">
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Briefcase size={16} color={GOLD} />
                      {service.title}
                    </div>
                  </td>
                  <td style={{ color: '#666' }}>{service.description || <span style={{color: '#aaa', fontStyle:'italic'}}>No description</span>}</td>
                  <td>
                    <button 
                      onClick={() => toggleStatus(service.id)}
                      style={{ 
                        border: 'none', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                        backgroundColor: service.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                        color: service.active ? '#059669' : '#6b7280',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                      {service.active ? <><CheckCircle size={12}/> Active</> : <><XCircle size={12}/> Inactive</>}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => openModal(service)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#666' }}>
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(service.id)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No services found. Add one above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="admin-modal__header" style={{ background: NAVY, padding: '20px' }}>
              <h2 style={{ color: '#fff', margin: 0 }}>{editingService ? 'Edit Service' : 'Add Service'}</h2>
            </div>
            <div className="admin-modal__body" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Service Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
                  placeholder="e.g., Free Zone Setup"
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Description (Optional)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'none' }} 
                />
              </div>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="activeToggle"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="activeToggle" style={{ cursor: 'pointer', fontWeight: 500 }}>Active (show on website)</label>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '12px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!title.trim()}
                  style={{ flex: 2, padding: '12px', background: !title.trim() ? '#ccc' : GOLD, color: '#fff', border: 'none', borderRadius: '4px', cursor: !title.trim() ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                >
                  Save Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
