# Application customization through appConfig.js

The appConfig.json file in the project's root directory allows developers to set properties which can be used to configure different values inside CUI. In addition, developers can add their own values and access those values inside of the app via the appConfig object.

We have also included the grunt plugin `AJV` in this project, which is used to validate our JSON schema in appConfig.json file. Inside of the jsonSchema.json file, you can specify the schema structure, properties, value types and whether or not they are required. This is beneficial because the grunt default, build and buildSDK tasks will stop if the file linting fails, preventing customers from deploying a config with missing or incorrect properties that might break the application.

To learn more about AJV, please reference the documentation [here](https://github.com/epoberezkin/ajv).

To learn more about existing property options, please reference the schema file located in `app/json/jsonSchema.json`