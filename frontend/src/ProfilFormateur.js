import React, { useState, useEffect } from 'react';
import { FaClock, FaUsers, FaStar } from 'react-icons/fa';

const ProfilFormateur = ({ formateurId, onBack, onReserver }) => {
  const [formateur, setFormateur] = useState(null);
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/utilisateurs/${formateurId}`)
      .then(res => res.json())
      .then(data => {
        setFormateur(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`http://localhost:5000/api/cours/formateur/${formateurId}`)
      .then(res => res.json())
      .then(data => setCours(data));
  }, [formateurId]);

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

  if (loading) return <div className="loading">Chargement...</div>;
  if (!formateur) return <div className="error">Formateur introuvable</div>;

  return (
    <div className="profil-container">

      {/* BOUTON RETOUR */}
      <button className="btn-back" onClick={onBack}>← Retour au catalogue</button>

      {/* HEADER FORMATEUR */}
      <div className="profil-header" style={{ marginTop: '1rem' }}>

        {/* PHOTO FORMATEUR ✅ CORRIGÉ : /images/formateurs/ */}
        <div className="profil-avatar-photo">
          {formateur.photo ? (
            <img
              src={`/images/formateurs/${formateur.photo}`}
              alt={formateur.prenom}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="profil-avatar"
            style={{ display: formateur.photo ? 'none' : 'flex' }}>
            {formateur.prenom.charAt(0)}{formateur.nom.charAt(0)}
          </div>
        </div>

        <div className="profil-header-info">
          <h2>{formateur.prenom} {formateur.nom}</h2>
          <span className="profil-role">FORMATEUR</span>
        </div>
      </div>

      {/* INFOS FORMATEUR */}
      <div className="formateur-infos-grid">
        <div className="formateur-info-item">
          <span className="fi-label">Email</span>
          <span className="fi-value">{formateur.email || 'Non renseigné'}</span>
        </div>
        <div className="formateur-info-item">
          <span className="fi-label">Téléphone</span>
          <span className="fi-value">{formateur.telephone || 'Non renseigné'}</span>
        </div>
        <div className="formateur-info-item">
          <span className="fi-label">Spécialité</span>
          <span className="fi-value fi-highlight">{formateur.specialites || 'Non renseigné'}</span>
        </div>
        <div className="formateur-info-item">
          <span className="fi-label">Niveau</span>
          <span className="fi-value">{formateur.niveau || 'Non renseigné'}</span>
        </div>
        <div className="formateur-info-item">
          <span className="fi-label">Évaluation</span>
          <span className="fi-value fi-stars">
            {formateur.evaluation_moyenne > 0
              ? `⭐ ${formateur.evaluation_moyenne} / 5`
              : 'Pas encore évalué'}
          </span>
        </div>
        {formateur.biographie && (
          <div className="formateur-info-item fi-full">
            <span className="fi-label">Biographie</span>
            <span className="fi-value fi-bio">{formateur.biographie}</span>
          </div>
        )}
      </div>

      {/* COURS DU FORMATEUR */}
      <div className="profil-content">
        <h3>Ses cours ({cours.length})</h3>
        {cours.length === 0 && (
          <p className="no-result">Aucun cours disponible</p>
        )}
        <div className="grille-cours" style={{ marginTop: '1rem' }}>
          {cours.map(c => (
            <div key={c.id} className="carte-cours">

              {/* IMAGE COURS ✅ CORRIGÉ : photos (et non photo) + /images/cours/ */}
              <div className="carte-image">
                {c.photos ? (
                  <img
                    src={`/images/cours/${c.photos}`}
                    alt={c.titre}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="carte-image-placeholder"
                  style={{ display: c.photos ? 'none' : 'flex' }}>
                  {iconCategorie(c.categorie)}
                </div>
                <span className="badge-categorie-image">{c.categorie}</span>
              </div>

              {/* TITRE + NIVEAU */}
              <div className="carte-titre-row">
                <h3>{c.titre}</h3>
                {c.niveau && (
                  <span className={`badge-niveau ${c.niveau.toLowerCase()}`}>
                    {c.niveau}
                  </span>
                )}
              </div>

              {/* DESCRIPTION */}
              <p className="cours-description">{c.description}</p>

              {/* INFOS */}
              <div className="carte-infos">
                <span><FaClock style={{ marginRight: '4px', color: 'var(--violet)' }}/>{formatDuree(c.duree)}</span>
                <span><FaUsers style={{ marginRight: '4px', color: 'var(--violet)' }}/>{c.nb_places} max</span>
              </div>

              {/* FOOTER : RATING + PRIX ✅ CORRIGÉ : fallback honnête */}
              <div className="carte-footer">
                <div className="carte-rating">
                  <FaStar style={{ color: '#F59E0B' }}/>
                  <span className="rating-note">
                    {c.evaluation_moyenne > 0 ? c.evaluation_moyenne : 'Nouveau'}
                  </span>
                  <span className="rating-count">
                    {c.nb_avis > 0 ? `(${c.nb_avis})` : ''}
                  </span>
                </div>
                <span className="prix">{c.prix}€</span>
              </div>

              <button
                className="btn-reserver"
                onClick={() => onReserver(c)}>
                Réserver
              </button>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ProfilFormateur;