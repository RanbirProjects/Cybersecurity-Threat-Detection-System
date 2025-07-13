import React, { useState } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [showThreatModal, setShowThreatModal] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@example.com' && password === 'password123') {
      setIsLoggedIn(true);
    } else {
      alert('Invalid credentials! Use: admin@example.com / password123');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setActiveTab('dashboard');
  };

  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleBlockIP = (ip) => {
    if (blockedIPs.includes(ip)) {
      showNotificationMessage(`IP ${ip} is already blocked!`, 'warning');
      return;
    }
    setBlockedIPs([...blockedIPs, ip]);
    showNotificationMessage(`IP ${ip} has been successfully blocked!`, 'success');
  };

  const handleGenerateReport = () => {
    const reportData = {
      totalThreats: threats.length,
      newThreats: threats.filter(t => t.status === 'new').length,
      criticalThreats: threats.filter(t => t.severity === 'critical').length,
      resolvedThreats: threats.filter(t => t.status === 'resolved').length,
      blockedIPs: blockedIPs.length,
      generatedAt: new Date().toISOString()
    };
    
    const reportBlob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(reportBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotificationMessage('Security report generated and downloaded successfully!', 'success');
  };

  const handleUpdateRules = () => {
    showNotificationMessage('Firewall rules updated successfully! New rules applied to all endpoints.', 'success');
  };

  const handleSendAlert = () => {
    showNotificationMessage('Security alert sent to all team members!', 'success');
  };

  const handleMarkAllRead = () => {
    notifications.forEach(notification => notification.read = true);
    showNotificationMessage('All notifications marked as read!', 'info');
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      notification.read = true;
    }
    showNotificationMessage(`Notification: ${notification.message}`, 'info');
  };

  const handleThreatAction = (action, threat) => {
    switch (action) {
      case 'investigate':
        setSelectedThreat(threat);
        setShowThreatModal(true);
        break;
      case 'block':
        handleBlockIP(threat.sourceIP);
        break;
      case 'view':
        setSelectedThreat(threat);
        setShowThreatModal(true);
        break;
      default:
        break;
    }
  };

  // Sample data
  const threats = [
    {
      id: 'THREAT-001',
      type: 'Brute Force',
      severity: 'high',
      status: 'new',
      sourceIP: '192.168.1.100',
      created: '2024-01-15',
      description: 'Multiple failed login attempts detected from suspicious IP',
      location: 'United States',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      attempts: 45,
      blocked: false
    },
    {
      id: 'THREAT-002',
      type: 'SQL Injection',
      severity: 'critical',
      status: 'investigating',
      sourceIP: '10.0.0.50',
      created: '2024-01-14',
      description: 'SQL injection attempt detected in login form',
      location: 'Russia',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
      attempts: 12,
      blocked: false
    },
    {
      id: 'THREAT-003',
      type: 'XSS Attack',
      severity: 'medium',
      status: 'resolved',
      sourceIP: '172.16.0.25',
      created: '2024-01-13',
      description: 'Cross-site scripting attempt in comment section',
      location: 'China',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      attempts: 3,
      blocked: true
    },
    {
      id: 'THREAT-004',
      type: 'DDoS Attack',
      severity: 'critical',
      status: 'investigating',
      sourceIP: '203.0.113.0/24',
      created: '2024-01-12',
      description: 'Distributed denial of service attack from multiple sources',
      location: 'Multiple',
      userAgent: 'Various',
      attempts: 1000,
      blocked: false
    },
    {
      id: 'THREAT-005',
      type: 'Phishing',
      severity: 'medium',
      status: 'new',
      sourceIP: '198.51.100.75',
      created: '2024-01-11',
      description: 'Phishing attempt targeting admin credentials',
      location: 'Nigeria',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      attempts: 1,
      blocked: false
    }
  ];

  const notifications = [
    {
      id: 1,
      type: 'alert',
      message: 'New critical threat detected: SQL Injection attempt',
      time: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      message: 'High number of failed login attempts detected',
      time: '15 minutes ago',
      read: false
    },
    {
      id: 3,
      type: 'info',
      message: 'System backup completed successfully',
      time: '1 hour ago',
      read: true
    },
    {
      id: 4,
      type: 'success',
      message: 'Threat THREAT-003 has been resolved',
      time: '2 hours ago',
      read: true
    }
  ];

  const auditLogs = [
    {
      id: 1,
      action: 'LOGIN',
      user: 'admin@example.com',
      ip: '192.168.1.10',
      timestamp: '2024-01-15 14:30:22',
      status: 'SUCCESS',
      details: 'User logged in successfully'
    },
    {
      id: 2,
      action: 'THREAT_BLOCKED',
      user: 'system',
      ip: '192.168.1.100',
      timestamp: '2024-01-15 14:25:15',
      status: 'BLOCKED',
      details: 'Brute force attempt blocked'
    },
    {
      id: 3,
      action: 'CONFIG_CHANGE',
      user: 'admin@example.com',
      ip: '192.168.1.10',
      timestamp: '2024-01-15 13:45:30',
      status: 'SUCCESS',
      details: 'Firewall rules updated'
    },
    {
      id: 4,
      action: 'LOGOUT',
      user: 'user@example.com',
      ip: '192.168.1.15',
      timestamp: '2024-01-15 13:20:45',
      status: 'SUCCESS',
      details: 'User logged out'
    }
  ];

  // Filter threats based on search and filters
  const filteredThreats = threats.filter(threat => {
    const matchesSearch = threat.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         threat.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         threat.sourceIP.includes(searchQuery) ||
                         threat.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || threat.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || threat.status === filterStatus;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const renderDashboard = () => (
    <div className="main-content">
      <div className="page-header">
        <div className="header-icon">📊</div>
        <div>
          <h1>Dashboard Overview</h1>
          <p>Real-time security monitoring and threat analysis</p>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🛡️</div>
          <h3>Total Threats</h3>
          <div className="stat-number">{threats.length}</div>
          <div className="stat-trend positive">+12% from yesterday</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <h3>New Threats</h3>
          <div className="stat-number">{threats.filter(t => t.status === 'new').length}</div>
          <div className="stat-trend negative">+5 new today</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <h3>Critical</h3>
          <div className="stat-number">{threats.filter(t => t.severity === 'critical').length}</div>
          <div className="stat-trend negative">+2 critical</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <h3>Resolved</h3>
          <div className="stat-number">{threats.filter(t => t.status === 'resolved').length}</div>
          <div className="stat-trend positive">+8 resolved</div>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="recent-threats">
          <div className="section-header">
            <div className="section-icon">🔍</div>
            <h2>Recent Threats</h2>
          </div>
          <table className="threats-table">
            <thead>
              <tr>
                <th>Threat ID</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Source IP</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {threats.slice(0, 5).map(threat => (
                <tr key={threat.id}>
                  <td>{threat.id}</td>
                  <td>{threat.type}</td>
                  <td><span className={`badge ${threat.severity}`}>{threat.severity}</span></td>
                  <td><span className={`badge ${threat.status}`}>{threat.status}</span></td>
                  <td>{threat.sourceIP}</td>
                  <td>{threat.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="quick-actions">
          <div className="section-header">
            <div className="section-icon">⚡</div>
            <h2>Quick Actions</h2>
          </div>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => handleBlockIP('192.168.1.100')}>
              <div className="action-icon">🔒</div>
              <span>Block IP</span>
            </button>
            <button className="action-btn" onClick={handleGenerateReport}>
              <div className="action-icon">📊</div>
              <span>Generate Report</span>
            </button>
            <button className="action-btn" onClick={handleUpdateRules}>
              <div className="action-icon">🔄</div>
              <span>Update Rules</span>
            </button>
            <button className="action-btn" onClick={handleSendAlert}>
              <div className="action-icon">📧</div>
              <span>Send Alert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderThreats = () => (
    <div className="main-content">
      <div className="page-header">
        <div className="header-icon">🛡️</div>
        <div>
          <h1>Threat Management</h1>
          <p>Monitor and manage security threats in real-time</p>
        </div>
      </div>
      
      <div className="threats-grid">
        {threats.map(threat => (
          <div key={threat.id} className="threat-card">
            <div className="threat-header">
              <div className="threat-id">
                <div className="threat-icon">🚨</div>
                <h3>{threat.id}</h3>
              </div>
              <span className={`badge ${threat.severity}`}>{threat.severity}</span>
            </div>
            <div className="threat-type">
              <div className="type-icon">
                {threat.type === 'Brute Force' && '🔨'}
                {threat.type === 'SQL Injection' && '💉'}
                {threat.type === 'XSS Attack' && '🎯'}
                {threat.type === 'DDoS Attack' && '🌊'}
                {threat.type === 'Phishing' && '🎣'}
              </div>
              {threat.type}
            </div>
            <div className="threat-description">{threat.description}</div>
            <div className="threat-details">
              <div className="detail-item">
                <span className="detail-label">🌍 Source IP:</span>
                <span className="detail-value">{threat.sourceIP}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📍 Location:</span>
                <span className="detail-value">{threat.location}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">🎯 Attempts:</span>
                <span className="detail-value">{threat.attempts}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📊 Status:</span>
                <span className={`badge ${threat.status}`}>{threat.status}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">🔒 Blocked:</span>
                <span className="detail-value">
                  {blockedIPs.includes(threat.sourceIP) ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            <div className="threat-actions">
              <button 
                className="btn-primary"
                onClick={() => handleThreatAction('investigate', threat)}
              >
                <span className="btn-icon">🔍</span>
                Investigate
              </button>
              <button 
                className="btn-secondary"
                onClick={() => handleThreatAction('block', threat)}
                disabled={blockedIPs.includes(threat.sourceIP)}
              >
                <span className="btn-icon">🚫</span>
                {blockedIPs.includes(threat.sourceIP) ? 'Blocked' : 'Block IP'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="main-content">
      <div className="page-header">
        <div className="header-icon">🔔</div>
        <div>
          <h1>Notifications Center</h1>
          <p>Stay updated with real-time security alerts and system notifications</p>
        </div>
      </div>
      
      <div className="notifications-container">
        <div className="notifications-header">
          <div className="notification-stats">
            <span className="stat-item">
              <span className="stat-number">{notifications.filter(n => !n.read).length}</span>
              <span className="stat-label">Unread</span>
            </span>
            <span className="stat-item">
              <span className="stat-number">{notifications.length}</span>
              <span className="stat-label">Total</span>
            </span>
          </div>
          <button className="btn-mark-all" onClick={handleMarkAllRead}>
            Mark All as Read
          </button>
        </div>
        
        <div className="notifications-list">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.type} ${!notification.read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                {notification.type === 'alert' && '🚨'}
                {notification.type === 'warning' && '⚠️'}
                {notification.type === 'info' && 'ℹ️'}
                {notification.type === 'success' && '✅'}
              </div>
              <div className="notification-content">
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{notification.time}</div>
              </div>
              {!notification.read && <div className="notification-badge"></div>}
              <button className="notification-action">⋯</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSearchAudit = () => (
    <div className="main-content">
      <div className="page-header">
        <div className="header-icon">🔍</div>
        <div>
          <h1>Search & Audit Trail</h1>
          <p>Advanced threat analysis and comprehensive audit logging</p>
        </div>
      </div>
      
      <div className="search-section">
        <div className="search-filters">
          <div className="search-box">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              placeholder="Search threats, IPs, users, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">Search</button>
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <label>Severity</label>
              <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Time Range</label>
              <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="results-section">
        <div className="results-header">
          <div className="results-info">
            <h2>Search Results</h2>
            <span className="results-count">{filteredThreats.length} threats found</span>
          </div>
          <div className="results-actions">
            <button className="btn-export" onClick={handleGenerateReport}>
              <span className="btn-icon">📊</span>
              Export Results
            </button>
            <button className="btn-refresh" onClick={() => window.location.reload()}>
              <span className="btn-icon">🔄</span>
              Refresh
            </button>
          </div>
        </div>

        <div className="threats-table-container">
          <table className="threats-table detailed">
            <thead>
              <tr>
                <th>Threat ID</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Source IP</th>
                <th>Location</th>
                <th>Created</th>
                <th>Attempts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredThreats.map(threat => (
                <tr key={threat.id}>
                  <td>{threat.id}</td>
                  <td>{threat.type}</td>
                  <td><span className={`badge ${threat.severity}`}>{threat.severity}</span></td>
                  <td><span className={`badge ${threat.status}`}>{threat.status}</span></td>
                  <td>{threat.sourceIP}</td>
                  <td>{threat.location}</td>
                  <td>{threat.created}</td>
                  <td>{threat.attempts}</td>
                  <td>
                    <button 
                      className="btn-small"
                      onClick={() => handleThreatAction('view', threat)}
                    >
                      👁️
                    </button>
                    <button 
                      className="btn-small"
                      onClick={() => handleThreatAction('block', threat)}
                      disabled={blockedIPs.includes(threat.sourceIP)}
                    >
                      🚫
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="audit-section">
        <div className="section-header">
          <div className="section-icon">📋</div>
          <h2>Audit Log</h2>
        </div>
        <div className="audit-table-container">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>User</th>
                <th>IP Address</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id}>
                  <td>{log.timestamp}</td>
                  <td><span className={`action-badge ${log.action.toLowerCase()}`}>{log.action}</span></td>
                  <td>{log.user}</td>
                  <td>{log.ip}</td>
                  <td><span className={`status-badge ${log.status.toLowerCase()}`}>{log.status}</span></td>
                  <td>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );



  if (!isLoggedIn) {
    return (
      <div className="app">
        <div className="login-container">
          <div className="ice-background">
            <div className="ice-crystal ice-crystal-1"></div>
            <div className="ice-crystal ice-crystal-2"></div>
            <div className="ice-crystal ice-crystal-3"></div>
            <div className="ice-crystal ice-crystal-4"></div>
            <div className="ice-crystal ice-crystal-5"></div>
          </div>
          <div className="login-card">
            <div className="login-header">
              <div className="logo-container">
                <div className="logo-icon">🛡️</div>
                <h1>CyberShield</h1>
              </div>
              <p>Advanced Threat Detection System</p>
            </div>
            
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label>
                  <span className="input-icon">👤</span>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>
                  <span className="input-icon">🔒</span>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                  required
                />
              </div>
              
              <button type="submit" className="login-btn">
                <span className="btn-icon">🚀</span>
                Access Dashboard
              </button>
            </form>
            
            <div className="demo-credentials">
              <div className="credentials-header">
                <span className="credentials-icon">💡</span>
                <span>Demo Credentials</span>
              </div>
              <div className="credentials-content">
                <div className="credential-item">
                  <span className="credential-label">Email:</span>
                  <span className="credential-value">admin@example.com</span>
                </div>
                <div className="credential-item">
                  <span className="credential-label">Password:</span>
                  <span className="credential-value">password123</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Notification Toast */}
      {showNotification && (
        <div className={`notification-toast ${notificationType}`}>
          <div className="toast-icon">
            {notificationType === 'success' && '✅'}
            {notificationType === 'warning' && '⚠️'}
            {notificationType === 'error' && '❌'}
            {notificationType === 'info' && 'ℹ️'}
          </div>
          <div className="toast-message">{notificationMessage}</div>
        </div>
      )}

      <nav className="navbar">
        <div className="nav-brand">
          <div className="brand-icon">🛡️</div>
          <h2>CyberShield Dashboard</h2>
        </div>
        <div className="nav-actions">
          <button className="nav-btn">
            <span className="nav-icon">🔔</span>
            <span className="notification-count">{notifications.filter(n => !n.read).length}</span>
          </button>
          <button className="nav-btn">
            <span className="nav-icon">⚙️</span>
          </button>
          <button onClick={handleLogout} className="logout-btn">
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </div>
      </nav>
      
      <div className="dashboard">
        <div className="sidebar">
          <div 
            className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="sidebar-icon">📊</div>
            <span>Dashboard</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'threats' ? 'active' : ''}`}
            onClick={() => setActiveTab('threats')}
          >
            <div className="sidebar-icon">🛡️</div>
            <span>Threats</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <div className="sidebar-icon">🔔</div>
            <span>Notifications</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <div className="sidebar-icon">🔍</div>
            <span>Search & Audit</span>
          </div>
        </div>
        
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'threats' && renderThreats()}
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'search' && renderSearchAudit()}
      </div>

      {/* Threat Modal */}
      {showThreatModal && selectedThreat && (
        <div className="modal-overlay" onClick={() => setShowThreatModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Threat Details: {selectedThreat.id}</h2>
              <button className="modal-close" onClick={() => setShowThreatModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="threat-detail-grid">
                <div className="detail-section">
                  <h3>Basic Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedThreat.type}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Severity:</span>
                    <span className={`badge ${selectedThreat.severity}`}>{selectedThreat.severity}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`badge ${selectedThreat.status}`}>{selectedThreat.status}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Description:</span>
                    <span className="detail-value">{selectedThreat.description}</span>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h3>Source Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Source IP:</span>
                    <span className="detail-value">{selectedThreat.sourceIP}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{selectedThreat.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">User Agent:</span>
                    <span className="detail-value">{selectedThreat.userAgent}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Attempts:</span>
                    <span className="detail-value">{selectedThreat.attempts}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-primary"
                onClick={() => handleThreatAction('block', selectedThreat)}
                disabled={blockedIPs.includes(selectedThreat.sourceIP)}
              >
                {blockedIPs.includes(selectedThreat.sourceIP) ? 'Already Blocked' : 'Block IP'}
              </button>
              <button className="btn-secondary" onClick={() => setShowThreatModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
