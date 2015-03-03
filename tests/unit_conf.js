module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    browsers: ['PhantomJS'],
    autowatch: false,
    singleRun: true,
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
