'use strict';
angular.module('main')
    .controller('Bid-listCtrl', function($scope, $global, $ionicModal, $ionicLoading,BidService,$timeout) {

        $scope.shouldShowDelete = false;
        $scope.shouldShowReorder = false;
        $scope.listCanSwipe = true;
        var completedParams = {
            'page': 0,
            'size': 10,
            'status': 'completed'
        };
        var pendingParams = {
            'page': 0,
            'size': 10,
            'status': 'pending'
        };
        $scope.sellReuests = function(params) {
            BidService.getBids(params).then(function(res) {
                $ionicLoading.hide();
                if (res.status == $global.SUCCESS) {
                    if (params.status == "completed")
                        $scope.completedBids = res.data.bids;
                    if (params.status == "pending")
                        $scope.pendingBids = res.data.bids;
                }
            })
        }
        $scope.getCompletedRequests=function(){
            $ionicLoading.show();
            $scope.sellReuests(completedParams);
        }
        $scope.getPendingRequests=function(){
            $ionicLoading.show();
            $scope.sellReuests(pendingParams);
        }
        $scope.showBid = function(id) {
            $ionicLoading.show();
            BidService.getBidById(id).then(function(res) {
                $scope.bidDetails = res.data.bid;
                $ionicLoading.hide();
                $scope.showBidModal.show();

            })
        };

         $ionicModal.fromTemplateUrl('main/templates/bid-detail-modal.html', {
            scope: $scope,
            animation: 'mh-slide'
        }).then(function(modal) {
            $scope.showBidModal = modal
        });

        $scope.bidCloseModal = function() {
            $scope.showBidModal.hide();
        };
        $scope.$on('$destroy', function() {
            $scope.showBidModal.remove();
        });
        $scope.showConfirm = function(bid) {

            var confirmPopup = $ionicPopup.confirm({
                title: 'Alert',
                template: 'Do you want to delete Appointment?',
                okType: 'button-assertive'
            });

            confirmPopup.then(function(res) {
                if (res) {
                    SellNow.cancelSellRquests(bid.confirmationId).then(function(res) {
                        $scope.sellReuests(pendingParams);
                    })
                }
            });

        };
    });
