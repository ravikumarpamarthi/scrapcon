'use strict';
angular.module('main')
    .controller('MenuCtrl', function($ionicModal, $scope, commonSevices, $cordovaNetwork, $ionicLoading, $state, $ionicSideMenuDelegate, $global, $rootScope, $ionicPopup, $timeout, $ionicScrollDelegate, $cordovaSocialSharing) {
        $scope.demoCaption2 = "This is demoing the second classic transparency walk-through.\nit has a caption, " +
            "regular marking of DOM element,\n 'arrow' to DOM element as icon\n and a button to close the walkthrough";

        $ionicModal.fromTemplateUrl('main/templates/share.html', {
            scope: $scope,
            animation: 'mh-slide'
        }).then(function(modal) {
            $scope.share = modal
        });
        $rootScope.walkThroughIsActive =false;
        function showHelp(data) {
            $scope.showHelp = data.key;
            $rootScope.walkThroughImage=data.key;
            $rootScope.walkThroughIsActive = ($global.getLocalItem(data.key) == null) ? true : false;
        }
        $scope.showWalkthrough=function(){
            $rootScope.walkThroughIsActive=true;
        }
        $rootScope.hideWalkThrough = function(key) {
            $global.setWalkThroughInvisible(key);
            $rootScope.walkThroughIsActive =false;
        }

        $rootScope.$on('setHelp', function(event, data) {
            if (data.show == true) {
                showHelp(data);
            }else if (data.show == false){
               $scope.showHelp = false;
               $rootScope.walkThroughIsActive =false;
             }
        });
        $scope.openShare = function() {
            $scope.share.show();
            $ionicLoading.show();
            commonSevices.getReferral().then(function(res) {
                if (res.status == $global.SUCCESS) {
                    $scope.message = res.data.body;
                    $scope.subject = res.data.subject;
                    $scope.refferalCode = res.data.referalCode;
                }
                $ionicLoading.hide();
            })
        };
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
                .then(function(result) {}, function(err) {});

        }
        $scope.shareViaTwitter = function() {
            $cordovaSocialSharing
                .shareViaTwitter($scope.message)
                .then(function(result) {}, function(err) {});

        }
        $scope.shareViaFacebook = function() {
            $cordovaSocialSharing
                .shareViaFacebook($scope.message)
                .then(function(result) {}, function(err) {});

        }
        $scope.closeShare = function() {
            $scope.share.hide();
        };


        $scope.go = function(state) {
            $state.go(state);
        }
        if ($global.consumerId) {
            commonSevices.getOffercount().then(function(res) {
                if (res.status == $global.SUCCESS) {
                    $scope.documentCount = res.data.documentCount;
                }
            })
        }
        var myPopup = function() {
            $scope.offlinePopup = $ionicPopup.show({
                template: 'Check your data connection',
                title: 'Network Problem',
                buttons: [

                    {
                        text: '<b>Try Again</b>',
                        type: 'button-assertive',
                        onTap: function(e) {
                            if ($cordovaNetwork.isOnline()) {
                                $scope.offlinePopup.close();
                            } else {
                                e.preventDefault();
                            }
                        }
                    }
                ]
            });
        }
        var badRequest = function() {
            $scope.badRequest = $ionicPopup.show({
                template: 'Unable to connect server',
                title: 'Oops, something went wrong',
                buttons: [

                    {
                        text: '<b>Try Again</b>',
                        type: 'button-assertive',
                        onTap: function(e) {
                            $scope.badRequest.close();
                            $state.go($state.current, {}, {
                                reload: true
                            });
                        }
                    }
                ]
            });
        }
        var badGps = function() {
                $scope.badGps = $ionicPopup.show({
                    template: 'Please Share your location',
                    title: 'Geolocation Problem',
                    buttons: [

                        {
                            text: '<b>Try Again</b>',
                            type: 'button-assertive',
                            onTap: function(e) {
                                $global.getCurrentLocation().then(function(latlng) {
                                    $scope.badGps.close();
                                }, function(err) {

                                })
                            }
                        }
                    ]
                });
            }
            /*if ($cordovaNetwork.isOffline()) {
                myPopup();
            }*/
        $scope.authentication = $global.authentication;
        $rootScope.$on("initMenu", function() {
            $scope.authentication = $global.authentication;
        })

        $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
            if ($scope.offlinePopup) {
                $scope.offlinePopup.close();
                $state.go($state.current, {}, {
                    reload: true
                });
                $scope.offlinePopup = null;
            }
        })

        $rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
            if (!$scope.offlinePopup) {
                myPopup();
            }
        })
        $rootScope.$on('badRequest', function(event, networkState) {
            if (!$scope.badRequest) {
                badRequest();
            }
        })
        $rootScope.$on('badGps', function(event, networkState) {
            // badGps();
        })
        $rootScope.$on('invalidApiToken', function(event) {
            $global.showToastMessage('Sorry we had to log you out, please log in again', 'short', 'center');
            $ionicLoading.hide();
            $state.go("main.login");
        })


        $scope.menuClicked = function() {
            $scope.opened = true;

        };
    });
