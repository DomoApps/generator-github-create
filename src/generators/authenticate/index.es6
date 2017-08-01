import { Base } from 'yeoman-generator';
import * as github from '../shared/github';
import * as shell from '../shared/shell';
import merge from 'lodash.merge';
import defaults from 'lodash.defaults';

class GithubAuthenticateGenerator extends Base {

  constructor(...args) {
    super(...args);

    this.option('debug', {
      type: String,
      alias: 'd',
      desc: 'GitHubAPI Debug'
    });

    this.option('host', {
      type: String,
      alias: 'h',
      desc: 'Github Host'
    });

    this.option('protocol', {
      type: String,
      alias: 'p',
      desc: 'Github Protocol'
    });

    this.option('path', {
      type: String,
      alias: 'q',
      desc: 'Github Path:  for some GHEs; none for GitHub.com'
    });

    this.option('twofactor', {
      type: String,
      alias: 't',
      desc: 'Enable 2 factor authentication'
    });

    this.option('scopes', {
      type: String,
      alias: 's',
      desc: 'Comma separated list for github authorization scopes'
    });

    this.option('username', {
      type: String,
      alias: 'u',
      desc: 'Github Username'
    });

    this.option('appName', {
      type: String,
      alias: 'n',
      desc: 'App Name for Github Authorization'
    });

    this.option('appUrl', {
      type: String,
      alias: 'o',
      desc: 'App URL for Github Authorization'
    });

  }

  initializing() {

    this.options = defaults(this.options, this.config.get('authenticate'), {
      debug: true,
      host: 'git.empdev.domo.com',
      protocol: 'https',
      path: '/api/v3',
      twofactor: false,
      scopes: 'user,public_repo,repo,repo:status',
      appName: 'generator-github-create',
      appUrl: 'https://git.empdev.domo.com/CustomApps/generator-github-create'
    });

    let ghsetup = {
      debug: this.options.debug,
      host: this.options.host,
      protocol: this.options.protocol,
      pathPrefix: this.options.path || '/',
      headers: {
        'user-agent': this.options.appName
      }
    };

    return shell.getUsername()
      .then(username => {
        /* istanbul ignore next: tough to test */
        if (!this.options.username && username) {
          this.options.username = username;
        }

        return shell.getPassword();
      })
      .then(password => {
        /* istanbul ignore next: tough to test */
        this.password = password;
      })
      .then(github.init(ghsetup))
      .then(() => {
        return [
          {
            name    : 'username',
            message : 'Github Username',
            default: this.options.username
          },
          {
            when: (answers) => { return answers.username !== this.options.username; },
            type: 'confirm',
            name: 'saveuser',
            message: 'Save username to git config?  Will make generation faster next time',
            default: 'Y'
          },
          {
            when: (answers) => { return !this.password || answers.username !== this.options.username; },
            type    : 'password',
            name    : 'password',
            message : 'Github Password',
          },
          {
            when: (answers) => { return answers.password !== undefined && answers.password !== this.options.password; },
            type: 'confirm',
            name: 'savepassword',
            message: 'Save password to git config?  Will make generation faster next time',
            default: 'Y'
          },
          {
            type: 'confirm',
            name    : 'twofactor',
            message : 'Use two factor authentication?',
            default: this.options.twofactor || false
          },
          {
            when: (answers) => { return answers.twofactor; },
            name    : 'twofactorcode',
            message : 'Two Factor Code'
          }
        ];
      })
      .then(prompts => this.prompt(prompts))
      .then(answers => {
        this.password = this.password || answers.password;
        this.twofactorcode = answers.twofactorcode;
        delete answers.password;
        delete answers.twofactorcode;
        /* istanbul ignore next: tough to test */
        if(answers.saveuser) {
          shell.saveUsername(answers.username);
        }
        /* istanbul ignore next: tough to test */
        if(answers.savepassword) {
          shell.savePassword(this.password);
        }
        this.config.set('authenticate', answers);
        return answers;
      })
      .then(answers => github.authenticate(answers.username, this.password))
      .then(() => this._authorize())
      .then(() => {
        this.config.save();
      });
  }

  _authorize() {
    if (this.options.host === 'api.github.com' && !this.options.path) {
      return github.getAuthorization(this.options.appName)
        .then(authorization => github.deleteAuthorization(authorization))
        .then(() => github.createAuthorization({ appName: this.options.appName, appUrl: this.options.appUrl, scopes: this.options.scopes }, this.twofactorcode));
    } else {
      return true;
    }
  }
}

module.exports = GithubAuthenticateGenerator;
