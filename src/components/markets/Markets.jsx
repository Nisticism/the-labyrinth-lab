import React from 'react';
import Seo from '../seo/Seo';
import './markets.css';

function Markets() {
  return (
    <div className="markets-page">
      <Seo
        title="Markets & Events"
        path="/markets"
        description="Find The Labyrinth Lab at craft markets and events around San Antonio and Austin, TX, or shop handcrafted woodworking online on Etsy."
      />
      <h1 className="markets-heading">Markets &amp; Events</h1>

      <div className="markets-section">
        <h3 className="markets-subheading">Upcoming Markets</h3>
        <p className="markets-text">
          There are no upcoming markets scheduled at this time. Check back soon for updates!
        </p>
      </div>

      <hr className="markets-hr" />

      <div className="markets-section">
        <h3 className="markets-subheading">Where to Find Us</h3>
        <p className="markets-text">
          While I don't have a fixed schedule, you can sometimes find The Labyrinth Lab at these
          markets and events:
        </p>
        <ul className="markets-list">
          <li>Shavano Park Market — San Antonio, TX</li>
          <li>Austin Artisan Markets — Austin, TX</li>
          <li>Garden Market</li>
          <li>Christmas Showcase — San Antonio, TX (annual holiday event)</li>
        </ul>
        <p className="markets-text">
          I occasionally participate in larger events and pop-ups as well. Follow along or reach out
          through the contact page to stay in the loop.
        </p>
      </div>

      <hr className="markets-hr" />

      <div className="markets-section markets-etsy">
        <h3 className="markets-subheading">Shop Online</h3>
        <p className="markets-text">
          Can't make it to a market? Browse and purchase pieces anytime from my Etsy store.
        </p>
        <a
          href="https://www.etsy.com/shop/LabyrinthLab"
          target="_blank"
          rel="noreferrer"
          className="markets-etsy-btn"
        >
          Visit the Etsy Shop
        </a>
      </div>
    </div>
  );
}

export default Markets;