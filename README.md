# Glific - Two Way Open Source Communication Platform

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
![CI](https://github.com/glific/glific-frontend/workflows/Continuous%20Integration/badge.svg)
[![Code coverage](https://img.shields.io/codecov/c/github/glific/glific-frontend/master.svg)](https://codecov.io/gh/glific/glific-frontend/branch/master)
![GitHub issues](https://img.shields.io/github/issues-raw/glific/glific-frontend)
[![Discord](https://img.shields.io/discord/717975833226248303.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/MVf2KF)
[![Cypress](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/detailed/ocex65/master&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/ocex65/runs)

Glific is a two-way communication platform built for nonprofits. This is the frontend interface built using React.

---

## 📋 Table of Contents

- [Clone Frontend Repo](#clone-frontend-repo)
  - [Git commands to clone](#git-commands-to-clone)
- [Pre-requisite](#pre-requisite)
  - [Software Dependencies](#software-dependencies)
    - [npm (via asdf)](#npm-via-asdf)
    - [yarn (via npm)](#yarn-via-npm)
  - [Glific Backend](#glific-backend)
- [Installation](#installation)
  - [Start backend server](#start-backend-server)
  - [Start frontend server](#start-frontend-server)
  - [Login credentials](#login-credentials)
  - [Configure Gupshup settings](#configure-gupshup-settings)
- [Available Scripts](#available-scripts)
- [Docker Image for Production](#docker-image-for-production)
- [Localization](#localization)
- [Deploying Release on ECS with CD](#deploying-release-on-ecs-with-cd)
- [Learn More](#learn-more)

---

## 🧬 Clone Frontend Repo

### Git commands to clone

```bash
git clone https://github.com/glific/glific-frontend.git
cd glific-frontend
```

---

## 🛠 Pre-requisite

### Software Dependencies

#### npm (via asdf)

```bash
asdf plugin-add nodejs
asdf install nodejs latest
asdf global nodejs latest
```

#### yarn (via npm)

```bash
npm install --global yarn
```

### Glific Backend

You need to set up the backend service for Glific. Follow the instructions here:  
🔗 https://github.com/glific/glific

> 💡 Note: SSL is required in development for both frontend and backend. Follow the SSL setup instructions in the backend README.

Also, add the following entry to your `/etc/hosts` file:

```
127.0.0.1 glific.test
```

---

## ⚙️ Installation

1. Copy `.env.example` to `.env` in the project root:

   ```bash
   cp .env.example .env
   ```

2. **Do not modify `.env`** unless absolutely required.
3. Install dependencies:

   ```bash
   yarn setup
   ```

---

### Start backend server

Ensure your Glific backend server is running and accessible.

---

### Start frontend server

```bash
yarn dev
```

Visit `https://glific.test:3000` to open the app.

---

### Login credentials

Use the default test user credentials defined in the backend README or seeds.

---

### Configure Gupshup settings

After logging in:

1. Go to **Settings → Integration**.
2. Enter your Gupshup credentials and App Name.
3. Save the settings to auto-fetch your Gupshup App ID.

---

## 📜 Available Scripts

```bash
yarn setup               # Install dependencies
yarn dev                 # Run app in development mode
yarn test                # Run tests in watch mode
yarn test:coverage       # Run tests with coverage
yarn build               # Create optimized production build
yarn extract-translations # Extract English strings for Lokalise
```

---

## 🐳 Docker Image for Production

To build a production Docker image:

```bash
docker build \
--build-arg VITE_GLIFIC_API_PORT=API-PORT \
--no-cache -t glific-frontend .
```

Replace `API-PORT` with your backend API port number.

---

## 🌐 Localization

1. Extract base strings:

   ```bash
   yarn extract-translations
   ```

2. Once merged into `main`, strings will appear in [Lokalise](https://lokalise.com).
3. Use `Download → Build only` in Lokalise to push translations.
4. This will create a PR automatically in the frontend repo.
5. It's recommended to **Preview** before building.

---

## 🚀 Deploying Release on ECS with CD

- For AWS CodeBuild, use `buildspec.yml.sample` as your config file.
- For Docker Hub and alternatives, use this GitHub Action:  
  🔗 https://github.com/marketplace/actions/build-and-push-docker-images

---

## 📚 Learn More

- 🌐 [Glific.org](https://glific.org/)
- 📄 [One Pager](https://docs.google.com/document/d/1XYxNvIYzNyX2Ve99-HrmTC8utyBFaf_Y7NP1dFYxI9Q/edit?usp=sharing)
- 📁 [Google Drive](https://drive.google.com/drive/folders/1aMQvS8xWRnIEtsIkRgLodhDAM-0hg0v1?usp=sharing)
- 📝 [Product Features](https://docs.google.com/document/d/1uUWmvFkPXJ1xVMr2xaBYJztoItnqxBnfqABz5ad6Zl8/edit?usp=sharing)
- 📰 [Blogs](https://chintugudiya.org/tag/glific/)
- 💬 [Discord](https://discord.gg/scsrGUw)
