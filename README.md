# wdio-testmo-service

With this plugin for [webdriver.io](https://webdriver.io/) you can choose test cases to execute based on Priority from an exported CSV from Testmo.

This plugin does not directly interact with Testmo yet. I am waiting for the Testmo team to implement the APIs necessary. Until then, this plugin will read the CSV file exported from Testmo in the following format:

```csv
"Case ID","Priority"
"11111","Medium"
...
```

Currently, the service only works with [mocha](https://mochajs.org/) test framework and assumes the Testmo Case ID is included in your mocha `describe` or `it` (or `suite`, `test` for TDD) blocks.

## Installation

The easiest way to install this module as a (dev-)dependency is by using the following command:

```sh
npm install wdio-testmo-service --save
```

Or:

```sh
npm install wdio-testmo-service --save-dev
```

## Usage

Add wdio-testmo-service and required options to your `wdio.conf.js`:

```javascript
exports.config = {
  // ...
 services: [
  [
   "testmo",
   {
    csv: "path/to/testcases.csv",
    priorities: ["Critical", "High"],
   },
  ],
 ],
  // ...
};
```

## Options

### csv <sub>*(required)*</sub>

Location of CSV file.

### priorities <sub>*(required)*</sub>

Array of Priority Names to choose tests from.

## Notes

1. The service considers cucumber-like tagging. For example, supplying `mocha-opts.grep "@sanity @smoke"` will only include test cases with either `@sanity` or `@smoke` in the describe or it blocks in addition to filtering by Priority.

1. Specifying `mochaOpts.grep` without a tag (no `@` in the string) or specifying `mochaOpts.invert` will override this service completely.

1. If you enter invalid Priorities, all Priorities will be included.

For more information on WebdriverIO see the [homepage](https://webdriver.io).
