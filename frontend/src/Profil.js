import React, { useState, useEffect } from 'react';

const Profil = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('infos');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [nom, setNom] = useState(user.nom);
  const [prenom, setPrenom] = useState(user.prenom);
  const [telephone, setTelephone] = useState(user.telephone || '');
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  const [ancienMdp, setAncienMdp] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');

  useEffect(() => {
    if (activeTab === 'reservations') {
      setLoading(true);
      fetch(`http://localhost:5000/api/reservations/client/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setReservations(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [activeTab, user.id]);

  const handleModifierInfos = (e) => {
    e.preventDefault();
    fetch(`http://localhost:5000/api/utilisateurs/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, prenom, telephone })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setSuccessMsg('Informations mises à jour !');
          setTimeout(() => setSuccessMsg(null), 3000);
        }
      })
      .catch(() => setError('Erreur lors de la mise à jour'));
  };

  const handleModifierMdp = (e) => {
    e.preventDefault();
    setError(null);
    if (nouveauMdp !== confirmMdp) {
      setError('Les mots de passe ne correspondent pas !');
      return;
    }
    fetch(`http://localhost:5000/api/utilisateurs/${user.id}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ancien_mdp: ancienMdp, nouveau_mdp: nouveauMdp })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setSuccessMsg(' Mot de passe modifié !');
          setAncienMdp('');
          setNouveauMdp('');
          setConfirmMdp('');
          setTimeout(() => setSuccessMsg(null), 3000);
        }
      })
      .catch(() => setError('Erreur lors du changement de mot de passe'));
  };

  const handleAnnuler = (reservationId) => {
  if (!window.confirm('Voulez-vous vraiment annuler cette réservation ?')) return;
  
  fetch(`http://localhost:5000/api/reservations/${reservationId}/annuler`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        setError(data.error);
      } else {
        setSuccessMsg('Réservation annulée avec succès !');
        setReservations(reservations.map(r =>
          r.id === reservationId ? { ...r, statut: 'ANNULEE' } : r
        ));
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    })
    .catch(() => setError('Erreur lors de l annulation'));
};

  return (
    <div className="profil-container">

      {/* HEADER PROFIL */}
      <div className="profil-header">
        <div className="profil-avatar">
          {user.prenom.charAt(0)}{user.nom.charAt(0)}
        </div>
        <div className="profil-header-info">
          <h2>{user.prenom} {user.nom}</h2>
          <span className="profil-role">{user.role}</span>
        </div>
      </div>

      {/* TABS */}
      <div className="profil-tabs">
        <button
          className={`profil-tab ${activeTab === 'infos' ? 'active' : ''}`}
          onClick={() => setActiveTab('infos')}>
           Mes informations
        </button>
        <button
          className={`profil-tab ${activeTab === 'reservations' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservations')}>
           Mes réservations
        </button>
        <button
          className={`profil-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}>
           Mot de passe
        </button>
      </div>

      {/* MESSAGES */}
      {successMsg && <p className="success-msg">{successMsg}</p>}
      {error && <p className="error-msg">❌ {error}</p>}

      {/* ONGLET INFOS */}
      {activeTab === 'infos' && (
        <div className="profil-content">
          <h3>Mes informations personnelles</h3>

          {/* INFOS AFFICHAGE */}
          <div className="profil-infos-cards">
            <div className="info-card">
              <span className="info-label"> Rôle</span>
              <span className="info-value">{user.role}</span>
            </div>
            {user.specialites && (
              <div className="info-card">
                <span className="info-label"> Spécialité</span>
                <span className="info-value">{user.specialites}</span>
              </div>
            )}
            {user.biographie && (
              <div className="info-card full">
                <span className="info-label"> Biographie</span>
                <span className="info-value">{user.biographie}</span>
              </div>
            )}
          </div>

          {/* FORMULAIRE */}
          <form onSubmit={handleModifierInfos}>
            <div className="form-row">
              <div className="form-group">
                <label>Prénom</label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="input-disabled"
              />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="06 00 00 00 00"
              />
            </div>
            <button type="submit" className="btn-sauvegarder">
               Sauvegarder
            </button>
          </form>
        </div>
      )}

      {/* ONGLET RESERVATIONS */}
      {activeTab === 'reservations' && (
  <div className="profil-content">
    <h3>Mes réservations</h3>
    {loading && <p className="loading">Chargement...</p>}
    {!loading && reservations.length === 0 && (
      <p className="no-result">Aucune réservation pour l'instant</p>
    )}
    <div className="reservations-liste">
      {reservations.map(res => (
        <div key={res.id} className="reservation-item">
          <div className="reservation-item-info">
            <h4>{res.titre}</h4>
            <p>Date de réservation : {new Date(res.date_reservation).toLocaleDateString('fr-FR')}</p>
            <p>Montant : {res.montant} €</p>
          </div>
          <div className="reservation-item-actions">
            <span className={`statut-badge ${res.statut.toLowerCase()}`}>
              {res.statut}
            </span>
            {res.statut !== 'ANNULEE' && (
              <button
                className="btn-annuler"
                onClick={() => handleAnnuler(res.id)}>
                Annuler
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
      
                  
        

      {/* ONGLET MOT DE PASSE */}
      {activeTab === 'password' && (
        <div className="profil-content">
          <h3>Modifier mon mot de passe</h3>
          <form onSubmit={handleModifierMdp}>
            <div className="form-group">
              <label>Ancien mot de passe</label>
              <input
                type="password"
                value={ancienMdp}
                onChange={(e) => setAncienMdp(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input
                type="password"
                value={nouveauMdp}
                onChange={(e) => setNouveauMdp(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={confirmMdp}
                onChange={(e) => setConfirmMdp(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn-sauvegarder">
               Modifier le mot de passe
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default Profil;