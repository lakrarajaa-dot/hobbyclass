import React, { useState } from 'react';
import Catalogue from './Catalogue';
import Login from './Login';
import Register from './Register';
import Reservation from './Reservation';
import Profil from './Profil';
import ProfilFormateur from './ProfilFormateur';
import CommentCaMarche from './CemmentCaMarche';
import Contact from './contact';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('login');
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [coursSel, setCoursSel] = useState(null);
  const [formateurId, setFormateurId] = useState(null);
  const [menuOuvert, setMenuOuvert] = useState(false);


  const handleLogin = (userData, nextSection = 'accueil') => {
    if (userData) {
      setUser(userData);
      setActiveSection(nextSection);
    } else {
      setActiveSection(nextSection);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveSection('login');
  };

  const handleReserver = (cours) => {
    if (!user) {
      setActiveSection('login');
    } else {
      setCoursSel(cours);
      setActiveSection('catalogue');
    }
  };

  const Footer = () => (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
           <span style={{ color: 'white' }}>Hobby</span>
           <span style={{ color: 'var(--violet-light)' }}>Class</span>
          <p>La plateforme qui vous connecte avec des formateurs passionnés pour apprendre et grandir.</p>
        </div>
        <div className="footer-links">
          <h4>Navigation</h4>
          <ul>
            <li onClick={() => setActiveSection('accueil')}>Accueil</li>
            <li onClick={() => setActiveSection('catalogue')}>Cours</li>
            <li onClick={() => setActiveSection('comment')}>Comment ça marche</li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>Contact</h4>
          <ul>
            <li>contact@hobbyclass.com</li>
            <li>+33 01 23 45 67 89</li>
            <li>Paris, France</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 HobbyClass — Tous droits réservés</p>
      </div>
    </footer>
  );

  return (
    <div className="App">

      {/* NAVBAR */}
      <nav className="navbar">
  <div className="nav-brand" onClick={() => setActiveSection('accueil')} style={{ cursor: 'pointer' }}>
    <img src="/images/logo.png" alt="HobbyClass" className="nav-logo" />
  </div>

  {/* HAMBURGER */}
  <button className="hamburger" onClick={() => setMenuOuvert(!menuOuvert)}>
    {menuOuvert ? '✕' : '☰'}
  </button>

  <ul className={`nav-menu ${menuOuvert ? 'ouvert' : ''}`}>
    <li>
      <a href="#accueil"
        className={activeSection === 'accueil' ? 'active' : ''}
        onClick={() => { setActiveSection('accueil'); setCoursSel(null); setFormateurId(null); setMenuOuvert(false); }}>
        Accueil
      </a>
    </li>
    <li>
      <a href="#catalogue"
        className={activeSection === 'catalogue' ? 'active' : ''}
        onClick={() => { setActiveSection('catalogue'); setCoursSel(null); setFormateurId(null); setMenuOuvert(false); }}>
        Cours
      </a>
    </li>
    <li>
      <a href="#comment"  
        onClick={() => { setActiveSection('comment'); setMenuOuvert(false); }}
        className={activeSection === 'comment' ? 'active' : ''}>
        Comment ça marche
      </a>
    </li>
    <li>
      <a href="#contact"  
        onClick={() => { setActiveSection('contact'); setMenuOuvert(false); }}
        className={activeSection === 'contact' ? 'active' : ''}>
        Contact
      </a>
    </li>
    <li>
      {user ? (
        <div className="user-info">
          <span style={{ cursor: 'pointer' }} onClick={() => { setActiveSection('profil'); setMenuOuvert(false); }}>
            {user.prenom} {user.nom}
          </span>
          <button className="btn-connexion" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      ) : (
        <button className="btn-connexion" onClick={() => { setActiveSection('login'); setMenuOuvert(false); }}>
          Connexion
        </button>
      )}
    </li>
  </ul>
</nav>

      {/* PAGE LOGIN */}
      {activeSection === 'login' && <Login onLogin={handleLogin} />}

      {/* PAGE REGISTER */}
      {activeSection === 'register' && (
        <Register
          onRegisterSuccess={() => setActiveSection('login')}
          onBackToLogin={() => setActiveSection('login')}
        />
      )}

      {/* PAGE ACCUEIL */}
      {activeSection === 'accueil' && (
        <div>
          {/* HERO */}
          <section id="accueil" className="hero">
            <div className="hero-content">
              <h1>Découvrez votre <span>passion</span></h1>
              <p>Apprenez de nouvelles compétences avec des experts passionnés</p>
              <div className="hero-buttons">
                <button className="btn-primary" onClick={() => setActiveSection('catalogue')}>
                  Explorer les cours
                </button>
                <button className="btn-secondary" onClick={() => setActiveSection('comment')}>
                  Comment ça marche ?
                </button>
              </div>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Que voulez-vous apprendre aujourd'hui ?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={() => setActiveSection('catalogue')}>Rechercher</button>
              </div>
            </div>
          </section>

          {/* CATÉGORIES POPULAIRES */}
          <section className="categories-section">
            <h2>Catégories populaires</h2>
            <p className="section-subtitle">Explorez nos domaines et trouvez votre passion</p>
            <div className="categories-grid">
              {[
                { nom: 'Peinture', photo: 'peinture2.jpg', count: '3 cours' },
                { nom: 'Cuisine', photo: 'cuisine.jpg', count: '3 cours' },
                { nom: 'Musique', photo: 'musique.jpg', count: '3 cours' },
                { nom: 'Danse', photo: 'danse.jpg', count: '3 cours' },
                { nom: 'Photographie', photo: 'photographie.jpg', count: '3 cours' },
                { nom: 'Yoga', photo: 'yoga.jpg', count: '3 cours' },
                { nom: 'Dessin', photo: 'dessin.jpg', count: '3 cours' },
                { nom: 'Jardinage', photo: 'jardinage.jpg', count: '3 cours' },
              ].map(cat => (
                <div
                  key={cat.nom}
                  className="categorie-card"
                  onClick={() => setActiveSection('catalogue')}>
                  <div className="categorie-photo">
                    <img src={`/images/categories/${cat.photo}`} alt={cat.nom} />
                    <div className="categorie-overlay">
                      <h4>{cat.nom}</h4>
                      <span>{cat.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TÉMOIGNAGES */}
          <section className="temoignages-section">
            <h2>Ce que disent nos élèves</h2>
            <p className="section-subtitle">Des milliers d'élèves nous font confiance</p>
            <div className="temoignages-grid">
              <div className="temoignage-card">
                <div className="temoignage-stars">⭐⭐⭐⭐⭐</div>
                <p>"J'ai appris la peinture aquarelle en 3 séances. Le formateur est incroyable et très patient !"</p>
                <div className="temoignage-auteur">
                  <div className="temoignage-avatar">SM</div>
                  <div>
                    <strong>Sara M.</strong>
                    <span>Cours de Peinture</span>
                  </div>
                </div>
              </div>
              <div className="temoignage-card">
                <div className="temoignage-stars">⭐⭐⭐⭐</div>
                <p>"La cuisine française n'a plus de secrets pour moi. Des recettes magnifiques et une ambiance super !"</p>
                <div className="temoignage-auteur">
                  <div className="temoignage-avatar">AK</div>
                  <div>
                    <strong>Ahmed K.</strong>
                    <span>Cours de Cuisine</span>
                  </div>
                </div>
              </div>
              <div className="temoignage-card">
                <div className="temoignage-stars">⭐⭐⭐⭐⭐</div>
                <p>"Le cours de yoga a transformé ma vie ! Je me sens beaucoup mieux physiquement et mentalement."</p>
                <div className="temoignage-auteur">
                  <div className="temoignage-avatar">LB</div>
                  <div>
                    <strong>Lina B.</strong>
                    <span>Cours de Yoga</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* PAGE CATALOGUE */}
      {activeSection === 'catalogue' && !coursSel && !formateurId && (
        <Catalogue
          searchQuery={searchQuery}
          onReserver={handleReserver}
          onVoirFormateur={(id) => setFormateurId(id)}
        />
      )}

      {/* PAGE PROFIL FORMATEUR */}
      {activeSection === 'catalogue' && !coursSel && formateurId && (
        <ProfilFormateur
          formateurId={formateurId}
          onBack={() => setFormateurId(null)}
          onReserver={(c) => {
            setFormateurId(null);
            handleReserver(c);
          }}
        />
      )}

      {/* PAGE RESERVATION */}
      {activeSection === 'catalogue' && coursSel && (
  <Reservation
    cours={coursSel}
    user={user}
    onBack={() => setCoursSel(null)}
    onVoirFormateur={(id) => {
      setCoursSel(null);
      setFormateurId(id);
    }}
  />
)}

      {/* PAGE PROFIL UTILISATEUR */}
      {activeSection === 'profil' && (
        <Profil user={user} onLogout={handleLogout} />
      )}

      {/* PAGE COMMENT ÇA MARCHE */}
      {activeSection === 'comment' && (
        <CommentCaMarche onCommencer={() => setActiveSection('catalogue')} />
      )}

      {/* PAGE CONTACT */}
      {activeSection === 'contact' && <Contact />}

      {/* FOOTER SUR TOUTES LES PAGES SAUF LOGIN/REGISTER */}
      {activeSection !== 'login' && activeSection !== 'register' && <Footer />}

    </div>
  );
}

export default App;