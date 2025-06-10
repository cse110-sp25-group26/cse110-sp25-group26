# Code Layout / Structure
This is the layout of code within the [/source](/source) directory within this repository. All structural directories are named in Snake Case. Code files are named in Snake Case, markdown files are named in AllCaps, and JavaScript Objects (classes) are named per their common names with the first letter capitalized.

## scripts/
This directory contains JavaScript scripts and objects for the project. These should contain a defined scope of methods and classes. Examples include:
- `Card.js`:  The definition of a Card object and attached DOM element(s). Includes methods used on Card objects, such as `animateToPosition`, `flyToElement`, `create/removeTooltip`, and others.
- `optionsManager.js`, which manages the state of options throughout the game. Includes methods to temporarily and permanently modify game options such as SFX/Music volume and game speed.
- `utils.js`, which contains helper functions commonly used between other files.

## scripts/tests/
This directory contains tests for the JavaScript scripts and objects in the `scripts/` directory. The respective test file for a code file may be found as follows:
1. Change the extension from `.js` to `.test.js`
2. Follow the directory tree from `tests/` as if from `scripts/`.

For example, if a file is under `scripts/subdirectory/file.js`, the test fill will be at `scripts/tests/subdirectory/file.test.js`.

## res/
This directory contains external resources for the project. This includes sound, images, and any other non-text files used in the project. This limitation is open to discussion and modification if necessary.

### res/img/
Image resources for the project. May contain subdirectories for sets of images, such as `res/img/card_backs/` or `res/img/UI_buttons/`.

### res/snd/
Sound effects and music for the project. May countain subdirectories for sets of sounds, such as `res/snd/mus` for music or `res/img/card` for card-related SFX.

## source/styles/
CSS files for the project. Grouped into section files, such as `card.css` for styling a card, or `panel.css` for defining a UI panel. Project-wide styling, such as CSS variable provision files, are also contained within this directory.

This presently does not contain subdirectories, but as development continues, this is open for reconsideration.

## ./
Top-level files. Mostly used for the HTML file(s) for the project.
