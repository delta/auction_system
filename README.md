# Auction System

A real time auction-system built using socket programming

### Tech

* [node.js]
* [Express]
* [React]
* [Webpack]
* [Sequelize]

### Getting Started

Auction system requires [Node.js](https://nodejs.org/) v6.11.5 LTS to run.

Install the dependencies and devDependencies and start the server.

Install [sequelize-cli] , the [Sequelize] Command Line Interface (CLI)
```sh
npm install -g sequelize-cli
```

For development environments...

```sh
$ npm install
$ npm run watch
```

For production environments...

```sh
$ npm install
$ npm run prod
```

Create a /config/config.json file for [Sequelize] by copying the contents of [/config/config.json.example](config/config.json.example) and replacing the necessesary fields
```
{
  "development": {
    "username": "root",
    "password": your mysql password,
    "database": "your database name",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": your mysql password,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": your mysql password,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}

```
For migrating the tables...
```sh
$ sequelize db:migrate
```

When you install a new dependency always use ```--save``` 
```sh
$ npm install --save <package_name>
```

Before committing your work, reformat the files...
```sh
$ npm run fmt
```

*Happy coding*

[node.js]: <http://nodejs.org>
[React]: <http://reactjs.org/>
[Webpack]: <http://webpack.js.org/>
[express]: <http://expressjs.com>
[sequelize-cli]: <http://www.npmjs.com/package/sequelize-cli>
[Sequelize]: <https://sequelizejs.com>

## Reporting Issues

If you think you've found a bug, or something isn't behaving the way you think it should, please raise an [issue](https://github.com/adarshPatel509/auction_system/issues) on GitHub.

# Contributing

Read our [Contribution Guidelines](https://github.com/adarshPatel509/auction_system/blob/dev/CONTRIBUTING.md) for information on how you can help out Auction-System.

# Licensing

Auction System is licensed under the Apache License, Version 2.0. See [LICENSE](https://github.com/adarshPatel509/auction_system/blob/dev/LICENSE.md) for the full license text.

