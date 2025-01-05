import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components';
import nyt_article_screen from '../../assets/nyt_article_screen.png';
import './home.css';

class Home extends Component {
  openInNewTab(url) {
    window.open(url, '_blank', 'noreferrer');
  }

  render() {
    return (
      <div>
        <Header />
      </div>
    );
  }
}

export default Home;
