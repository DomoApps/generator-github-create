'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUsername = getUsername;
exports.getPassword = getPassword;
exports.saveEmail = saveEmail;
exports.saveName = saveName;
exports.saveUsername = saveUsername;
exports.savePassword = savePassword;
exports.gitInit = gitInit;
exports.gitRemote = gitRemote;
exports.gitCommit = gitCommit;
exports.gitPush = gitPush;

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function executeGit(cmd) {
  return new Promise((resolve, reject) => {
    if (!_shelljs2.default.which('git')) {
      return reject('This script requires local git installed');
    }

    _shelljs2.default.exec(cmd, { silent: true }, (code, stdout, stderr) => {
      if (code !== 0) {
        return reject(stderr);
      }

      return resolve(stdout.trim());
    });
  });
}

function getUsername() {
  return executeGit('git config --global --get domoapps.user').catch(err => {
    console.error(err);

    return false;
  });
}

function getPassword() {
  return executeGit('git config --global --get domoapps.token').catch(err => {
    console.error(err);

    return false;
  });
}

function saveEmail(email) {
  return executeGit(`git config --global user.email "${email}"`);
}

function saveName(name) {
  return executeGit(`git config --global user.name "${name}"`);
}

function saveUsername(username) {
  return executeGit(`git config --global domoapps.user "${username}"`);
}

function savePassword(password) {
  return executeGit(`git config --global domoapps.token "${password}"`);
}

function gitInit() {
  return executeGit('git init');
}

function gitRemote(config) {
  return executeGit(`git remote add origin ${config.urls[1]}`);
}

function gitCommit() {
  return executeGit('git add -A && git commit -m "Initial Commit"');
}

function gitPush() {
  return executeGit('git push -u origin master');
}