import React, { useRef, useState, useCallback } from 'react';
import './carousel.css';

const VISIBLE = 3;

function Carousel({ images, title }) {
  const trackRef = useRef(null);
  const [page, setPage] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const totalPages = Math.ceil(images.length / VISIBLE);

  const scrollToPage = useCallback((p) => {
    const track = trackRef.current;
    if (!track || p < 0 || p >= totalPages) return;
    const slideIndex = p * VISIBLE;
    const slide = track.children[slideIndex];
    if (slide) {
      track.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
      setPage(p);
    }
  }, [totalPages]);

  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || !track.children[0]) return;
    const slideWidth = track.children[0].offsetWidth;
    const newPage = Math.round(track.scrollLeft / (slideWidth * VISIBLE));
    setPage(newPage);
  }, []);

  const startImg = page * VISIBLE + 1;
  const endImg = Math.min((page + 1) * VISIBLE, images.length);

  return (
    <div className="carousel">
      <div className="carousel-header">
        <h3 className="carousel-title">{title}</h3>
        <span className="carousel-count">{startImg}–{endImg} of {images.length}</span>
      </div>
      <div className="carousel-wrapper">
        <button
          className="carousel-btn carousel-btn-left"
          onClick={() => scrollToPage(page - 1)}
          disabled={page === 0}
          aria-label="Previous images"
        >
          &#8249;
        </button>
        <div className="carousel-track" ref={trackRef} onScroll={handleScroll}>
          {images.map((src, i) => (
            <div className="carousel-slide" key={i}>
              <img
                src={src}
                alt={`${title} ${i + 1}`}
                loading="lazy"
                onClick={() => setLightboxSrc(src)}
              />
            </div>
          ))}
        </div>
        <button
          className="carousel-btn carousel-btn-right"
          onClick={() => scrollToPage(page + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Next images"
        >
          &#8250;
        </button>
      </div>
      {lightboxSrc && (
        <div className="lightbox-overlay" onClick={() => setLightboxSrc(null)}>
          <button className="lightbox-close" onClick={() => setLightboxSrc(null)} aria-label="Close">&times;</button>
          <img
            className="lightbox-img"
            src={lightboxSrc}
            alt={title}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default Carousel;
