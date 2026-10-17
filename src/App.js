import './App.css';
import { Navigation, Home, Gallery, Markets, Commissions, Contact, NotFound } from './components';
import Admin from './components/admin/Admin';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

// Secret admin path is configured via REACT_APP_ADMIN_PATH at build time.
// Falls back to a placeholder that won't match real traffic if unset.
const ADMIN_PATH = (process.env.REACT_APP_ADMIN_PATH || 'admin-portal-unset').replace(/^\/+/, '');

function ChromeAwareLayout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/' + ADMIN_PATH);
  return (
    <div className="App">
      {!isAdmin && (
        <div className="nav-background">
          <Navigation />
        </div>
      )}
      <div className="content">{children}</div>
    </div>
  );
}

function App() {
  return (
    <Router basename="/">
      <ChromeAwareLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/commissions" element={<Commissions />} />
          <Route path="/contact" element={<Contact />} />
          <Route path={`/${ADMIN_PATH}`} element={<Admin />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </ChromeAwareLayout>
    </Router>
  );
}

export default App;
