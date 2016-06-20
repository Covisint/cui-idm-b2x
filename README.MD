# CUI-IDM-B2X

## List of reference implementations for CUI IDM.

### How to use

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
