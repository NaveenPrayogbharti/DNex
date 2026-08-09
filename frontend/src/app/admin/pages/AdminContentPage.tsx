import { useState, useEffect } from 'react';
import { AdminNavbar } from '../components/AdminNavbar';
import { CommunicationTemplates } from '../components/CommunicationTemplates';
import {
  Globe, Save, Edit, ChevronDown, ChevronUp, Plus, Trash2, Image,
  FileText, Star, Phone, MessageSquare, RefreshCw,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useContentStore } from '../../../store/contentStore';

const GOLD = '#C9963C';
const NAVY = '#0A1628';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ContentSection {
  id: string;
  section_key: string;
  label: string;
  fields: ContentField[];
}

interface ContentField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'tel' | 'number';
  value: string;
  placeholder?: string;
}

// ── Default content structure (matches website sections) ──────────────────────

const CONTENT_SCHEMA: ContentSection[] = [
  {
    id: 'hero',
    section_key: 'hero',
    label: '🏠 Homepage Hero Section',
    fields: [
      { key: 'hero_headline', label: 'Main Headline', type: 'text', value: 'Your Gateway to Business Success in UAE', placeholder: 'Main headline shown on homepage' },
      { key: 'hero_subheadline', label: 'Sub Headline', type: 'textarea', value: 'Expert business setup, visa processing, and PRO services to help you establish and grow your business in the UAE.', placeholder: '' },
      { key: 'hero_cta_primary', label: 'Primary Button Text', type: 'text', value: 'Get Started Today', placeholder: '' },
      { key: 'hero_cta_secondary', label: 'Secondary Button Text', type: 'text', value: 'Explore Services', placeholder: '' },
    ],
  },
  {
    id: 'contact',
    section_key: 'contact',
    label: '📞 Contact Information',
    fields: [
      { key: 'contact_phone_primary', label: 'Primary Phone', type: 'tel', value: '+971 50 000 0000', placeholder: '+971 XX XXX XXXX' },
      { key: 'contact_phone_secondary', label: 'Secondary Phone', type: 'tel', value: '', placeholder: '+971 XX XXX XXXX' },
      { key: 'contact_email', label: 'Email Address', type: 'text', value: 'info@dnexbusiness.com', placeholder: 'contact@yourdomain.com' },
      { key: 'contact_whatsapp', label: 'WhatsApp Number', type: 'tel', value: '+971 50 000 0000', placeholder: '+971 XX XXX XXXX (with country code)' },
      { key: 'contact_address', label: 'Office Address', type: 'textarea', value: 'Dubai, United Arab Emirates', placeholder: 'Full office address' },
      { key: 'contact_hours', label: 'Business Hours', type: 'text', value: 'Mon–Sat, 9:00 AM – 6:00 PM GST', placeholder: '' },
    ],
  },
  {
    id: 'about',
    section_key: 'about',
    label: '🏢 About Us Section',
    fields: [
      { key: 'about_tagline', label: 'Company Tagline', type: 'text', value: 'Trusted Business Setup Experts in UAE', placeholder: '' },
      { key: 'about_description', label: 'Company Description', type: 'textarea', value: 'DNex Business Setup is a leading business consultancy in the UAE, specializing in company formation, visa processing, and PRO services.', placeholder: '' },
      { key: 'about_years_experience', label: 'Years of Experience', type: 'number', value: '10', placeholder: '' },
      { key: 'about_clients_served', label: 'Clients Served', type: 'number', value: '2000', placeholder: '' },
      { key: 'about_countries', label: 'Countries Served', type: 'number', value: '45', placeholder: '' },
    ],
  },
  {
    id: 'seo',
    section_key: 'seo',
    label: '🔍 SEO & Meta Tags',
    fields: [
      { key: 'seo_title', label: 'Page Title (Homepage)', type: 'text', value: 'DNex Business Setup | UAE Company Formation Experts', placeholder: '' },
      { key: 'seo_description', label: 'Meta Description', type: 'textarea', value: 'Expert business setup, visa processing, and PRO services in UAE. Company formation in Dubai free zones and mainland. Contact us today.', placeholder: 'Max 160 characters' },
      { key: 'seo_keywords', label: 'Meta Keywords', type: 'textarea', value: 'UAE business setup, Dubai company formation, free zone company, mainland company, visa processing UAE', placeholder: 'Comma-separated keywords' },
    ],
  },
  {
    id: 'social',
    section_key: 'social',
    label: '📱 Social Media Links',
    fields: [
      { key: 'social_linkedin', label: 'LinkedIn URL', type: 'url', value: '', placeholder: 'https://linkedin.com/company/...' },
      { key: 'social_instagram', label: 'Instagram URL', type: 'url', value: '', placeholder: 'https://instagram.com/...' },
      { key: 'social_facebook', label: 'Facebook URL', type: 'url', value: '', placeholder: 'https://facebook.com/...' },
      { key: 'social_twitter', label: 'X (Twitter) URL', type: 'url', value: '', placeholder: 'https://x.com/...' },
    ],
  },
  {
    id: 'testimonials',
    section_key: 'testimonials',
    label: '⭐ Testimonials',
    fields: [
      { key: 'testimonial_1_name', label: 'Testimonial 1 — Name', type: 'text', value: 'Ahmed Al Rashid', placeholder: '' },
      { key: 'testimonial_1_role', label: 'Testimonial 1 — Role/Company', type: 'text', value: 'CEO, Gulf Ventures LLC', placeholder: '' },
      { key: 'testimonial_1_text', label: 'Testimonial 1 — Quote', type: 'textarea', value: 'DNex made our company formation incredibly smooth and fast. Highly recommended!', placeholder: '' },
      { key: 'testimonial_2_name', label: 'Testimonial 2 — Name', type: 'text', value: 'Priya Sharma', placeholder: '' },
      { key: 'testimonial_2_role', label: 'Testimonial 2 — Role/Company', type: 'text', value: 'Founder, TechStart FZE', placeholder: '' },
      { key: 'testimonial_2_text', label: 'Testimonial 2 — Quote', type: 'textarea', value: 'Professional, efficient, and transparent throughout the process. Great team!', placeholder: '' },
      { key: 'testimonial_3_name', label: 'Testimonial 3 — Name', type: 'text', value: 'Sarah Johnson', placeholder: '' },
      { key: 'testimonial_3_role', label: 'Testimonial 3 — Role/Company', type: 'text', value: 'Managing Partner, Dubai Trade Co.', placeholder: '' },
      { key: 'testimonial_3_text', label: 'Testimonial 3 — Quote', type: 'textarea', value: 'Exceptional service quality and very knowledgeable about UAE business regulations.', placeholder: '' },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminContentPage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'website' | 'templates'>('website');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ hero: true, contact: true });
  const { fetchContent } = useContentStore();

  // Load from Supabase (fallback: localStorage)
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_content')
          .select('key, value');
        if (!error && data) {
          const map: Record<string, string> = {};
          data.forEach((row: { key: string; value: string }) => { map[row.key] = row.value; });
          setContent(map);
        } else {
          // Fallback to localStorage
          const saved = localStorage.getItem('dnex_content_config');
          if (saved) setContent(JSON.parse(saved));
          else {
            // Initialize with defaults
            const defaults: Record<string, string> = {};
            CONTENT_SCHEMA.forEach(s => s.fields.forEach(f => { defaults[f.key] = f.value; }));
            setContent(defaults);
          }
        }
      } catch {
        const saved = localStorage.getItem('dnex_content_config');
        if (saved) setContent(JSON.parse(saved));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateField = (key: string, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      // Save to localStorage always
      localStorage.setItem('dnex_content_config', JSON.stringify(content));

      // Try Supabase upsert
      const rows = Object.entries(content).map(([key, value]) => ({ key, value }));
      const { error } = await supabase
        .from('admin_content')
        .upsert(rows, { onConflict: 'key' });

      if (error) console.warn('[Content] Supabase unavailable, saved to localStorage:', error.message);
      
      // Update global content store
      await fetchContent();
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const resetSection = (section: ContentSection) => {
    if (!confirm(`Reset "${section.label}" to default values?`)) return;
    const updates: Record<string, string> = {};
    section.fields.forEach(f => { updates[f.key] = f.value; });
    setContent(prev => ({ ...prev, ...updates }));
    setSaved(false);
  };

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getValue = (field: ContentField) => content[field.key] ?? field.value;

  if (loading) {
    return (
      <div className="admin-page">
        <AdminNavbar title="Content Management" subtitle="Loading..." />
        <div style={{ display:'flex', justifyContent:'center', padding:'60px' }}>
          <div style={{ width:36, height:36, border:`3px solid rgba(0,0,0,0.1)`, borderTopColor:GOLD, borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <AdminNavbar title="Content Management" subtitle="Manage your website content and templates from here" />

      <div className="admin-page__content">
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
          <button
            onClick={() => setActiveTab('website')}
            style={{
              background: activeTab === 'website' ? GOLD : '#f8fafc',
              color: activeTab === 'website' ? '#fff' : NAVY,
              border: '1px solid #e2e8f0',
              padding: '10px 20px',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Globe size={16} /> Website Content
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            style={{
              background: activeTab === 'templates' ? GOLD : '#f8fafc',
              color: activeTab === 'templates' ? '#fff' : NAVY,
              border: '1px solid #e2e8f0',
              padding: '10px 20px',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <MessageSquare size={16} /> Communication Templates
          </button>
        </div>

        {activeTab === 'templates' ? (
          <CommunicationTemplates />
        ) : (
          <>
            {/* Top Action Bar */}
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          background:'#fff', border:'1px solid #e2e8f0', borderRadius:12,
          padding:'16px 20px', marginBottom:20,
          boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div>
            <div style={{ fontWeight:700, fontSize:16, color:NAVY, display:'flex', alignItems:'center', gap:8 }}>
              <Globe size={18} color={GOLD} /> Website Content Editor
            </div>
            <div style={{ fontSize:13, color:'#64748b', marginTop:2 }}>
              Changes are saved to Supabase and used across the website. Some fields require a page refresh to apply.
            </div>
          </div>
          <button
            onClick={saveAll}
            disabled={saving}
            style={{
              background: saved ? '#10b981' : GOLD,
              color: '#fff', border:'none', padding:'10px 24px',
              borderRadius:8, cursor:'pointer', fontWeight:700,
              display:'flex', alignItems:'center', gap:8, fontSize:14,
              transition:'background 0.3s',
            }}
          >
            {saving ? <><RefreshCw size={16} style={{ animation:'spin 0.7s linear infinite' }}/> Saving...</>
             : saved ? <><Save size={16}/> Saved!</>
             : <><Save size={16}/> Save All Changes</>}
          </button>
        </div>

        {/* Content Sections */}
        {CONTENT_SCHEMA.map(section => (
          <div key={section.id} style={{
            background:'#fff', border:'1px solid #e2e8f0', borderRadius:12,
            marginBottom:16, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.04)',
          }}>
            {/* Section Header */}
            <div
              style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'16px 20px', cursor:'pointer',
                borderBottom: openSections[section.id] ? '1px solid #e2e8f0' : 'none',
                background: openSections[section.id] ? '#fafafa' : '#fff',
              }}
              onClick={() => toggleSection(section.id)}
            >
              <div style={{ fontWeight:700, fontSize:15, color:NAVY }}>{section.label}</div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); resetSection(section); }}
                  title="Reset to defaults"
                  style={{ border:'none', background:'transparent', cursor:'pointer', color:'#94a3b8', fontSize:12, display:'flex', alignItems:'center', gap:4 }}
                >
                  <RefreshCw size={13} /> Reset
                </button>
                {openSections[section.id] ? <ChevronUp size={18} color="#64748b"/> : <ChevronDown size={18} color="#64748b"/>}
              </div>
            </div>

            {/* Fields */}
            {openSections[section.id] && (
              <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:16 }}>
                {section.fields.map(field => (
                  <div key={field.key}>
                    <label style={{ display:'block', marginBottom:6, fontWeight:600, fontSize:13, color:'#374151' }}>
                      {field.label}
                      <span style={{ marginLeft:8, fontSize:11, color:'#94a3b8', fontFamily:'monospace', fontWeight:400 }}>
                        {field.key}
                      </span>
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={getValue(field)}
                        onChange={e => updateField(field.key, e.target.value)}
                        rows={3}
                        placeholder={field.placeholder}
                        style={{
                          width:'100%', padding:'10px 12px',
                          border:'1px solid #e2e8f0', borderRadius:8,
                          fontSize:14, color:'#1e293b', outline:'none',
                          resize:'vertical', fontFamily:'inherit',
                          background:'#f8fafc', boxSizing:'border-box',
                        }}
                        onFocus={e => e.target.style.borderColor = GOLD}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={getValue(field)}
                        onChange={e => updateField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        style={{
                          width:'100%', padding:'10px 12px',
                          border:'1px solid #e2e8f0', borderRadius:8,
                          fontSize:14, color:'#1e293b', outline:'none',
                          background:'#f8fafc', boxSizing:'border-box',
                        }}
                        onFocus={e => e.target.style.borderColor = GOLD}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Info Box */}
        <div style={{
          padding:'16px 20px', background:'rgba(201,150,60,0.06)',
          border:'1px solid rgba(201,150,60,0.2)', borderRadius:12, marginTop:8,
        }}>
          <div style={{ fontWeight:700, color:GOLD, marginBottom:6, fontSize:14 }}>
            📌 How Content Management Works
          </div>
          <ul style={{ margin:0, paddingLeft:20, color:'#475569', fontSize:13, lineHeight:1.8 }}>
            <li>Content is stored in Supabase (<code>admin_content</code> table) and falls back to localStorage if unavailable.</li>
            <li>To use these values in your website, import <code>useContentStore()</code> in any page component.</li>
            <li>The <strong>admin_content</strong> Supabase table needs <code>key</code> (text, primary) and <code>value</code> (text) columns.</li>
            <li>Run the SQL below to set up the table (one time).</li>
          </ul>
          <pre style={{
            marginTop:12, padding:'12px 16px',
            background:'#0A1628', color:'#e2e8f0', borderRadius:8,
            fontSize:12, overflowX:'auto',
          }}>
{`CREATE TABLE IF NOT EXISTS admin_content (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
ALTER TABLE admin_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_read"  ON admin_content FOR SELECT USING (true);
CREATE POLICY "admin_write" ON admin_content FOR ALL USING (auth.role() = 'authenticated');`}
          </pre>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
