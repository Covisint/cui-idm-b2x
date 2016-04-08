(function(angular){
    'use strict';

    $.get('./appConfig.json',function (configData) {
        var appConfig=configData;

        angular.element(document).ready(function () {
            angular.module('app',['translate','ngMessages','cui.authorization','cui-ng','ui.router','snap','LocalStorageModule']);
