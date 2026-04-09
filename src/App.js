import './App.css';
import { Navigation, Home, Gallery, Markets, Commissions, Contact, NotFound } from './components';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router basename="/">
      <div className="App">
        <div className="nav-background">
          <Navigation />
        </div>
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/commissions" element={<Commissions />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
