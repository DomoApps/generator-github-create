import shell from 'shelljs';

function executeGit(cmd) {
  return new Promise((resolve, reject) => {
    if (!shell.which('git')) {
      return reject('This script requires local git installed');
    }

    shell.exec(cmd, { silent: true }, (code, stdout, stderr) => {
      if (code !== 0) {
        return reject(stderr);
      }

      return resolve(stdout.trim());
    });
  });
}

export function getUsername() {
  return executeGit('git config --global --get domoapps.user')
    .catch(err => {
      console.error(err);

      return false;
    });
}

export function getPassword() {
  return executeGit('git config --global --get domoapps.token')
    .catch(err => {
      console.error(err);

      return false;
    });
}

export function saveEmail(email) {
  return executeGit(`git config --global user.email "${email}"`);
}

export function saveName(name) {
  return executeGit(`git config --global user.name "${name}"`);
}

export function saveUsername(username) {
  return executeGit(`git config --global domoapps.user "${username}"`);
}

export function savePassword(password) {
  return executeGit(`git config --global domoapps.token "${password}"`);
}

export function gitInit() {
  return executeGit('git init');
}

export function gitRemote(config) {
  return executeGit(`git remote add origin ${config.urls[1]}`);
}

export function gitCommit() {
  return executeGit('git add -A && git commit -m "Initial Commit"');
}


export function gitPush() {
  return executeGit('git push -u origin master');
}
