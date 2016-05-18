'use strict';
angular.module('main')
    .controller('DashboardCtrl', function($scope, $ImageCacheFactory, $global, ScrapCategories, $state, $ionicModal, $ionicPopup, $ionicLoading, $timeout, $cordovaToast) {
        // $global.removeSellRequest();
        var shades = [1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21, 22, 25, 26, 29, 30, 33, 34, 37, 38, 41, 42];

        $scope.inShades = function(index) {
            return shades.indexOf(index) != -1
        }
         var sellRequestObj = $global.getSellRequest();
        $scope.data = (sellRequestObj)?sellRequestObj:[];
        $ionicLoading.show();
        ScrapCategories.getCategories().then(function(res) {
            if (res.status == $global.SUCCESS) {
                $ionicLoading.hide();
                $scope.categories = res.data.categories;
            }
        }, function(error) {
            $ionicLoading.hide();
        });
        $scope.sellNow = function() {
            $ionicLoading.show();
            $global.setSellRequest($scope.data);
            $timeout(function() {
                $state.go("main.sell-now");
            }, 500)
        };
        $scope.bookAppiontment = function() {
            $ionicLoading.show();
            $global.setSellRequest($scope.data);
            $timeout(function() {
                $state.go("main.bookappointment");
            }, 500)

        };
        $scope.placeBid = function() {

            if (!validBidRequest($scope.data)) {
                $global.showToastMessage('Please Select atleast one category', 'short', 'center');
                return;
            }
            // $ionicLoading.show();
            $global.setSellRequest($scope.data);
            $state.go("main.place-bid");
            /*$timeout(function() {
                
            }, 500)*/
        };

        $scope.decreaseQty = function(index) {
            if ($scope.data[index].qty > 1)
                $scope.data[index].qty = parseInt($scope.data[index].qty) - 1;
        }
        $scope.increaseQty = function(index) {
            $scope.data[index].qty = parseInt($scope.data[index].qty) + 1;
        }

        function validBidRequest(sellRequestObj) {
            var validate = false;
            for (var i = sellRequestObj.length - 1; i >= 0; i--) {
                if (sellRequestObj[i].items && sellRequestObj[i].items.length > 0) {
                    validate = true;
                    break;
                }
            };
            return validate;
        }
    });
