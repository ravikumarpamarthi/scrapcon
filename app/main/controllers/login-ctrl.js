'use strict';
angular.module('main')
    .controller('LoginCtrl', function($ionicModal, $scope, $global, authentication, $state, $ionicLoading, $timeout, $rootScope) {
        $scope.loginInfo = {};
        $rootScope.$emit('initMenu', "ok");
        $ionicModal.fromTemplateUrl('main/templates/password-keypad.html', {
            scope: $scope,
            animation: 'mh-slide'
        }).then(function(modal) {
            $scope.passwordKeyPad = modal
            $scope.passwordKeyPad.name = 'password-keypad'
        });
        $scope.openPasswordKeyPad = function() {
            $scope.passwordKeyPad.show();
        };
        $scope.closePasswordKeyPad = function(submit) {
            
            if($scope.password.length ==6 && submit){
              $scope.loginSubmit($scope.loginForm,$scope.loginInfo);
              $scope.passwordKeyPad.submit=true;
            }else{
              $scope.clearPassword();
            }
            $scope.passwordKeyPad.hide();
        };

        $scope.$on('modal.hidden', function(event, modal) {
             if(modal.name == 'password-keypad' && !$scope.passwordKeyPad.submit){
                $scope.clearPassword();
            }
        });
        $scope.getPasswordLength = function() {
            return $scope.loginInfo.password.length;
        }
        $scope.password = [];
        $scope.setPassword = function(num) {
            if ($scope.password.length <6) {
                $scope.password.push(num);
                $scope.loginInfo.password=$scope.password.join("");
            }
        }
        $scope.clearPassword=function(){
            $scope.password = [];
            $scope.loginInfo.password='';
        }
        $scope.removePassword = function() {
            if ($scope.password.length != 0) {
                $scope.password.pop();
                $scope.loginInfo.password=$scope.password.join("");
            }
        }

        $scope.loginSubmit = function(form,loginInfo) {
            $scope.loginError = "";
            if (form.$valid) {
            $ionicLoading.show();
            authentication.login(loginInfo).then(function(res) {
                if (res.status == $global.SUCCESS) {
                    $global.setLocalItem("authentication", res, true);
                    $ionicLoading.hide();
                    $state.go("main.dashboard");
                } else if (res.status == $global.FAILURE) {
                    $ionicLoading.hide();
                    $scope.loginError = res.error.message;
                }
            }, function(err) {
                $scope.loginError = $global.ERR_CONNECTION_REFUSED;
                $ionicLoading.hide();
            });
            }
        };
    });