import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BsHouseDoor, 
  BsBoxSeam, 
  BsBoxArrowInDown, 
  BsBoxArrowUp, 
  BsPerson, 
  BsBoxArrowRight 
} from 'react-icons/bs';

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="app-container">
      <aside>
        <h4>STOKRAPI</h4>
        <div className="search-box mb-3">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search..." 
          />
        </div>
        
        <Link 
          className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          to="/dashboard"
        >
          <BsHouseDoor className="nav-icon" /> Dashboard
        </Link>
        
        <Link 
          className={`nav-link ${location.pathname === '/data-barang' ? 'active' : ''}`}
          to="/data-barang"
        >
          <BsBoxSeam className="nav-icon" /> Data Barang
        </Link>

        <Link 
          className={`nav-link ${location.pathname === '/barang-masuk' ? 'active' : ''}`}
          to="/barang-masuk"
        >
          <BsBoxArrowInDown className="nav-icon" /> Barang Masuk
        </Link>

        <Link 
          className={`nav-link ${location.pathname === '/barang-keluar' ? 'active' : ''}`}
          to="/barang-keluar"
        >
          <BsBoxArrowUp className="nav-icon" /> Barang Keluar
        </Link>

        <Link 
          className={`nav-link ${location.pathname === '/profil' ? 'active' : ''}`}
          to="/profil"
        >
          <BsPerson className="nav-icon" /> Profil
        </Link>

        <Link 
          className={`nav-link ${location.pathname === '/logout' ? 'active' : ''}`}
          to="/login"
        >
          <BsBoxArrowRight className="nav-icon" /> Logout
        </Link>
      </aside>
      {children}
    </div>
  );
};

export default Layout;
