# Textbit core plugins

This package provides a set of core plugins for the Textbit editor

## Install

Published to GitHub Packages, not npmjs, so the `@ttab` scope needs mapping. GitHub
Packages requires a token even for public packages, so an install without one fails
with a 401. In `.npmrc`:

```
@ttab:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```sh
npm install @ttab/textbit-plugins
```

