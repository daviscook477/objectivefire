module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'), // package
    conf: grunt.file.readJSON('config.json'), // config
    banner: '/*!\n' +
            ' * ObjectiveFire is a utility library that makes interactions with firebase easy by representing data as objects\n' +
            ' *\n' +
            ' * ObjectiveFire 0.0.0\n' +
            ' * https://github.com/daviscook477/objectivefire/\n' +
            ' * Date: <%=grunt.template.today("mm/dd/yyyy")%>\n' +
            ' * License: MIT\n' +
            ' */\n',
    ngAnnotate: {
      src: {
        files: [{expand:true,src:'<%=conf.src%>/**/*.js'}]
      }
    },
    concat: {
      src: {
        options: { banner: '<%=banner%>' },
        src: [
          '<%=conf.src%>/module.js',
          '<%=conf.src%>/**/*.js'
        ],
        dest: '<%=conf.dist%>/objectivefire.js'
      }
    },
    uglify: {
      sr: {
        files: {
          '<%=conf.dist%>/objectivefire.min.js': ['<%=conf.src%>/module.js', '<%=conf.src%>/**/*.js'],
        }
      }
    },
    jshint : {
      options : {
        jshintrc: '.jshintrc',
        ignores: ['<%=conf.src%>/angularfire_mod/**/*.js']
      },
      all : ['<%=conf.src%>/**/*.js']
    },
    karma: {
      unit: {
        configFile: '<%=conf.tests%>/unit_conf.js'
      },
      watch: {
         autowatch: true,
         singleRun: false
      },
      singlerun: {}
    },
    protractor: {
      options: {
        configFile: "<%=conf.tests%>/protractor_conf.js"
      },
      singlerun: {}
    },
    watch : {
      scripts : {
        files : ['src/**/*.js', 'tests/unit/**/*.spec.js'],
        tasks : ['test:unit', 'notify:watch'],
        options : {
          interrupt : true,
          atBegin: true
        }
      }
    },
    connect: {
      testserver: {
        options: {
          hostname: 'localhost',
          port: 3030
        }
      }
    },
    notify: {
      watch: {
        options: {
          title: 'Grunt Watch',
          message: 'Tests Finished'
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-protractor-runner'); // TODO: make protractor work
  grunt.registerTask('test', ['test:unit', 'test:e2e']);
  grunt.registerTask('test:e2e', ['concat', 'connect:testserver', 'protractor:singlerun']);
  grunt.registerTask('test:watch', ['karma:watch']);
  grunt.registerTask('test:watch:unit', ['karma:watch']);
  grunt.registerTask('test:unit', ['karma:unit']);
  grunt.registerTask('build', ['jshint', 'ngAnnotate', 'concat', 'uglify']);
  grunt.registerTask('default', ['build']);
};
