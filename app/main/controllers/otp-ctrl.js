'use strict';
angular.module('main')
    .controller('OtpCtrl', function($scope, $ionicModal, $state, authentication, profile, $global, $stateParams, $ionicLoading, $timeout) {
        $scope.data = $global.getLocalItem("registration", true);
        if (!$scope.data) {
            $scope.data = {};
            var mobileOrEmail = $global.getLocalItem("mobileOrEmail", true);
            $scope.data.mobileNo = mobileOrEmail;
        }else{
            $scope.registration=true;
        }
        $scope.authorization = {}
        $scope.$watch('data.otp', function(newVal, oldVal) {
            if (newVal && newVal.length == 6) {
                $scope.verify();
            }
        });

        $ionicModal.fromTemplateUrl('main/templates/otp-keypad.html', {
            scope: $scope,
            animation: 'mh-slide'
        }).then(function(modal) {
            $scope.otpKeyPad = modal
            $scope.otpKeyPad.name = 'otp-keypad';
        });
        $scope.openOTPKeyPad = function() {
            $scope.otpKeyPad.show();
        };
        $scope.closeOTPKeyPad = function(submit) {
            $scope.otpKeyPad.submit=submit;
            $scope.otpKeyPad.hide();
        };

        $scope.getOTPLength = function() {
            return $scope.data.otp.length;
        }
        $scope.otp = [];
        $scope.setOTP = function(num) {
            if ($scope.otp.length < 6) {
                $scope.otp.push(num);
                $scope.data.otp = $scope.otp.join("");
            }
        }
        $scope.clearOTP=function(){
            $scope.otp = [];
            $scope.data.otp='';
        }
        $scope.removeOTP = function() {
            if ($scope.otp.length != 0) {
                $scope.otp.pop();
                $scope.data.otp = $scope.otp.join("");
            }
        }

        $scope.$on('modal.hidden', function(event, modal) {
            if(modal.name == 'otp-keypad' && !$scope.otpKeyPad.submit){
                $scope.clearOTP();
            } 
            if(modal.name == 'password-keypad' && !$scope.passwordKeyPad.submit){
                $scope.clearPassword();
            }
            if(modal.name == 'repassword-keypad' && !$scope.rePasswordKeyPad.submit){
                $scope.clearRepassword();
            }
        });


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
            $scope.passwordKeyPad.submit=submit;
            $scope.passwordKeyPad.hide();
        };

        $scope.getPasswordLength = function() {
            return $scope.authorization.password.length;
        }
        $scope.password = [];
        $scope.setPassword = function(num) {
            if ($scope.password.length < 6) {
                $scope.password.push(num);
                $scope.authorization.password = $scope.password.join("");
            }
        }
         $scope.clearPassword=function(){
            $scope.password = [];
            $scope.authorization.password='';
        }
        $scope.removePassword = function() {
            if ($scope.password.length != 0) {
                $scope.password.pop();
                $scope.authorization.password = $scope.password.join("");
            }
        }


        $ionicModal.fromTemplateUrl('main/templates/re-password-keypad.html', {
            scope: $scope,
            animation: 'mh-slide'
        }).then(function(modal) {
            $scope.rePasswordKeyPad = modal
            $scope.rePasswordKeyPad.name = 'repassword-keypad';
        });
        $scope.openRePasswordKeyPad = function() {
            $scope.rePasswordKeyPad.show();
        };
        $scope.closeRePasswordKeyPad = function(submit) {
            $scope.rePasswordKeyPad.submit=submit;
            $scope.rePasswordKeyPad.hide();
        };

        $scope.getRePasswordLength = function() {
            return $scope.authorization.confirmPassword.length;
        }
        $scope.repassword = [];
        $scope.setRePassword = function(num) {
            if ($scope.repassword.length < 6) {
                $scope.repassword.push(num);
                $scope.authorization.confirmPassword = $scope.repassword.join("");
            }
        }
         $scope.clearRepassword=function(){
            $scope.repassword = [];
            $scope.authorization.confirmPassword='';
        }
        $scope.removeRePassword = function() {
            if ($scope.repassword.length != 0) {
                $scope.repassword.pop();
                $scope.authorization.confirmPassword = $scope.repassword.join("");
            }
        }


        $scope.verify = function() {
            $scope.errMessage = "";
            var verification = {};
            verification.mobileOrEmail = $scope.data.mobileNo;
            verification.verificationCode = $scope.data.otp;
            authentication.otpVerification(verification).then(function(res) {
                if (res.status && res.status == $global.SUCCESS) {
                    $global.setLocalItem("authentication", res, true);
                    $scope.authorization.otpkey = true;
                    $global.init();
                    if(mobileOrEmail==undefined){
                        getCategoriesList()
                    }
                    $scope.closeOTPKeyPad(true);
                } else if (res.status == $global.FAILURE) {
                    $ionicLoading.hide();
                    $global.showToastMessage(res.error.message, 'short', 'center');
                    $scope.errMessage = res.error.message || "OTP seems to be invalid, please try again or call us for help";
                }
            }, function(err) {

            })
        }
        

        


        $scope.submitOtpForm = function(form) {
            $scope.errMessage = "";
            if ($scope.authorization.password != $scope.authorization.confirmPassword) {
                $global.showToastMessage("Both passcodes aren't matching, please check again", 'short', 'center');
                return false;
            }
            if ($scope.authorization.password.length != 6) {
                $global.showToastMessage('Passcode must be 6 digits', 'short', 'center');
                return false;
            }
            var data = {
                newPassword: $scope.authorization.password
            }
            if (form.$valid) {
                $ionicLoading.show();
                profile.changePwd(data).then(function(res) {
                    console.log(res);
                    if (res.status == $global.SUCCESS) {
                        $scope.successMessage = res.data.message;
                        // $global.showToastMessage(res.data.message, 'short', 'center');
                        if (mobileOrEmail) {
                            $state.go('main.dashboard');
                        } else {
                          //  $state.go('main.catselection');
                           $scope.submitCatSelectionForm();
                        }
                    } else if (res.status == $global.FAILURE) {
                        $scope.errorMessage = res.error.message;
                    }
                    $ionicLoading.hide();
                })
            }
        };

        function getCategoriesList(){
            $scope.userCategories = [];
            $ionicLoading.show(); 
            profile.userCategories().then(function(res) {
                console.log(res);
                if (res.status == "SUCCESS") {
                    $scope.catList = res.data.categories;
                } else if (res.status == "FAILURE") {
                    $scope.errMessage = res.error.message;
                }
                $ionicLoading.hide(); 

            });
            profile.getProfile().then(function(res) {
                $scope.profiledata = res.data.consumer;
            })
        }
        $scope.submitCatSelectionForm = function() {
            $ionicLoading.show(); 
            $scope.profiledata.categories=[];
            if ($scope.userCategories.length > 0) {
                for (var i = $scope.catList.length - 1; i >= 0; i--) {
                    if ($scope.userCategories.indexOf($scope.catList[i].consumerCategoryId) != -1) {
                        $scope.profiledata.categories.push({
                            key: $scope.catList[i].consumerCategoryId,
                            value: $scope.catList[i].name
                        });
                    }
                };
            }
            profile.updateProfile($scope.profiledata).then(function(res) {
                if (res.status == "SUCCESS") {
                    $state.go('main.myaccount');
                } else if (res.status == "failure") {
                    $scope.errMessage = res.error.message;
                }
              $ionicLoading.hide(); 
            })

        };
    });