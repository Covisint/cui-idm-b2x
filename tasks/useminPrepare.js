module.exports = function(grunt,config){
    return {
        html: 'index.html',
        options: {
          src: './',
          dest: '<%= config.buildDir %>'
        }
    };
};