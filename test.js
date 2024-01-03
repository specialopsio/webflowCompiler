import fs from 'fs'

const filesToCheck = [
    // './dist/head/prod.js',
    // './dist/head/staging.js',
    // './dist/head/style.min.css',
    './dist/head/embed.txt',
    './dist/footer/embed.txt',
    // './dist/footer/prod.js',
    // './dist/footer/staging.js'
]

filesToCheck.forEach((file) => {
    if(!fs.existsSync(file)){
        console.error(`ERROR: Missing generated file: ${file}`)
        process.exit(1)
    }
})

console.log("All files present")