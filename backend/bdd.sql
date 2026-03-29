
--Table Utilisateur (et rôles)
CREATE TABLE utilisateur(
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  telephone VARCHAR(30),
  adresse VARCHAR(255),
  role ENUM('ADMIN','FORMATEUR','CLIENT') NOT NULL,
  photo VARCHAR(255),
  niveau VARCHAR(100),              -- utile pour Administrateur si besoin
  biographie TEXT,                  -- utile pour Formateur
  certifications TEXT,
  specialites TEXT,
  valide BOOLEAN DEFAULT FALSE,     -- formateur validé ou non
  evaluation_moyenne DECIMAL(3,2) DEFAULT 0.00
);
--Tables Catégorie et Cours
CREATE TABLE categorie (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  ordonnee INT
);

CREATE TABLE cours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(150) NOT NULL,
  description TEXT,
  niveau VARCHAR(50),
  duree INT,                        -- en minutes par ex.
  nb_places INT,
  prix DECIMAL(10,2),
  materiel_necessaire TEXT,
  photos TEXT,
  videos TEXT,
  statut VARCHAR(50),               -- ex: 'ACTIF','INACTIF'
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_cours DATE,
  heure_debut TIME,
  heure_fin TIME,
  categorie_id INT,
  formateur_id INT NOT NULL,
  FOREIGN KEY (categorie_id) REFERENCES categorie(id),
  FOREIGN KEY (formateur_id) REFERENCES utilisateur(id)
);
--Disponibilité et Réservation
CREATE TABLE disponibilite (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cours_id INT NOT NULL,
  date DATE NOT NULL,
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  places_disponibles INT,
  active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (cours_id) REFERENCES cours(id)
);

CREATE TABLE reservation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  cours_id INT NOT NULL,
  disponibilite_id INT,
  date_reservation DATETIME DEFAULT CURRENT_TIMESTAMP,
  statut VARCHAR(50),               -- ex: 'EN_ATTENTE','CONFIRMEE','ANNULEE'
  date_cours DATE,
  heure_debut TIME,
  heure_fin TIME,
  annulable BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (client_id) REFERENCES utilisateur(id),
  FOREIGN KEY (cours_id) REFERENCES cours(id),
  FOREIGN KEY (disponibilite_id) REFERENCES disponibilite(id)
);
--Paiement et Transaction
CREATE TABLE paiement (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL,
  montant DECIMAL(10,2) NOT NULL,
  date_paiement DATETIME DEFAULT CURRENT_TIMESTAMP,
  mode_paiement VARCHAR(50),
  statut VARCHAR(50),               -- ex: 'SUCCES','ECHEC','REMBOURSE'
  transaction_id VARCHAR(255),
  facture VARCHAR(255),
  FOREIGN KEY (reservation_id) REFERENCES reservation(id)
);

CREATE TABLE transaction_financiere (
  id INT AUTO_INCREMENT PRIMARY KEY,
  montant DECIMAL(10,2) NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  type VARCHAR(50),                 -- ex: 'ENTREE','SORTIE'
  description TEXT
);
--Evaluation, Message, Notification, Favori
CREATE TABLE evaluation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cours_id INT NOT NULL,
  client_id INT NOT NULL,
  note INT NOT NULL,
  commentaire TEXT,
  date_evaluation DATETIME DEFAULT CURRENT_TIMESTAMP,
  modere BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (cours_id) REFERENCES cours(id),
  FOREIGN KEY (client_id) REFERENCES utilisateur(id)
);

CREATE TABLE message (
  id INT AUTO_INCREMENT PRIMARY KEY,
  expediteur_id INT NOT NULL,
  destinataire_id INT NOT NULL,
  contenu TEXT NOT NULL,
  date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
  lu BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (expediteur_id) REFERENCES utilisateur(id),
  FOREIGN KEY (destinataire_id) REFERENCES utilisateur(id)
);

CREATE TABLE notification (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  type VARCHAR(50),
  contenu TEXT,
  date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
  lu BOOLEAN DEFAULT FALSE,
  priorite VARCHAR(20),
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id)
);

CREATE TABLE favori (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  cours_id INT NOT NULL,
  date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES utilisateur(id),
  FOREIGN KEY (cours_id) REFERENCES cours(id),
  UNIQUE KEY unique_favori (client_id, cours_id)
);
