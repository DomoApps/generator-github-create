# @appteam6/generator-github-create
Yeoman generator for github authentication, create repository, local git initialization, and local commit and push.

## Installation
```sh
$ npm install -g generator-github-create
```

## Basic Authentication on OAuth Github Enterprise

To be able to authenticate with the Github API for a Github Enterprise instance that uses OAuth, you will need to set up a token.
That can be done by click on your profile pic in the top right > Settings > Personal Access Tokens > Generate new token. Give it a name in the `Token description`
that makes sense to you. You will need to check the `repo` scope and leave the others unchecked. You should then be presented with a token. Copy that token
and save it in a safe place. This is what you will provide the generator when it asks for your password.

## Features
* Multiple Github Accounts
* Token Authentication
* 2 Factor authentication (not tested.  Create an issue if it doesn't work)
* Organization Support
* Create remote repository
* Initialize local git
* Commit and push generated project to created repository

## Composability
> Composability is a way to combine smaller parts to make one large thing. Sort of [like Voltron®][voltron]
> — [Yeoman docs](http://yeoman.io/authoring/composability.html)
You can use the following methods to composeWith

## Sub Generators
* yo github-create:authentication - Authenticate to github
* yo github-create:create - the list user orgs, create github repository, initialize git, push initial commit.

## Usage
To find usage you can run --help on the subgenerators
```sh
yo github-create:authenticate --help
```

## Example
Checkout the these generators to see how they all work together.
* https://github.com/modern-mean/generator-modern-mean/blob/master/src/generators/module/index.es6
* https://github.com/trainerbill/generator-github-create/blob/master/src/generators/app/index.es6
