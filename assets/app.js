var _ = null;

var app = angular.module('app', []);
app.controller('MainController', function ($scope) {

    _ = $scope;

    _.title = "Minimum AngularJS App";

});
