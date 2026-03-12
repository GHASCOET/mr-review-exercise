# Exercice de Code Review - Module Assurance

## Contexte de l'entretien

Ce dossier contient une simulation de Merge Request pour un exercice de relecture de code.
Le candidat doit reviewer les 5 fichiers comme s'il s'agissait d'une vraie MR soumise par un collègue.

---

## User Story associée

### US-4287 : Ajout du module Assurance dans le parcours de concrétisation

**En tant que** conseiller de vente (boutique, télévendeur ou partenaire),
**je veux** pouvoir proposer une assurance au client lors de la concrétisation de sa commande,
**afin de** finaliser la souscription d'une couverture adaptée à son terminal ou sa ligne, directement dans le tunnel de vente.

#### Description

Dans le cadre de l'enrichissement du parcours de concrétisation, nous ajoutons un nouveau module **Assurance** qui s'insère dans l'accordéon entre le module Options et le module Livraison.

Ce module permet de :

- **Consulter** les assurances disponibles pour le parcours en cours (acquisition mobile, renouvellement)
- **Souscrire** ou **modifier** une assurance existante
- **Renseigner un contact d'urgence** requis contractuellement pour la souscription
- **Calculer et afficher** les tarifs mensuels (TTC, avec promotion et financement éventuel)

Le module intègre également :

- Un **système de notifications** temps réel pour informer le conseiller des changements de statut (validation assurance, alerte fraude, confirmation contact)
- Une **vérification anti-fraude** côté client avant la souscription, basée sur un fingerprint navigateur

#### Critères d'acceptation

- [ ] Le conseiller peut voir la liste des assurances disponibles pour le parcours
- [ ] Le conseiller peut souscrire une assurance en un clic
- [ ] En renouvellement, une confirmation est demandée avant de remplacer l'assurance existante
- [ ] Le formulaire de contact d'urgence est affiché et requis avant validation
- [ ] Les prix sont affichés en TTC avec le format `XX,XX €`
- [ ] La détection de fraude bloque la souscription si le score est trop élevé
- [ ] Les notifications de changement de statut sont affichées en temps réel
- [ ] Le module s'intègre dans l'accordéon avec le pattern ModuleBuilder existant
- [ ] Les attributs `data-cy` sont présents pour les tests E2E

#### Périmètre technique

| Fichier                    | Description                                                     |
| -------------------------- | --------------------------------------------------------------- |
| `NotificationProvider.tsx` | Context + Provider pour les notifications temps réel du module  |
| `InsuranceContent.tsx`     | Contenu principal du module Assurance (liste, sélection, modal) |
| `useFraudDetection.ts`     | Hook de détection de fraude par fingerprint navigateur          |
| `EmergencyContactForm.tsx` | Formulaire de contact d'urgence (requis pour la souscription)   |
| `pricing.utils.ts`         | Utilitaires de calcul de prix (TTC, mensualités, promotions)    |

#### Liens

- Epic : CONC-312 - Module Assurance
- Maquette : Figma #4287
- API : Documentation GraphQL `consulterAssurances`, `sauvegarderContactUrgence`

---

## Instructions pour le candidat

Tu reçois cette MR d'un collègue développeur. Elle implémente la US ci-dessus.

**Ta mission** : reviewer les 5 fichiers et rédiger tes commentaires de review comme tu le ferais sur GitLab/GitHub.

Pour chaque problème trouvé, indique :

1. **Le fichier et la ligne** concernée
2. **La nature du problème** (bug, sécurité, performance, convention, anti-pattern...)
3. **Une explication** de pourquoi c'est problématique
4. **Une suggestion** de correction

Tu peux aussi noter les points positifs si tu en vois.

**Temps suggéré** : 30-45 minutes

**Critères d'évaluation** :

- Capacité à identifier les bugs critiques (crash, sécurité)
- Connaissance des bonnes pratiques React/TypeScript
- Attention aux patterns du projet (conventions, design system)
- Qualité des explications et suggestions de correction
- Priorisation des remarques (bloquant vs. mineur)

---

## Fichiers à reviewer

1. [`NotificationProvider.tsx`](./NotificationProvider.tsx)
2. [`InsuranceContent.tsx`](./InsuranceContent.tsx)
3. [`useFraudDetection.ts`](./useFraudDetection.ts)
4. [`EmergencyContactForm.tsx`](./EmergencyContactForm.tsx)
5. [`pricing.utils.ts`](./pricing.utils.ts)
