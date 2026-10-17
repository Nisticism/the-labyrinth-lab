import React, { useCallback, useEffect, useState } from 'react';
import { adminApi } from './adminApi';
import AdminCategory from './AdminCategory';

function AdminGallery({ onLogout }) {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [saveState, setSaveState] = useState('');
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await adminApi.fetchGallery();
      setCategories(data);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Persist the full categories array. Called by child components after any
  // reorder. Optimistic UI: we already updated local state, so on failure we
  // just reload from the server.
  const saveAll = useCallback(async (next) => {
    setSaveState('Saving…');
    try {
      await adminApi.saveGallery(next);
      setSaveState('Saved');
      setTimeout(() => setSaveState((s) => (s === 'Saved' ? '' : s)), 1500);
    } catch (err) {
      setSaveState('Save failed: ' + err.message);
      await load();
    }
  }, [load]);

  const handleCategoryChange = useCallback((catId, updater) => {
    setCategories((prev) => {
      const next = prev.map((c) => (c.id === catId ? updater(c) : c));
      saveAll(next);
      return next;
    });
  }, [saveAll]);

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <h1>Gallery Admin</h1>
        <div className="admin-header__right">
          {saveState && <span className="admin-savestate">{saveState}</span>}
          <a className="admin-btn admin-btn--ghost" href="/gallery" target="_blank" rel="noreferrer">View site</a>
          <button className="admin-btn admin-btn--ghost" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      {status === 'loading' && <p className="admin-status">Loading gallery&hellip;</p>}
      {status === 'error' && (
        <p className="admin-status admin-status--error">
          Failed to load gallery. <button className="admin-btn admin-btn--ghost" onClick={load}>Retry</button>
        </p>
      )}
      {status === 'ready' && (
        <div className="admin-categories">
          {categories.map((cat) => (
            <AdminCategory
              key={cat.id}
              category={cat}
              isOpen={openId === cat.id}
              onToggle={() => setOpenId((id) => (id === cat.id ? null : cat.id))}
              onChange={(updater) => handleCategoryChange(cat.id, updater)}
              onReload={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminGallery;
