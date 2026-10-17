import React, { useRef, useState } from 'react';
import {
  DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import AdminImageCard from './AdminImageCard';
import { adminApi } from './adminApi';

const API_BASE = (process.env.REACT_APP_API_BASE || '').replace(/\/$/, '');

function AdminCategory({ category, isOpen, onToggle, onChange, onReload, dragHandleProps }) {
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onChange((cat) => {
      const oldIndex = cat.images.indexOf(active.id);
      const newIndex = cat.images.indexOf(over.id);
      if (oldIndex < 0 || newIndex < 0) return cat;
      return { ...cat, images: arrayMove(cat.images, oldIndex, newIndex) };
    });
  }

  async function handleDelete(imgPath) {
    if (!window.confirm('Delete this image? This permanently removes it from the server.')) return;
    try {
      await adminApi.deleteImage(imgPath);
      // Reload from server so we reflect the canonical state after delete.
      onReload();
    } catch (err) {
      window.alert('Delete failed: ' + err.message);
    }
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;
    setUploadBusy(true);
    setUploadError('');
    try {
      await adminApi.upload(category.id, files);
      onReload();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadBusy(false);
    }
  }

  return (
    <section className={`admin-cat ${isOpen ? 'admin-cat--open' : ''}`}>
      <div className="admin-cat__headrow">
        <span
          className="admin-cat__drag"
          role="button"
          tabIndex={0}
          aria-label="Drag to reorder category"
          title="Drag to reorder"
          {...(dragHandleProps || {})}
        >
          ⠿
        </span>
        <button type="button" className="admin-cat__header" onClick={onToggle}>
          <span className="admin-cat__title">{category.title}</span>
          <span className="admin-cat__meta">{category.images.length} images</span>
          <span className="admin-cat__chevron" aria-hidden>{isOpen ? '▾' : '▸'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="admin-cat__body">
          <div className="admin-cat__actions">
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={uploadBusy}
            >
              {uploadBusy ? 'Uploading…' : 'Upload images'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
            {uploadError && <span className="admin-cat__error">{uploadError}</span>}
          </div>

          {category.images.length === 0 ? (
            <p className="admin-cat__empty">No images yet. Upload some to get started.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={category.images} strategy={rectSortingStrategy}>
                <div className="admin-grid">
                  {category.images.map((src, idx) => (
                    <AdminImageCard
                      key={src}
                      id={src}
                      src={API_BASE + src}
                      index={idx}
                      onDelete={() => handleDelete(src)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </section>
  );
}

export default AdminCategory;
