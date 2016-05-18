'use strict';
angular.module('main')
    .controller('AboutCtrl', function($scope, commonSevices,$global, $ionicLoading, $timeout) {
        $ionicLoading.show();
        commonSevices.getAbout().then(function(res) {
            $scope.about = res.data.message;
            $ionicLoading.hide();
        });
    });
