'use strict';
angular.module('main')
    .controller('ReferCtrl', function($scope, $cordovaSocialSharing, commonSevices,$global,$ionicLoading) {
        $ionicLoading.show();
        commonSevices.getReferral().then(function(res) {
            if (res.status == $global.SUCCESS) {
                $scope.message = res.data.body + ". Referral Code:" + res.data.referalCode;
                $scope.subject = res.data.subject;
                $scope.refferalCode = res.data.referalCode;
            }
            $ionicLoading.hide();
        })

        $scope.shareViaWhatsApp = function() {
            $cordovaSocialSharing
                .shareViaWhatsApp($scope.message)
                .then(function(result) {
                    console.log(result)
                }, function(err) {
                    console.log(err)
                });
        }
        $scope.shareViaSMS = function() {
            $cordovaSocialSharing
                .shareViaSMS($scope.message)
                .then(function(result) {}, function(err) {});
        }
        $scope.shareViaSMS = function() {
            $cordovaSocialSharing
                .shareViaSMS($scope.message)
                .then(function(result) {}, function(err) {});
        }

        $scope.shareViaEmail = function() {
            $cordovaSocialSharing
                .shareViaEmail($scope.message, $scope.subject)
                .then(function(result) {
                    // Success!
                }, function(err) {
                    // An error occurred. Show a message to the user
                });

        }
        $scope.shareViaTwitter = function() {
            $cordovaSocialSharing
                .shareViaTwitter($scope.message)
                .then(function(result) {
                    // Success!
                }, function(err) {
                    // An error occurred. Show a message to the user
                });

        }
        $scope.shareViaFacebook = function() {
            $cordovaSocialSharing
                .shareViaFacebook($scope.message)
                .then(function(result) {
                    // Success!
                }, function(err) {
                    // An error occurred. Show a message to the user
                });

        }


    });
