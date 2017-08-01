'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.destroy = destroy;
exports.get = get;
exports.authenticate = authenticate;
exports.getAuthorization = getAuthorization;
exports.deleteAuthorization = deleteAuthorization;
exports.createAuthorization = createAuthorization;
exports.getOrgs = getOrgs;
exports.getRepos = getRepos;
exports.createRepository = createRepository;
exports.setRepoDefaults = setRepoDefaults;
exports.setMasterBranchProtection = setMasterBranchProtection;
exports.createJenkinsHook = createJenkinsHook;
exports.escapeUsername = escapeUsername;

var _lodash = require('lodash');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _github = require('github');

var _github2 = _interopRequireDefault(_github);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let github;

function init(config) {
  return github = new _github2.default(config);
}

function destroy() {
  return github = undefined;
}

function get() {
  return github;
}

function authenticate(user, pass) {
  return new Promise((resolve, reject) => {
    github.authenticate({
      type: 'basic',
      username: user,
      password: pass
    });
    return resolve(github);
  });
}

function getAuthorization(appName) {
  return new Promise((resolve, reject) => {
    github.authorization.getAll({ page: '1', per_page: '100' }, (err, auths) => {
      if (err) {
        return reject(err);
      }
      let authorization = (0, _lodash.find)(auths, { app: { name: appName } }) || undefined;
      return resolve(authorization);
    });
  });
}

function deleteAuthorization(authorization) {
  return new Promise((resolve, reject) => {
    if (!authorization) {
      return resolve();
    }
    github.authorization.delete({ id: authorization.id }, (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

function createAuthorization(config, twofactorcode) {
  return new Promise((resolve, reject) => {
    github.authorization.create({
      scopes: config.scopes.split(',').map(item => item.trim()),
      note: config.appName,
      note_url: config.appUrl,
      headers: twofactorcode ? { 'X-GitHub-OTP': twofactorcode } : undefined
    }, (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

function getOrgs() {
  return new Promise((resolve, reject) => {
    github.users.getOrgs({ page: '1', per_page: '100' }, (err, orgs) => {
      if (err) {
        return reject(err);
      }

      return resolve(orgs);
    });
  });
}

function getRepos(config) {
  return new Promise((resolve, reject) => {
    if (config.org) {
      github.repos.getForOrg({ org: config.org, page: '1', per_page: '100' }, (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    } else {
      github.repos.getForUser({ username: escapeUsername(config.username), page: '1', per_page: '100' }, (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    }
  });
}

function createRepository(config) {
  return new Promise((resolve, reject) => {
    const body = {
      name: config.name,
      description: config.description,
      private: config.private,
      auto_init: false,
      allow_merge_commit: false,
      allow_rebase_merge: false,
      allow_squash_merge: true
    };

    if (config.org) {
      github.repos.createForOrg(Object.assign({}, body, { org: config.org }), (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    } else {
      github.repos.create(body, (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    }
  });
}

function setRepoDefaults(name, owner) {
  return Promise.all([setMasterBranchProtection(name, owner), createJenkinsHook(name, owner)]);
}

function setMasterBranchProtection(name, owner) {
  return new Promise((resolve, reject) => {
    github.repos.updateBranchProtection({
      owner,
      repo: name,
      branch: 'master',
      required_status_checks: {
        include_admins: true,
        strict: true,
        contexts: ['default']
      },
      required_pull_request_reviews: {
        include_admins: true,
        dismiss_stale_reviews: true
      },
      restrictions: null
    }, (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
}

function createJenkinsHook(name, owner) {
  return new Promise((resolve, reject) => {
    github.repos.createHook({
      owner,
      repo: name,
      name: 'jenkins',
      config: {
        jenkins_hook_url: 'http://pipeline.domo.com/github-webhook/'
      }
    }, (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
}

function escapeUsername(username) {
  return username.replace('.', '-');
}