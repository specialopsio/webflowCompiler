import inquirer from "inquirer";
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

// Function to prompt user for project details
async function getProjectDetails() {
    const questions = [
        {
            type: 'input',
            name: 'projectName',
            message: 'Enter your project name:',
            validate: input => input ? true : 'Project name cannot be empty.'
        },
        {
            type: 'input',
            name: 'stagingUrl',
            message: 'Enter your staging URL:'
        },
        {
            type: 'input',
            name: 'productionUrl',
            message: 'Enter your production URL:'
        }
    ];
    
    return inquirer.prompt(questions);
}

// Function to create project structure
function createProjectStructure(projectName, stagingUrl, productionUrl, share_links) {
    const config = { projectName, stagingUrl, productionUrl, 'debug':true, 'minify': true, 'functionNames': [], "head_embed":share_links.head_embed, "footer_embed":share_links.footer_embed};
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    console.log('Project structure created and configuration saved.');
}


// Function to generate and display share links
function generateAndDisplayShareLinks(projectName) {
    const jsdelivrBaseUrl = `https://unpkg.com/${projectName}@latest/dist/`;
    const prodHeaderJsUrl = jsdelivrBaseUrl + 'head/prod.js'; // Change 'prod.js' to your actual production JS file name
    const prodFooterJsUrl = jsdelivrBaseUrl + 'footer/prod.js'; // Change 'prod.js' to your actual production JS file name
    const stagingHeaderJsUrl = jsdelivrBaseUrl + 'head/staging.js'; // Change 'staging.js' to your actual staging JS file name
    const stagingFooterJsUrl = jsdelivrBaseUrl + 'footer/staging.js'; // Change 'staging.js' to your actual staging JS file name
    const cssFileUrl = jsdelivrBaseUrl + 'head/style.min.css'; // Change 'style.min.css' to your actual CSS file name

    const embedHeaderCode = `
<!-- Production JS -->
<script src="${prodHeaderJsUrl}"></script>

<!-- Staging JS -->
<script src="${stagingHeaderJsUrl}"></script>

<!-- CSS File -->
<link rel="stylesheet" href="${cssFileUrl}">
`;
    const embedFooterCode = `
<!-- Production JS -->
<script src="${prodFooterJsUrl}"></script>

<!-- Staging JS -->
<script src="${stagingFooterJsUrl}"></script>
`;

    console.log('Share links:');
    console.log('Production Header JS File URL:', prodHeaderJsUrl);
    console.log('Production Footer JS File URL:', prodFooterJsUrl);
    console.log('Staging Header JS File URL:', stagingHeaderJsUrl);
    console.log('Staging Footer JS File URL:', stagingFooterJsUrl);
    console.log('CSS File URL:', cssFileUrl);
    console.log('Embed code saved to embed.txt');
    return {
        "head_embed": embedHeaderCode,
        "footer_embed": embedFooterCode
    }
}

async function intiializeNpm(projectDetails){
    try{
        const package_json = {
            name: projectDetails.projectName,
            version: "1.0.0",
            description: "",
            maine: "setup.js",
            scripts: {
                "setup": "node setup.js",
                "test": "echo \"Error: no test specified\" && exit 1",
                "build": "gulp",
                "build-prod": "gulp build-prod-commit",
                "build-staging": "gulp build-staging-commit",
                "build-prod-no-commit": "gulp build-prod",
                "build-staging-no-commit": "gulp build-staging",
                "scss-to-css": "gulp scssToCss",
                "start": "gulp",
                "deploy": "gulp build-commit-all",
                "commit-prod": "gulp commit-prod",
                "commit-staging": "gulp commit-staging",
                "commit-dist": "gulp commit-dist",
                "commit-script": "gulp commit-scripts",
                "commit": "gulp commit-all",
                "rand": "gulp"
            },
            "repository": {
                "type": "git",
                "url": `git+https://github.com/BuiltByQuantum/${projectName}.git`
              },
              "author": "0 + R",
              "license": "ISC",
              "bugs": {
                "url": "https://github.com/BuiltByQuantum/${projectName}/issues"
              },
              "homepage": "https://github.com/BuiltByQuantum/${projectName}#readme",
              "dependencies": {
                "browser-sync": "^2.27.7",
                "gulp": "^4.0.2",
                "gulp-concat": "^2.6.1",
                "gulp-git": "^2.10.1",
                "gulp-jsbeautifier": "^3.0.1",
                "gulp-rename": "^2.0.0",
                "gulp-sass": "^5.1.0",
                "gulp-sort": "^2.0.0",
                "gulp-uglify": "^3.0.2",
                "gulp-uglifycss": "^1.1.0",
                "gulp-wrap": "^0.15.0",
                "inquirer": "^9.2.12",
                "sass": "^1.69.6",
                "simple-git": "^3.22.0"
              }
        }
        fs.writeFileSync('./package.json', JSON.stringify(package_json, null, 2))
        console.log("NPM package initialized")
    } catch (e){
        console.error("Error initializing npm package:", e)
    }
}

// Main function to run the script
async function main() {
    try {
        const { projectName, stagingUrl, productionUrl } = await getProjectDetails();

        
        // Generate and display share links
        const share_links = generateAndDisplayShareLinks(projectName);
        
        // Create project structure
        createProjectStructure(projectName, stagingUrl, productionUrl, share_links);
        
        await intiializeNpm()

        console.log('Setup complete.');
    } catch (error) {
        console.error('Error during setup:', error);
    }
}

main();
