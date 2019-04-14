import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (

  <React.Fragment>

    <div id="headnav" className="container-fluid">
      <nav className="navbar navbar-expand-md">
        <a className="navbar-brand mb-0 h1 text-white" href="/"><i className="fas fa-rss"></i> busR</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <i className="fas fa-bars" style={{ color: '#FFFFFF' }}></i>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav">
            <Link className="nav-item nav-link text-white" to="/transaction" style={{ textDecoration: 'none', color: '#FFFFFF' }}>
              Lien 1
            </Link>
            <Link className="nav-item nav-link text-white" to="/historique" style={{ textDecoration: 'none', color: '#FFFFFF' }}>
              Lien 2
            </Link>
            <Link className="nav-item nav-link text-white" to="/dashboard" style={{ textDecoration: 'none', color: '#FFFFFF' }}>
              Lien 3
            </Link>
          </div>
        </div>
      </nav>
    </div>

  </React.Fragment>
);

export default Header;