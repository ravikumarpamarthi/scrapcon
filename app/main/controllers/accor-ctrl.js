'use strict';
angular.module('main')
.controller('AccorCtrl', function ($log, $scope) {
  
  $scope.groups = [];
  for (var i = 0; i < 2; i++) {
    $scope.groups[i] = {
      name: i,
      items: []
    };
    for (var j = 0; j < 3; j++) {
      $scope.groups[i].items.push(i + '-' + j);
    }
  }

  /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */
  $scope.toggleGroup = function (group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function (group) {
    return $scope.shownGroup === group;
  };
  $log.log('Hello from your Controller: AccorCtrl in module main:. This is your controller:', this);

});
