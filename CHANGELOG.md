# @ttab/textbit-plugins

## 1.8.0

### Minor Changes

- Removes the OEmbed plugin. Nothing registered it: not the monorepo chrome, not
  the standalone elephant-chrome that production runs, and chrome has no NewsDoc
  transformation for core/oembed, so such blocks could never be read or written.
  It could not have worked either way, since its consume returned the input MIME
  type rather than the core/oembed it declared, and the pipe discards a result
  whose type does not match.

### Patch Changes

- Set default role text value to 'question' in print-text action handler instead of empty string.

- The TV listing init dialog confirms on Enter when the form is valid, the same as clicking
  'Lägg till'. Enter is left alone when focus is on the channel combobox or the footer buttons.

## 1.7.0

### Minor Changes

- Empty links are removed rather than left behind, parseImageId no longer has a default export, and the package carries the MIT license text its manifest always claimed. It now depends on a @ttab/textbit range instead of an exact version, so consumers do not end up with two copies, and its slate-react peer moves to ^0.125.1 to match textbit.

### Patch Changes

- dependencies updates:
    - Updated dependency [`slate@^0.126.2` ↗︎](https://www.npmjs.com/package/slate/v/0.126.2) (from `^0.124.1`, in `peerDependencies`)
    - Updated dependency [`slate-react@^0.126.4` ↗︎](https://www.npmjs.com/package/slate-react/v/0.126.4) (from `^0.125.1`, in `peerDependencies`)

- Moves the package's repository link on GitHub Packages to the monorepo. The manifest already names it; a publish is what makes the registry act on it, and publish permission follows that link.

## 1.7.0-beta.3

### Patch Changes

- dependencies updates:
    - Updated dependency [`slate@^0.126.2` ↗︎](https://www.npmjs.com/package/slate/v/0.126.2) (from `^0.124.1`, in `peerDependencies`)
    - Updated dependency [`slate-react@^0.126.4` ↗︎](https://www.npmjs.com/package/slate-react/v/0.126.4) (from `^0.125.1`, in `peerDependencies`)

## 1.7.0-beta.2

### Patch Changes

- Moves the package's repository link on GitHub Packages to the monorepo. The manifest already names it; a publish is what makes the registry act on it, and publish permission follows that link.

## 1.7.0-beta.0

### Minor Changes

- Empty links are removed rather than left behind, parseImageId no longer has a default export, and the package carries the MIT license text its manifest always claimed. It now depends on a @ttab/textbit range instead of an exact version, so consumers do not end up with two copies, and its slate-react peer moves to ^0.125.1 to match textbit.

### Patch Changes

- Updated dependencies:
  - @ttab/textbit@1.7.0-beta.0
