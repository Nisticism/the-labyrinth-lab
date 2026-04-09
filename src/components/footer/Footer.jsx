import React from 'react';
import { Link } from 'react-router-dom';
import './footer.css';

const Footer = () => {

  return (
    <div className="footer">
      <div className="footer-links-container">
        <div className="column-wrapper">
          <span className="footer-text">Navigation</span>
          <hr/>
          <div className="multi-column">
            <div className="links-column">
              <ul>
                <li>
                  <Link className="footer-link" to="/home">Home</Link>
                </li>
                <li>
                  <Link className="footer-link" to="/gallery">Gallery</Link>
                </li>
                <li>
                  <Link className="footer-link" to="/commissions">Commissions</Link>
                </li>
                <li>
                  <Link className="footer-link" to="/markets">Markets</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="column-wrapper">
          <span className="footer-text">Contact</span>
          <hr/>
          <div className="multi-column">
            <div className="links-column">
              <ul>
                <li>
                  <Link className="footer-link" to="/contact">Contact form</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer