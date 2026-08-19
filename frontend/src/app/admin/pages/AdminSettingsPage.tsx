import { useState, useEffect } from 'react';
import { AdminNavbar } from '../components/AdminNavbar';
import { Settings as SettingsIcon, Save, Image, FileText, Globe } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const GOLD = '#C9963C';
const NAVY = '#0A1628';

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'content' | 'seo'>('general');
  const [companyName, setCompanyName] = useState('DNex');
  const [contactEmail, setContactEmail] = useState('info@dnex.com');
  const [contactPhone, setContactPhone] = useState('+971 551251185');
  
  const [seoTitle, setSeoTitle] = useState('DNex | Business Setup in Dubai');
  const [seoDescription, setSeoDescription] = useState('Expert business setup consultants in Dubai, UAE.');

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('admin_settings').select('*');
      if (error) throw error;
      if (data) {
        const settingsMap: Record<string, string> = {};
        data.forEach((row: any) => {
          settingsMap[row.key] = row.value;
        });
        if (settingsMap['company_name']) setCompanyName(settingsMap['company_name']);
        if (settingsMap['contact_email']) setContactEmail(settingsMap['contact_email']);
        if (settingsMap['contact_phone']) setContactPhone(settingsMap['contact_phone']);
        if (settingsMap['seo_title']) setSeoTitle(settingsMap['seo_title']);
        if (settingsMap['seo_description']) setSeoDescription(settingsMap['seo_description']);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const updates = [
        { key: 'company_name', value: companyName },
        { key: 'contact_email', value: contactEmail },
        { key: 'contact_phone', value: contactPhone },
        { key: 'seo_title', value: seoTitle },
        { key: 'seo_description', value: seoDescription },
      ];
      
      const { error } = await supabase.from('admin_settings').upsert(updates, { onConflict: 'key' });
      if (error) throw error;
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <AdminNavbar title="Settings & Content" subtitle="Loading..." />
        <div style={{ display:'flex', justifyContent:'center', padding:'60px' }}>
          <div style={{ width:36, height:36, border:`3px solid rgba(0,0,0,0.1)`, borderTopColor:GOLD, borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
        </div>
      </div>
    );
  }

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
                  <button 
                    onClick={saveSettings}
                    disabled={saving}
                    style={{ 
                      marginTop: '10px', background: GOLD, color: '#fff', border: 'none', 
                      padding: '12px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                      display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content'
                    }}>
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div>
                <h3 style={{ marginBottom: '20px', color: NAVY }}>Website Content Management</h3>
                <p style={{ color: '#666', marginBottom: '20px' }}>Update main text and photos for different sections of the site.</p>
                <p style={{ color: '#059669', marginBottom: '20px', fontWeight: 'bold' }}>Note: Please use the "Content" menu tab for comprehensive content management.</p>
              </div>
            )}

            {activeTab === 'seo' && (
              <div>
                <h3 style={{ marginBottom: '20px', color: NAVY }}>SEO Configuration</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#444' }}>Global Meta Title</label>
                    <input 
                      type="text" 
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#444' }}>Global Meta Description</label>
                    <textarea 
                      rows={4} 
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                    ></textarea>
                  </div>
                  <button 
                    onClick={saveSettings}
                    disabled={saving}
                    style={{ 
                      marginTop: '10px', background: GOLD, color: '#fff', border: 'none', 
                      padding: '12px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                      display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content'
                    }}>
                    <Save size={18} /> {saving ? 'Saving...' : 'Save SEO Info'}
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
