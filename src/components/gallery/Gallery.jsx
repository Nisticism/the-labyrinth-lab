import React from 'react';
import Carousel from '../carousel/Carousel';
import galleryData from '../../helpers/galleryData';
import './gallery.css';

function Gallery() {
  return (
    <div className="gallery-page">
      <h2 className="gallery-heading">Gallery</h2>
      <div className="gallery-categories">
        {galleryData.map((category) => (
          <Carousel
            key={category.id}
            images={category.images}
            title={category.title}
          />
        ))}
      </div>
    </div>
  );
}

export default Gallery;