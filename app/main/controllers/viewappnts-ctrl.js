'use strict';
angular.module('main')
    .controller('ViewAppntsCtrl', function($scope, $state, $ionicModal, $global, SellNow, $ionicPopup, $ionicLoading, $timeout, $ionicScrollDelegate) {


        $scope.scrollTop = function() {
            $ionicScrollDelegate.scrollTop();
        };
        $scope.resetCompletedParams = function() {
            completedParams.page = 0;
            $scope.noMoreCompletedParams = false;
        }
        $scope.resetPendingParams = function() {
            pendingParams.page = 0;
            $scope.noMorependingParams = false;
        }
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
        $scope.loadMorePendingRequests = function() {
            if ($scope.pending) {
                if ($scope.noMorependingParams == true) {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    return;
                }
                pendingParams.page += 1;
                SellNow.getSellRquests(pendingParams).then(function(res) {
                    if (res.status == $global.SUCCESS) {
                        var sells = res.data.sells;
                        var pendingSells = [];
                        // pendingSells=angular.copy($scope.pendingSells);
                        if (res.data.totalPages == pendingParams.page + 1) {
                            $scope.noMorependingParams = true;
                        }
                        for (var i = 0; i <= sells.length - 1; i++) {
                            $scope.pendingSells.push(sells[i]);
                        }
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                })
            }
        }
        $scope.loadMoreCompletedRequests = function() {
            if ($scope.completed) {
                if ($scope.noMoreCompletedParams == true) {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    return;
                }
                completedParams.page += 1;
                SellNow.getSellRquests(completedParams).then(function(res) {
                    if (res.status == $global.SUCCESS) {
                        var sells = res.data.sells;
                        if (res.data.totalPages == completedParams.page + 1) {
                            $scope.noMoreCompletedParams = true;
                        }
                        for (var i = 0; i <= sells.length - 1; i++) {
                            $scope.pendingSells.push(sells[i]);
                        }
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                })
            }
        }
        $scope.sellReuests = function(params) {
            SellNow.getSellRquests(params).then(function(res) {
                $ionicLoading.hide();
                if (res.status == $global.SUCCESS) {
                    if (params.status == "completed") {
                        $scope.completedSells = res.data.sells;
                        if (res.data.totalPages == 0 || res.data.totalPages == completedParams.page + 1) {
                            $scope.noMoreCompletedParams = true;
                        }
                    }
                    if (params.status == "pending") {
                        $scope.pendingSells = res.data.sells;
                        if (!$scope.pendingSells[0].agentName) {
                            $scope.getAgentRecord(0, $scope.pendingSells[0].confirmationId);
                        }
                        if (res.data.totalPages == 0 || res.data.totalPages == pendingParams.page + 1) {
                            $scope.noMorependingParams = true;
                        }
                    }

                }
            })
        }
        $scope.getCompletedRequests = function() {
            $ionicLoading.show();
            $scope.sellReuests(completedParams);
        }
        $scope.getPendingRequests = function() {
            $ionicLoading.show();
            $scope.sellReuests(pendingParams);
        }
        $scope.showConfirm = function(sell) {

            var confirmPopup = $ionicPopup.confirm({
                title: 'Alert',
                template: 'Do you want to cancel Appointment?',
                okType: 'button-assertive'
            });

            confirmPopup.then(function(res) {
                if (res) {
                    SellNow.cancelSellRquests(sell.confirmationId).then(function(res) {
                        $scope.sellReuests(pendingParams);
                    })
                }
            });

        };

        $ionicModal.fromTemplateUrl('main/templates/appointment-detail-modal-newui.html', {
            scope: $scope,
            animation: 'mh-slide'
        }).then(function(modal) {
            $scope.showAppointmentModal = modal
        });
        $scope.showAppointment = function(id) {
            $ionicLoading.show();
            $scope.showAppointmentModal.show();
            SellNow.getSellById(id).then(function(res) {
                if (res.status == $global.SUCCESS) {
                    $scope.sellDetails = res.data.sell;
                    var total = 0;
                    angular.forEach($scope.sellDetails.items, function(value, key) {
                        total = parseFloat(total) + parseFloat(value.amount);
                    });
                    
                    $scope.total=total;
                } else if (res.status == $global.FAILURE) {
                    $global.showToastMessage(res.error.message);
                }
                $ionicLoading.hide();

            })

        };
        var timeouts = [];
        $scope.getAgentRecord = function(index, id) {
            var promise = $timeout(function() {
                SellNow.getSellById(id).then(function(res) {
                    // $scope.sellDetails = res.data.sell;
                    $scope.pendingSells[index] = res.data.sell;
                })
            }, 6000);
            timeouts.push(promise);

        }
        $scope.$on("$destroy", function() {
            for (var i = timeouts.length - 1; i >= 0; i--) {
                $timeout.cancel(timeouts[i]);
            }
        });
        $scope.appointmentCloseModal = function() {
            $scope.showAppointmentModal.hide();
        };
        $scope.$on('$destroy', function() {
            $scope.showAppointmentModal.remove();
        });

        $ionicModal.fromTemplateUrl('main/templates/directions.html', {
            scope: $scope,
            animation: 'mh-slide'
        }).then(function(modal) {
            $scope.showDirectionsModal = modal
        });
        $scope.showDirections = function(id) {
            // $event.stopPropagation();
            $ionicLoading.show();
            $scope.directions = {};
            SellNow.getSellById(id).then(function(res) {
                if (res.status == $global.SUCCESS) {
                    var sellDetails = res.data.sell;
                    $scope.directions.sellDetails = sellDetails;
                    var destination = [];
                    destination.push(sellDetails.agentAddress.latitude);
                    destination.push(sellDetails.agentAddress.longitude);
                    $scope.directions.destination = destination.join();
                    var origin = [];
                    origin.push(sellDetails.consumerAddress.latitude);
                    origin.push(sellDetails.consumerAddress.longitude);
                    $scope.directions.origin = origin.join();
                    $scope.showDirectionsModal.show();
                } else if (res.status == $global.FAILURE) {
                    $global.showToastMessage(res.error.message);
                }
                $ionicLoading.hide();
            })
        };

        $scope.directionsCloseModal = function() {
            $scope.showDirectionsModal.hide();
        };

        $scope.edit = function(sell) {
            //subType=NOW,APPOINTMENT,
            //type=DROP
            if (sell.type == 'DROP') {
                $state.go("main.edit-drop-by-native", { id: sell.confirmationId });
                return;
            }

            if (sell.subType == 'NOW') {
                $state.go("main.edit-sell-now-by-native", { id: sell.confirmationId });
                return;
            }
            if (sell.subType == 'APPOINTMENT') {
                $state.go("main.edit-appointment-by-native", { id: sell.confirmationId });
            }

        }

    });
