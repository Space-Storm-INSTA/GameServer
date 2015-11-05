module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-coffee');

  grunt.initConfig({
    coffee: {
      compile: {
        option:{
          bare:true
        },
        files: {
          'js/app.js': ['coffee/*.coffee', 'level/*.coffee']
        }
      }
    },
    watch: {
      scripts: {
        files: '**/*.coffee',
        tasks: ['coffee:compile']
      }
    }
  });

  grunt.registerTask('default', ['coffee', 'watch']);
};
