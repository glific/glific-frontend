# Glific - Two Way Open Source Communication Platform

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
![](https://github.com/glific/glific-frontend/workflows/Continuous%20Integration/badge.svg)
[![Code coverage badge](https://img.shields.io/codecov/c/github/glific/glific-frontend/master.svg)](https://codecov.io/gh/glific/glific-frontend/branch/master)
![GitHub issues](https://img.shields.io/github/issues-raw/glific/glific-frontend)
[![Discord](https://img.shields.io/discord/717975833226248303.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/MVf2KF)
[![Glific](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/detailed/ocex65/master&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/ocex65/runs)

Frontend interface built using React.

## Prerequisite

- Setup the backend application. You can find the instructions [here](https://github.com/glific/glific).
- SSL is mandatory for both frontend and backend in development. You can find the instructions to generate ssl certificate [here](https://github.com/glific/glific#use-ssl-for-frontend-and-backend)
- Configure below host in your `/etc/hosts`
  `127.0.0.1 glific.test`

## Installation steps

1. Create a new file `.env` in the project root directory and copy the contents from `.env.example`.
2. Do not update the .env file unless you are absolutely sure of what you are doing. Keep the variables same.
3. Run `yarn setup`

## Available Scripts

In the project directory, you can run:

### `yarn setup`

Install the dependencies and required packages.

### `yarn dev`

Runs the app in the development mode.

### `yarn test`

Launches the test runner in the interactive watch mode.

### `yarn test:coverage`

Launches the test runner in the interactive watch mode and code coverage stats.

### `yarn build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

Your app is ready to be deployed!

## Docker image for production

```bash
docker build \
--build-arg VITE_GLIFIC_API_PORT=API-PORT \
--no-cache -t .
```

## Localization

Update translation base file (i.e. English)

```bash
yarn extract-translations
```

Once changed are pushed and merged into master it will be available in `lokalise.com` for translation.

After new strings are transalated. Use `Download >> Build only`. It will automatically create PR in this repo.

Note: Good to `Preview` before using `Build only`

## Deploying release on ECS with CD

1. If you are using AWS codebuild for CD, use buildspec.yml.sample file content for creating and pushing docker image.
2. For using and alternative repository like docker hub, click the link to see how we can [build and push docker](https://github.com/marketplace/actions/build-and-push-docker-images) images to docker hub.

## Learn More

### Glific

- [Glific.org](https://glific.org/)
- [One Pager](https://docs.google.com/document/d/1XYxNvIYzNyX2Ve99-HrmTC8utyBFaf_Y7NP1dFYxI9Q/edit?usp=sharing)
- [Google Drive](https://drive.google.com/drive/folders/1aMQvS8xWRnIEtsIkRgLodhDAM-0hg0v1?usp=sharing)
- [Product Features](https://docs.google.com/document/d/1uUWmvFkPXJ1xVMr2xaBYJztoItnqxBnfqABz5ad6Zl8/edit?usp=sharing)
- [Blogs](https://chintugudiya.org/tag/glific/)
- [Discord](https://discord.gg/scsrGUw)
