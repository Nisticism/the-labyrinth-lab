import './App.css';
import { Navigation, Home, Gallery, Markets, Commissions, FAQ, Courts, Photos, About, Webcam, Contact, Footer, NotFound, Album  } from './components';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { history } from "./helpers/history";
import albumData from "./helpers/albumData";

function App() {
  return (
    <Router history={ history } basename="/">
      <div className="App">
        <div className="nav-background">
          <Navigation />
          {/* <Header /> */}
        </div>
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            {/* <Route path="/faq" element={<FAQ />} /> */}
            <Route path="/courts" element={<Courts />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/commissions" element={<Commissions />} />
            <Route path="/gallery" element={<Gallery />} />
            {/* <Route path="/about" element={<About />} /> */}
            {/* <Route path="/webcam" element={<Webcam />} /> */}
            <Route path="/contact" element={<Contact />} />
            <Route path="/gallery/thomasmoralez" element={<Album albumData={albumData.albumDataTM} />} />
            {/* <Route path="/gallery/general" element={<Album albumData={albumData.albumDataGeneral}/>} /> */}
            {/* <Route path="/gallery/woodturnings" element={<Album albumData={albumData.albumDataNYT}/>} />
            <Route path="/gallery/furniture" element={<Album albumData={albumData.albumDataNYT}/>} /> */}
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </div>
        {/* <Footer /> */}
      </div>
    </Router>
  );
}

export default App;
