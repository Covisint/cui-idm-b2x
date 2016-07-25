module.exports = function(grunt,config){
    return {
        dist:{
          options: {
            sourceMap: true
          },
          files:{
            '<%= config.concatCssDir %>': '<%= config.scss %>/main.scss'
          }
        }
    };
};