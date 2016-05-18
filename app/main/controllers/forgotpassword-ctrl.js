'use strict';
angular.module('main')
    .controller('ForgotpasswordCtrl', function($scope, profile, $global, $ionicLoading,$state) {
        $scope.data = {};
        $scope.getPassword = function(form) {
            if (form.$valid) {
                $ionicLoading.show();
                profile.forgotPassword($scope.data.username).then(function(res) {
                    if (res.status == $global.SUCCESS) {
                        $scope.successMessage = res.data.message;
                        $global.setLocalItem("mobileOrEmail",$scope.data.username,true);
                        $state.go('main.otp');

                    } else if (res.status == $global.FAILURE) {
                        $scope.errorMessage = res.error.message;
                    }
                    $ionicLoading.hide();
                })
            }
        }
    });
