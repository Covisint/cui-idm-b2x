(function(angular) {
    'use strict';

    $.get('./appConfig.json', function(configData) {
        var appConfig = configData;

        angular.element(document).ready(function () {
