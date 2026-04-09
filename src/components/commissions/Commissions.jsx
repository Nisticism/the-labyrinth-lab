import React from 'react';
import { Link } from 'react-router-dom';
import './commissions.css';

const PREFIX = process.env.PUBLIC_URL + '/images';
const tmPhoto1 = PREFIX + '/thomas-moralez/OTM-10.jpg';
const tmPhoto2 = PREFIX + '/thomas-moralez/OTM-14.jpg';
const commPhoto1 = PREFIX + '/commission-work/IMG_20240809_155227.jpg';
const commPhoto2 = PREFIX + '/commission-work/PXL_20240824_220827611.jpg';
const commPhoto3 = PREFIX + '/commission-work/PXL_20241227_230132227.jpg';

function Commissions() {
  return (
    <div className="commissions-page">
      <h2 className="comm-heading">Custom Commissions</h2>
      <div className="comm-section">
        <p className="comm-text">
          Every piece from The Labyrinth Lab starts with a conversation. Whether you have a detailed vision
          or just a rough idea, I work closely with each client to design and build something truly one-of-a-kind.
          From exotic hardwood chess boards to hand-routed labyrinths, no two projects are ever the same.
        </p>
      </div>

      <div className="comm-gallery">
        <div className="comm-img-card">
          <img src={tmPhoto1} alt="Custom woodworking example" />
          <span className="comm-caption">Handcrafted with care and precision</span>
        </div>
        <div className="comm-img-card">
          <img src={tmPhoto2} alt="Fine woodworking detail" />
          <span className="comm-caption">Attention to detail in every project</span>
        </div>
      </div>

      <hr className="comm-hr" />

      <h3 className="comm-subheading">What Can Be Commissioned</h3>
      <div className="comm-section">
        <p className="comm-text">
          Common commissions include chess boards, charcuterie boards, labyrinths, pens, cutting boards,
          furniture, decorative containers, and spinning tops. If you can describe it, chances are I can build it.
          Pricing depends on materials, complexity, and size — reach out through the{' '}
          <Link to="/contact" className="comm-link">contact page</Link> to get started.
        </p>
        <p className="comm-text">
          You can also browse and purchase ready-made pieces on my{' '}
          <a href="https://www.etsy.com/shop/LabyrinthLab" target="_blank" rel="noreferrer" className="comm-link">Etsy shop</a>.
        </p>
      </div>

      <hr className="comm-hr" />

      <h3 className="comm-subheading">House Repair &amp; Construction</h3>
      <div className="comm-section">
        <p className="comm-text">
          Beyond fine woodworking, I also take on house repair and construction projects. From custom shelving
          and built-ins to structural repairs and renovations, the same craftsmanship that goes into a chess board
          goes into every job site. Below are a few examples of past construction and repair work.
        </p>
      </div>

      <div className="comm-gallery comm-gallery-three">
        <div className="comm-img-card">
          <img src={commPhoto1} alt="House repair project" />
          <span className="comm-caption">Custom construction work</span>
        </div>
        <div className="comm-img-card">
          <img src={commPhoto2} alt="Renovation project" />
          <span className="comm-caption">Renovation and repair</span>
        </div>
        <div className="comm-img-card">
          <img src={commPhoto3} alt="Construction project" />
          <span className="comm-caption">Built with the same attention to detail</span>
        </div>
      </div>

      <hr className="comm-hr" />

      <div className="comm-cta">
        <h3 className="comm-subheading">Ready to Start a Project?</h3>
        <p className="comm-text">
          I'd love to hear what you have in mind.{' '}
          <Link to="/contact" className="comm-link">Send me a message</Link> and let's make something great together.
        </p>
      </div>
    </div>
  );
}

export default Commissions;