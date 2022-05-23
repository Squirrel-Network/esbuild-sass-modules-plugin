# Contributing to esbuild-sass-modules-plugin

The following is a set of guidelines for contributing to the project.
These are mostly guidelines, not rules.
Use your best judgment, and feel free to propose changes to this document in a
pull request.

#### Table Of Contents
[Code of Conduct](#code-of-conduct)

[tldr; I just have a question!](#tldr-i-just-have-a-question)

[What should I know before I get started?](#what-should-i-know-before-i-get-started)
* [Package manager](#package-manager)
* [Dependencies](#dependencies)
* [Workflow](#workflow)
* [Code style](#code-style)
* [Pull requests](#pull-requests)

[Thank you!](#thank-you)

## Code of Conduct

This project and everyone participating in it is governed by the
[Code of Conduct](CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code.
Please report unacceptable behavior to [officialsquirrelnetwork@gmail.com](mailto:officialsquirrelnetwork@gmail.com).

## TLDR; I just have a question!
> **Note:** Please don't file an issue to ask a question.

Feel free to contact us in the network by reaching the Squirrel Network's
administrators.

## What should I know before I get started?

### Package manager

This project uses the Yarn package manager version 3.2.1 in the _stable_ branch.
To ensure version changes will not affect the build or the tests, the actual
CLI is included in this repository under [.yarn/releases](.yarn/releases).

Beacuse of Yarn, this npm module package needs to be loaded accordingly when
running tests; the following command should allow you to make both Node and Jest
work with modules:

```shell
$ yarn node --experimental-vm-modules $(yarn bin jest)
```

### Dependencies

This project depends on the following packages:

* lodash
* esbuild
* jest
* postcss
* sass

However, removing or adding dependencies can be done after approved pull
requests.

### Workflow

This repository is organized in the following branches:

* `master`: production-ready code expected to be published on npm
* `develop`: working tested code that merges the features and eventually gets
hotfixes
* `release`: production-ready code cleaned up to be published
* `feature/`: the branches under this name represent the features of this
package and should be named accordingly
* `testing`: for developing and fixing the test suites themselves

The usual workflow is as defined below:

1. Clone this repo
2. Checkout `develop`
3. Create or checkout the `feature/` branch you'll be working on
4. Develop the feature or the tests
5. Commit to that `feature/` branch only the changes in `src/`
6. Move to `testing`
7. Merge your `feature/` into `testing`
8. Commit the changes to your test suites
9. If everything goes well, checkout `feature/` again and merge `testing` to
your `feature/`
10. Merge `feature/` into `develop`
11. When the requirements of a new release are met, it will be merged in
`release` and then in `master`.
Tests or build files should not be included in the releases.

> Note: please make sure that all the branches you're working on are up-to-date,
> and do not directly merge on `master` or `release`.

### Code style

> Note: please use UTF-8 without BOM for all the files and Unix-style line
> endings.

There is not relly any defined code style, but there are some rules I would
prefer the contributors to follow:

- Use the same indentation characters, which in this case is tabs.
- The block notation I use is inspired by [Elm](https://elm-lang.org/examples/cards)
and looks like these examples:
```js
{ property1: value
, property2: value
, property3: value
}

[ item1
, item2
, item3
]
```
In my opinion, this style looks more clean and easy to read and edit.
- Use the `_().method` versions with lodash.
- Use [BSD-style switches](https://www.freebsd.org/cgi/man.cgi?query=style&sektion=9)
and scope the cases with brackets:
```js
switch(on) {
case match: {
	break;
}
}
```
In my opinion, this makes it more clear where the cases begin or end, and also
scopes them in a block which can sometimes be useful.
- Do not go over 80 columns. I usually have multiple files open at one time, and
80 columns makes it so that code can fit into my view without having to scroll
it horizontally.

### Pull requests

In general, feel free to file us pull requests. There aren't any special
requirements to meet I can think of, but just following this guide and the Code
of Conduct should be enough.

## Thank you!

Thank you from me and the whole Squirrel Network for contributing to this small
plugin!

![Squirrel Network](https://avatars.githubusercontent.com/u/61167371?s=200&v=4)
