'use strict';
angular.module('main')
    .controller('OffersCtrl', function($scope,$global, commonSevices, $ionicLoading) {
        $ionicLoading.show();
        commonSevices.getOfferDetails().then(function(res) {
            if (res.status == $global.SUCCESS) {
                $scope.offersList = res.data.offers;
            }
            $ionicLoading.hide();
        });

    });
