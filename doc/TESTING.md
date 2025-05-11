# Testing Procedures
Testing will be done with the testing suite `jest`. This was described in Lab 5, and the full documentation may be found [here](https://jestjs.io/docs/getting-started).

## Fetching Packages
To fetch the required packages, direct a terminal to the root directory of the repository, and run `npm install`.



# Test Files
Tests should be placed as specified in the [structure specification](/doc/STRUCTURE.md).

## Test Contents
Tests should test both the basic functionality of provided functions and attempt to catch potential edge cases before they are encountered during real use.

There is no strict guideline on how to write tests, they may be as basic or as complex as the function requires. This is left up to developer discretion.


# Running the Test Pipeline
With `jest` installed for the project, direct a terminal to the root directory of the repository, and run `npm test source/scripts/tests/*`. This should run the full test suite.

If you wish to run a smaller number of tests for faster testing time, you may instead run the following from the repository root: `npm test <script 1> [script 2] [script 3]...`. The location of tests respective to their scripts is defined in the [structure specification](/doc/STRUCTURE.md).