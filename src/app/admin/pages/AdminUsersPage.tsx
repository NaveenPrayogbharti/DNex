import { useState, useEffect } from 'react';
import { AdminNavbar } from '../components/AdminNavbar';
import { Users as UsersIcon, Plus, Edit, Trash2, Shield, User, MessageSquare } from 'lucide-react';

const GOLD = '#C9963C';

type Role = 'superadmin' | 'content' | 'support';

interface AdminUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

// Initial mock data until backend is fully hooked up
const INITIAL_USERS: AdminUser[] = [
  { id: '1', email: 'admin@dnex.com', role: 'superadmin', name: 'Super Admin' },
  { id: '2', email: 'content@dnex.com', role: 'content', name: 'Content Manager' },
  { id: '3', email: 'support@dnex.com', role: 'support', name: 'Support Rep' },
];

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('support');

  // Sync form state when editing user changes
  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name);
      setEmail(editingUser.email);
      setRole(editingUser.role);
    } else {
      setName('');
      setEmail('');
      setRole('support');
    }
  }, [editingUser]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this admin user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleSave = () => {
    if (!name || !email) {
      alert("Name and Email are required");
      return;
    }
    
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, name, email, role } : u));
    } else {
      const newUser: AdminUser = {
        id: Date.now().toString(),
        name,
        email,
        role
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'superadmin': return <Shield size={16} />;
      case 'content': return <User size={16} />;
      case 'support': return <MessageSquare size={16} />;
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'superadmin': return 'Super Admin';
      case 'content': return 'Content Team';
      case 'support': return 'Support Team';
    }
  };

  return (
    <div className="admin-page">
      <AdminNavbar title="Admin Users" subtitle="Manage team members and roles" />
      
      <div className="admin-page__content">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>User Management</h2>
          <button 
            onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
            style={{ 
              background: GOLD, color: '#fff', border: 'none', 
              padding: '10px 20px', borderRadius: '4px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
            }}
          >
            <Plus size={18} /> Add User
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="admin-table__row">
                  <td style={{ fontWeight: 600 }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getRoleIcon(user.role)}
                      <span>{getRoleLabel(user.role)}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#666' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Simple Modal for Users */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="admin-modal__header" style={{ background: '#0A1628', padding: '20px' }}>
              <h2 style={{ color: '#fff', margin: 0 }}>{editingUser ? 'Edit User' : 'Add User'}</h2>
            </div>
            <div className="admin-modal__body" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Role</label>
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value as Role)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="superadmin">Super Admin (All access)</option>
                  <option value="content">Content Team (Content changes only)</option>
                  <option value="support">Support Team (Inquiries only)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '12px', background: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  style={{ flex: 2, padding: '12px', background: GOLD, color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Save User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
