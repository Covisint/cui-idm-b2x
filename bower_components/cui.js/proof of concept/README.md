# Proof of concept

## Usage

- Get an access token and insert into this line, make sure to leave 'Bearer' in the string
```javascript 
    headers : {
      Authorization: 'Bearer 2|xj2x2NokGknntBihFkgrNb0oX4em',
      Accept : 'application/vnd.com.covisint.platform.device.v1+json'
    }
```     
- Open index.html

## How this was built

Using [this javascript client generator](https://github.com/mulesoft/raml-client-generator) we created a browser/node module to make API requests to the Cov. device API. This module uses [Popsicle](https://github.com/blakeembrey/popsicle) to make API requests.

## Ex: 

Here is a service/controller in Angular that uses this module to either get all devices or to follow a certain query.
```javascript
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
```
To introduce a query into the request one simply has to call getByQuery({*query parameters here*}) from the controller ( getByQuery({active:true}) for example will return the devices that are active. Check the device-api-readme for more options.)
