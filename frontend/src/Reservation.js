import React, { useState, useEffect } from 'react';
import { FaClock, FaUsers, FaStar, FaTools } from 'react-icons/fa';
import API_URL from './Api';

const Reservation = ({ cours, user, onBack, onVoirFormateur }) => {
  const [disponibilites, setDisponibilites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispo, setSelectedDispo] = useState(null);
  const [etape, setEtape] = useState('details');
  const [modePaiement, setModePaiement] = useState('CARTE');
  const [reservationId, setReservationId] = useState(null);
  const [error, setError] = useState(null);


    useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [etape]);

  useEffect(() => {
    fetch(`${API_URL}/api/cours/${cours.id}/disponibilites`)
      .then(res => res.json())
      .then(data => {
        setDisponibilites(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Impossible de charger les disponibilités');
        setLoading(false);
      });
  }, [cours.id]);

  const formatDuree = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h${m}`;
  };

  const handleReserver = () => {
    fetch(`${API_URL}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: user.id,
        cours_id: cours.id,
        disponibilite_id: selectedDispo.id
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setReservationId(data.reservation_id);
          setEtape('paiement');
        }
      })
      .catch(() => setError('Erreur lors de la réservation'));
  };

  const handlePaiement = () => {
    fetch(`${API_URL}/api/paiement/${reservationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        montant: cours.prix,
        mode_paiement: modePaiement
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setEtape('succes');
        }
      })
      .catch(() => setError('Erreur lors du paiement'));
  };

  return (
    <div className="reservation-container">

      <div className="reservation-header">
        <button className="btn-back" onClick={onBack}>← Retour</button>
        <h2>{cours.titre}</h2>
      </div>

      <div className="etapes-bar">
        <div className={`etape ${etape === 'details' ? 'active' : ''} ${etape !== 'details' ? 'done' : ''}`}>1. Détails</div>
        <div className="etape-ligne" />
        <div className={`etape ${etape === 'disponibilites' ? 'active' : ''} ${['confirmation','paiement','succes'].includes(etape) ? 'done' : ''}`}>2. Disponibilités</div>
        <div className="etape-ligne" />
        <div className={`etape ${etape === 'confirmation' ? 'active' : ''} ${['paiement','succes'].includes(etape) ? 'done' : ''}`}>3. Confirmation</div>
        <div className="etape-ligne" />
        <div className={`etape ${etape === 'paiement' ? 'active' : ''} ${etape === 'succes' ? 'done' : ''}`}>4. Paiement</div>
        <div className="etape-ligne" />
        <div className={`etape ${etape === 'succes' ? 'active' : ''}`}>5. Succès</div>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {/* ÉTAPE 1 : DÉTAILS */}
      {etape === 'details' && (
        <div className="etape-content">
          <div className="detail-image-wrapper">
            {cours.photos ? (
              <img
                src={`/images/cours/${cours.photos}`}
                alt={cours.titre}
                className="detail-image"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="detail-image-placeholder">{cours.categorie}</div>
            )}
            <span className="badge-categorie-image">{cours.categorie}</span>
          </div>

          <div className="detail-titre-row">
            <h2>{cours.titre}</h2>
            {cours.niveau && (
              <span className={`badge-niveau ${cours.niveau.toLowerCase()}`}>{cours.niveau}</span>
            )}
          </div>

          <div className="detail-section">
            <h4>Description</h4>
            <p className="detail-description">{cours.description}</p>
          </div>

          {cours.materiel_necessaire && (
            <div className="detail-section">
              <h4><FaTools style={{ marginRight: '6px', color: 'var(--violet)' }} />Matériel nécessaire</h4>
              <p className="detail-materiel">{cours.materiel_necessaire}</p>
            </div>
          )}

          <div className="detail-stats">
            <div className="detail-stat">
              <FaClock style={{ color: 'var(--violet)' }} />
              <span>{formatDuree(cours.duree)}</span>
            </div>
            <div className="detail-stat">
              <FaUsers style={{ color: 'var(--violet)' }} />
              <span>{cours.nb_places} places max</span>
            </div>
            <div className="detail-stat">
              <FaStar style={{ color: '#F59E0B' }} />
              <span>{cours.evaluation_moyenne > 0 ? `${cours.evaluation_moyenne} / 5` : 'Nouveau cours'}</span>
            </div>
          </div>

          <div className="detail-formateur-row">
            <div
              className="detail-formateur"
              onClick={() => onVoirFormateur && onVoirFormateur(cours.formateur_id)}
              style={{ cursor: 'pointer' }}>
              <div className="carte-formateur-avatar">
                {cours.formateur_photo ? (
                  <img
                    src={`/images/formateurs/${cours.formateur_photo}`}
                    alt={cours.prenom}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="carte-formateur-initiales"
                  style={{ display: cours.formateur_photo ? 'none' : 'flex' }}>
                  {cours.prenom?.[0]}{cours.formateur_nom?.[0]}
                </div>
              </div>
              <div>
                <span className="detail-formateur-label">Formateur</span>
                <span className="detail-formateur-nom" style={{ color: 'var(--violet)' }}>
                  {cours.prenom} {cours.formateur_nom}
                </span>
              </div>
            </div>
            <span className="detail-prix-grand">{cours.prix}€</span>
          </div>

          <button className="btn-suivant" onClick={() => setEtape('disponibilites')}>
            Choisir une disponibilité →
          </button>
        </div>
      )}

      {/* ÉTAPE 2 : DISPONIBILITÉS */}
      {etape === 'disponibilites' && (
        <div className="etape-content">
          <h3>Choisissez une disponibilité</h3>
          {loading && <p className="loading">Chargement...</p>}
          {!loading && disponibilites.length === 0 && (
            <p className="no-result">Aucune disponibilité pour ce cours</p>
          )}
          <div className="dispos-liste">
            {disponibilites.map(dispo => (
              <div
                key={dispo.id}
                className={`dispo-card ${selectedDispo?.id === dispo.id ? 'selected' : ''}`}
                onClick={() => setSelectedDispo(dispo)}>
                <div className="dispo-info">
                  <span className="dispo-date">{dispo.date}</span>
                  <span className="dispo-heure">{dispo.heure_debut} — {dispo.heure_fin}</span>
                  <span className="dispo-places">{dispo.places_disponibles} places restantes</span>
                </div>
                {selectedDispo?.id === dispo.id && <span className="dispo-check">✓</span>}
              </div>
            ))}
          </div>
          <div className="btns-navigation">
            <button className="btn-back-etape" onClick={() => setEtape('details')}>← Retour</button>
            {selectedDispo && (
              <button className="btn-suivant" onClick={() => setEtape('confirmation')}>Continuer →</button>
            )}
          </div>
        </div>
      )}

      {/* ÉTAPE 3 : CONFIRMATION */}
      {etape === 'confirmation' && (
        <div className="etape-content">
          <h3>Confirmez votre réservation</h3>
          <div className="recap-card">
            <div className="recap-ligne"><span>Cours</span><strong>{cours.titre}</strong></div>
            <div className="recap-ligne"><span>Client</span><strong>{user.prenom} {user.nom}</strong></div>
            <div className="recap-ligne"><span>Formateur</span><strong>{cours.prenom} {cours.formateur_nom}</strong></div>
            <div className="recap-ligne"><span>Date</span><strong>{selectedDispo.date}</strong></div>
            <div className="recap-ligne"><span>Heure</span><strong>{selectedDispo.heure_debut} — {selectedDispo.heure_fin}</strong></div>
            <div className="recap-ligne"><span>Durée</span><strong>{formatDuree(cours.duree)}</strong></div>
            <div className="recap-ligne total"><span>Prix</span><strong>{cours.prix}€</strong></div>
          </div>
          <div className="btns-navigation">
            <button className="btn-back-etape" onClick={() => setEtape('disponibilites')}>← Retour</button>
            <button className="btn-suivant" onClick={handleReserver}>Confirmer →</button>
          </div>
        </div>
      )}

      {/* ÉTAPE 4 : PAIEMENT */}
      {etape === 'paiement' && (
        <div className="etape-content">
          <h3>Choisissez votre mode de paiement</h3>
          <div className="paiement-options">
            {['CARTE', 'PAYPAL', 'VIREMENT'].map(mode => (
              <div
                key={mode}
                className={`paiement-option ${modePaiement === mode ? 'selected' : ''}`}
                onClick={() => setModePaiement(mode)}>
                <span>{mode}</span>
              </div>
            ))}
          </div>
          <div className="recap-card">
            <div className="recap-ligne"><span>Cours</span><strong>{cours.titre}</strong></div>
            <div className="recap-ligne"><span>Date</span><strong>{selectedDispo.date} à {selectedDispo.heure_debut}</strong></div>
            <div className="recap-ligne total"><span>Total à payer</span><strong>{cours.prix}€</strong></div>
          </div>
          <div className="btns-navigation">
            <button className="btn-back-etape" onClick={() => setEtape('confirmation')}>← Retour</button>
            <button className="btn-suivant" onClick={handlePaiement}>Payer {cours.prix}€ →</button>
          </div>
        </div>
      )}

      {/* ÉTAPE 5 : SUCCÈS */}
      {etape === 'succes' && (
        <div className="etape-content succes-content">
          <div className="succes-icon">🎉</div>
          <h3>Réservation confirmée !</h3>
          <p>Votre réservation pour <strong>{cours.titre}</strong> a été confirmée avec succès.</p>
          <p>Le <strong>{selectedDispo.date}</strong> à <strong>{selectedDispo.heure_debut}</strong></p>
          <p className="succes-email">Un email de confirmation a été envoyé à <strong>{user.email}</strong></p>
          <button className="btn-suivant" onClick={onBack}>Retour au catalogue</button>
        </div>
      )}

    </div>
  );
};

export default Reservation;