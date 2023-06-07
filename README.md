# esbuild-sass-modules-plugin
A sass module loader plugin for esbuild.

[![npm package version](https://img.shields.io/npm/v/@squirrelnetwork/esbuild-sass-modules-plugin?label=%40squirrelnetwork%2Fesbuild-sass-modules-plugin&logo=npm)](https://www.npmjs.com/package/@squirrelnetwork/esbuild-sass-modules-plugin)
![license](https://img.shields.io/npm/l/@squirrelnetwork/esbuild-sass-modules-plugin)

This plugin allows .scss and .sass files to be imported as modules in javascript
files.

> Warning: this module does not work with SASS 1.63.0 because of https://github.com/sass/dart-sass/issues/1995

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

## PostCSS and its plugins

Just set the `postcss.use` to `true` to enable PostCSS and set `postcss.plugins`
to an array of plugins.

### Autoprefixer example

```js
import esb from 'esbuild';
import sassModules from '@squirrelnetwork/esbuild-sass-modules-plugin';
import autoprefixer from 'autoprefixer';

await esb.build(
	{ bundle: true
	, sourceRoot: 'src/'
	, entryPoints: [ 'src/index.js' ]
	, outfile: 'build/app.js'
	, plugins:
		[ sassModules(
			{ postcss:
				{ use: true
				, plugins: [ autoprefixer ]
				}
			}
		)
		]
	}
);
```

## Documentation

See the [wiki](https://github.com/Squirrel-Network/esbuild-sass-modules-plugin/wiki/)
of this project.

![Squirrel Network](https://avatars.githubusercontent.com/u/61167371?s=200&v=4)
