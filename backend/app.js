require('dotenv').config()

const PORT = process.env.PORT || 5000
const express = require('express')
const mysql = require('mysql2')
const myconnection = require('express-myconnection')
const cors = require('cors')
const nodemailer = require('nodemailer')
const cron = require('node-cron')

const app = express()

app.use(cors({
  origin: ['http://localhost:3000', 'https://hobbyclass.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const dbConfig = {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: parseInt(process.env.MYSQLPORT)
}

app.use(myconnection(mysql, dbConfig, 'pool'))

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
})

function creerNotification(connection, utilisateur_id, type, contenu, priorite = 'NORMALE') {
  connection.query(
    'INSERT INTO notification (utilisateur_id, type, contenu, priorite) VALUES (?, ?, ?, ?)',
    [utilisateur_id, type, contenu, priorite]
  )
}

app.get('/api/notifications/:utilisateur_id', (req, res) => {
  const { utilisateur_id } = req.params
  req.getConnection((err, connection) => {
    connection.query(
      'SELECT * FROM notification WHERE utilisateur_id = ? ORDER BY date_envoi DESC LIMIT 20',
      [utilisateur_id],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
      }
    )
  })
})

app.get('/api/notifications/:utilisateur_id/non-lues', (req, res) => {
  const { utilisateur_id } = req.params
  req.getConnection((err, connection) => {
    connection.query(
      'SELECT COUNT(*) as count FROM notification WHERE utilisateur_id = ? AND lu = 0',
      [utilisateur_id],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ count: results[0].count })
      }
    )
  })
})

app.put('/api/notifications/:utilisateur_id/lire', (req, res) => {
  const { utilisateur_id } = req.params
  req.getConnection((err, connection) => {
    connection.query(
      'UPDATE notification SET lu = 1 WHERE utilisateur_id = ?',
      [utilisateur_id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ message: 'Notifications lues' })
      }
    )
  })
})

app.get('/api/cours', (req, res) => {
  req.getConnection((err, connection) => {
    if (err) return res.status(500).json({ error: err.message });
    connection.query(`
      SELECT c.*, cat.nom as categorie, cat.description as categorie_description,
             cat.icon as categorie_icon, u.prenom, u.nom as formateur_nom,
             u.photo as formateur_photo
      FROM cours c
      JOIN categorie cat ON c.categorie_id = cat.id
      JOIN utilisateur u ON c.formateur_id = u.id
      WHERE c.statut = 'ACTIF'
    `, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });
});

app.get('/api/cours/:id', (req, res) => {
  const { id } = req.params
  req.getConnection((err, connection) => {
    connection.query(`
      SELECT c.*, cat.nom as categorie, u.prenom, u.nom as formateur_nom, u.photo as formateur_photo
      FROM cours c
      JOIN categorie cat ON c.categorie_id = cat.id
      JOIN utilisateur u ON c.formateur_id = u.id
      WHERE c.id = ?
    `, [id], (err, results) => {
      if (err || !results.length) return res.status(404).json({ error: 'Cours non trouvé' })
      res.json(results[0])
    })
  })
})

app.get('/api/cours/:id/disponibilites', (req, res) => {
  const { id } = req.params
  req.getConnection((err, connection) => {
    connection.query(`
      SELECT id, cours_id,
      DATE_FORMAT(date, '%d/%m/%Y') as date,
      TIME_FORMAT(heure_debut, '%H:%i') as heure_debut,
      TIME_FORMAT(heure_fin, '%H:%i') as heure_fin,
      places_disponibles, active
      FROM disponibilite
      WHERE cours_id = ? AND active = 1 AND places_disponibles > 0
      ORDER BY date, heure_debut
    `, [id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(results)
    })
  })
})

app.get('/api/cours/formateur/:id', (req, res) => {
  const { id } = req.params;
  req.getConnection((err, connection) => {
    connection.query(`
      SELECT c.*, cat.nom as categorie, u.prenom, u.nom as formateur_nom, u.photo as formateur_photo
      FROM cours c
      JOIN categorie cat ON c.categorie_id = cat.id
      JOIN utilisateur u ON c.formateur_id = u.id
      WHERE c.formateur_id = ? AND c.statut = 'ACTIF'
    `, [id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, mot_de_passe } = req.body
  req.getConnection((err, connection) => {
    if (err) return res.status(500).json({ error: 'Erreur DB' })
    connection.query(
      'SELECT * FROM utilisateur WHERE email = ? AND mot_de_passe = ?',
      [email, mot_de_passe],
      (err, results) => {
        if (err || !results.length) {
          return res.status(401).json({ error: 'Identifiants incorrects' })
        }
        const user = results[0]
        res.json({
          message: 'Connexion réussie',
          user: {
            id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            role: user.role,
            email: user.email,
            telephone: user.telephone,
            specialites: user.specialites,
            biographie: user.biographie
          }
        })
      }
    )
  })
})

app.get('/api/reservations/client/:id', (req, res) => {
  const { id } = req.params;
  req.getConnection((err, connection) => {
    connection.query(`
      SELECT r.*, c.titre, c.prix as montant
      FROM reservation r
      JOIN cours c ON r.cours_id = c.id
      WHERE r.client_id = ?
      ORDER BY r.date_reservation DESC
    `, [id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });
});

app.get('/api/utilisateurs/:id', (req, res) => {
  const { id } = req.params;
  req.getConnection((err, connection) => {
    connection.query(
      'SELECT id, nom, prenom, email, telephone, role, biographie, specialites, niveau, evaluation_moyenne, photo FROM utilisateur WHERE id = ?',
      [id],
      (err, results) => {
        if (err || !results.length) return res.status(404).json({ error: 'Utilisateur introuvable' });
        res.json(results[0]);
      }
    );
  });
});

app.put('/api/utilisateurs/:id', (req, res) => {
  const { id } = req.params;
  const { nom, prenom, telephone } = req.body;
  req.getConnection((err, connection) => {
    connection.query(
      'UPDATE utilisateur SET nom=?, prenom=?, telephone=? WHERE id=?',
      [nom, prenom, telephone, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Profil mis à jour' });
      }
    );
  });
});

app.put('/api/utilisateurs/:id/password', (req, res) => {
  const { id } = req.params;
  const { ancien_mdp, nouveau_mdp } = req.body;
  req.getConnection((err, connection) => {
    connection.query(
      'SELECT * FROM utilisateur WHERE id=? AND mot_de_passe=?',
      [id, ancien_mdp],
      (err, results) => {
        if (err || !results.length) {
          return res.status(401).json({ error: 'Ancien mot de passe incorrect' });
        }
        connection.query(
          'UPDATE utilisateur SET mot_de_passe=? WHERE id=?',
          [nouveau_mdp, id],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Mot de passe modifié' });
          }
        );
      }
    );
  });
});

app.put('/api/reservations/:id/annuler', (req, res) => {
  const { id } = req.params;
  req.getConnection((err, connection) => {
    connection.query(
      'UPDATE reservation SET statut = "ANNULEE" WHERE id = ?',
      [id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        connection.query(
          'UPDATE disponibilite SET places_disponibles = places_disponibles + 1 WHERE id = (SELECT disponibilite_id FROM reservation WHERE id = ?)',
          [id],
          (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            connection.query(`
              SELECT u.email, u.prenom, u.nom, u.id as client_id,
                     c.titre,
                     DATE_FORMAT(d.date, '%d/%m/%Y') as date,
                     TIME_FORMAT(d.heure_debut, '%H:%i') as heure_debut
              FROM reservation r
              JOIN utilisateur u ON r.client_id = u.id
              JOIN cours c ON r.cours_id = c.id
              JOIN disponibilite d ON r.disponibilite_id = d.id
              WHERE r.id = ?
            `, [id], (err3, results) => {
              if (!err3 && results.length) {
                const { email, prenom, nom, client_id, titre, date, heure_debut } = results[0]
                creerNotification(connection, client_id, 'ANNULATION',
                  `Votre réservation pour le cours "${titre}" du ${date} à ${heure_debut} a été annulée.`, 'HAUTE')
                const mailOptions = {
                  from: `"HobbyClass" <${process.env.GMAIL_USER}>`,
                  to: email,
                  subject: `Annulation de votre réservation — ${titre}`,
                  html: `<p>Bonjour ${prenom} ${nom}, votre réservation pour le cours "${titre}" du ${date} à ${heure_debut} a été annulée.</p>`
                }
                transporter.sendMail(mailOptions, (errMail) => {
                  if (errMail) console.log('❌ Erreur email annulation:', errMail.message)
                  else console.log('✅ Email annulation envoyé à', email)
                })
              }
              res.json({ message: 'Réservation annulée' });
            })
          }
        );
      }
    );
  });
});

app.post('/api/reservations', (req, res) => {
  const { client_id, cours_id, disponibilite_id } = req.body
  req.getConnection((err, connection) => {
    connection.beginTransaction(err => {
      if (err) return res.status(500).json({ error: 'Erreur transaction' })
      connection.query(
        'SELECT places_disponibles FROM disponibilite WHERE id = ?',
        [disponibilite_id],
        (err, results) => {
          if (err || !results.length || results[0].places_disponibles < 1) {
            return connection.rollback(() => res.status(400).json({ error: 'Aucune place disponible' }))
          }
          connection.query(
            'INSERT INTO reservation (client_id, cours_id, disponibilite_id, statut) VALUES (?, ?, ?, "EN_ATTENTE")',
            [client_id, cours_id, disponibilite_id],
            (err, result) => {
              if (err) {
                connection.rollback(() => res.status(500).json({ error: err.message }))
              } else {
                connection.query(
                  'UPDATE disponibilite SET places_disponibles = places_disponibles - 1 WHERE id = ?',
                  [disponibilite_id],
                  err2 => {
                    if (err2) {
                      connection.rollback(() => res.status(500).json({ error: err2.message }))
                    } else {
                      connection.commit(() => res.json({ message: 'Réservation créée', reservation_id: result.insertId }))
                    }
                  }
                )
              }
            }
          )
        }
      )
    })
  })
})

app.post('/api/paiement/:reservation_id', (req, res) => {
  const { reservation_id } = req.params
  const { montant, mode_paiement } = req.body
  req.getConnection((err, connection) => {
    connection.query(
      'INSERT INTO paiement (reservation_id, montant, mode_paiement, statut) VALUES (?, ?, ?, "SUCCES")',
      [reservation_id, montant, mode_paiement],
      err => {
        if (err) return res.status(500).json({ error: 'Erreur paiement' })
        connection.query(
          'UPDATE reservation SET statut = "CONFIRMEE" WHERE id = ?',
          [reservation_id],
          err2 => {
            if (err2) return res.status(500).json({ error: err2.message })
            connection.query(`
              SELECT u.email, u.prenom, u.nom, u.id as client_id,
                     c.titre, c.prix,
                     DATE_FORMAT(d.date, '%d/%m/%Y') as date,
                     TIME_FORMAT(d.heure_debut, '%H:%i') as heure_debut,
                     TIME_FORMAT(d.heure_fin, '%H:%i') as heure_fin
              FROM reservation r
              JOIN utilisateur u ON r.client_id = u.id
              JOIN cours c ON r.cours_id = c.id
              JOIN disponibilite d ON r.disponibilite_id = d.id
              WHERE r.id = ?
            `, [reservation_id], (err3, results) => {
              if (!err3 && results.length) {
                const { email, prenom, nom, client_id, titre, prix, date, heure_debut, heure_fin } = results[0]
                creerNotification(connection, client_id, 'CONFIRMATION',
                  `✅ Réservation confirmée ! Votre cours "${titre}" est prévu le ${date} à ${heure_debut}. Montant payé : ${prix}€`, 'HAUTE')
                const mailOptions = {
                  from: `"HobbyClass" <${process.env.GMAIL_USER}>`,
                  to: email,
                  subject: `✅ Confirmation de réservation — ${titre}`,
                  html: `<p>Bonjour ${prenom} ${nom}, votre réservation pour "${titre}" le ${date} de ${heure_debut} à ${heure_fin} est confirmée. Montant payé : ${prix}€</p>`
                }
                transporter.sendMail(mailOptions, (errMail) => {
                  if (errMail) console.log('❌ Erreur email:', errMail.message)
                  else console.log('✅ Email envoyé à', email)
                })
              }
              res.json({ message: 'Paiement réussi, réservation confirmée' })
            })
          }
        )
      }
    )
  })
})

app.get('/api/health', (req, res) => {
  res.json('Welcome to HobbyClass')
})

cron.schedule('0 9 * * *', () => {
  console.log('🔔 Vérification des rappels de cours...')
  const connCron = mysql.createConnection(dbConfig)
  connCron.connect()
  connCron.query(`
    SELECT r.client_id, u.email, u.prenom, u.nom, c.titre,
           DATE_FORMAT(d.date, '%d/%m/%Y') as date,
           TIME_FORMAT(d.heure_debut, '%H:%i') as heure_debut
    FROM reservation r
    JOIN utilisateur u ON r.client_id = u.id
    JOIN cours c ON r.cours_id = c.id
    JOIN disponibilite d ON r.disponibilite_id = d.id
    WHERE r.statut = 'CONFIRMEE'
    AND DATE(d.date) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
  `, (err, results) => {
    if (err) { console.log('❌ Erreur cron:', err.message); return }
    results.forEach(({ client_id, email, prenom, nom, titre, date, heure_debut }) => {
      connCron.query(
        'INSERT INTO notification (utilisateur_id, type, contenu, priorite) VALUES (?, ?, ?, ?)',
        [client_id, 'RAPPEL', `🔔 Rappel : votre cours "${titre}" a lieu demain le ${date} à ${heure_debut}. N'oubliez pas !`, 'HAUTE']
      )
      const mailRappel = {
        from: `"HobbyClass" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `🔔 Rappel — Votre cours "${titre}" est demain !`,
        html: `<p>Bonjour ${prenom} ${nom}, rappel pour votre cours "${titre}" demain le ${date} à ${heure_debut}. À demain ! 😊</p>`
      }
      transporter.sendMail(mailRappel, (errMail) => {
        if (errMail) console.log('❌ Erreur rappel email:', errMail.message)
        else console.log('✅ Rappel envoyé à', email)
      })
    })
    console.log(`✅ ${results.length} rappels traités`)
    connCron.end()
  })
})

app.listen(PORT, () => {
  console.log(`Serveur HobbyClass démarré sur http://localhost:${PORT}`)
})