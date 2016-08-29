'use strict'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const path = require('path')
const base64 = require('base-64')

module.exports = (grunt, config, gruntTaskContext) => {

  // called with grunt upload_file --target=<target> --clientId=<clientId> --clientSecret=<clientSecret> --artifact=<artifact file name>(optional)
  const appName = config.name
  const artifactDir = config.artifactDir
  const target = config.target
  const clientId = config.clientId
  const clientSecret = config.clientSecret
  const originUri = config.originUri
  const uiHost = config.uiHost

  // the artifact option is only relevant to this task
  const buildArtifact = config.buildArtifact
  const artifactToDeploy = path.join( artifactDir, buildArtifact)

  const url = uiHost + '/-/c/cms/upload?originUri=' + originUri
  const headers = {
    Authorization: 'Basic ' + base64.encode(clientId + ':' + clientSecret)
  }

  return {
    build: {
      src: artifactToDeploy,
      dest: 'zipfile',
      options: {
        url: url,
        headers: headers,
        onComplete: function(data) {
          console.log('Response: ' + data);
        }
      }
    }
  }
}