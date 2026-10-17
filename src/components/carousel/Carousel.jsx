import React, { useRef, useState, useCallback, useEffect } from 'react';
import './carousel.css';

function Carousel({ images, title }) {
  const trackRef = useRef(null);
  const overlayRef = useRef(null);
  const wheelLock = useRef(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [range, setRange] = useState({ first: 0, last: 0 });
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Recompute which slides are visible (variable-width slides, so derive the
  // range from actual layout rects) plus whether we're at either scroll end.
  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, clientWidth, scrollWidth } = track;
    setAtStart(scrollLeft <= 1);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 1);

    const trackRect = track.getBoundingClientRect();
    const children = Array.from(track.children);
    let first = -1;
    let last = 0;
    children.forEach((child, i) => {
      const r = child.getBoundingClientRect();
      if (r.right > trackRect.left + 1 && r.left < trackRect.right - 1) {
        if (first === -1) first = i;
        last = i;
      }
    });
    if (first === -1) first = 0;
    setRange({ first, last });
  }, []);

  useEffect(() => { updateScrollState(); }, [updateScrollState, images]);

  const scrollByPage = useCallback((dir) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * track.clientWidth, behavior: 'smooth' });
  }, []);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
  }, [images.length]);
  const showNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? i : (i + 1) % images.length));
  }, [images.length]);

  // Arrow keys / Escape while the lightbox is open.
  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); showPrev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); showNext(); }
      else if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, showPrev, showNext, closeLightbox]);

  // While zoomed in, the mouse wheel advances exactly one image per gesture
  // (throttled). Native non-passive listener so we can suppress page scroll.
  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const el = overlayRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      const now = Date.now();
      if (now - wheelLock.current < 250) return;
      wheelLock.current = now;
      if (e.deltaY > 0 || e.deltaX > 0) showNext();
      else if (e.deltaY < 0 || e.deltaX < 0) showPrev();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [lightboxIndex, showPrev, showNext]);

  const firstLabel = range.first + 1;
  const lastLabel = Math.min(range.last + 1, images.length);

  return (
    <div className="carousel">
      <div className="carousel-header">
        <h3 className="carousel-title">{title}</h3>
        <span className="carousel-count">{firstLabel}–{lastLabel} of {images.length}</span>
      </div>
      <div className="carousel-wrapper">
        <button
          className="carousel-btn carousel-btn-left"
          onClick={() => scrollByPage(-1)}
          disabled={atStart}
          aria-label="Previous images"
        >
          &#8249;
        </button>
        <div className="carousel-track" ref={trackRef} onScroll={updateScrollState}>
          {images.map((src, i) => (
            <div className="carousel-slide" key={i}>
              <img
                src={src}
                alt={`${title} ${i + 1}`}
                loading="lazy"
                onLoad={updateScrollState}
                onClick={() => setLightboxIndex(i)}
              />
            </div>
          ))}
        </div>
        <button
          className="carousel-btn carousel-btn-right"
          onClick={() => scrollByPage(1)}
          disabled={atEnd}
          aria-label="Next images"
        >
          &#8250;
        </button>
      </div>

      {lightboxIndex !== null && (
        <div className="lightbox-overlay" ref={overlayRef} onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">&times;</button>
          {images.length > 1 && (
            <button
              className="lightbox-nav lightbox-nav-left"
              onClick={(e) => { e.stopPropagation(); showPrev(); }}
              aria-label="Previous image"
            >
              &#8249;
            </button>
          )}
          <img
            className="lightbox-img"
            src={images[lightboxIndex]}
            alt={`${title} ${lightboxIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <button
              className="lightbox-nav lightbox-nav-right"
              onClick={(e) => { e.stopPropagation(); showNext(); }}
              aria-label="Next image"
            >
              &#8250;
            </button>
          )}
          <span className="lightbox-count">{lightboxIndex + 1} / {images.length}</span>
        </div>
      )}
    </div>
  );
}

export default Carousel;
