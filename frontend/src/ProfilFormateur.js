import React, { useState, useEffect } from 'react';
import API_URL from './Api';

const ProfilFormateur = ({ formateurId, onBack, onReserver }) => {
  const [formateur, setFormateur] = useState(null);
  const [cours, setCours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    titre: '',
    description: '',
    niveau: 'Débutant',
    duree: '',
    nb_places: '',
    prix: '',
    materiel_necessaire: '',
    photos: '',
    videos: '',
    date_cours: '',
    heure_debut: '',
    heure_fin: '',
    categorie_id: ''
  });

  useEffect(() => {
    fetchFormateurData();
    fetchCategories();
  }, [formateurId]);

  const fetchFormateurData = () => {
    Promise.all([
      fetch(`${API_URL}/api/utilisateurs/${formateurId}`).then(res => res.json()),
      fetch(`${API_URL}/api/cours/formateur/${formateurId}`).then(res => res.json())
    ])
      .then(([userData, coursData]) => {
        setFormateur(userData);
        setCours(coursData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchCategories = () => {
    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  };

  const handleChange = (e) => {
    setNewCourse({ ...newCourse, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const courseToSubmit = { ...newCourse, formateur_id: formateurId };

    fetch(`${API_URL}/api/cours`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseToSubmit)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          alert('Cours ajouté avec succès !');
          setShowAddForm(false);
          fetchFormateurData(); // Recharger la liste
          setNewCourse({
            titre: '', description: '', niveau: 'Débutant', duree: '',
            nb_places: '', prix: '', materiel_necessaire: '',
            photos: '', videos: '', date_cours: '',
            heure_debut: '', heure_fin: '', categorie_id: ''
          });
        }
      })
      .catch(err => alert('Erreur lors de l\'ajout du cours'));
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (!formateur) return <div className="no-result">Formateur introuvable</div>;

  return (
    <div className="profil-container">
      <button className="btn-back" onClick={onBack} style={{ marginBottom: '1rem' }}>
        ← Retour au catalogue
      </button>

      <div className="profil-header">
        <div className="profil-avatar-photo">
          <img src={formateur.photo ? `/images/formateurs/${formateur.photo}` : '/images/avatar-default.png'} alt={formateur.nom} />
        </div>
        <div className="profil-header-info">
          <h2>{formateur.prenom} {formateur.nom}</h2>
          <span className="profil-role">Formateur Expert</span>
          <div className="fi-stars" style={{ marginTop: '0.5rem' }}>
            {"⭐".repeat(Math.round(formateur.evaluation_moyenne || 5))} 
            <span style={{ color: 'var(--gray)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
              ({formateur.evaluation_moyenne || "5.0"})
            </span>
          </div>
        </div>
      </div>

      <div className="profil-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1.5px solid var(--border)', paddingBottom: '0.8rem' }}>
          <h3 style={{ margin: 0, border: 'none' }}>À propos</h3>
          <button 
            className="btn-primary" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Annuler' : '+ Ajouter un cours'}
          </button>
        </div>

        {showAddForm ? (
          <form onSubmit={handleSubmit} className="add-course-form" style={{ background: 'var(--gray-light)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Nouveau cours</h4>
            
            <div className="form-group">
              <label>Titre du cours</label>
              <input type="text" name="titre" value={newCourse.titre} onChange={handleChange} required placeholder="Ex: Apprendre le Piano - Débutant" />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={newCourse.description} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1.5px solid var(--border)' }} rows="3"></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Catégorie</label>
                <select name="categorie_id" value={newCourse.categorie_id} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '50px', border: '1.5px solid var(--border)' }}>
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nom}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Niveau</label>
                <select name="niveau" value={newCourse.niveau} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '50px', border: '1.5px solid var(--border)' }}>
                  <option value="Débutant">Débutant</option>
                  <option value="Intermédiaire">Intermédiaire</option>
                  <option value="Avancé">Avancé</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Prix (€)</label>
                <input type="number" name="prix" value={newCourse.prix} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Durée (min)</label>
                <input type="number" name="duree" value={newCourse.duree} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Nb de places</label>
                <input type="number" name="nb_places" value={newCourse.nb_places} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date du cours</label>
                <input type="date" name="date_cours" value={newCourse.date_cours} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Heure début</label>
                <input type="time" name="heure_debut" value={newCourse.heure_debut} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Heure fin</label>
                <input type="time" name="heure_fin" value={newCourse.heure_fin} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Matériel nécessaire</label>
              <input type="text" name="materiel_necessaire" value={newCourse.materiel_necessaire} onChange={handleChange} placeholder="Pinceaux, tablier..." />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Photo (nom du fichier)</label>
                <input type="text" name="photos" value={newCourse.photos} onChange={handleChange} placeholder="exemple.jpg" />
              </div>
              <div className="form-group">
                <label>Vidéo (URL)</label>
                <input type="text" name="videos" value={newCourse.videos} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>

            <button type="submit" className="btn-login" style={{ marginTop: '1rem' }}>Enregistrer le cours</button>
          </form>
        ) : (
          <>
            <div className="formateur-infos-grid">
              <div className="formateur-info-item fi-full">
                <span className="fi-label">Biographie</span>
                <p className="fi-bio">{formateur.biographie || "Aucune biographie disponible."}</p>
              </div>
              <div className="formateur-info-item">
                <span className="fi-label">Spécialités</span>
                <span className="fi-value fi-highlight">{formateur.specialites || "Non renseigné"}</span>
              </div>
              <div className="formateur-info-item">
                <span className="fi-label">Expérience</span>
                <span className="fi-value">{formateur.niveau || "Expert"}</span>
              </div>
              <div className="formateur-info-item">
                <span className="fi-label">Email</span>
                <span className="fi-value">{formateur.email}</span>
              </div>
            </div>

            <h3 style={{ marginTop: '2.5rem' }}>Cours proposés par {formateur.prenom}</h3>
            <div className="grille-cours" style={{ marginTop: '1.5rem' }}>
              {cours.length > 0 ? (
                cours.map(c => (
                  <div key={c.id} className="carte-cours">
                    <div className="carte-image">
                      <div className="badge-categorie-image">{c.categorie}</div>
                      <img src={`/images/cours/${c.photos || 'default.jpg'}`} alt={c.titre} />
                    </div>
                    <div className="carte-titre-row">
                      <h3>{c.titre}</h3>
                      <span className={`badge-niveau ${c.niveau.toLowerCase()}`}>{c.niveau}</span>
                    </div>
                    <div className="carte-footer">
                      <div className="prix">{c.prix}€</div>
                      <button className="btn-reserver" style={{ width: 'auto', margin: 0, padding: '0.5rem 1rem' }} onClick={() => onReserver(c)}>
                        Réserver
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-result">Ce formateur n'a pas encore de cours actifs.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilFormateur;
