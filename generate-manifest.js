//@ts-check

// generate-manifest.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dir = './'; // or wherever your assets are


const canProcessFile = (function () {
    const dirIgnore = [
        '.git',
        'node_modules',
        'dist',
        'build',
        'out',
        'coverage',
    ];
    const fileIgnore = [
        '.DS_Store',
        'generate-manifest.js',
        'manifest.json',
    ]

    /**
     * @param {string} filePath
     */
    return function (filePath) {
        const fileName = path.basename(filePath);
        const dirList = path.dirname(filePath).split(path.sep);

        if (dirList.some((dir) => dirIgnore.includes(dir))) {
            return false;
        }
        if (fileIgnore.includes(fileName)) {
            return false;
        }

        return true;
    }
})();

/**
 * @param {string} dirPath
 * @param {{[filePath: string]: string}} fileList
 * @returns
 */
function walk(dirPath, fileList = {}) {
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (!canProcessFile(fullPath)) {
            return;
        }
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            walk(fullPath, fileList);
        } else {
            const content = fs.readFileSync(fullPath);
            const hash = crypto.createHash('md5').update(content).digest('hex');
            const relativePath = path.relative('.', fullPath).replace(/\\/g, '/');
            fileList[relativePath] = hash;
        }
    });

    return fileList;
}

const manifest = {
    version: new Date().toISOString(),
    files: walk(dir)
};

fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));
console.log('✅ manifest.json generated.');
