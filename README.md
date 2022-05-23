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

## Basic usage:

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

> Note: if you see an error in console like this:
> ```js
> node:internal/process/esm_loader:94
>     internalBinding('errors').triggerUncaughtException(
>                               ^
>
> Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import 'node_modules\lodash\fp' is not supported resolving ES modules imported from node_modules\@squirrelnetwork\esbuild-sass-modules-plugin\src\esbuild-sass-modules-plugin.class.js
> Did you mean to import lodash/fp.js?
>       at new NodeError (node:internal/errors:371:5)
>       at finalizeResolution (node:internal/modules/esm/resolve:412:17)
>       at moduleResolve (node:internal/modules/esm/resolve:932:10)
>       at defaultResolve (node:internal/modules/esm/resolve:1044:11)
>       at ESMLoader.resolve (node:internal/modules/esm/loader:422:30)
>       at ESMLoader.getModuleJob (node:internal/modules/esm/loader:222:40)
>       at ModuleWrap.<anonymous> (node:internal/modules/esm/module_job:76:40)
>       at link (node:internal/modules/esm/module_job:75:36) {
>   code: 'ERR_UNSUPPORTED_DIR_IMPORT',
>   url: 'file:///.../node_modules/lodash/fp'
> }
> ```
> Then you need to
> [add the flag](https://nodejs.org/api/cli.html#cli_experimental_specifier_resolution_mode)
> `--experimental-specifier-resolution=node` when running node.

## Documentation

See the [wiki](https://github.com/Squirrel-Network/esbuild-sass-modules-plugin/wiki/)
of this project.

![Squirrel Network](https://avatars.githubusercontent.com/u/61167371?s=200&v=4)
