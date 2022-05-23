# esbuild-sass-modules-plugin
A sass module loader plugin for esbuild.

![npm package version](https://img.shields.io/static/v1?label=%40squirrelnetwork%2Fesbuild-sass-modules-plugin&message=1.0.3&color=5AA9E6&logo=npm&logoColor=FF6392)

This plugin allows .scss and .sass files to be imported as modules in javascript
files.

## Basic usge:

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

## Documentation

See the [wiki](https://github.com/Squirrel-Network/esbuild-sass-modules-plugin/wiki/)
of this project.

![Squirrel Network](https://avatars.githubusercontent.com/u/61167371?s=200&v=4)
