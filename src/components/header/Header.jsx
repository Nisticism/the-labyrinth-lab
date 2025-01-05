import React from 'react'
import header from '../../assets/site-header-photo.png';
import './header.css';


function Header() {
  return (
    <div className="header-container">
      <img src={ header } className="header" alt="GLP Header" id="header"/>
      <div className="zoom-container">
        <div className="zoom-text">
          The Labyrinth Lab
        </div>
        <div className="zoom-text-subheader">
          Custom Woodworking
        </div>
      </div>
    </div>
  )
}

export default Header