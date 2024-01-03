# Webflow Compiler

## Description
This Node.js application is designed for web development, integrating scripting, styling, and deployment automation using Gulp, npm, and custom setup scripts.

## Installation

1. **Node.js**: Ensure Node.js is installed.
2. **Clone Repository**: Clone the project.
3. **Dependencies**: Run `npm install` to install packages.

## Usage

### Setup
- Run `node setup.js` for initial configuration.
- Inputs project name, staging URL, and production URL.
- Generates `config.json`, `embed-header.txt`, and `embed-footer.txt`.
- `config.json` contains project settings used by other scripts/tasks.

### Gulp Tasks
- Tasks for SCSS, script management, Git integration, and builds.
- `gulp build-prod`: Production build.
- `gulp build-staging`: Staging build.
- Additional tasks for specific needs.

### Generating Share Links:

- The script creates URLs for JavaScript and CSS files hosted on a CDN. These URLs are specific to your project's name and are meant for production and staging environments.
- It also generates embed code for these files and saves them in embed-header.txt and embed-footer.txt. These text files contain HTML code that you can use to easily embed the generated JavaScript and CSS into your webflow pages.

### npm Scripts
- `npm run setup`: Executes setup script.
- `npm test`: Runs tests.
- `npm run build`: Default Gulp build.
- `npm run build-prod`: Gulp production build.
- `npm run build-staging`: Gulp staging build.
- `npm start`: Starts default Gulp task.
- `npm run deploy`: Deploys and commits changes.

### Configuration (`config.json`)
- `debug`: Enables debug mode when `true`, providing more detailed error messages and logs.
- `minify`: When `true`, minifies CSS and JS files to reduce file size for production.
- `productionLink`: URL of the production environment for deployment.
- `stagingLink`: URL of the staging environment for testing before production.

### Deployment
- Use specified gulp tasks for deploying to staging or production.

