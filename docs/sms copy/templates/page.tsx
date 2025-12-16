'use client';

import { useState, useEffect } from 'react';

interface SmsTemplate {
  id: string;
  name: string;
  code: string;
  content: string;
  variables: string[];
  status: 'active' | 'inactive' | 'pending';
  description: string | null;
  created_at: string;
  updated_at: string;
}

const styles = {
  page: {
    padding: '24px',
    background: '#f1f5f9',
    minHeight: '100vh',
  } as React.CSSProperties,
  header: {
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  } as React.CSSProperties,
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px',
  } as React.CSSProperties,
  addBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)',
    color: 'white',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(8, 145, 178, 0.3)',
  } as React.CSSProperties,
  infoCard: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
    borderRadius: '12px',
    padding: '20px 24px',
    marginBottom: '24px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  } as React.CSSProperties,
  infoIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as React.CSSProperties,
  infoContent: {
    flex: 1,
  } as React.CSSProperties,
  infoTitle: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '4px',
  } as React.CSSProperties,
  infoDesc: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.5,
  } as React.CSSProperties,
  docLink: {
    color: '#22d3ee',
    textDecoration: 'none',
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '16px',
  } as React.CSSProperties,
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  } as React.CSSProperties,
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  } as React.CSSProperties,
  cardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#0f172a',
    margin: 0,
  } as React.CSSProperties,
  cardCode: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px',
    fontFamily: 'monospace',
  } as React.CSSProperties,
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
  } as React.CSSProperties,
  statusActive: {
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
  } as React.CSSProperties,
  statusInactive: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
  } as React.CSSProperties,
  statusPending: {
    background: 'rgba(234, 179, 8, 0.1)',
    color: '#eab308',
  } as React.CSSProperties,
  cardContent: {
    background: '#f8fafc',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
    fontSize: '14px',
    color: '#334155',
    lineHeight: 1.6,
  } as React.CSSProperties,
  variable: {
    background: 'linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    display: 'inline-block',
    margin: '0 2px',
  } as React.CSSProperties,
  variablesLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '8px',
  } as React.CSSProperties,
  variablesList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
    marginBottom: '12px',
  } as React.CSSProperties,
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #e2e8f0',
  } as React.CSSProperties,
  cardTime: {
    fontSize: '12px',
    color: '#94a3b8',
  } as React.CSSProperties,
  cardActions: {
    display: 'flex',
    gap: '8px',
  } as React.CSSProperties,
  actionBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    background: 'white',
    color: '#64748b',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  // Modal styles
  modal: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  } as React.CSSProperties,
  modalContent: {
    background: 'white',
    borderRadius: '16px',
    width: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
  } as React.CSSProperties,
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  modalTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#0f172a',
    margin: 0,
  } as React.CSSProperties,
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px',
  } as React.CSSProperties,
  modalBody: {
    padding: '24px',
  } as React.CSSProperties,
  formGroup: {
    marginBottom: '20px',
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#334155',
    marginBottom: '8px',
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '100px',
    boxSizing: 'border-box' as const,
    lineHeight: 1.6,
  } as React.CSSProperties,
  hint: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '6px',
  } as React.CSSProperties,
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  } as React.CSSProperties,
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: 'white',
    color: '#64748b',
    fontSize: '14px',
    cursor: 'pointer',
  } as React.CSSProperties,
  submitBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)',
    color: 'white',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
  } as React.CSSProperties,
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #0891b2',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  } as React.CSSProperties,
  empty: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    color: '#64748b',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  } as React.CSSProperties,
};

export default function SmsTemplatesPage() {
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SmsTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    content: '',
    description: '',
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/v2/sms-templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('获取短信模板失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTemplate(null);
    setFormData({ name: '', code: '', content: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (template: SmsTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      code: template.code,
      content: template.content,
      description: template.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此模板吗？')) return;
    
    try {
      const res = await fetch(`/api/v2/sms-templates/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchTemplates();
      } else {
        alert(data.error?.message || '删除失败');
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleToggleStatus = async (template: SmsTemplate) => {
    const newStatus = template.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/v2/sms-templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTemplates();
      } else {
        alert(data.error?.message || '更新失败');
      }
    } catch (error) {
      alert('更新失败');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code || !formData.content) {
      alert('请填写完整信息');
      return;
    }

    setSaving(true);
    try {
      const url = editingTemplate 
        ? `/api/v2/sms-templates/${editingTemplate.id}` 
        : '/api/v2/sms-templates';
      const method = editingTemplate ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (data.success) {
        fetchTemplates();
        setShowModal(false);
      } else {
        alert(data.error?.message || '保存失败');
      }
    } catch (error) {
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return styles.statusActive;
      case 'inactive': return styles.statusInactive;
      case 'pending': return styles.statusPending;
      default: return {};
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '已启用';
      case 'inactive': return '已禁用';
      case 'pending': return '待审核';
      default: return status;
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderContent = (content: string) => {
    return content.replace(/\{(\w+)\}/g, (match) => {
      return `<span style="background: linear-gradient(135deg, #0891b2, #22d3ee); color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">${match}</span>`;
    });
  };

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>短信模板管理</h1>
          <p style={styles.subtitle}>管理短信通知模板，使用亿美软通短信服务</p>
        </div>
        <button style={styles.addBtn} onClick={handleAdd}>
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建模板
        </button>
      </div>

      <div style={styles.infoCard}>
        <div style={styles.infoIcon}>
          <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div style={styles.infoContent}>
          <div style={styles.infoTitle}>亿美软通短信服务</div>
          <div style={styles.infoDesc}>
            当前系统已接入亿美软通短信平台，支持模板短信发送。变量使用 {'{变量名}'} 格式定义。
            <a href="https://www.b2m.cn/static/doc/sms/sms_normaltemplate.html" target="_blank" rel="noopener noreferrer" style={styles.docLink}>
              查看API文档 →
            </a>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>
          <div style={styles.spinner} />
        </div>
      ) : templates.length === 0 ? (
        <div style={styles.empty}>
          <p>暂无短信模板</p>
          <button style={{ ...styles.addBtn, marginTop: '16px' }} onClick={handleAdd}>
            创建第一个模板
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {templates.map(template => (
            <div key={template.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>{template.name}</h3>
                  <div style={styles.cardCode}>模板编码: {template.code}</div>
                </div>
                <span style={{ ...styles.statusBadge, ...getStatusStyle(template.status) }}>
                  {getStatusText(template.status)}
                </span>
              </div>
              
              <div 
                style={styles.cardContent}
                dangerouslySetInnerHTML={{ __html: renderContent(template.content) }}
              />
              
              <div style={styles.variablesLabel}>模板变量</div>
              <div style={styles.variablesList}>
                {template.variables && template.variables.length > 0 ? (
                  template.variables.map(v => (
                    <span key={v} style={styles.variable}>{v}</span>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>无变量</span>
                )}
              </div>
              
              <div style={styles.cardFooter}>
                <span style={styles.cardTime}>更新于 {formatTime(template.updated_at)}</span>
                <div style={styles.cardActions}>
                  <button 
                    style={styles.actionBtn} 
                    onClick={() => handleToggleStatus(template)}
                  >
                    {template.status === 'active' ? '禁用' : '启用'}
                  </button>
                  <button style={styles.actionBtn} onClick={() => handleEdit(template)}>编辑</button>
                  <button 
                    style={{ ...styles.actionBtn, color: '#ef4444', borderColor: '#fecaca' }} 
                    onClick={() => handleDelete(template.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editingTemplate ? '编辑模板' : '新建模板'}</h2>
              <button style={styles.closeBtn} onClick={() => setShowModal(false)}>
                <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>模板名称 *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：调度确认通知"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>模板编码 *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="例如：DISPATCH_CONFIRM"
                />
                <div style={styles.hint}>用于API调用时标识模板，建议使用大写字母和下划线</div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>模板内容 *</label>
                <textarea
                  style={styles.textarea}
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="请输入短信内容，变量使用 {变量名} 格式&#10;例如：尊敬的{driver_name}司机，您的调度单已确认"
                />
                <div style={styles.hint}>变量格式: {'{driver_name}'}, {'{order_no}'}, {'{station_name}'} 等</div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>模板描述</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="简要描述模板用途"
                />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>取消</button>
              <button style={styles.submitBtn} onClick={handleSubmit} disabled={saving}>
                {saving ? '保存中...' : (editingTemplate ? '保存修改' : '创建模板')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
