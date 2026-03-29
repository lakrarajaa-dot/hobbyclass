import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa'
import './App.css';

const Contact = () => {
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' });
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.nom || !form.email || !form.message) {
      setErreur('Merci de remplir tous les champs obligatoires.');
      return;
    }
    setErreur('');
    setEnvoye(true);
  };

  return (
    <div className="contact-page">

      {/* HERO */}
      <div className="contact-hero">
        <h1>Contactez-<span>nous</span></h1>
        <p>Une question sur nos cours ? On vous répond dans les 24h.</p>
      </div>

      <div className="contact-container">

        {/* COLONNE GAUCHE — Infos + Carte */}
        <div className="contact-infos">

          <div className="contact-infos-card">
            <h3>Nos coordonnées</h3>

            <div className="contact-info-item">
              <div className="contact-info-icon"><FaEnvelope color="#7C3AED"/></div>
              <div>
                <span className="contact-info-label">Email</span>
                <span className="contact-info-value">contact@hobbyclass.fr</span>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon"><FaPhone color="#7C3AED"/></div>
              <div>
                <span className="contact-info-label">Téléphone</span>
                <span className="contact-info-value">+33 1 23 45 67 89</span>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon"><FaMapMarkerAlt color="#7C3AED"/></div>
              <div>
                <span className="contact-info-label">Adresse</span>
                <span className="contact-info-value">12 rue de la Créativité<br />75010 Paris, France</span>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon"><FaClock color="#7C3AED"/></div>
              <div>
                <span className="contact-info-label">Horaires</span>
                <span className="contact-info-value">Lun – Ven : 09h à 20h<br />Sam : 10h à 18h<br />Dim : 10h à 18h </span>
              </div>
            </div>
          </div>

          {/* CARTE GOOGLE MAPS */}
          <div className="contact-map">
            <iframe
              title="HobbyClass localisation"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2623.8!2d2.3601!3d48.8698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDjCsDUyJzExLjMiTiAywr8yMSczNi40IkU!5e0!3m2!1sfr!2sfr!4v1"
              width="100%"
              height="220"
              style={{ border: 0, borderRadius: '16px' }}
              allowFullScreen=""
              loading="lazy"
            />
          </div>

        </div>

        {/* COLONNE DROITE — Formulaire */}
        <div className="contact-form-card">
          {envoye ? (
            <div className="contact-succes">
              <div className="contact-succes-icon">✅</div>
              <h3>Message envoyé !</h3>
              <p>Merci <strong>{form.nom}</strong>, nous vous répondrons sous 24h à <strong>{form.email}</strong>.</p>
              <button className="btn-primary" onClick={() => { setEnvoye(false); setForm({ nom: '', email: '', sujet: '', message: '' }); }}>
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <>
              <h3>Envoyez-nous un message</h3>
              <p className="contact-form-subtitle">Tous les champs marqués * sont obligatoires.</p>

              {erreur && <div className="error-msg">{erreur}</div>}

              <div className="form-row">
                <div className="form-group">
                  <label>Nom complet *</label>
                  <input
                    type="text"
                    name="nom"
                    placeholder="Votre nom"
                    value={form.nom}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="votre@email.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Sujet</label>
                <select name="sujet" value={form.sujet} onChange={handleChange} className="contact-select">
                  <option value="">Choisissez un sujet</option>
                  <option value="reservation">Question sur une réservation</option>
                  <option value="cours">Informations sur un cours</option>
                  <option value="paiement">Problème de paiement</option>
                  <option value="annulation">Annulation / remboursement</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  placeholder="Décrivez votre demande..."
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  className="contact-textarea"
                />
              </div>

              <button className="btn-login" onClick={handleSubmit}>
                Envoyer le message 
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Contact;