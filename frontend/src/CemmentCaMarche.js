import React from 'react';

const CommentCaMarche = ({ onCommencer }) => {
  return (
    <div className="ccm-container">

      <div className="ccm-hero">
        <h1>Comment ça marche ?</h1>
        <p>Rejoignez HobbyClass en 3 étapes simples et commencez à apprendre dès aujourd'hui</p>
      </div>

      {/* ÉTAPES */}
      <div className="ccm-etapes">
        <div className="ccm-etape">
          <div className="ccm-numero">1</div>
          <h3>Choisissez votre cours</h3>
          <p>Parcourez notre catalogue de cours dans différentes catégories : peinture, cuisine, musique, danse et bien plus encore.</p>
        </div>
        <div className="ccm-fleche">→</div>
        <div className="ccm-etape">
          <div className="ccm-numero">2</div>
          <h3>Réservez votre place</h3>
          <p>Sélectionnez la date et l'heure qui vous conviennent parmi les disponibilités proposées par le formateur.</p>
        </div>
        <div className="ccm-fleche">→</div>
        <div className="ccm-etape">
          <div className="ccm-numero">3</div>
          <h3>Apprenez et progressez</h3>
          <p>Participez à votre cours avec un formateur passionné et développez de nouvelles compétences à votre rythme.</p>
        </div>
      </div>

      {/* AVANTAGES */}
      <div className="ccm-avantages">
        <h2>Pourquoi choisir HobbyClass ?</h2>
        <div className="ccm-avantages-grid">
          <div className="ccm-avantage">
            <div className="ccm-avantage-icon"></div>
            <h4>Formateurs experts</h4>
            <p>Tous nos formateurs sont des professionnels passionnés et expérimentés dans leur domaine.</p>
          </div>
          <div className="ccm-avantage">
            <div className="ccm-avantage-icon"></div>
            <h4>Horaires flexibles</h4>
            <p>Choisissez les créneaux qui s'adaptent à votre emploi du temps, soir et weekend inclus.</p>
          </div>
          <div className="ccm-avantage">
            <div className="ccm-avantage-icon"></div>
            <h4>Petits groupes</h4>
            <p>Des cours en petits groupes pour un suivi personnalisé et une meilleure progression.</p>
          </div>
          <div className="ccm-avantage">
            <div className="ccm-avantage-icon"></div>
            <h4>Paiement sécurisé</h4>
            <p>Réglez en toute sécurité par carte bancaire, PayPal ou virement bancaire.</p>
          </div>
          <div className="ccm-avantage">
            <div className="ccm-avantage-icon"></div>
            <h4>Avis vérifiés</h4>
            <p>Consultez les évaluations des autres élèves pour choisir le cours qui vous correspond.</p>
          </div>
          <div className="ccm-avantage">
            <div className="ccm-avantage-icon"></div>
            <h4>Annulation facile</h4>
            <p>Annulez ou reportez votre réservation jusqu'à 24h avant le début du cours.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="ccm-cta">
        <h2>Prêt à commencer ?</h2>
        <p>Rejoignez des milliers d'apprenants et découvrez votre nouvelle passion</p>
        <button className="btn-primary ccm-btn" onClick={onCommencer}>
          Explorer les cours
        </button>
      </div>

    </div>
  );
};

export default CommentCaMarche;