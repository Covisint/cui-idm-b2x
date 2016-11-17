# Covisint B2X Accelerator

[Repository](https://github.com/covisint/cui-idm-b2x)

## Overview

The IDM B2X Accelerator provides a flexible set of features prebuilt and connected to the Covisint IDM platform. It allows your buiness to connect to just about any entity internally and externally. B2X mode gives developers pre-built tools and modules allowing them to customize each project to tailor their client's needs.

By following the guide below, you will be set up with a Reference B2X implementation. It is called B2X because it is meant to work from a business to just about any other entity. An enterprise can use B2X to allow other internal and external entities to interact it's realm of organizations, applications via APIs.

* Prebuilt IDM Features
  - Walkup Registration/Approval Workflow
  - User Profile
  - Application Directory
  - Application Search/Request/Approval Workflow
  - Organization Profile
  - Organization Directory
  - Organization Hierarchy


## Starting Your Own Project

This section assumes you have all the [prerequisites](https://cui-gitbook.run.covisintrnd.com/prerequisites.html) installed.

#### Install The CUI Generator

The *generator-cui-ng* is located on [NPM](https://www.npmjs.com/package/generator-cui-ng) which can be installed by running `sudo npm install -g generator-cui-ng`

#### Generate Your New CUI Project

Create a new directory for your CUI project. 

From this new project directory you are able to generate the CUI project by running `yo cui-ng`.

At the end of the process you will be asked to run the `grunt` command to generate directories for your project's environment variable profile. [Click here for more information about the project environment variables](https://cui-gitbook.run.covisintrnd.com/prerequisites.html).

  * Note: We use your HOME environment variable to create the directories that house the project environment profile. The HOME environment variable is by default created on Linux and OSX operating systems. For Windows users, you will have to create this environment variable if you don't have it setup already. The HOME environment variable should resemble `C:\Users\username\`

Once your project's environment variables are properly set up you can run the generated project using the `grunt` command and begin making customization or implementing new features.

## Running B2X Directly

- `npm install`
- `grunt`
