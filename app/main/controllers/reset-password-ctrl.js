'use strict';
angular.module('main')
    .controller('ResetPasswordCtrl', function($scope, $state, $global, profile, $ionicLoading) {

        $scope.data = {};
        $scope.changePassword = function(form) {

            if (form.$valid) {
                $ionicLoading.show();
                profile.changePwd($scope.data).then(function(res) {
                	console.log(res);
                    if (res.status == $global.SUCCESS) {
                        $scope.successMessage = res.data.message;
                        $global.showToastMessage(res.data.message, 'short','center');
						$state.go('main.login');
                    } else if (res.status == $global.FAILURE) {
                        $scope.errorMessage = res.error.message;
                    }
                    $ionicLoading.hide();
                })
            }
        }

    });
