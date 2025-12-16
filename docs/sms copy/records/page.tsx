'use client';

import { useState } from 'react';

interface SmsRecord {
  id: string;
  mobile: string;
  content: string;
  templateCode: string;
  templateName: string;
  status: 'success' | 'failed' | 'pending';
  errorMsg?: string;
  sendTime: string;
  driverName?: string;
  orderId?: string;
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
  actions: {
    display: 'flex',
    gap: '12px',
  } as React.CSSProperties,
  sendBtn: {
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
  exportBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: 'white',
    color: '#64748b',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  } as React.CSSProperties,
  statCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  } as React.CSSProperties,
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '8px',
  } as React.CSSProperties,
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#0f172a',
  } as React.CSSProperties,
  filterBar: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '16px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  } as React.CSSProperties,
  filterSelect: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: 'white',
    fontSize: '14px',
    color: '#334155',
    minWidth: '120px',
    outline: 'none',
  } as React.CSSProperties,
  filterInput: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: 'white',
    fontSize: '14px',
    color: '#334155',
    outline: 'none',
    flex: 1,
    maxWidth: '200px',
  } as React.CSSProperties,
  searchBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#0f172a',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
  } as React.CSSProperties,
  table: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  } as React.CSSProperties,
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '80px 120px 1fr 120px 100px 160px 100px',
    padding: '14px 20px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '13px',
    fontWeight: 600,
    color: '#64748b',
  } as React.CSSProperties,
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '80px 120px 1fr 120px 100px 160px 100px',
    padding: '14px 20px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '14px',
    color: '#334155',
    alignItems: 'center',
  } as React.CSSProperties,
  mobile: {
    fontFamily: 'monospace',
    fontWeight: 500,
  } as React.CSSProperties,
  content: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    paddingRight: '20px',
  } as React.CSSProperties,
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
    display: 'inline-block',
  } as React.CSSProperties,
  statusSuccess: {
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
  } as React.CSSProperties,
  statusFailed: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
  } as React.CSSProperties,
  statusPending: {
    background: 'rgba(234, 179, 8, 0.1)',
    color: '#eab308',
  } as React.CSSProperties,
  actionBtn: {
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    background: 'white',
    color: '#64748b',
    fontSize: '12px',
    cursor: 'pointer',
  } as React.CSSProperties,
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderTop: '1px solid #e2e8f0',
    background: '#fafafa',
  } as React.CSSProperties,
  pageInfo: {
    fontSize: '14px',
    color: '#64748b',
  } as React.CSSProperties,
  pageButtons: {
    display: 'flex',
    gap: '8px',
  } as React.CSSProperties,
  pageBtn: {
    padding: '8px 14px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    background: 'white',
    color: '#334155',
    fontSize: '13px',
    cursor: 'pointer',
  } as React.CSSProperties,
  pageBtnActive: {
    background: '#0f172a',
    color: 'white',
    border: '1px solid #0f172a',
  } as React.CSSProperties,
  // Modal
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
    width: '500px',
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
  select: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    background: 'white',
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
};

// 模拟数据
const mockRecords: SmsRecord[] = [
  {
    id: '1',
    mobile: '138****1234',
    content: '【恒德能源】尊敬的张师傅司机，您的调度单DP202401150001已确认，请于14:00到达大宁CNG站进行装卸。',
    templateCode: 'DISPATCH_CONFIRM',
    templateName: '调度确认通知',
    status: 'success',
    sendTime: '2024-01-15 13:30:00',
    driverName: '张师傅',
    orderId: 'DP202401150001',
  },
  {
    id: '2',
    mobile: '139****5678',
    content: '【恒德能源】李师傅司机，因计划调整，您的预约时间调整为15:30，请及时确认。',
    templateCode: 'PLAN_ADJUST',
    templateName: '计划调整通知',
    status: 'success',
    sendTime: '2024-01-15 13:25:00',
    driverName: '李师傅',
  },
  {
    id: '3',
    mobile: '137****9012',
    content: '【恒德能源】管理员您好，鹏奥站今日下游计划存在偏差500m³，请及时协调调度。',
    templateCode: 'STATION_COORDINATE',
    templateName: '站点协调通知',
    status: 'failed',
    errorMsg: '手机号格式错误',
    sendTime: '2024-01-15 13:20:00',
  },
  {
    id: '4',
    mobile: '135****3456',
    content: '【恒德能源】王师傅司机，调度单DP202401150002装卸已完成，装卸量850m³。感谢您的配合！',
    templateCode: 'LOAD_COMPLETE',
    templateName: '装卸完成通知',
    status: 'pending',
    sendTime: '2024-01-15 13:15:00',
    driverName: '王师傅',
    orderId: 'DP202401150002',
  },
];

export default function SmsRecordsPage() {
  const [records] = useState<SmsRecord[]>(mockRecords);
  const [showSendModal, setShowSendModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchMobile, setSearchMobile] = useState('');

  const stats = {
    total: records.length,
    success: records.filter(r => r.status === 'success').length,
    failed: records.filter(r => r.status === 'failed').length,
    pending: records.filter(r => r.status === 'pending').length,
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'success': return styles.statusSuccess;
      case 'failed': return styles.statusFailed;
      case 'pending': return styles.statusPending;
      default: return {};
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return '发送成功';
      case 'failed': return '发送失败';
      case 'pending': return '发送中';
      default: return status;
    }
  };

  const filteredRecords = records.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchMobile && !r.mobile.includes(searchMobile)) return false;
    return true;
  });

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>发送记录</h1>
          <p style={styles.subtitle}>查看短信发送历史记录</p>
        </div>
        <div style={styles.actions}>
          <button style={styles.exportBtn}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导出记录
          </button>
          <button style={styles.sendBtn} onClick={() => setShowSendModal(true)}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            发送短信
          </button>
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>今日发送总数</div>
          <div style={styles.statValue}>{stats.total}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>发送成功</div>
          <div style={{ ...styles.statValue, color: '#22c55e' }}>{stats.success}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>发送失败</div>
          <div style={{ ...styles.statValue, color: '#ef4444' }}>{stats.failed}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>发送中</div>
          <div style={{ ...styles.statValue, color: '#eab308' }}>{stats.pending}</div>
        </div>
      </div>

      <div style={styles.filterBar}>
        <select 
          style={styles.filterSelect}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">全部状态</option>
          <option value="success">发送成功</option>
          <option value="failed">发送失败</option>
          <option value="pending">发送中</option>
        </select>
        <input
          type="text"
          style={styles.filterInput}
          placeholder="搜索手机号"
          value={searchMobile}
          onChange={e => setSearchMobile(e.target.value)}
        />
        <button style={styles.searchBtn}>查询</button>
      </div>

      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <span>ID</span>
          <span>手机号</span>
          <span>短信内容</span>
          <span>模板</span>
          <span>状态</span>
          <span>发送时间</span>
          <span>操作</span>
        </div>
        {filteredRecords.map(record => (
          <div key={record.id} style={styles.tableRow}>
            <span>{record.id}</span>
            <span style={styles.mobile}>{record.mobile}</span>
            <span style={styles.content} title={record.content}>{record.content}</span>
            <span>{record.templateName}</span>
            <span>
              <span style={{ ...styles.statusBadge, ...getStatusStyle(record.status) }}>
                {getStatusText(record.status)}
              </span>
            </span>
            <span>{record.sendTime}</span>
            <span>
              <button style={styles.actionBtn}>
                {record.status === 'failed' ? '重发' : '详情'}
              </button>
            </span>
          </div>
        ))}

        <div style={styles.pagination}>
          <span style={styles.pageInfo}>共 {filteredRecords.length} 条记录</span>
          <div style={styles.pageButtons}>
            <button style={styles.pageBtn}>上一页</button>
            <button style={{ ...styles.pageBtn, ...styles.pageBtnActive }}>1</button>
            <button style={styles.pageBtn}>2</button>
            <button style={styles.pageBtn}>下一页</button>
          </div>
        </div>
      </div>

      {/* 发送短信Modal */}
      {showSendModal && (
        <div style={styles.modal} onClick={() => setShowSendModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>发送短信</h2>
              <button style={styles.closeBtn} onClick={() => setShowSendModal(false)}>
                <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>选择模板</label>
                <select style={styles.select}>
                  <option value="">请选择短信模板</option>
                  <option value="DISPATCH_CONFIRM">调度确认通知</option>
                  <option value="PLAN_ADJUST">计划调整通知</option>
                  <option value="STATION_COORDINATE">站点协调通知</option>
                  <option value="LOAD_COMPLETE">装卸完成通知</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>接收手机号</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="请输入手机号，多个用逗号分隔"
                />
                <div style={styles.hint}>支持批量发送，多个手机号用逗号分隔</div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>模板参数</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="driver_name: 司机名称"
                />
                <input
                  type="text"
                  style={{ ...styles.input, marginTop: '8px' }}
                  placeholder="order_no: 调度单号"
                />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowSendModal(false)}>取消</button>
              <button style={styles.submitBtn}>发送</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
