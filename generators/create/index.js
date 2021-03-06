'use strict';

var _yeomanGenerator = require('yeoman-generator');

var _github = require('../shared/github');

var github = _interopRequireWildcard(_github);

var _shell = require('../shared/shell');

var shell = _interopRequireWildcard(_shell);

var _lodash = require('lodash.merge');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.find');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.defaults');

var _lodash6 = _interopRequireDefault(_lodash5);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class GitCreateGenerator extends _yeomanGenerator.Base {

  constructor(...args) {
    super(...args);

    this.option('username', {
      type: String,
      alias: 'u',
      desc: 'Github Username. Creates the repository on the user'
    });

    this.option('init', {
      type: String,
      alias: 'i',
      desc: 'initialize local git'
    });

    this.option('push', {
      type: String,
      alias: 'p',
      desc: 'initial commit and push repository'
    });

    this.option('org', {
      type: String,
      alias: 'o',
      desc: 'Organization. Creates the repository on the org not the user'
    });

    this.option('name', {
      type: String,
      alias: 'n',
      desc: 'Repository Name'
      //defaults: path.basename(process.cwd())
    });

    this.option('description', {
      type: String,
      alias: 'd',
      desc: 'Repository Description'
    });

    this.option('private', {
      type: String,
      alias: 'a',
      desc: 'Repository Access.  private|public'
    });
  }

  initializing() {
    //Authenticate Github API
    /* istanbul ignore if */
    if (!github.get()) {
      this.log('You must use the authenticate generator first... Exiting');
      process.exit(1);
    }

    //Initialize defaults
    this.options = (0, _lodash6.default)(this.options, this.config.get('create'), {
      name: _path2.default.basename(process.cwd()),
      description: 'Repository generated with generator-github-create',
      private: false,
      username: this.config.get('authenticate') ? this.config.get('authenticate').username : undefined,
      init: true,
      push: true
    });

    return github.getOrgs().then(res => {
      const orgs = res.data || res;
      let choices = orgs.map(function (item) {
        return item.login;
      });
      return [{
        when: answers => {
          return orgs.length;
        },
        type: 'confirm',
        name: 'useOrg',
        message: 'Will this repository be part of an organization you belong to?',
        default: this.options.useOrg
      }, {
        when: answers => {
          return answers.useOrg;
        },
        type: 'list',
        name: 'org',
        default: this.options.org,
        message: 'Select your organization',
        choices: choices
      }];
    }).then(prompts => this.prompt(prompts)).then(answers => {
      if (answers.useOrg) {
        this.options.org = answers.org;
      }

      this.config.set('create', answers);
    }).then(() => github.getRepos(this.options)).then(repos => {
      return [{
        name: 'name',
        message: 'Repository Name',
        validate: input => {
          /* istanbul ignore next: no idea how to test validate */return (0, _lodash4.default)(repos, { name: input }) ? input + ' repository exists.' : true;
        },
        default: this.options.name
      }, {
        name: 'description',
        message: 'Repository Description',
        default: this.options.description
      }, {
        type: 'list',
        name: 'private',
        message: 'Access',
        default: this.options.private,
        choices: [{
          name: 'Public',
          value: false
        }, {
          name: 'Private - You have to pay for this',
          value: true
        }]
      }];
    }).then(prompts => this.prompt(prompts)).then(answers => {
      this.config.set('create', (0, _lodash2.default)(this.config.get('create'), answers));
    }).then(() => {
      /* istanbul ignore next: no need to test this */
      if (this.fs.exists('.git/config')) {
        this.log('Skipping Git Init:  Git is already initialized in this directoy.  You need to delete the .git folder before you can initialize and push this repository.');
        return [];
      }
      return [{
        type: 'confirm',
        name: 'init',
        message: 'Initialize Local Git?',
        default: this.options.init
      }, {
        when: answers => {
          return answers.init;
        },
        type: 'confirm',
        name: 'push',
        message: 'Push initial commit?',
        default: this.options.push
      }];
    }).then(prompts => this.prompt(prompts)).then(answers => {
      this.config.set('create', (0, _lodash2.default)(this.config.get('create'), answers));
    });
  }

  configuring() {
    return this.config.save();
  }

  default() {
    let currentConfig = this.config.get('create');

    return github.createRepository(currentConfig).then(res => {
      const repo = res.data || res;
      const newConfig = (0, _lodash2.default)(this.config.get('create'), { urls: [repo.html_url, repo.ssh_url, repo.clone_url] });
      this.config.set('create', newConfig);
      return newConfig;
    }).then(config => {
      if (config.init) {
        return shell.gitInit().then(() => shell.gitRemote(config));
      }
    });
  }

  writing() {
    let config = this.config.get('create');
    let pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    /* istanbul ignore next: no need to test this */
    if (!pkg) {
      pkg = this.fs.readJSON(this.fs.writeJSON(this.destinationPath('package.json'), {}));
    }

    pkg.repository = {
      type: 'git',
      url: config.urls[1]
    };
    pkg.bugs = {
      url: config.urls[0] + '/issues'
    };
    pkg.homepage = config.urls[0] + '#readme';
    this.fs.writeJSON(this.destinationPath('package.json'), pkg);
  }

  install() {
    if (this.config.get('create').push) {
      return shell.gitCommit().then(() => shell.gitPush()).then(() => {
        const config = this.config.get('create');
        const repoName = config.name;
        const owner = config.org || github.escapeUsername(this.options.username);
        github.setRepoDefaults(repoName, owner);
      });
    }
  }

}

module.exports = GitCreateGenerator;