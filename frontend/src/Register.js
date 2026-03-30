import React, { useState } from 'react';
import API_URL from './Api';

const Register = ({ onRegisterSuccess, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    mot_de_passe: '',
    confirm_mdp: '',
    role: 'CLIENT' // Valeur par défaut
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (newRole) => {
    setFormData({ ...formData, role: newRole });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.mot_de_passe !== formData.confirm_mdp) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        mot_de_passe: formData.mot_de_passe,
        role: formData.role
      })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.error) {
          setError(data.error);
        } else {
          alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
          onRegisterSuccess();
        }
      })
      .catch(() => {
        setLoading(false);
        setError('Impossible de contacter le serveur');
      });
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '480px' }}>
        <h2>Créer un compte</h2>
        <p className="login-subtitle">Rejoignez la communauté HobbyClass</p>

        {/* SÉLECTEUR DE RÔLE */}
        <div className="role-selector">
          <div 
            className={`role-option ${formData.role === 'CLIENT' ? 'active' : ''}`}
            onClick={() => handleRoleChange('CLIENT')}
          >
            <span className="role-icon">🎓</span>
            <span className="role-label">Élève</span>
          </div>
          <div 
            className={`role-option ${formData.role === 'FORMATEUR' ? 'active' : ''}`}
            onClick={() => handleRoleChange('FORMATEUR')}
          >
            <span className="role-icon">👨‍🏫</span>
            <span className="role-label">Formateur</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Prénom</label>
              <input
                type="text"
                name="prenom"
                placeholder="Jean"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Nom</label>
              <input
                type="text"
                name="nom"
                placeholder="Dupont"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input
              type="tel"
              name="telephone"
              placeholder="06 12 34 56 78"
              value={formData.telephone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="mot_de_passe"
              placeholder="••••••••"
              value={formData.mot_de_passe}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              name="confirm_mdp"
              placeholder="••••••••"
              value={formData.confirm_mdp}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Inscription...' : "S'inscrire en tant que " + (formData.role === 'CLIENT' ? 'élève' : 'formateur')}
          </button>
        </form>

        <p className="auth-switch">
          Déjà un compte ? <span onClick={onBackToLogin}>Se connecter</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
