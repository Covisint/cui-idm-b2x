(function(angular){

  'use strict';

  angular
  .module('deviceTest',[])
  .factory('deviceTestService',[deviceTestService])
  .controller('deviceTestCtrl',['deviceTestService','$scope',deviceTestCtrl]);

  //Service
  function deviceTestService() {
    return DeviceApi;
  };


  //Controller
  function deviceTestCtrl(deviceTestService,$scope){
    var device = this;
    device.init = function(){
      device.service =  device.startService();
      device.headers = device.getHeaders();
      device.getAll();
    };

    device.startService = function(){
      return new deviceTestService({
        baseUri: 'https://apiqa.np.covapp.io/device/v2'
      })
    };

    device.getHeaders = function(){
      return {
        Authorization: 'Bearer 2|6tLNinoOyRAdqA9MGYJiA8egfL9j',
        Accept : 'application/vnd.com.covisint.platform.device.v1+json'
      }
    };

    device.getAll = function(){
      device.service.resources.devices.get(null,{headers:device.headers})
      .then(function(res){
        if(res.status!==200){
          device.error=res.status;
          $scope.$apply();
        }
        else{
          device.result=res.body;
          $scope.$apply();
        }
      })
    };

    device.getByQuery = function(query){
      device.service.resources.devices.get(query,{headers:device.headers})
      .then(function(res){
       if(res.status!==200){
          device.error=res.status;
          $scope.$apply();
        }
        else{
          device.result=res.body;
          $scope.$apply();
        }
      })
    };


    device.init();
  }
  //End Controller

  
})(angular);
