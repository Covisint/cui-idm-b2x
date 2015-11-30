# Device API

Browser and node module for making API requests against [Device API](https://api.covisintlabs.com/device/v2).

**Please note: This module uses [Popsicle](https://github.com/blakeembrey/popsicle) to make API requests. Promises must be supported or polyfilled on all target environments.**

## Installation

```
npm install device-api --save
bower install device-api --save
```

## Usage

### Node

```javascript
var DeviceApi = require('device-api');

var client = new DeviceApi();
```

### Browsers

```html
<script src="device-api/index.js"></script>

<script>
  var client = new DeviceApi();
</script>
```

### Options

You can set options when you initialize a client or at any time with the `options` property. You may also override options for a single request by passing an object as the second argument of any request method. For example:

```javascript
var client = new DeviceApi({ ... });

client.options = { ... };

client.resource('/').get(null, {
  baseUri: 'http://example.com',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

#### Base URI

You can override the base URI by setting the `baseUri` property, or initializing a client with a base URI. For example:

```javascript
new DeviceApi({
  baseUri: 'https://example.com'
});
```

#### Base URI Parameters

If the base URI has parameters inline, you can set them by updating the `baseUriParameters` property. For example:

```javascript
client.options.baseUriParameters.version = 'v3';
```

### Resources

All methods return a HTTP request instance of [Popsicle](https://github.com/blakeembrey/popsicle), which allows the use of promises (and streaming in node).

#### resources.devices

Collection endpoint for devices.

```js
var resource = client.resources.devices;
```

##### GET

Search devices based on the given filter parameters.

```js
resource.get().then(function (res) { ... });
```

##### Query Parameters

```javascript
resource.get({ ... });
```

* **tag** _boolean, default: true_

Retrieve devices with the given tag value.  Multiple parameters are allowed and the search results will be a union.

* **sortBy** _string, one of (+creation, -creation, +state, -state), default: +creation_

Sort the search results.

* **page** _integer, default: 1_

Which page to return in the paginated results.  The first page is page 1.

* **pageSize** _integer, default: 50_

How many items per page in the paginated results.

* **id** _string_

Retrieve devices with the specified id. Multiple parameters are allowed and the search results will be a union.

* **parentDeviceTemplateId** _string_

Retrieve devices based on the specified device template. Search results will be a union when multiple parameters are provided.

* **name** _string_

Retrieve devices with the specified name. Multiple parameters are allowed and the search results will be a union.

* **description** _string_

Retrieve devices with the specified description. Multiple parameters are allowed and the search results will be a union.

* **state** _string_

Retrieve devices in the specified state.  Multiple parameters are allowed and the search results will be a union.

* **active** _boolean_

Retrieve devices that are either active or inactive.

* **standardAttributes.attributeType.id** _string_

Retrieve devices referencing a standard attribute type of the given attribute type id. Multiple parameters are allowed and the search results will be a union.

* **standardAttributes.value** _string_

Retrieve devices referencing a standard attribute type of the given value. Multiple parameters are allowed and the search results will be a union.

* **extendedAttributes.attributeType.id** _string_

Retrieve devices referencing a extended attribute type of the given attribute type id. Multiple parameters are allowed and the search results will be a union.

* **extendedAttributes.value** _string_

Retrieve devices referencing a extended attribute type of the given value. Multiple parameters are allowed and the search results will be a union.

* **observableEvents.id** _string_

Retrieve devices referencing an event of the given event id. Multiple parameters are allowed  and the search results will be a union.

* **supportedCommands.id** _string_

Retrieve devices referencing a command of the given command id. Multiple parameters are allowed and the search results will be a union.

##### Headers

```javascript
resource.get(null, {
  headers: { ... }
});
```

* **Authorization** _string_

Access token that is obtained from the /token endpoint of the oauth API.

* **Accept** _string_

Media type.

#### resources.devices.deviceId(deviceId)

* **deviceId** _string_

id of the device.

Endpoint for an individual device.

```js
var resource = client.resources.devices.deviceId(deviceId);
```

##### GET

Retrieve the specified device based on its unique id.

```js
resource.get().then(function (res) { ... });
```

##### Headers

```javascript
resource.get(null, {
  headers: { ... }
});
```

* **Authorization** _string_

Access token that is obtained from the /token endpoint of the oauth API.

* **Accept** _string_

Media type.

##### PUT

Updates the requested device. Throws an error if the device doesn't already exist.

```js
resource.put().then(function (res) { ... });
```

##### Headers

```javascript
resource.put(null, {
  headers: { ... }
});
```

* **Authorization** _string_

Access token that is obtained from the /token endpoint of the oauth API.

* **Accept** _string_

Media type

* **Content-Type** _string_

The content type

##### Body

**application/vnd.com.covisint.platform.device.v1+json**

```
{
"id": "http://api.covisint.com/schema/device",
"$schema": "http://json-schema.org/draft-04/schema",
"type":"object",
"description": "Schema representing a device type",
"extends":{
  "$ref": "http://api.covisint.com/schema/realmScopedResource#"
},
"properties":{
  "name": {
    "description": "Name of the device",
    "required":true,
    "$ref": "http://api.covisint.com/idm/schema/internationalString#"
 },
  "description": {
    "description": "Description of the device",
   "required": false,
    "$ref": "http://api.covisint.com/idm/schema/internationalString#"
 },
  "attributes": {
    "type": "object",
    "description": "Thelist of attributes associated to the device.",
    "required": false,
    "properties":{
      "standard": {
        "type": "array",
        "description":"The list of standard attributeTypes associated to the device that are referedfrom the Device Template used.These attributes only once during deviec registration",
       "items": {
          "oneOf": [
            {
              "attributeTypeId":{
                "type": "string",
                "description": "TheattributeType id.",
                "required": true
              }
            },
           { 
              "attributeType": {
                "description":"The full attribute type definition.",
                "$ref": "http://api.covisint.com/schema/attributeType#"
              }
            }
          ],
          "value": {
            "type":"any",
            "description": "The attribute value",
            "required":false
          }
        }
      },
      "extended": {
        "type":"array",
        "description": "The list of attributes associated directlyto the device,not available with the device template used.These attribute valuecan be change mutiple time during device lifetime",
        "items": {
          "oneOf":[
            {
              "attributeTypeId": {
                "type":"string",
                "description": "The attributeType id.",
                "required":true
              }
            },
            { 
              "attributeType":{
                "description": "The full attribute type definition.",
               "$ref": "http://api.covisint.com/schema/attributeType#" 
             }
            }
          ],
          "value": {
            "type":"any",
            "description": "The attribute value",
            "required":false
          }
        }
      }
    }
  },
  "observableEvents": {
   "type": "array",
    "description": "The list of event ids that canbe observed or generated by the device.",
    "required": false,
    "minItems":1,
    "items": {
      "type": "string",
      "description": "Theid of the device generated event that can be observed in IOT Core Platform"
   }
  },
  "supportedCommands": {
    "type": "array",
    "description":"The list of commands ids supported by the device.",
    "required": false,
   "minItems": 1,
    "items": {
      "type": "string",
      "description":"The id of the command supported by the device"
    }
  },
  "parentDeviceTemplateId":{
    "type": "string",
    "required": true,
    "description": "Theid of the device template used or being refered to create the device."
  },
 "state": {
    "type": "string",
    "description": "The state ofthe device i.e online or offline",
    "required": false
  },
  "isActive":{
    "type": "boolean",
    "description": "Whether or not device isactive.",
    "required": true,
    "default": false
  },
  "tags":{
    "description": "The list of tags associated to the device.",
    "required":false,
    "$ref": "http://api.covisint.com/idm/schema/tags#"
  }
 }
}
 

```

#### resources.devices.deviceId(deviceId).tags.tag(tag)

* **tag** _string_

The tag value.

Device tags endpoint.

```js
var resource = client.resources.devices.deviceId(deviceId).tags.tag(tag);
```

##### PUT

Tags the specified device.

```js
resource.put().then(function (res) { ... });
```

##### Headers

```javascript
resource.put(null, {
  headers: { ... }
});
```

* **Authorization** _string_

Access token that is obtained from the /token endpoint of the oauth API.

##### DELETE

Removes a tag from the device.

```js
resource.delete().then(function (res) { ... });
```

##### Headers

```javascript
resource.delete(null, {
  headers: { ... }
});
```

* **Authorization** _string_

Access token that is obtained from the /token endpoint of the oauth API.

#### resources.devices.deviceId(deviceId).tasks.activate

```js
var resource = client.resources.devices.deviceId(deviceId).tasks.activate;
```

##### POST

Activates the device.

```js
resource.post().then(function (res) { ... });
```

##### Query Parameters

```javascript
resource.post(null, { query: { ... } });
```

* **deviceId** _string_

Device id to activate.

##### Headers

```javascript
resource.post(null, {
  headers: { ... }
});
```

* **Authorization** _string_

Access token that is obtained from the /token endpoint of the oauth API.

#### resources.devices.deviceId(deviceId).tasks.deactivate

```js
var resource = client.resources.devices.deviceId(deviceId).tasks.deactivate;
```

##### POST

Deactivates the device.

```js
resource.post().then(function (res) { ... });
```

##### Query Parameters

```javascript
resource.post(null, { query: { ... } });
```

* **deviceId** _string_

Device id to deactivate

##### Headers

```javascript
resource.post(null, {
  headers: { ... }
});
```

* **Authorization** _string_

Access token that is obtained from the /token endpoint of the oauth API.

#### resources.tasks.createDeviceFromTemplate

```js
var resource = client.resources.tasks.createDeviceFromTemplate;
```

##### POST

Create a new device based on the given deviceTemplateId.

```js
resource.post().then(function (res) { ... });
```

##### Query Parameters

```javascript
resource.post(null, { query: { ... } });
```

* **deviceTemplateId** _string_

The id of the device template on which to model the device.

##### Headers

```javascript
resource.post(null, {
  headers: { ... }
});
```

* **Authorization** _string_

Access token that is obtained from the /token endpoint of the oauth API.

* **Accept** _string_

Media type.

#### resources.tasks.migrateDeviceToNewTemplate

```js
var resource = client.resources.tasks.migrateDeviceToNewTemplate;
```

##### POST

Upgrade the device with the latest version of its device template.  This syncs the standard attributes, events and commands of device with current device template version.

```js
resource.post().then(function (res) { ... });
```

##### Query Parameters

```javascript
resource.post(null, { query: { ... } });
```

* **deviceTemplateId** _string_

The id of the new parent device template.

* **deviceId** _string_

The device ids to upgrade.

##### Headers

```javascript
resource.post(null, {
  headers: { ... }
});
```

* **Authorization** _string_

Access token that is obtained from the /token endpoint of the oauth API.

* **Accept** _string_

Media type.



### Custom Resources

You can make requests to a custom path in the API using the `#resource(path)` method.

```javascript
client.resource('/example/path').get();
```

## License

Apache 2.0
