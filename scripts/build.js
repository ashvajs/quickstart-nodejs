const fs = require('fs-extra');
const path = require('path');
var file_system = require('fs');
var archiver = require('archiver');
var packageJson = require('../package.json');
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

function copyFileSync(source, target) {
  var targetFile = target;

  // If target is a directory, a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target, ignore = ['node_modules', 'coverage', '.storybook', '.nyc_output', 'package-lock.json']) {
  var files = [];
  if (ignore.indexOf(path.basename(source)) > -1) {
    return;
  }
  // Check if folder needs to be created or integrated
  var targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function (file) {
      var curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        if (ignore.indexOf(path.basename(curSource)) === -1) {
          copyFileSync(curSource, targetFolder);
        }
      }
    });
  }
}

function copyServer() {
  if (!fs.existsSync(`${resolveApp('dist')}`)) {
    fs.mkdirSync(`${resolveApp('dist')}`);
  }
  console.log(resolveApp('dist'));
  if (!fs.existsSync(`${resolveApp('dist')}/${packageJson.name}`)) {
    fs.mkdirSync(`${resolveApp('dist')}/${packageJson.name}`);
  }

  fs.copyFileSync(resolveApp('./') + '/package.json', `${resolveApp('dist')}/${packageJson.name}/package.json`);

  copyFolderRecursiveSync(resolveApp('src'), `${resolveApp('dist')}/${packageJson.name}`);
  copyFolderRecursiveSync(resolveApp('public'), `${resolveApp('dist')}/${packageJson.name}`);
}

function zipBuild(filename) {
  var output = file_system.createWriteStream(filename);
  var archive = archiver('zip');

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);

  // append files from a sub-directory, putting its contents at the root of archive
  archive.directory(`${resolveApp('dist')}/${packageJson.name}`, false);

  archive.finalize();
}

copyServer();
zipBuild(`dist/${packageJson.name}.zip`);
console.log('build done');
