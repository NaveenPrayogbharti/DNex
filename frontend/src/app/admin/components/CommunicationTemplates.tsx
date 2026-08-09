import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Mail, MessageCircle, Save, Plus, Trash2, Edit } from 'lucide-react';

const GOLD = '#C9963C';
const NAVY = '#0A1628';

interface Template {
  id: string;
  type: string;
  name: string;
  subject: string | null;
  body: string;
  variables: string[];
}

export function CommunicationTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase.from('system_templates').select('*').order('type').order('name');
      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    try {
      if (selectedTemplate.id === 'new') {
        const { id, ...rest } = selectedTemplate;
        const { error } = await supabase.from('system_templates').insert([rest]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('system_templates').update({
          name: selectedTemplate.name,
          subject: selectedTemplate.subject,
          body: selectedTemplate.body,
        }).eq('id', selectedTemplate.id);
        if (error) throw error;
      }
      alert('Template saved successfully!');
      fetchTemplates();
      setSelectedTemplate(null);
    } catch (err: any) {
      alert(`Error saving template: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      const { error } = await supabase.from('system_templates').delete().eq('id', id);
      if (error) throw error;
      fetchTemplates();
      if (selectedTemplate?.id === id) setSelectedTemplate(null);
    } catch (err: any) {
      alert(`Error deleting template: ${err.message}`);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading templates...</div>;
  }

  return (
    <div style={{ display: 'flex', gap: 20, minHeight: 600 }}>
      {/* Sidebar List */}
      <div style={{ width: 300, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: NAVY }}>Templates</span>
          <button 
            onClick={() => setSelectedTemplate({ id: 'new', type: 'email', name: 'New Template', subject: '', body: '', variables: [] })}
            style={{ background: 'transparent', border: 'none', color: GOLD, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Plus size={16} /> Add
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {templates.map(t => (
            <div 
              key={t.id} 
              onClick={() => setSelectedTemplate(t)}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f1f5f9',
                cursor: 'pointer',
                background: selectedTemplate?.id === t.id ? '#f8fafc' : '#fff',
                borderLeft: selectedTemplate?.id === t.id ? `3px solid ${GOLD}` : '3px solid transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {t.type === 'email' ? <Mail size={14} color="#64748b" /> : <MessageCircle size={14} color="#10b981" />}
                <span style={{ fontWeight: 600, fontSize: 13, color: NAVY }}>{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
        {selectedTemplate ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 18, color: NAVY, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Edit size={18} color={GOLD} /> 
                {selectedTemplate.id === 'new' ? 'Create Template' : 'Edit Template'}
              </h2>
              <div style={{ display: 'flex', gap: 12 }}>
                {selectedTemplate.id !== 'new' && (
                  <button onClick={() => handleDelete(selectedTemplate.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Trash2 size={16} /> Delete
                  </button>
                )}
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  style={{ background: GOLD, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#374151' }}>Template Name</label>
                <input 
                  type="text" 
                  value={selectedTemplate.name}
                  onChange={e => setSelectedTemplate(p => p ? {...p, name: e.target.value} : p)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                />
              </div>
              <div style={{ width: 150 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#374151' }}>Type</label>
                <select 
                  value={selectedTemplate.type}
                  onChange={e => setSelectedTemplate(p => p ? {...p, type: e.target.value} : p)}
                  disabled={selectedTemplate.id !== 'new'}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                >
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
            </div>

            {selectedTemplate.type === 'email' && (
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#374151' }}>Email Subject</label>
                <input 
                  type="text" 
                  value={selectedTemplate.subject || ''}
                  onChange={e => setSelectedTemplate(p => p ? {...p, subject: e.target.value} : p)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                />
              </div>
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
                <label style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>Message Body (HTML for Email, Text for WhatsApp)</label>
                {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                  <span style={{ fontSize: 12, color: '#64748b' }}>Variables: {selectedTemplate.variables.map(v => `{{${v}}}`).join(', ')}</span>
                )}
              </div>
              <textarea 
                value={selectedTemplate.body}
                onChange={e => setSelectedTemplate(p => p ? {...p, body: e.target.value} : p)}
                style={{ flex: 1, minHeight: 300, padding: '12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontFamily: 'monospace', outline: 'none', resize: 'vertical' }}
              />
            </div>

          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', flexDirection: 'column', gap: 12 }}>
            <Mail size={48} opacity={0.2} />
            <p>Select a template from the left or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
