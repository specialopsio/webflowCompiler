import gulp from 'gulp';
import sassModule from 'gulp-sass';
import sassCompiler from 'sass';
import uglify from 'gulp-uglify';
import sort from 'gulp-sort';
import wrap from 'gulp-wrap';
import concat from 'gulp-concat';
import jsbeautifier from 'gulp-jsbeautifier';
import uglifycss from 'gulp-uglifycss';
import rename from "gulp-rename";
import browserSync from 'browser-sync';
import fs from 'fs';
import git from 'gulp-git'
import dotenv from 'dotenv'
import { execSync } from 'child_process';

dotenv.config()


const sass = sassModule(sassCompiler);
const sync = browserSync.create();



// Load config.json
const config = JSON.parse(fs.readFileSync('./config.json'));

function readFileContents(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file: ${filePath}`, error);
    return '';
  }
}

function bumpVersion(type){
  return function(done){
    const updateType = type === 'staging' ? 'patch' : 'minor';
    execSync(`npm version ${updateType} --no-git-tag-version`, { stdio: 'inherit' })
    done()
  }
}

// Function to combine import.txt with embed-*.txt for a given section (footer or head)
function combineImportsAndEmbed(section) {

    const importsPath = `./src/scripts/${section}/imports.txt`
    const embedElem = `${section}_embed`
    
    const importsContent = readFileContents(importsPath)
    const embedContent = config[embedElem]

    const combinedContent = `${importsContent}\n${embedContent}`

    const outputPath = `./dist/${section}/embed.txt`
    fs.writeFileSync(outputPath, combinedContent)

    console.log(`Combined file created at: ${outputPath}`)
}


// Asynchronously import stripDebug
async function getStripDebug() {
  if (!getStripDebug.stripDebug) {
    const stripDebugModule = await import('gulp-strip-debug');
    getStripDebug.stripDebug = stripDebugModule.default;
  }
  return getStripDebug.stripDebug;
}

// SCSS to CSS conversion
const scssToCss = () => {
  return gulp.src('./scss/**/*.scss')
    .pipe(concat('combined.scss'))
    .pipe(sass().on('error', sass.logError))
    .pipe(rename('style.min.css'))
    .pipe(uglifycss({ "uglyComments": true }))
    .pipe(gulp.dest(`./dist/head/`))
    .pipe(sync.stream());
}

async function processScriptsForProd(fileName, section) {
  let domain = config.productionUrl;
  let function_names = config.functionNames
  let function_name_string = ''
  if(function_names){
    function_names.forEach((name) => {
      function_name_string += `window.${name}=${name};`
    })
  }
  let stream = gulp.src(`./src/scripts/${section}/*.js`)
    .pipe(sort())
    .pipe(concat('combined.js'));

  if (config.debug === false) {
    const stripDebug = await getStripDebug();
    stream = stream.pipe(stripDebug());
    
  }

  // Apply wrap after minification/beautification
  stream = stream.pipe(wrap(`(function(){ if (window.location.href.indexOf("${domain}") !== -1) {<%= contents %>} })();`))
    .pipe(concat(`${fileName}`));
  

  if (config.minify) {
    stream = stream.pipe(uglify(
      {
        mangle: {
          reserved: ['selectedPlace', 'selectedPlaceHero', 'selectedPlaceNav', 'selectedPlaceCTA', 'selectedPlaceExit']
        }
      }
    ));
  } else {
    stream = stream.pipe(jsbeautifier({ indent_size: 2 }));
  }


  return stream.pipe(gulp.dest(`./dist/${section}`));
}

function commitAndPushSpecificFile(filePath) {
  return function(done) {
    const commitMessage = `Gulp Commit: Updating ${filePath}`
    const remote = 'origin'
    const branch = process.env.GIT_BRANCH ? process.env.GIT_BRANCH : 'main'

    git.exec({ args: 'reset' }, function(err) {
      if (err) throw err

      gulp.src(filePath, { base: '.' })
        .pipe(git.add({ args: '-f' }))
        .pipe(git.commit(commitMessage))
        .on('end', function() {
          git.push(remote, branch, { args: '--no-verify' }, function(error) {
            if (error) {
              console.error('ERROR PUSHING TO GIT:', error)
            } else {
              console.log(`SUCCESSFULLY PUSHED ${filePath} TO GIT`)
            }
            done()
          })
        })
    })
  }
}

gulp.task('commit-dist', function() {
  const files_to_stage = './dist/'
  const commit_message = 'Gulp Commit: Updating dist/ files.'

  const remote = 'origin'
  const branch = process.env.GIT_BRANCH ? process.env.GIT_BRANCH : 'main'

  gulp.src(files_to_stage)
  .pipe(git.add())
  .pipe(git.commit(commit_message))
  .on('end', function(){
    git.push(remote, branch, function(error){
      if(error){
        console.error('ERROR PUSHING TO GIT:', error)
      } else {
        console.log("SUCCESSFUL PUSH TO GIT")
      }
      done()
    })
  })

})

gulp.task('commit-scripts', function(){
  const files_to_stage = './src/scripts/'
  const commit_message = 'Gulp Commit: Updating script/ files.'

  const remote = 'origin'
  const branch = process.env.GIT_BRANCH ? process.env.GIT_BRANCH : 'main'

  gulp.src(files_to_stage)
  .pipe(git.add())
  .pipe(git.commit(commit_message))
  .on('end', function(){
    git.push(remote, branch, function(error){
      if(error){
        console.error('ERROR PUSHING TO GIT:', error)
      } else {
        console.log("SUCCESSFUL PUSH TO GIT")
      }
      done()
    })
  })
})

// Function to process scripts for staging
function processScriptsForStaging(fileName, section) {
  let domain = config.stagingUrl;
  return gulp.src(`./src/scripts/${section}/*.js`)
    .pipe(sort())
    .pipe(concat('combined.js'))
    .pipe(wrap(`if (window.location.href.indexOf("${domain}") !== -1) {<%= contents %>};`))
    .pipe(jsbeautifier({ indent_size: 2 }))
    .pipe(concat(`${fileName}`))
    .pipe(gulp.dest(`./dist/${section}`));
}

gulp.task('commit-prod', commitAndPushSpecificFile('./dist/prod.js'))

gulp.task('commit-staging', commitAndPushSpecificFile('./dist/staging.js'))

gulp.task('commit-dist', commitAndPushSpecificFile('./dist/*'));

gulp.task('commit-scss', commitAndPushSpecificFile('./scss/*'))

// Task to commit 'scripts' directory
gulp.task('commit-scripts', commitAndPushSpecificFile('./src/scripts/*'));

// Production build task
gulp.task('build-prod', gulp.series(bumpVersion('production'), async function() {
  // Compile SCSS
  scssToCss();

  // Compile scripts for production
  await processScriptsForProd('prod.js', 'footer');
  await processScriptsForProd('prod.js', 'head');
}));


gulp.task('combine-embeds', async function () {
  combineImportsAndEmbed('footer')
  combineImportsAndEmbed('head')
})

// Staging build task
gulp.task('build-staging', gulp.series(bumpVersion('staging'), async function() {
  // Compile SCSS for staging
  scssToCss();
  
  // Process scripts for staging
  await processScriptsForStaging('staging.js', 'footer');
  await processScriptsForStaging('staging.js', 'head');
}));

gulp.task('build-prod-commit', gulp.series('build-prod', 'commit-dist', 'commit-scripts', 'commit-scss'))
gulp.task('build-staging-commit', gulp.series('build-staging', 'commit-dist', 'commit-scripts', 'commit-scss'))

gulp.task('commit-all', gulp.parallel('commit-dist', 'commit-scripts', 'commit-scss'))

gulp.task('build-commit-all', gulp.series(gulp.parallel('build-prod', 'build-staging'), 'commit-all', 'combine-embeds', 'commit-scss'))

// Default task
gulp.task('default', gulp.series('build-prod', 'build-staging', 'combine-embeds', 'commit-dist', 'commit-scripts', 'commit-scss'));
