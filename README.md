# 📦 Plateforme ERP SaaS Multi-Entreprises (Modulaire & Scalable)

<div align="center">

![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15.5-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-4.4-blue?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

**Un système de gestion d'entreprise (ERP) moderne, isolé par locataire (Multi-Tenant) avec des modules spécialisés (Informatique, Pharmacie, Restaurant).**

[Modules & Architecture](#-modules-métiers-multi-tenant) • [Sécurité](#-sécurité-saas) • [Frontend Dynamique](#-frontend-nextjs-dynamique) • [Installation & Docker](#-guide-dinstallation)

</div>

---

## ✨ Modules Métiers Multi-Tenant

L'application repose sur une architecture où chaque entreprise dispose de ses propres données isolées, et n'accède qu'aux modules pertinents pour son secteur d'activité :

### 🏢 1. Le Cœur d'Inventaire (Toutes entreprises)
*   **Gestion centralisée** : Produits, catégories, entrepôts multiples, fournisseurs.
*   **Mouvements de stock** : Entrées, sorties, transferts inter-entrepôts avec traçabilité complète.
*   **Alertes** : Détection en temps réel des ruptures de stock.

### 💻 2. Module Informatique (IT Store)
*   **Suivi des équipements** : Ordinateurs, serveurs, périphériques.
*   **Gestion des licences** : Traçabilité des clés logicielles et places disponibles.
*   **Helpdesk & Support** : Système de tickets pour les incidents utilisateurs.
*   **Maintenance** : Suivi du cycle de vie matériel et de l'entretien.

### 💊 3. Module Pharmacie
*   **Traçabilité par lots** : Suivi strict des lots de médicaments.
*   **Dates de péremption** : Alertes automatiques pour les produits expirant prochainement.

### 🍽️ 4. Module Restaurant
*   **Gestion de Salle** : Plan de table et taux d'occupation.
*   **Flux des commandes** : De la table à la cuisine jusqu'à la facturation.

---

## 🏗️ Architecture Multi-Tenant & Sécurité SaaS

### Isolation des Données (Discriminator Pattern)
Chaque table en base de données inclut une colonne `company_id`. Les entités JPA et les Repositories filtrent automatiquement les données pour s'assurer qu'un locataire (Tenant) ne voit que les informations de son entreprise.

### Sécurité Avancée
*   **Authentification JWT** : Jetons signés injectant les rôles et le `companyId` de l'utilisateur.
*   **Rotation des Refresh Tokens** : Gestion de session sécurisée.
*   **Validation `@Valid`** : Protection contre les injections.
*   **Global Exception Handler** : Réponses standardisées.

---

## 🎨 Frontend Next.js Dynamique
*   **Zustand Store** : Le frontend adapte instantanément son état global en fonction de l'entreprise connectée (`companyType`).
*   **Dashboard Modulaire** : Les widgets et les menus de navigation (Sidebar) se reconstruisent dynamiquement selon le métier (Ex: Affichage des tables pour les restaurants, des tickets pour l'IT).
*   **Thème Premium & Dark Mode** : Interface utilisateur riche, utilisant `TailwindCSS` et `HeroIcons`, offrant une expérience fluide et professionnelle.

---

## 📋 Endpoints API Principaux

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authentification (renvoie JWT + Données Entreprise) |
| `GET` | `/api/modules/it/equipments/company/{id}` | Récupération des équipements (Isolé par tenant) |
| `GET` | `/api/modules/it/tickets/company/{id}` | Liste des tickets de support (Isolé par tenant) |
| `GET` | `/api/products/page` | Pagination et recherche filtrée des produits |
| `GET` | `/api/reports/export/products/pdf` | Génération de rapports analytiques professionnels |

---

## ⚙️ Guide d'Installation

### 🐳 Lancement avec Docker Compose (Recommandé)
Assurez-vous d'avoir Docker installé, puis lancez à la racine du projet :
```bash
docker-compose up --build -d
```
*   **Frontend** : `http://localhost:3000`
*   **Backend API** : `http://localhost:8080`
*   **Base de Données** : Port `3306`

### 💻 Lancement Manuel (Développement)
1.  Configurez `stock_db` sur MySQL.
2.  **Backend (Java/Spring Boot)** :
    ```bash
    cd stock-management/backend
    mvn spring-boot:run
    ```
3.  **Frontend (Next.js)** :
    ```bash
    cd stock-management/frontend
    npm install
    npm run dev
    ```
