import React, { useCallback, useEffect, useState } from 'react';
import {
  DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, verticalListSortingStrategy, sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { adminApi } from './adminApi';
import AdminCategory from './AdminCategory';

// Derive a URL-safe category id from a title, guaranteeing uniqueness against
// ids already in use. Matches the server's allowed id pattern [a-z0-9-]+.
function slugify(title, existingIds) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'category';
  const taken = new Set(existingIds);
  let id = base;
  let n = 2;
  while (taken.has(id)) id = `${base}-${n++}`;
  return id;
}

// Wraps a category row so it can be dragged to reorder. The drag handle is
// passed down so only the handle (not the whole header) initiates a drag.
function SortableCategory({ category, ...rest }) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: category.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 5 : 'auto',
  };
  return (
    <div ref={setNodeRef} style={style}>
      <AdminCategory
        category={category}
        dragHandleProps={{ ...attributes, ...listeners }}
        {...rest}
      />
    </div>
  );
}

function AdminGallery({ onLogout }) {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [saveState, setSaveState] = useState('');
  const [openId, setOpenId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [createError, setCreateError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  const handleCategoryDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setCategories((prev) => {
      const oldIndex = prev.findIndex((c) => c.id === active.id);
      const newIndex = prev.findIndex((c) => c.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      const next = arrayMove(prev, oldIndex, newIndex);
      saveAll(next);
      return next;
    });
  }, [saveAll]);

  const handleCreate = useCallback((e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) { setCreateError('Enter a category name'); return; }
    setCreateError('');
    setCategories((prev) => {
      const id = slugify(title, prev.map((c) => c.id));
      const next = [...prev, { id, title, images: [] }];
      saveAll(next);
      setOpenId(id);
      return next;
    });
    setNewTitle('');
  }, [newTitle, saveAll]);

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
        <>
          <form className="admin-newcat" onSubmit={handleCreate}>
            <input
              type="text"
              className="admin-newcat__input"
              placeholder="New category name"
              value={newTitle}
              onChange={(e) => { setNewTitle(e.target.value); if (createError) setCreateError(''); }}
              aria-label="New category name"
            />
            <button type="submit" className="admin-btn admin-btn--primary">Add category</button>
            {createError && <span className="admin-cat__error">{createError}</span>}
          </form>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
            <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="admin-categories">
                {categories.map((cat) => (
                  <SortableCategory
                    key={cat.id}
                    category={cat}
                    isOpen={openId === cat.id}
                    onToggle={() => setOpenId((id) => (id === cat.id ? null : cat.id))}
                    onChange={(updater) => handleCategoryChange(cat.id, updater)}
                    onReload={load}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
}

export default AdminGallery;
