'use strict';
angular.module('main')
    .controller('CatSelectionCtrl', function($scope, $state, $global, profile,$ionicLoading) {
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
            $scope.data = res.data.consumer;
        })
        $scope.submitCatSelectionForm = function(list) {
            $ionicLoading.show(); 
          $scope.data.categories=[];
            if ($scope.userCategories.length > 0) {
                for (var i = $scope.catList.length - 1; i >= 0; i--) {
                    if ($scope.userCategories.indexOf($scope.catList[i].consumerCategoryId) != -1) {
                        $scope.data.categories.push({
                            key: $scope.catList[i].consumerCategoryId,
                            value: $scope.catList[i].name
                        });
                    }
                };
            }
            profile.updateProfile($scope.data).then(function(res) {
                if (res.status == "SUCCESS") {
                    $state.go('main.myaccount');
                } else if (res.status == "failure") {
                    $scope.errMessage = res.error.message;
                }
              $ionicLoading.hide(); 
            })

        };
    });
