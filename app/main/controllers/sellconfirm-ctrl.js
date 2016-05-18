'use strict';
angular.module('main')
    .controller('SellconfirmCtrl', function($scope, SellNow, $state, $stateParams, NgMap, $timeout, $global, $ionicLoading) {
        var id = $stateParams.id;
        $scope.map = {};
        var map;
        NgMap.getMap().then(function(evtMap) {
            map = evtMap;
        });
        $global.removeSellRequest();

        function reRednerMap() {
            $timeout(function() {
                if (map) {
                    var currCenter = map.getCenter();
                    map.setCenter(currCenter);
                    google.maps.event.trigger(map, 'resize');
                }
            }, 500);
        }

        $scope.initMap = function(mapId) {
            $scope.map = NgMap.initMap(mapId);
        }
        $ionicLoading.show();
        SellNow.getSellById(id).then(function(res) {
            if (res.status == $global.SUCCESS) {
                $scope.sellDetails = res.data.sell;
                var origin = [];
                origin.push($scope.sellDetails.consumerAddress.latitude);
                origin.push($scope.sellDetails.consumerAddress.longitude);
                $scope.origin = origin.join();

                if ($scope.sellDetails.agentAddress) {
                    var destination = [];
                    destination.push($scope.sellDetails.agentAddress.latitude);
                    destination.push($scope.sellDetails.agentAddress.longitude);
                    $scope.destination = destination.join();
                    document.addEventListener("deviceready", function() {
                        $scope.cltlng = new plugin.google.maps.LatLng($scope.sellDetails.consumerAddress.latitude, $scope.sellDetails.consumerAddress.longitude);
                        $scope.altlng = new plugin.google.maps.LatLng($scope.sellDetails.agentAddress.latitude, $scope.sellDetails.agentAddress.longitude);
                    }, false);
                }
            }
            reRednerMap();
            $ionicLoading.hide();
        });
        $scope.getDirectionByNative = function() {
            plugin.google.maps.external.launchNavigation({
                "from": $scope.cltlng,
                "to": $scope.altlng
            });
        }
        $scope.goToPendingList = function(id) {
            $state.go('main.viewappnts');
        }
    });
