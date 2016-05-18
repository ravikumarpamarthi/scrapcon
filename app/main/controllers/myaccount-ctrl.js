'use strict';
angular.module('main')
    .controller('MyAccountCtrl', function($scope, $stateParams, $state, $cordovaDevice, $global, profile, $ionicModal, $ionicPopup, $ionicLoading, $timeout) {
        $ionicLoading.show();
        $scope.data = {};
        $scope.myAccountForm = {};
        $scope.editForm = {};
        $scope.edit = function(key) {
            $scope.editForm[key] = true;
        }
        $scope.userCategories = [];
        $scope.userAddresses = [];
        $scope.init = false;
        $scope.addLocation = function() {
            $state.go("main.ngmap");
            $scope.addressesModal.hide();
        }
        $ionicModal.fromTemplateUrl('main/templates/password-keypad.html', {
            scope: $scope,
            animation: 'mh-slide'
        }).then(function(modal) {
            $scope.passwordKeyPad = modal;
            $scope.passwordKeyPad.name = 'password-keypad'
        });

        $scope.$on('modal.hidden', function(event, modal) {
            if (modal.name == 'password-keypad' && !$scope.passwordKeyPad.submit) {
                $scope.clearPassword();
            }
        });
        $scope.openPasswordKeyPad = function() {
            $scope.passwordKeyPad.show();
        };
        $scope.closePasswordKeyPad = function(submit) {
            $scope.passwordKeyPad.submit = submit;
            $scope.passwordKeyPad.hide();
            if ($scope.password.length < 6) {
                $scope.clearPassword();
            }
        };

        $scope.getPasswordLength = function() {
            return $scope.profileData.newpassword.length;
        }
        $scope.password = [];
        $scope.setPassword = function(num) {
            if ($scope.password.length < 6) {
                $scope.password.push(num);
                $scope.profileData.newpassword = $scope.password.join("");
            }
        }
        $scope.$on('modal.hidden', function(event, modal) {
            if ($scope.passwordKeyPad.isShown()) {
                alert("hidden")
            }
            /* if($scope.password.length <6){
               $scope.loginSubmit($scope.loginInfo);
             }else{
               $scope.clearPassword();
             }*/
        });

        $scope.$on('modal.removed', function() {
            if ($scope.passwordKeyPad.isShown()) {
                alert("hidden")
            }
        });
        $scope.clearPassword = function() {
            $scope.password = [];
            $scope.profileData.password = '';
        }
        $scope.removePassword = function() {
            if ($scope.password.length != 0) {
                $scope.password.pop();
                $scope.profileData.newpassword = $scope.password.join("");
            }
        }

        function init() {
            profile.getProfile().then(function(res) {
                if (res.status == $global.SUCCESS) {
                    $scope.profileData = res.data.consumer;
                    if (res.data.consumer && res.data.consumer.address) {
                        $scope.data.defaultLocation = res.data.consumer.address
                    } else {
                        $scope.data.defaultLocation = null;
                    }
                    setCategories();
                    $scope.init = true;
                } else if (res.status == $global.FAILURE) {
                    $state.go("main.login")
                }
                $ionicLoading.hide();
                if ($stateParams.from == 'addlocation') {
                    $scope.showAddresses();
                }
            });
        }

        function setCategories() {
            for (var i = $scope.profileData.categories.length - 1; i >= 0; i--) {
                $scope.userCategories.push($scope.profileData.categories[i].key);
            };
        }
        init();
        $ionicModal.fromTemplateUrl('main/templates/categories-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.categoriesModal = modal
        });

        $ionicModal.fromTemplateUrl('main/templates/addresses-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.addressesModal = modal
        });

        $scope.setDefaultLocation = function(location) {
            $scope.data.defaultLocation = location;
        }

        $ionicModal.fromTemplateUrl('main/templates/addresses-delete-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.addressesModalForDelete = modal
        });

        function getCategories() {
            profile.userCategories().then(function(res) {
                if (res.status == $global.SUCCESS) {
                    $ionicLoading.hide();
                    $scope.catList = res.data.categories;
                } else if (res.status == $global.FAILURE) {
                    $ionicLoading.hide();
                    $scope.errMessage = res.error.message;
                }

            });
        }
        $scope.go = function(state) {
            $state.go(state);
        }
        $scope.getAddress = function() {

            profile.getAddress().then(function(res) {
                $ionicLoading.hide();
                $scope.locations = res.data.addresses;
            });
        }
        $scope.showAddresses = function() {
            $ionicLoading.show();
            $scope.getAddress();
            $scope.addressesModal.show();
        };

        $scope.showAddressesForDelete = function() {
            $ionicLoading.show();
            profile.getAddress().then(function(res) {
                $ionicLoading.hide();
                $scope.locations = res.data.addresses;
            });
            $scope.addressesModalForDelete.show();
        };

        $scope.showCategories = function() {
            $ionicLoading.show();
            getCategories();
            $scope.categoriesModal.show();
        };

        $scope.categoriesCloseModal = function() {
            $scope.profileData.categories = []
            if ($scope.userCategories.length > 0) {
                for (var i = $scope.catList.length - 1; i >= 0; i--) {
                    if ($scope.userCategories.indexOf($scope.catList[i].consumerCategoryId) != -1) {
                        $scope.profileData.categories.push({
                            key: $scope.catList[i].consumerCategoryId,
                            value: $scope.catList[i].name
                        });
                    }
                };
                $scope.categoriesModal.hide();
            }
        };

        $scope.addressesCloseModal = function() {
            $scope.addressesModal.hide();
        };

        $scope.addressesToDeleteCloseModal = function() {
            init();
            $scope.addressesModalForDelete.hide();
        };


        $scope.confirmDelete = function(location, index) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Alert',
                template: 'Do you want to delete Address?',
                okType: 'button-default',
                okText: 'Yes',
                cancelText: 'No',
                cancelType: 'button-assertive'

            });
            confirmPopup.then(function(res) {
                if (res) {
                    $ionicLoading.show();
                    profile.deleteAddres(location.addressId).then(function(res) {
                        if ($scope.data.defaultLocation.addressId == location.addressId) {
                            $scope.data.defaultLocation = $scope.locations[index + 1];
                        }
                        $scope.getAddress();
                        $ionicLoading.hide();
                    })
                } else {}
            });
        };

        function setDefaultAdd() {
            profile.setDefaultAdd($scope.data.defaultLocation.addressId).then(function(res) {})
        }
        $scope.sub = function(profileData, myAccountForm) {

            if (!$scope.data.defaultLocation || !$scope.data.defaultLocation.addressId) {
                $global.showToastMessage('Please add atleast one location', 'short', 'center');
                // $scope.noLocationError = "Please add atleast one location";
                return;
            }
            if (profileData.categories.length == 0) {
                // $scope.noCategoryError = "Please add atleast one category";
                $global.showToastMessage('Please add atleast one category', 'short', 'center');
                return;
            }
            if (profileData.newpassword != undefined && $scope.password.length != 6) {
                $global.showToastMessage('Passcode must be 6 digits', 'short', 'center');
                return false;
            }
            $scope.reset = {};
            if (myAccountForm.$valid) {
                $ionicLoading.show();
                setDefaultAdd();
                var prodata = angular.copy($scope.profileData);
                if (prodata.newpassword) {
                    var newPassword = { newPassword: prodata.newpassword };
                }
                delete prodata.address;
                delete prodata.newPassword;
                profile.updateProfile(prodata).then(function(res) {
                    if (res.status == $global.FAILURE) {
                        $scope[res.error.code] = res.error.message;
                        $ionicLoading.hide();
                    } else if (res.status == $global.SUCCESS) {
                        if (newPassword) {
                            profile.changePwd(newPassword).then(function(res) {
                                if (res.status == $global.SUCCESS) {
                                    $scope.successMessage = res.data.message;
                                    $global.showToastMessage(res.data.message, 'short', 'center');
                                } else if (res.status == $global.FAILURE) {
                                    $scope.errorMessage = res.error.message;
                                }
                                $ionicLoading.hide();
                                $state.go('main.dashboard');
                            })
                        } else {
                            $ionicLoading.hide();
                            $state.go('main.dashboard');
                        }
                    }

                }, function(err) {
                    $ionicLoading.hide();

                });
            }
            return;

        };

        $scope.focus = function(id) {
            $timeout(function() {
                document.getElementById(id).focus();
                if (ionic.Platform.isAndroid()) {
                    cordova.plugins.Keyboard.show();
                }
            }, 0);
        }
    });
