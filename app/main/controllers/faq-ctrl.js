'use strict';
angular.module('main')
    .controller('FaqCtrl', function($scope, commonSevices, $ionicLoading, $global,$ionicScrollDelegate) {
        $ionicLoading.show();
        commonSevices.getFaqs().then(function(res) {
            $scope.faqs = res.data.faqData;
            $ionicLoading.hide();
        });
        $scope.showFaq = function(index) {
            if ($scope.showfaqindex != index) {
                $scope.showfaqindex = index;
            }else{
                $scope.showfaqindex =null;
            }
        }
        $scope.scrollBottom = function() {
            $ionicScrollDelegate.scrollBottom();
        };
    });
