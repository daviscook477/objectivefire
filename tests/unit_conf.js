module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    browsers: ['PhantomJS'],
reporters: ['spec','failed','coverage'],
    autowatch: false,
    singleRun: true,
preprocessors: {
      "../src/*.js": "coverage",
},
coverageReporter: {
      reporters: [
        {
          type: "lcov",
          dir: "coverage",
          subdir: "."
        },
        {
          type: "text-summary"
        }
      ]
    },
files: [
'../bower_components/angular/angular.js',
'../bower_components/firebase/firebase.js',
'../node_modules/angular-mocks/angular-mocks.js',
'../src/module.js',
'../src/**/*.js',
'unit/**/*.spec.js'
]
  });
};
