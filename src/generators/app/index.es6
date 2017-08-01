import { Base } from 'yeoman-generator';
import yosay from 'yosay';

class GitGenerator extends Base {

  constructor(...args) {
    super(...args);

    this.option('debug', {
      type: String,
      defaults: false,
      alias: 'd',
      desc: 'GitHubAPI Debug'
    });

    this.argument('generators', {
      type: Array,
      defaults: ['authenticate', 'create'],
      required: false,
      desc: 'List of generators to use. Ex: yo github-create authenticate'
    });


  }

  initializing() {
    this.log(yosay('Welcome to the github repository generator!'));
    if(this.generators.indexOf('authenticate') !== -1) {
      this.composeWith('github-create:authenticate', {
        options: {
          debug: this.options.debug
        }
      });
    }

  }

  default() {

    if(this.generators.indexOf('create') !== -1) {
      this.composeWith('github-create:create', {
        options: {
          org: this.config.get('orgs') ? this.config.get('orgs').org : undefined,
          user: this.config.get('authenticate') ? this.config.get('authenticate').user : undefined,
        }
      });
    }
  }

}

module.exports = GitGenerator;
