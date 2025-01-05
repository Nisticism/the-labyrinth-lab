import React, { useState, useRef, useEffect } from 'react';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import { Link, useLocation } from 'react-router-dom';
import './navigation.css';


function getNavClasses(path, route) {
  return(
    ["nav-item", `${path === route ? "nav-item-color-focus" : "nav-item-color"}`].join(" ")
  );
}

function getNavClassesHome(path, route) {
  return(
    `${path === route ? "nav-item-color-focus" : "nav-item-color"}`
  );
}

const Menu = (props) => (
  <>
    <div className="nav-item-div">
      <Link className={getNavClasses("/gallery", props.location.pathname)} to="/gallery" onClick={() => props.setToggleMenu ? props.setToggleMenu(false) : false}>Gallery</Link>
    </div>
    <div className="nav-item-div">
      <Link className={getNavClasses("/commissions", props.location.pathname)} to="/commissions" onClick={() => props.setToggleMenu ? props.setToggleMenu(false) : false}>Commissions</Link>
    </div>
    {/* <div className="nav-item-div">
       <Link className={getNavClasses("/webcam", props.location.pathname)} to="/webcam">Webcam</Link>
    </div> */}
    <div className="nav-item-div">
      <Link className={getNavClasses("/markets", props.location.pathname)} to="/markets" onClick={() => props.setToggleMenu ? props.setToggleMenu(false) : false}>Markets</Link>
    </div>
    <div className="nav-item-div">
      <Link className={getNavClasses("/contact", props.location.pathname)} to="/contact" onClick={() => props.setToggleMenu ? props.setToggleMenu(false) : false}>Contact</Link>
    </div>
  </>
)

function useCloseWhenClickedOutside(ref, setToggleMenu) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setToggleMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  })
}

const Navigation = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const location = useLocation();

  const closeWhenClickedOutsideRef = useRef(null);
  useCloseWhenClickedOutside(closeWhenClickedOutsideRef, setToggleMenu);

  return (
    <div className="navbar" id="navbar">
      <div className="nav-home-div">
          <Link className={[getNavClassesHome("/home", location.pathname), "nav-home"].join(" ")} to="/home">Home</Link>
      </div>
      <div className="center-fill">
        <div className="navbar-links-container">
          <Menu location={location}/>
        </div>
      </div>
      <div className="navbar-menu" ref={ closeWhenClickedOutsideRef }>
        { toggleMenu 
          ? <RiCloseLine size={27} onClick={() => setToggleMenu(false)} />
          : <RiMenu3Line size={27} onClick={() => setToggleMenu(true)} />
        }
        { toggleMenu && (
          <div className="navbar-menu-container scale-up-center">
            <div className="navbar-menu-container-links">
              <Menu location={location} setToggleMenu={setToggleMenu}/>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default Navigation