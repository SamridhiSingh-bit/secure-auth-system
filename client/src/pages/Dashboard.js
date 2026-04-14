import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/useAuth';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import './Dashboard.css';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [managerData, setManagerData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/protected/user-data');
      setUserData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user data');
    }
    setLoading(false);
  };

  const fetchManagerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/protected/manager-data');
      setManagerData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Access denied');
    }
    setLoading(false);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/protected/admin-data');
      setAdminData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Access denied');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* User Info Card */}
        <div className="card user-info-card">
          <h2>👤 Your Profile</h2>
          {user && (
            <div className="profile-info">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> <span className={`role-badge ${user.role}`}>{user.role.toUpperCase()}</span></p>
            </div>
          )}
        </div>

        {/* User Data */}
        <div className="card user-data-card">
          <h2>📊 User Information</h2>
          {userData ? (
            <div className="data-display">
              <p>{userData.content}</p>
              <pre>{JSON.stringify(userData, null, 2)}</pre>
            </div>
          ) : (
            <button onClick={fetchUserData} disabled={loading} className="fetch-btn">
              {loading ? 'Loading...' : 'Fetch User Data'}
            </button>
          )}
        </div>

        {/* Manager Data - Only for managers and admins */}
        {(user?.role === 'manager' || user?.role === 'admin') && (
          <div className="card manager-data-card">
            <h2>📋 Manager Dashboard</h2>
            {managerData ? (
              <div className="data-display">
                <p>{managerData.content}</p>
                <div className="report-grid">
                  <div className="report-item">
                    <span className="report-label">Total Users</span>
                    <span className="report-value">{managerData.reportData.totalUsers}</span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">Active Users</span>
                    <span className="report-value">{managerData.reportData.activeUsers}</span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">Inactive Users</span>
                    <span className="report-value">{managerData.reportData.inactiveUsers}</span>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={fetchManagerData} disabled={loading} className="fetch-btn">
                {loading ? 'Loading...' : 'Fetch Manager Data'}
              </button>
            )}
          </div>
        )}

        {/* Admin Data - Only for admins */}
        {user?.role === 'admin' && (
          <div className="card admin-data-card">
            <h2>⚙️ Admin Console</h2>
            {adminData ? (
              <div className="data-display">
                <p>{adminData.content}</p>
                <div className="system-grid">
                  <div className="system-item">
                    <span className="system-label">Total Sessions</span>
                    <span className="system-value">{adminData.systemData.totalSessions}</span>
                  </div>
                  <div className="system-item">
                    <span className="system-label">System Health</span>
                    <span className="system-value">{adminData.systemData.systemHealth}</span>
                  </div>
                  <div className="system-item">
                    <span className="system-label">Last Backup</span>
                    <span className="system-value">{new Date(adminData.systemData.lastBackup).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={fetchAdminData} disabled={loading} className="fetch-btn">
                {loading ? 'Loading...' : 'Fetch Admin Data'}
              </button>
            )}
          </div>
        )}

        {error && <div className="error-alert">{error}</div>}
      </main>
    </div>
  );
};
