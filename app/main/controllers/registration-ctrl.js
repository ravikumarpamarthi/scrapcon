'use strict';
angular.module('main')
    .controller('RegistrationCtrl', function($scope, $state, authentication, $global, $ionicLoading,$timeout) {
        $scope.authorization = {}
        $scope.signUp = function(form) {

            $scope.errMessage = "";
            if (form.$valid) {
                $ionicLoading.show();
                $scope.authorization.registerType = "SELF";
                $global.setLocalItem("registration",$scope.authorization,true);
                authentication.register($scope.authorization).then(function(res) {
                    $scope.cfdump = res;
                    if (res.status == $global.SUCCESS) {
                        $ionicLoading.hide();
                        $state.go('main.otp', {
                            queryParams: $scope.authorization
                        })
                    } else if (res.status == $global.FAILURE) {
                        $ionicLoading.hide();
                        $scope.errMessage = res.error.message;

                    }

                });
            }
        };

    });
