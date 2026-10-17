import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function AdminImageCard({ id, src, index, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="admin-card">
      <div className="admin-card__index">{index + 1}</div>
      <button
        type="button"
        className="admin-card__handle"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <img src={src} alt="" loading="lazy" decoding="async" />
      </button>
      <button
        type="button"
        className="admin-card__delete"
        onClick={onDelete}
        aria-label="Delete image"
      >
        Delete
      </button>
    </div>
  );
}

export default AdminImageCard;
