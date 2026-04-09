import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components';
import './home.css';

const hero1 = process.env.PUBLIC_URL + '/images/thomas-moralez/OTM-1.jpg';
const hero2 = process.env.PUBLIC_URL + '/images/thomas-moralez/OTM-5.jpg';

function Home() {
  return (
    <div>
      <Header />
      <div className="home-content">
        <h2 className="home-section-heading">Handcrafted Woodworking</h2>
        <div className="home-section">
          <span className="home-text">
            Welcome to The Labyrinth Lab — a custom woodworking studio specializing in one-of-a-kind,
            handcrafted pieces made from carefully selected domestic and exotic hardwoods. Every project
            is built with attention to detail, from initial design through final finish.
          </span>
        </div>

        <div className="home-heroes">
          <div className="home-hero-card">
            <img src={hero1} alt="Handcrafted woodwork" className="home-hero-img" />
            <span className="home-hero-caption">Precision craftsmanship in every piece</span>
          </div>
          <div className="home-hero-card">
            <img src={hero2} alt="Custom woodworking" className="home-hero-img" />
            <span className="home-hero-caption">Built to last from fine hardwoods</span>
          </div>
        </div>

        <hr className="home-hr" />

        <h2 className="home-section-heading">What We Make</h2>
        <div className="home-section">
          <span className="home-text">
            We create a wide range of woodworking projects including hand-routed labyrinths, chess boards
            with inlaid squares, charcuterie and cutting boards, hand-turned pens, bowls, spinning tops,
            decorative containers, and custom furniture. Each piece is unique — no two are ever exactly alike.
          </span>
        </div>

        <div className="home-links">
          <Link to="/gallery" className="home-link-card">
            <h3>Gallery</h3>
            <span>Browse photos of completed projects across all categories.</span>
          </Link>
          <Link to="/commissions" className="home-link-card">
            <h3>Commissions</h3>
            <span>Have something specific in mind? We take custom orders — get in touch to discuss your project.</span>
          </Link>
          <Link to="/markets" className="home-link-card">
            <h3>Markets</h3>
            <span>Find us at local craft markets and events throughout the year.</span>
          </Link>
          <Link to="/contact" className="home-link-card">
            <h3>Contact</h3>
            <span>Questions, ideas, or just want to say hello? Reach out anytime.</span>
          </Link>
          <a href="https://www.etsy.com/shop/LabyrinthLab" target="_blank" rel="noreferrer" className="home-link-card">
            <h3>Etsy Shop</h3>
            <span>Browse and purchase available pieces on our Etsy store.</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;
