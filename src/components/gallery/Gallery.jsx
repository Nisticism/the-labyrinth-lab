import React from 'react'
import { AlbumButton } from '..';
import './gallery.css';

function Gallery() {
  const ButtonData = {
    tm: 
    {title: "Thomas Moralez Photos", url: "/gallery/thomasmoralez", src: "images/tm/bloodwood-pen.jpg"},
    // nyt: 
    // {title: "General", url: "/photos/nyt", src: "images/general/Pickleball_01.JPG"}
  }
  return (
    <div className="text-align photos-wrapper">
      <div>
        <span className="album-titles">Albums</span>
      </div>
      <div className="hr-photos">
        <hr/>
      </div>
      <div className="gallery">
        <AlbumButton buttonData={ButtonData.tm}/>
        {/* <AlbumButton buttonData={ButtonData.nyt}/> */}
      </div>
    </div>
  )
}

export default Gallery