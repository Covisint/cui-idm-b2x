# Covisint B2X Accelerator

[Repository](https://github.com/covisint/cui-idm-b2x)

## Overview

The IDM B2X Accelerator provides a flexible set of features prebuilt and connected to the Covisint IDM platform. It lets your buiness to connect to just about any entity internally and externally. B2X mode gives developer all the tools and modules to so developers can customize it to tailor their exact needs.

By following the guide below, you will be set up with a Reference B2X implementation.  It is called B2X because it is meant to work from a business to just about any other entity. An enterprise can use B2X to allow other internal and external entities to interact it's realm of organizations, applications via APIs.

* Prebuilt IDM Features
  - Registration
  - User Profile
  - Application Directory
  - Application Request / Approval Workflow


### Getting Started

Start your own local IDM B2X project using Yeoman.  This section assumes you have all the [prerequisites](../prerequisites.md) installed.

1. Install the yeoman generator

  * `sudo npm install -g generator-cui-ng`

2. Create new CUI project directory

  * Exit CUI-NG Yeoman project: `cd ../../`
  * Create new project directory: `mkdir cui-ng-new-project`
  * Change directory into your new project directory: `cd cui-ng-new-project`

3. Build your starting CUI project

  * Use Yeoman to build your CUI starter project: `yo cui-ng`
  * After you're done going through all the steps you should get a readme that explains how to use and customize the application

### How to use this project directly

Run `npm install`, and then `grunt` to start a local server in which you can see changes in real time.

### Contributing

Follow these rules when creating a PR or committing new code:

1. All changes to specific states should be made in the branch named after that child state. Ex: If editing `app/modules/applications/myApplications/myApplications.html` the changes should be made to the `application.myApplications` branch (create it if it doesn't exist)
2. Only global (PRD and STG) changes should be made directly to #master (rule of thumb, always commit to a branch unless you don't think it fits in any branch)

Before starting any changes, follow this procedure to avoid merge conflicts:

1. From your fork / clone make sure you're on the master branch, `git checkout master`
2. Pull from upstream / origin master
3. Checkout the branch you want to make changes to : `git checkout applications.myApplications` or `git checkout -b branch-name` if the branch doesn't exist
4. Pull from that branch `git pull origin applications.myApplications`
5. Merge master into that branch `git merge master` (this is why it's important to only keep global changes on master)
6. Make your changes, commit and push to that branch
