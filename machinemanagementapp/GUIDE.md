# Guide d'utilisation - Système de gestion de réparation

## Vue d'ensemble

Ce système permet de gérer efficacement un atelier de réparation d'ordinateurs avec trois types d'utilisateurs : Admin, Secrétaire et Technicien.

## Rôles et permissions

### Admin
- Accès complet à toutes les fonctionnalités
- Peut créer/modifier/supprimer des utilisateurs
- Peut gérer les machines, clients et réparations
- Voit toutes les statistiques

### Secrétaire
- Enregistre les machines des clients
- Gère la base de données clients
- Assigne des techniciens aux machines
- Peut voir l'état des réparations
- N'a pas accès à la gestion des utilisateurs

### Technicien
- Voit les machines assignées
- Met à jour le statut des réparations
- Ajoute des remarques techniques
- Indique si une réparation n'a pas pu être effectuée

## Flux de travail

### 1. Enregistrement d'une machine

1. Le client arrive avec sa machine défectueuse
2. Le secrétaire crée/sélectionne le client dans la base
3. Le secrétaire enregistre la machine avec :
   - Marque et modèle
   - Numéro de série (optionnel)
   - Description du défaut
   - Photo de la machine (optionnel)
   - Date de rendez-vous
   - Montant estimé
   - Technicien assigné (optionnel)
4. La machine est créée avec le statut "En attente"

### 2. Réparation

1. Le technicien accède à la section "Réparations"
2. Il change le statut de la machine :
   - "En cours" : réparation en cours
   - "Terminé" : réparation terminée avec succès
   - "Anomalie" : problème détecté, réparation impossible
3. Le technicien peut ajouter une remarque technique :
   - Explications sur la réparation
   - Raison pour laquelle la machine n'a pas pu être réparée
   - Conseils au client

### 3. Récupération de la machine

1. Le secrétaire voit que la machine est terminée
2. Il appelle le client pour l'informer
3. Quand le client vient :
   - Si réparé : le client paie et récupère sa machine
   - Si anomalie : le secrétaire explique le problème au client
4. Le secrétaire marque la machine comme "Payée"

## Fonctionnalités principales

### Dashboard
- Statistiques en temps réel
- Nombre total de machines, clients, utilisateurs
- Répartition par statut (en attente, en cours, terminé, anomalie)
- Liste des machines récentes

### Gestion des machines
- Liste complète avec filtres par statut
- Recherche par marque, modèle, client
- Affichage en cartes avec photos
- Modification complète des informations
- Historique des modifications

### Gestion des clients
- Base de données complète
- Recherche par nom/prénom
- Coordonnées complètes (téléphone, email, adresse)
- Champ notes pour informations supplémentaires

### Gestion des utilisateurs (Admin uniquement)
- Création de comptes secrétaires et techniciens
- Attribution des rôles
- Activation/désactivation des comptes
- Modification des informations

## Conseils d'utilisation

### Pour les secrétaires
- Enregistrez toujours les coordonnées complètes du client
- Prenez une photo de la machine si possible
- Décrivez précisément le défaut expliqué par le client
- Fixez une date de rendez-vous réaliste
- Assignez un technicien dès que possible

### Pour les techniciens
- Mettez à jour le statut dès le début de la réparation
- Ajoutez des remarques détaillées, surtout en cas d'anomalie
- Soyez précis sur les raisons d'une non-réparation
- Changez le statut en "Terminé" uniquement quand c'est fait

### Pour les admins
- Créez des comptes avec des mots de passe sécurisés
- Vérifiez régulièrement les statistiques
- Désactivez les comptes des employés qui partent
- Sauvegardez régulièrement la base de données

## Support technique

En cas de problème :
1. Vérifiez que le backend est démarré (port 8080)
2. Vérifiez que le frontend est démarré (port 3000)
3. Vérifiez la connexion à MySQL
4. Consultez les logs dans la console

## Notes importantes

- Les mots de passe sont stockés en clair (à sécuriser en production)
- Pensez à faire des sauvegardes régulières de la base
- Le système fonctionne en local (localhost)
- Pour la production, configurez CORS et sécurisez les endpoints
