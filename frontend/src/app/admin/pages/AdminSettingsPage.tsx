import { useState } from 'react';
import { AdminNavbar } from '../components/AdminNavbar';
import { Settings as SettingsIcon, Save, Image, FileText, Globe } from 'lucide-react';

const GOLD = '#C9963C';
const NAVY = '#0A1628';

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'content' | 'seo'>('general');
  const [companyName, setCompanyName] = useState('DNex');
  const [contactEmail, setContactEmail] = useState('info@dnex.com');
  const [contactPhone, setContactPhone] = useState('+971 123 4567');

  return (
    <div className="admin-page">
      <AdminNavbar title="Settings & Content" subtitle="Manage website configuration and static content" />
      
      <div className="admin-page__content">
        <div style={{ display: 'flex', gap: '20px', height: '100%' }}>
          
          {/* Settings Sidebar */}
          <div style={{ width: '250px', background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div 
              onClick={() => setActiveTab('general')}
              style={{
                padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px',
                background: activeTab === 'general' ? 'rgba(201, 150, 60, 0.1)' : 'transparent',
                color: activeTab === 'general' ? GOLD : '#444', fontWeight: activeTab === 'general' ? 600 : 400,
                display: 'flex', alignItems: 'center', gap: '10px'
              }}
            >
              <SettingsIcon size={18} /> General Settings
            </div>
            <div 
              onClick={() => setActiveTab('content')}
              style={{
                padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px',
                background: activeTab === 'content' ? 'rgba(201, 150, 60, 0.1)' : 'transparent',
                color: activeTab === 'content' ? GOLD : '#444', fontWeight: activeTab === 'content' ? 600 : 400,
                display: 'flex', alignItems: 'center', gap: '10px'
              }}
            >
              <FileText size={18} /> Site Content & Images
            </div>
            <div 
              onClick={() => setActiveTab('seo')}
              style={{
                padding: '10px 15px', borderRadius: '6px', cursor: 'pointer',
                background: activeTab === 'seo' ? 'rgba(201, 150, 60, 0.1)' : 'transparent',
                color: activeTab === 'seo' ? GOLD : '#444', fontWeight: activeTab === 'seo' ? 600 : 400,
                display: 'flex', alignItems: 'center', gap: '10px'
              }}
            >
              <Globe size={18} /> SEO Configuration
            </div>
          </div>

          {/* Settings Content area */}
          <div style={{ flex: 1, background: '#fff', borderRadius: '8px', padding: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            
            {activeTab === 'general' && (
              <div>
                <h3 style={{ marginBottom: '20px', color: NAVY }}>General Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#444' }}>Company Name</label>
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#444' }}>Contact Email</label>
                    <input 
                      type="email" 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#444' }}>Contact Phone</label>
                    <input 
                      type="text" 
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} 
                    />
                  </div>
                  <button style={{ 
                    marginTop: '10px', background: GOLD, color: '#fff', border: 'none', 
                    padding: '12px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content'
                  }}>
                    <Save size={18} /> Save Settings
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div>
                <h3 style={{ marginBottom: '20px', color: NAVY }}>Website Content Management</h3>
                <p style={{ color: '#666', marginBottom: '20px' }}>Update main text and photos for different sections of the site.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px' }}>
                    <h4 style={{ marginBottom: '15px' }}>Hero Section (Home Page)</h4>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Headline</label>
                    <input type="text" defaultValue="Setup Your Business in Dubai" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} />
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Sub-headline</label>
                    <textarea rows={3} defaultValue="We provide expert guidance to open your company quickly." style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }}></textarea>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '100px', height: '60px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                        <Image color="#ccc" />
                      </div>
                      <button style={{ border: '1px solid #ddd', padding: '8px 15px', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}>Change Hero Image</button>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px' }}>
                    <h4 style={{ marginBottom: '15px' }}>About Us Section</h4>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Content</label>
                    <textarea rows={5} defaultValue="DNex is a leading corporate service provider..." style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}></textarea>
                  </div>

                  <button style={{ 
                    background: GOLD, color: '#fff', border: 'none', 
                    padding: '12px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content'
                  }}>
                    <Save size={18} /> Update Content
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div>
                <h3 style={{ marginBottom: '20px', color: NAVY }}>SEO Configuration</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#444' }}>Global Meta Title</label>
                    <input type="text" defaultValue="DNex | Business Setup in Dubai" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#444' }}>Global Meta Description</label>
                    <textarea rows={4} defaultValue="Expert business setup consultants in Dubai, UAE." style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}></textarea>
                  </div>
                  <button style={{ 
                    marginTop: '10px', background: GOLD, color: '#fff', border: 'none', 
                    padding: '12px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content'
                  }}>
                    <Save size={18} /> Save SEO Info
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
