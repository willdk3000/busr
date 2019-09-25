import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (

  <React.Fragment>

    <div id="headnav" className="container-fluid">
      <nav className="navbar navbar-expand-md">
        <p className="navbar-brand mb-0 h1 text-white"><i className="fas fa-rss"></i> busr</p>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <i className="fas fa-bars" style={{ color: '#FFFFFF' }}></i>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav">
            <Link className="nav-item nav-link text-white" to="/" style={{ textDecoration: 'none', color: '#FFFFFF' }}>
              Carte
            </Link>
            <Link className="nav-item nav-link text-white" to="/historique" style={{ textDecoration: 'none', color: '#FFFFFF' }}>
              Historique
            </Link>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                style={{ textDecoration: 'none', color: '#FFFFFF' }}>
                Vue linéaire
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                <Link className="dropdown-item" to="/livetrips" style={{ textDecoration: 'none' }}>
                  Par départ
                </Link>
                <Link className="dropdown-item" to="/liveroutes" style={{ textDecoration: 'none' }}>
                  Par ligne
                </Link>
              </div>
            </li>
            {/*<Link className="nav-item nav-link text-white" to="/howto" style={{ textDecoration: 'none', color: '#FFFFFF' }}>
              Aide
</Link>*/}
          </div>
        </div>
      </nav>
    </div>

  </React.Fragment>
);

export default Header;