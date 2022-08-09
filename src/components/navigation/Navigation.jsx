import React, { useState } from 'react';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import './navigation.css';

const Menu = () => (
  <>
    <div className="nav-item-div">
      <Link className="nav-item" to="/courts">The Courts</Link>
    </div>
    <div className="nav-item-div">
      <Link className="nav-item" to="/faq">FAQ</Link>
    </div>
    <div className="nav-item-div">
       <Link className="nav-item" to="/webcam">Web Cam</Link>
    </div>
    <div className="nav-item-div">
      <Link className="nav-item" to="/photos">Photos</Link>
    </div>
    <div className="nav-item-div">
      <Link className="nav-item" to="/about">About</Link>
    </div>
  </>
)

const Navigation = () => {
  const [toggleMenu, setToggleMenu] = useState(false);

  return (
    <div className="navbar" id="navbar">
      <div className="nav-home">
          <Link className="nav-item-home" to="/home">Home</Link>
      </div>
      <div className="center-fill">
        <div className="navbar-links-container">
          <Menu />
        </div>
      </div>
      <div className="navbar-menu">
        { toggleMenu 
          ? <RiCloseLine color="fff" size={27} onClick={() => setToggleMenu(false)} />
          : <RiMenu3Line color="fff" size={27} onClick={() => setToggleMenu(true)} />
        }
        { toggleMenu && (
          <div className="navbar-menu-container scale-up-center">
            <div className="navbar-menu-container-links">
              <Menu />
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default Navigation