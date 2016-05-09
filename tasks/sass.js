module.exports = function(grunt,config){
    return {
        dist:{
          files:{
            '<%= config.concatCssDir %>': '<%= config.scss %>/main.scss'
          }
        }
    };
};