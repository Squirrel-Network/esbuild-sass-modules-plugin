# esbuild-sass-modules-plugin
A sass module loader plugin for esbuild.

![npm package version](https://img.shields.io/static/v1?label=%40squirrelnetwork%2Fesbuild-sass-modules-plugin&message=1.0.3&color=5AA9E6&logo=npm&logoColor=FF6392)

This plugin allows .scss and .sass files to be imported as modules in javascript
files.

> Note: this package is a module.

## Install

### Using NPM
```shell
$ npm install --save-dev @squirrelnetwork/esbuild-sass-modules-plugin
```

### Using Yarn
```shell
$ yarn add -D @squirrelnetwork/esbuild-sass-modules-plugin
```

## Basic usage

```js
import esb from 'esbuild';
import sassModules from '@squirrelnetwork/esbuild-sass-modules-plugin';

await esb.build(
	{ bundle: true
	, sourceRoot: 'src/'
	, entryPoints: [ 'src/index.js' ]
	, outfile: 'build/app.js'
	, plugins: [ sassModules() ]
	}
);
```

## Resolvers

Resolvers modify the behavior of the plugin when importing files.

### Bundle resolver

```js
import 'source.scss';
```

### Inline resolver

```js
import style from 'inline:source.scss';

// contains the compiled css text
console.log(style);
```

### File resolver

```js
import style from 'file:source.scss';

// contains the text path to be fetched
fetch(style)
	.then(css => console.log(css));
```

## Documentation

See the [wiki](https://github.com/Squirrel-Network/esbuild-sass-modules-plugin/wiki/)
of this project.

![Squirrel Network](https://avatars.githubusercontent.com/u/61167371?s=200&v=4)
