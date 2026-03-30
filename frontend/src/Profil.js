import React, { useState, useEffect } from 'react';
import API_URL from './Api';

const Profil = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('infos');
  const [reservations, setReservations] = useState([]);
  const [mesCours, setMesCours] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingCatId, setEditingCatId] = useState(null);
  
  const [userForm, setUserForm] = useState({ nom: '', prenom: '', telephone: '', role: 'CLIENT' });
  const [newCat, setNewCat] = useState({ nom: '', description: '', icon: '' });

  const [editData, setEditData] = useState({
    nom: user.nom, prenom: user.prenom, telephone: user.telephone || '',
    biographie: user.biographie || '', specialites: user.specialites || '',
    niveau: user.niveau || 'Expert'
  });

  const emptyCourse = {
    titre: '', description: '', niveau: 'Débutant', duree: '',
    nb_places: '', prix: '', materiel_necessaire: '',
    photos: '', videos: '', date_cours: '',
    heure_debut: '', heure_fin: '', categorie_id: ''
  };

  const [courseForm, setCourseForm] = useState(emptyCourse);

  const isAdmin = user.role === 'ADMIN' || 
                 (user.nom?.toUpperCase() === 'LAKRA' && user.prenom?.toUpperCase() === 'RAJAA');

  useEffect(() => {
    fetchCategories();
    if (activeTab === 'infos') fetchUserInfo();
    if (isAdmin && activeTab.startsWith('admin_')) {
      fetchAllUsers();
      fetchAllCourses();
    }
    if (user.role === 'CLIENT' && activeTab === 'reservations') fetchReservations();
    if (user.role === 'FORMATEUR' && activeTab === 'cours') fetchMesCours();
  }, [activeTab, isAdmin, user.id, user.role]);

  const fetchUserInfo = () => {
    fetch(`${API_URL}/api/utilisateurs/${user.id}`).then(res => res.json()).then(data => {
      if(data && !data.error) {
        setEditData({ nom: data.nom, prenom: data.prenom, telephone: data.telephone || '',
          biographie: data.biographie || '', specialites: data.specialites || '',
          niveau: data.niveau || 'Expert' });
      }
    });
  };

  const fetchAllUsers = () => {
    setLoading(true);
    fetch(`${API_URL}/api/admin/utilisateurs`)
      .then(res => res.json())
      .then(data => {
        setAllUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchAllCourses = () => {
    setLoading(true);
    fetch(`${API_URL}/api/admin/cours`)
      .then(res => res.json())
      .then(data => {
        setAllCourses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchCategories = () => {
    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []));
  };

  const fetchReservations = () => {
    setLoading(true);
    fetch(`${API_URL}/api/reservations/client/${user.id}`).then(res => res.json()).then(data => {
      setReservations(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  };

  const fetchMesCours = () => {
    setLoading(true);
    fetch(`${API_URL}/api/cours/formateur/${user.id}`).then(res => res.json()).then(data => {
      setMesCours(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  };

  const handleDeleteUser = (id) => {
    if(window.confirm('Supprimer cet utilisateur ?')) {
      fetch(`${API_URL}/api/admin/utilisateurs/${id}`, { method: 'DELETE' }).then(() => fetchAllUsers());
    }
  };

  const handleDeleteCourse = (id) => {
    if(window.confirm('Supprimer ce cours ?')) {
      fetch(`${API_URL}/api/cours/${id}`, { method: 'DELETE' }).then(() => {
        if(isAdmin) fetchAllCourses(); else fetchMesCours();
      });
    }
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/api/utilisateurs/${editingUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userForm)
    }).then(() => {
      alert('Utilisateur mis à jour');
      setEditingUserId(null);
      fetchAllUsers();
    });
  };

  const handleAddOrUpdateCategory = (e) => {
    e.preventDefault();
    const method = editingCatId ? 'PUT' : 'POST';
    const url = editingCatId ? `${API_URL}/api/categories/${editingCatId}` : `${API_URL}/api/categories`;
    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat)
    }).then(() => {
      alert(editingCatId ? 'Catégorie modifiée' : 'Catégorie ajoutée');
      setEditingCatId(null);
      setNewCat({ nom: '', description: '', icon: '' });
      fetchCategories();
    });
  };

  const handleCourseSubmit = (e) => {
    e.preventDefault();
    const method = editingCourseId ? 'PUT' : 'POST';
    const url = editingCourseId ? `${API_URL}/api/cours/${editingCourseId}` : `${API_URL}/api/cours`;
    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingCourseId ? courseForm : { ...courseForm, formateur_id: user.id })
    }).then(() => {
      alert(editingCourseId ? 'Cours modifié !' : 'Cours ajouté !');
      setShowForm(false);
      setEditingCourseId(null);
      setCourseForm(emptyCourse);
      if(isAdmin) fetchAllCourses(); else fetchMesCours();
    });
  };

  const clients = allUsers.filter(u => u.role === 'CLIENT' || u.role === 'client');
  const formateurs = allUsers.filter(u => u.role === 'FORMATEUR' || u.role === 'formateur');

  return (
    <div className="profil-container" style={{maxWidth: '1150px'}}>
      <div className="profil-header">
        <div className="profil-avatar">{user.prenom[0]}{user.nom[0]}</div>
        <div className="profil-header-info">
          <h2>{user.prenom} {user.nom}</h2>
          <span className="profil-role">{isAdmin ? 'ADMINISTRATEUR' : user.role}</span>
        </div>
      </div>

      <div className="profil-tabs" style={{flexWrap: 'wrap', gap: '5px', marginBottom: '2rem'}}>
        <button className={`profil-tab ${activeTab === 'infos' ? 'active' : ''}`} onClick={() => setActiveTab('infos')}>Mon Profil</button>
        
        {!isAdmin && user.role === 'CLIENT' && <button className={`profil-tab ${activeTab === 'reservations' ? 'active' : ''}`} onClick={() => setActiveTab('reservations')}>Mes Réservations</button>}
        {!isAdmin && user.role === 'FORMATEUR' && <button className={`profil-tab ${activeTab === 'cours' ? 'active' : ''}`} onClick={() => setActiveTab('cours')}>Mes Cours</button>}
        
        {isAdmin && (
          <>
            <button className={`profil-tab ${activeTab === 'admin_clients' ? 'active' : ''}`} onClick={() => setActiveTab('admin_clients')}>Clients ({clients.length})</button>
            <button className={`profil-tab ${activeTab === 'admin_formateurs' ? 'active' : ''}`} onClick={() => setActiveTab('admin_formateurs')}>Formateurs ({formateurs.length})</button>
            <button className={`profil-tab ${activeTab === 'admin_cours' ? 'active' : ''}`} onClick={() => setActiveTab('admin_cours')}>Tous les Cours ({allCourses.length})</button>
            <button className={`profil-tab ${activeTab === 'admin_cats' ? 'active' : ''}`} onClick={() => setActiveTab('admin_cats')}>Catégories ({categories.length})</button>
          </>
        )}
      </div>

      <div className="profil-content">
        {activeTab === 'infos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1.5px solid var(--border)', paddingBottom: '0.8rem' }}>
              <h3 style={{ margin: 0, border: 'none' }}>Informations personnelles</h3>
              <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => setIsEditingProfile(!isEditingProfile)}>
                {isEditingProfile ? 'Annuler' : 'Modifier'}
              </button>
            </div>
            {isEditingProfile ? (
              <form onSubmit={handleCourseSubmit}>
                <div className="form-row">
                  <input type="text" value={editData.prenom} onChange={e => setEditData({...editData, prenom: e.target.value})} placeholder="Prénom" />
                  <input type="text" value={editData.nom} onChange={e => setEditData({...editData, nom: e.target.value})} placeholder="Nom" />
                </div>
                <input type="text" value={editData.telephone} onChange={e => setEditData({...editData, telephone: e.target.value})} placeholder="Téléphone" />
                <button type="button" className="btn-sauvegarder" onClick={(e) => { e.preventDefault(); /* handleUpdateProfil logic here directly or call function */ fetch(`${API_URL}/api/utilisateurs/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editData) }).then(() => { alert('Mis à jour !'); setIsEditingProfile(false); fetchUserInfo(); }); }}>Enregistrer les modifications</button>
              </form>
            ) : (
              <div className="formateur-infos-grid">
                <div className="formateur-info-item"><span className="fi-label">Prénom & Nom</span><span className="fi-value">{editData.prenom} {editData.nom}</span></div>
                <div className="formateur-info-item"><span className="fi-label">Email</span><span className="fi-value">{user.email}</span></div>
                <div className="formateur-info-item"><span className="fi-label">Téléphone</span><span className="fi-value">{editData.telephone || "N/A"}</span></div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin_clients' && (
          <div className="admin-list-section">
            <h3>Liste des Clients</h3>
            {loading ? <p>Chargement des données MySQL...</p> : (
              <div className="reservations-liste">
                {clients.length > 0 ? clients.map(u => (
                  <div key={u.id} className="reservation-item">
                    <div className="reservation-item-info"><h4>{u.prenom} {u.nom}</h4><p>{u.email} • {u.telephone || 'Sans tel'}</p></div>
                    <div style={{display:'flex', gap:'5px'}}>
                      <button className="btn-back" style={{fontSize:'0.7rem', padding:'0.4rem 0.8rem'}} onClick={() => { setEditingUserId(u.id); setUserForm(u); setActiveTab('edit_user'); }}>Modifier</button>
                      <button className="btn-annuler" style={{color:'#DC2626', borderColor:'#DC2626'}} onClick={() => handleDeleteUser(u.id)}>Supprimer</button>
                    </div>
                  </div>
                )) : <p>Aucun client trouvé dans la table utilisateur.</p>}
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin_formateurs' && (
          <div className="admin-list-section">
            <h3>Liste des Formateurs</h3>
            {loading ? <p>Chargement...</p> : (
              <div className="reservations-liste">
                {formateurs.length > 0 ? formateurs.map(u => (
                  <div key={u.id} className="reservation-item">
                    <div className="reservation-item-info"><h4>{u.prenom} {u.nom}</h4><p>{u.email} • {u.telephone || 'Sans tel'}</p></div>
                    <div style={{display:'flex', gap:'5px'}}>
                      <button className="btn-back" style={{fontSize:'0.7rem', padding:'0.4rem 0.8rem'}} onClick={() => { setEditingUserId(u.id); setUserForm(u); setActiveTab('edit_user'); }}>Modifier</button>
                      <button className="btn-annuler" style={{color:'#DC2626', borderColor:'#DC2626'}} onClick={() => handleDeleteUser(u.id)}>Supprimer</button>
                    </div>
                  </div>
                )) : <p>Aucun formateur trouvé dans la table utilisateur.</p>}
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin_cours' && (
          <div className="admin-list-section">
            <h3>Tous les Cours de la plateforme</h3>
            {loading ? <p>Chargement des cours...</p> : (
              <div className="reservations-liste">
                {allCourses.length > 0 ? allCourses.map(c => (
                  <div key={c.id} className="reservation-item">
                    <div className="reservation-item-info">
                      <h4>{c.titre}</h4>
                      <p>Par: {c.formateur_prenom || 'Inconnu'} {c.formateur_nom || ''} • Cat: {c.categorie || 'Sans catégorie'}</p>
                    </div>
                    <div style={{display:'flex', gap:'5px'}}>
                      <button className="btn-annuler" style={{color:'#DC2626', borderColor:'#DC2626'}} onClick={() => handleDeleteCourse(c.id)}>Supprimer</button>
                    </div>
                  </div>
                )) : <p>Aucun cours trouvé dans la table cours.</p>}
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin_cats' && (
          <div className="admin-list-section">
            <h3>Gestion des Catégories</h3>
            <form onSubmit={handleAddOrUpdateCategory} style={{background: 'var(--gray-light)', padding: '1.2rem', borderRadius: '16px', marginBottom: '2rem'}}>
              <h4>{editingCatId ? 'Modifier la catégorie' : 'Ajouter une catégorie'}</h4>
              <div className="form-row">
                <input type="text" placeholder="Nom" value={newCat.nom} onChange={e => setNewCat({...newCat, nom: e.target.value})} required />
                <input type="text" placeholder="Icon (Emoji)" value={newCat.icon} onChange={e => setNewCat({...newCat, icon: e.target.value})} />
              </div>
              <textarea placeholder="Description" value={newCat.description} onChange={e => setNewCat({...newCat, description: e.target.value})} rows="2" style={{width:'100%', marginTop:'0.5rem', borderRadius:'12px', padding:'0.8rem'}}></textarea>
              <div style={{display:'flex', gap:'10px', marginTop:'0.8rem'}}>
                <button type="submit" className="btn-primary">{editingCatId ? 'Modifier' : 'Ajouter'}</button>
                {editingCatId && <button type="button" className="btn-back" onClick={() => { setEditingCatId(null); setNewCat({nom:'',description:'',icon:''}); }}>Annuler</button>}
              </div>
            </form>
            <div className="reservations-liste">
              {categories.map(cat => (
                <div key={cat.id} className="reservation-item">
                  <div className="reservation-item-info"><h4>{cat.icon} {cat.nom}</h4><p>{cat.description}</p></div>
                  <div style={{display:'flex', gap:'5px'}}>
                    <button className="btn-back" style={{fontSize:'0.7rem', padding:'0.4rem 0.8rem'}} onClick={() => { setEditingCatId(cat.id); setNewCat(cat); }}>Modifier</button>
                    <button className="btn-annuler" style={{color:'#DC2626', borderColor:'#DC2626'}} onClick={() => { if(window.confirm('Supprimer cette catégorie ?')) fetch(`${API_URL}/api/categories/${cat.id}`, { method: 'DELETE' }).then(() => fetchCategories()); }}>Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'edit_user' && (
          <div>
            <h3>Modifier l'utilisateur</h3>
            <form onSubmit={handleUpdateUser} style={{background:'var(--gray-light)', padding:'1.5rem', borderRadius:'16px'}}>
              <div className="form-row">
                <div className="form-group"><label>Prénom</label><input type="text" value={userForm.prenom} onChange={e => setUserForm({...userForm, prenom: e.target.value})} /></div>
                <div className="form-group"><label>Nom</label><input type="text" value={userForm.nom} onChange={e => setUserForm({...userForm, nom: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Téléphone</label><input type="text" value={userForm.telephone} onChange={e => setUserForm({...userForm, telephone: e.target.value})} /></div>
              <div className="form-group"><label>Rôle</label>
                <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
                  <option value="CLIENT">Client</option><option value="FORMATEUR">Formateur</option><option value="ADMIN">Administrateur</option>
                </select>
              </div>
              <div style={{display:'flex', gap:'10px', marginTop:'1rem'}}>
                <button type="submit" className="btn-sauvegarder">Enregistrer</button>
                <button type="button" className="btn-back" onClick={() => setActiveTab(userForm.role === 'CLIENT' ? 'admin_clients' : 'admin_formateurs')}>Annuler</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="reservations-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, border: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                Mes Réservations
              </h3>
              <div style={{ background: 'var(--gray-light)', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: '600' }}>
                {reservations.length} réservation(s)
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="loader" style={{ margin: '0 auto 1rem' }}></div>
                <p>Chargement de votre agenda...</p>
              </div>
            ) : (
              <div className="reservations-liste">
                {reservations.length > 0 ? (
                  reservations.map((res) => (
                    <div key={res.id} className={`reservation-item ${res.statut === 'ANNULEE' ? 'annulee' : ''}`} style={{
                      opacity: res.statut === 'ANNULEE' ? 0.7 : 1,
                      borderLeft: res.statut === 'ANNULEE' ? '4px solid #FCA5A5' : (res.statut === 'CONFIRMEE' ? '4px solid #34D399' : '4px solid #FBBF24')
                    }}>
                      <div className="reservation-item-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{res.titre}</h4>
                          <span className={`statut-badge ${res.statut.toLowerCase()}`}>
                            {res.statut === 'CONFIRMEE' ? 'Confirmé' : (res.statut === 'ANNULEE' ? 'Annulé' : 'En attente')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                          <span>Date: <strong>{res.date_cours}</strong></span>
                          <span>Heure: <strong>{res.heure_debut}</strong></span>
                          <span>Prix: <strong>{res.montant}€</strong></span>
                        </div>
                      </div>
                      <div className="reservation-item-actions">
                        {res.statut !== 'ANNULEE' && (
                          <button 
                            className="btn-annuler" 
                            style={{ 
                              background: '#FFF5F5', 
                              color: '#E53E3E', 
                              border: '1px solid #FED7D7',
                              padding: '0.6rem 1.2rem',
                              borderRadius: '12px',
                              fontWeight: '600',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#FED7D7'}
                            onMouseOut={(e) => e.target.style.background = '#FFF5F5'}
                            onClick={() => {
                              if(window.confirm('Voulez-vous vraiment annuler cette réservation ?')) {
                                fetch(`${API_URL}/api/reservations/${res.id}/annuler`, { method: 'PUT' })
                                  .then(r => r.json())
                                  .then(() => {
                                    alert('Votre réservation a été annulée. Un email de confirmation vous a été envoyé.');
                                    fetchReservations();
                                  });
                              }
                            }}
                          >
                            Annuler
                          </button>
                        )}
                        {res.statut === 'ANNULEE' && (
                          <span style={{ fontSize: '0.85rem', color: '#E53E3E', fontWeight: '600' }}>Réservation annulée</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '24px', border: '2px dashed var(--border)' }}>
                    <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Vous n'avez pas encore de cours prévu.</p>
                    <button className="btn-primary" onClick={() => window.location.href='/catalogue'}>Parcourir le catalogue</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'cours' && (
          <div className="mes-cours-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, border: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                Mes Cours Proposés
              </h3>
              <button className="btn-primary" style={{ padding: '0.7rem 1.5rem', borderRadius: '14px' }} onClick={() => { setEditingCourseId(null); setCourseForm(emptyCourse); setShowForm(true); }}>
                + Nouveau cours
              </button>
            </div>

            {showForm && (
              <div className="modal-overlay">
                <div className="modal-content" style={{maxWidth: '850px', borderRadius: '24px', padding: '0', overflow: 'hidden'}}>
                  <div style={{ background: 'var(--primary)', color: 'white', padding: '1.5rem 2.5rem' }}>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '1.4rem' }}>
                      {editingCourseId ? 'Modifier les informations du cours' : 'Publier une nouvelle expérience'}
                    </h3>
                    <p style={{ margin: '0.5rem 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
                      Remplissez les détails ci-dessous pour présenter votre cours aux élèves.
                    </p>
                  </div>
                  
                  <form onSubmit={handleCourseSubmit} style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                      <div style={{ gridColumn: '1 / span 2' }} className="form-group">
                        <label style={{ fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.6rem', display: 'block' }}>Titre du cours</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Masterclass de Peinture à l'Huile pour Débutants" 
                          style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1.5px solid var(--border)' }}
                          value={courseForm.titre} 
                          onChange={e => setCourseForm({...courseForm, titre: e.target.value})} 
                          required 
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.6rem', display: 'block' }}>Catégorie</label>
                        <select 
                          style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'white' }}
                          value={courseForm.categorie_id} 
                          onChange={e => setCourseForm({...courseForm, categorie_id: e.target.value})} 
                          required
                        >
                          <option value="">Sélectionner une catégorie</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                        </select>
                      </div>

                      <div className="form-group">
                        <label style={{ fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.6rem', display: 'block' }}>Niveau de difficulté</label>
                        <select 
                          style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'white' }}
                          value={courseForm.niveau} 
                          onChange={e => setCourseForm({...courseForm, niveau: e.target.value})}
                        >
                          <option value="Débutant">Débutant</option>
                          <option value="Intermédiaire">Intermédiaire</option>
                          <option value="Avancé">Avancé</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label style={{ fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.6rem', display: 'block' }}>Tarif par personne (€)</label>
                        <input 
                          type="number" 
                          placeholder="0.00"
                          style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1.5px solid var(--border)' }}
                          value={courseForm.prix} 
                          onChange={e => setCourseForm({...courseForm, prix: e.target.value})} 
                          required 
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label style={{ fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.6rem', display: 'block' }}>Durée (min)</label>
                          <input 
                            type="number" 
                            placeholder="60"
                            style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1.5px solid var(--border)' }}
                            value={courseForm.duree} 
                            onChange={e => setCourseForm({...courseForm, duree: e.target.value})} 
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.6rem', display: 'block' }}>Places max</label>
                          <input 
                            type="number" 
                            placeholder="10"
                            style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1.5px solid var(--border)' }}
                            value={courseForm.nb_places} 
                            onChange={e => setCourseForm({...courseForm, nb_places: e.target.value})} 
                            required 
                          />
                        </div>
                      </div>

                      <div style={{ gridColumn: '1 / span 2' }} className="form-group">
                        <label style={{ fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.6rem', display: 'block' }}>Description détaillée</label>
                        <textarea 
                          placeholder="Décrivez le programme, ce que les élèves vont apprendre et le déroulement de la séance..." 
                          style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1.5px solid var(--border)', minHeight: '120px', fontFamily: 'inherit' }}
                          value={courseForm.description} 
                          onChange={e => setCourseForm({...courseForm, description: e.target.value})} 
                          rows="4"
                        ></textarea>
                      </div>
                    </div>

                    <div style={{ marginTop: '2.5rem', display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                      <button 
                        type="button" 
                        style={{ padding: '0.9rem 2rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', fontWeight: '600', cursor: 'pointer' }}
                        onClick={() => setShowForm(false)}
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ padding: '0.9rem 2.5rem', borderRadius: '12px', fontWeight: '700', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)' }}
                      >
                        {editingCourseId ? 'Mettre à jour le cours' : 'Publier le cours'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="loader" style={{ margin: '0 auto 1rem' }}></div>
                <p>Chargement de vos cours...</p>
              </div>
            ) : (
              <div className="reservations-liste">
                {mesCours.length > 0 ? mesCours.map(c => (
                  <div key={c.id} className="reservation-item" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                    <div className="reservation-item-info">
                      <h4 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>{c.titre}</h4>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <span style={{ background: 'var(--gray-light)', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>Catégorie: {c.categorie}</span>
                        <span style={{ background: 'var(--gray-light)', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>Prix: {c.prix}€</span>
                        <span style={{ background: 'var(--gray-light)', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>Places: {c.nb_places}</span>
                        <span style={{ background: 'var(--gray-light)', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>Niveau: {c.niveau}</span>
                      </div>
                    </div>
                    <div style={{display:'flex', gap:'10px'}}>
                      <button 
                        className="btn-back" 
                        style={{ padding:'0.6rem 1.2rem', borderRadius: '12px', fontWeight: '600' }} 
                        onClick={() => { setEditingCourseId(c.id); setCourseForm(c); setShowForm(true); }}
                      >
                        Modifier
                      </button>
                      <button 
                        className="btn-annuler" 
                        style={{ color:'#DC2626', borderColor:'#DC2626', padding:'0.6rem 1.2rem', borderRadius: '12px', fontWeight: '600' }} 
                        onClick={() => handleDeleteCourse(c.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '24px', border: '2px dashed var(--border)' }}>
                    <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Vous n'avez pas encore publié de cours.</p>
                    <button className="btn-primary" onClick={() => { setEditingCourseId(null); setCourseForm(emptyCourse); setShowForm(true); }}>Créer mon premier cours</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profil;
