import "source-map-support/register"; // tslint:disable-line:no-import-side-effect

// Use bluebird instead of native Promises, because it gives enhanced Promise stacktraces
global.Promise = require("bluebird"); // tslint:disable-line:no-var-requires no-require-imports
(<any>Promise).config({
    warnings: true,
    longStackTraces: true
});
