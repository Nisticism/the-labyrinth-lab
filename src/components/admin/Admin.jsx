import React, { useEffect, useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminGallery from './AdminGallery';
import { adminApi, getToken, clearToken } from './adminApi';
import './admin.css';

function Admin() {
  const [state, setState] = useState('checking'); // 'checking' | 'login' | 'authed'

  useEffect(() => {
    const token = getToken();
    if (!token) { setState('login'); return; }
    adminApi.verify()
      .then(() => setState('authed'))
      .catch(() => { clearToken(); setState('login'); });
  }, []);

  function handleLoggedIn() { setState('authed'); }
  function handleLogout() { clearToken(); setState('login'); }

  if (state === 'checking') {
    return <div className="admin-shell"><p className="admin-status">Checking session&hellip;</p></div>;
  }
  if (state === 'login') {
    return <AdminLogin onLoggedIn={handleLoggedIn} />;
  }
  return <AdminGallery onLogout={handleLogout} />;
}

export default Admin;
