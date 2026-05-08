import { useState, useEffect, useCallback } from 'react';
import { CRMNavbar } from '../components/CRMNavbar';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import type { CRMTask } from '../services/taskService';
import { Plus, Trash2, Calendar, Flag } from 'lucide-react';

const GOLD = '#C9963C';

type Column = { id: CRMTask['status']; label: string; color: string };
const COLUMNS: Column[] = [
  { id: 'pending',     label: '📋 Pending',     color: '#f59e0b' },
  { id: 'in_progress', label: '⚡ In Progress',  color: '#3b82f6' },
  { id: 'done',        label: '✅ Done',         color: '#10b981' },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: '#94a3b8', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444',
};

export function TasksPage() {
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium' as CRMTask['priority'],
    due_date: '', assigned_to_name: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try { setTasks(await fetchTasks()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.title) return;
    try {
      await createTask({
        title: form.title,
        description: form.description,
        priority: form.priority,
        due_date: form.due_date || null,
        assigned_to_name: form.assigned_to_name || null,
        status: 'pending',
        case_id: null,
        assigned_to: null,
      });
      setForm({ title: '', description: '', priority: 'medium', due_date: '', assigned_to_name: '' });
      setShowForm(false);
      await load();
    } catch (e) { console.error(e); }
  };

  const moveTask = async (task: CRMTask, status: CRMTask['status']) => {
    try {
      await updateTask(task.id, { status });
      setTasks(ts => ts.map(t => t.id === task.id ? { ...t, status } : t));
    } catch (e) { console.error(e); }
  };

  const removeTask = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try { await deleteTask(id); await load(); }
    catch (e) { console.error(e); }
  };

  const isOverdue = (task: CRMTask) =>
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  const tasksByCol = (col: CRMTask['status']) => tasks.filter(t => t.status === col);

  if (loading) return <div className="crm-page"><CRMNavbar title="Tasks" /><div className="crm-spinner" /></div>;

  return (
    <div className="crm-page">
      <CRMNavbar title="Task Management" subtitle="Track and manage team tasks" />
      <div className="crm-page__content">

        {/* Add Task Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="crm-btn crm-btn--primary" onClick={() => setShowForm(v => !v)}>
            <Plus size={16} /> New Task
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="crm-table-wrap" style={{ padding: '20px' }}>
            <h3 style={{ color: '#fff', marginTop: 0 }}>Create Task</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input className="crm-input" placeholder="Task title *" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <textarea className="crm-textarea" rows={2} placeholder="Description (optional)"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <div className="crm-form-row">
                <div className="crm-form-group">
                  <label>Priority</label>
                  <select className="crm-select" value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value as CRMTask['priority'] }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="crm-form-group">
                  <label>Due Date</label>
                  <input type="date" className="crm-input" value={form.due_date}
                    onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                </div>
                <div className="crm-form-group">
                  <label>Assign To</label>
                  <input className="crm-input" placeholder="Team member name" value={form.assigned_to_name}
                    onChange={e => setForm(f => ({ ...f, assigned_to_name: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="crm-btn crm-btn--primary" onClick={handleCreate}>Create Task</button>
                <button className="crm-btn crm-btn--ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="crm-taskboard">
          {COLUMNS.map(col => (
            <div key={col.id} className="crm-taskboard__col">
              <div className="crm-taskboard__col-header">
                <div className="crm-taskboard__col-title" style={{ color: col.color }}>{col.label}</div>
                <span className="crm-taskboard__col-count">{tasksByCol(col.id).length}</span>
              </div>

              {tasksByCol(col.id).length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#475569', fontSize: '13px' }}>
                  No tasks
                </div>
              )}

              {tasksByCol(col.id).map(task => (
                <div key={task.id} className="crm-task-card">
                  <div className="crm-task-card__title">{task.title}</div>
                  {task.description && (
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{task.description}</div>
                  )}
                  <div className="crm-task-card__meta">
                    <span style={{ color: PRIORITY_COLORS[task.priority] }}>
                      <Flag size={11} /> {task.priority}
                    </span>
                    {task.due_date && (
                      <span className={isOverdue(task) ? 'crm-task-card__due-overdue' : ''}>
                        <Calendar size={11} /> {new Date(task.due_date).toLocaleDateString()}
                        {isOverdue(task) && ' ⚠'}
                      </span>
                    )}
                    {task.assigned_to_name && <span>👤 {task.assigned_to_name}</span>}
                  </div>

                  {/* Move buttons */}
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {COLUMNS.filter(c => c.id !== col.id).map(c => (
                      <button key={c.id} className="crm-btn crm-btn--ghost"
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                        onClick={() => moveTask(task, c.id)}>
                        → {c.label.split(' ')[1]}
                      </button>
                    ))}
                    <button className="crm-btn crm-btn--danger"
                      style={{ padding: '3px 8px', fontSize: '11px', marginLeft: 'auto' }}
                      onClick={() => removeTask(task.id)}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
