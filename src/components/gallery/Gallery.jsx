import React, { useEffect, useState } from 'react';
import Carousel from '../carousel/Carousel';
import { fetchGalleryData } from '../../helpers/galleryData';
import './gallery.css';

function Gallery() {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetchGalleryData()
      .then((data) => {
        if (cancelled) return;
        setCategories(data);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="gallery-page">
      <h2 className="gallery-heading">Gallery</h2>
      {status === 'loading' && (
        <p className="gallery-status">Loading gallery&hellip;</p>
      )}
      {status === 'error' && (
        <p className="gallery-status gallery-status--error">
          Could not load the gallery. Please try again later.
        </p>
      )}
      {status === 'ready' && (
        <div className="gallery-categories">
          {categories.map((category) => (
            <Carousel
              key={category.id}
              images={category.images}
              title={category.title}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Gallery;