import React, { useState, useEffect } from 'react';
import { FaClock, FaUsers, FaStar } from 'react-icons/fa'
import './App.css';
import API_URL from './Api';

const Catalogue = ({ searchQuery, onReserver, onVoirFormateur }) => {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtreCategorie, setFiltreCategorie] = useState('Tous');
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/cours`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      })
      .then(data => {
        setCours(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const categories = ['Tous', ...new Set(cours.map(c => c.categorie))];

  const coursFiltres = cours.filter(c => {
    const matchCategorie = filtreCategorie === 'Tous' || c.categorie === filtreCategorie;
    const matchRecherche = searchQuery
      ? c.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.categorie.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchCategorie && matchRecherche;
  });

  const iconCategorie = (cat) => {
    const icons = {
      'Peinture': '🎨', 'Cuisine': '🍳', 'Musique': '🎸',
      'Danse': '💃', 'Photographie': '📷', 'Yoga': '🧘',
      'Dessin': '✏️', 'Jardinage': '🌿'
    };
    return icons[cat] || '📚';
  };

  const formatDuree = (minutes) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h === 0) return `${m}min`
    if (m === 0) return `${h}h`
    return `${h}h${m}`
  }

  if (loading) return <div className="loading">Chargement des cours...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;

  return (
    <div className="catalogue-layout">

      {/* FILTRES À GAUCHE */}
      <aside className="filtres-sidebar">
  <div className="filtres-header" onClick={() => setFiltresOuverts(!filtresOuverts)}>
    <h3>Filtres</h3>
    <span className="filtres-toggle">{filtresOuverts ? '▲' : '▼'}</span>
  </div>
  <div className={`filtres-body ${filtresOuverts ? 'ouvert' : ''}`}>
    <div className="filtre-section">
      <h4>Catégories</h4>
      <ul className="filtre-liste">
        {categories.map(cat => (
          <li key={cat}>
            <label className={`filtre-item ${filtreCategorie === cat ? 'active' : ''}`}>
              <input
                type="radio"
                name="categorie"
                value={cat}
                checked={filtreCategorie === cat}
                onChange={() => { setFiltreCategorie(cat); setFiltresOuverts(false); }}
              />
              {cat}
              {cat !== 'Tous' && (
                <span className="filtre-count">
                  {cours.filter(c => c.categorie === cat).length}
                </span>
              )}
            </label>
          </li>
        ))}
      </ul>
    </div>
  </div>
</aside>

      {/* CONTENU COURS */}
      <section className="catalogue-content">
        <h2>Apprenez, créez et partagez grâce à nos {coursFiltres.length} cours disponibles</h2>

        {coursFiltres.length === 0 && (
          <p className="no-result">Aucun cours trouvé pour "{searchQuery}"</p>
        )}

        <div className="grille-cours">
          {coursFiltres.map(coursItem => (
            <div key={coursItem.id} className="carte-cours" onClick={() => onReserver(coursItem)} style={{ cursor: 'pointer' }}>

              {/* IMAGE + BADGE CATEGORIE */}
              <div className="carte-image">
                {coursItem.photos ? (
                  <img
                    src={`/images/cours/${coursItem.photos}`}
                    alt={coursItem.titre}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="carte-image-placeholder"
                  style={{ display: coursItem.photos ? 'none' : 'flex' }}>
                  {iconCategorie(coursItem.categorie)}
                </div>
                <span className="badge-categorie-image">{coursItem.categorie}</span>
              </div>

              {/* TITRE + BADGE NIVEAU */}
              <div className="carte-titre-row">
                <h3>{coursItem.titre}</h3>
                {coursItem.niveau && (
                  <span className={`badge-niveau ${coursItem.niveau.toLowerCase()}`}>
                    {coursItem.niveau}
                  </span>
                )}
              </div>

              {/* DESCRIPTION */}
              <p className="cours-description">{coursItem.description}</p>

              {/* INFOS */}
              <div className="carte-infos">
                <span><FaClock style={{marginRight: '4px', color: 'var(--violet)'}}/>
                {formatDuree(coursItem.duree)}</span>
                <span><FaUsers style={{marginRight: '4px', color: 'var(--violet)'}}/>
                {coursItem.nb_places} max</span>
              </div>

              {/* FORMATEUR AVEC PHOTO */}
              <div
                className="carte-formateur"
                 onClick={(e) => {
               e.stopPropagation();
                 onVoirFormateur(coursItem.formateur_id);
           }}>
                <div className="carte-formateur-avatar">
                  {coursItem.formateur_photo ? (
                    <img
                      src={`/images/formateurs/${coursItem.formateur_photo}`}
                      alt={coursItem.prenom}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="carte-formateur-initiales"
                    style={{ display: coursItem.formateur_photo ? 'none' : 'flex' }}>
                    {coursItem.prenom?.[0]}{coursItem.formateur_nom?.[0]}
                  </div>
                </div>
                <span className="carte-formateur-nom">
                  {coursItem.prenom} {coursItem.formateur_nom}
                </span>
              </div>

              {/* FOOTER : RATING + PRIX */}
              <div className="carte-footer">
                <div className="carte-rating">
                  <FaStar style={{color: '#F59E0B'}}/>
                  <span className="rating-note">
                    {coursItem.evaluation_moyenne > 0
                      ? coursItem.evaluation_moyenne
                      : 'Nouveau'}
                  </span>
                  <span className="rating-count">
                    {coursItem.nb_avis > 0 ? `(${coursItem.nb_avis})` : ''}
                  </span>
                </div>
                <span className="prix">{coursItem.prix}€</span>
              </div>

              <button
                className="btn-reserver"
                onClick={() => onReserver(coursItem)}>
                Réserver
              </button>

            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Catalogue;