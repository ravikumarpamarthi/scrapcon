'use strict';
angular.module('main')
    .controller('SellConfirmationByNativeMapCtrl', function($scope, $ionicSideMenuDelegate, SellNow, $state, $stateParams, $timeout, $global, $ionicLoading) {
        var id = $stateParams.id;
        var map;
        var consumerMarker;
        var globalpolyline;
         document.addEventListener("deviceready", function() {
           var div = document.getElementById("confirm_map");
            map = plugin.google.maps.Map.getMap(div);
            map.on(plugin.google.maps.event.MAP_READY, function() {});
         }, false);
        $global.removeSellRequest();
        $ionicLoading.show();
        SellNow.getSellById(id).then(function(res) {
                if (res.status == $global.SUCCESS) {
                    $scope.sellDetails = res.data.sell;

                    if ($scope.sellDetails.consumerAddress) {
                        var obj = new plugin.google.maps.LatLng($scope.sellDetails.consumerAddress.latitude, $scope.sellDetails.consumerAddress.longitude);
                        if ($scope.sellDetails.agentAddress) {
                            var agentObj = new plugin.google.maps.LatLng($scope.sellDetails.agentAddress.latitude, $scope.sellDetails.agentAddress.longitude);
                        }
                        setConsumerMarker(obj,agentObj);
                    }
                    
                }
            $ionicLoading.hide();
        });

        $scope.$watch(function() {
                return $ionicSideMenuDelegate.isOpenRight();
            },
            function(isOpen) {
                if (isOpen) {
                    document.getElementById("side-menu-right").style.display = "block";
                } else {
                    document.getElementById("side-menu-right").style.display = "none";
                }
            });




        function setConsumerMarker(obj,agentObj) {
            map.animateCamera({
                tilt: 10,
                bearing: 230,
                target: obj,
                zoom: 17
            }, function() {
                $timeout(function() {
                    map.addMarker({
                        'position': obj,
                        'animation': plugin.google.maps.Animation.DROP,
                        'icon': 'www/main/assets/images/consumer.png'
                    }, function(marker) {
                        consumerMarker = marker;
                        if(agentObj);
                        setAgentMarker(agentObj);
                    });
                });
            });
        }

        function setAgentMarker(obj) {
            $timeout(function() {
                map.addMarker({
                    'position': obj,
                    'animation': plugin.google.maps.Animation.DROP,
                    'icon': 'www/main/assets/images/agent.png'
                }, function(marker) {
                    setPolyLine(obj)
                });
            });
        }

        function setPolyLine(agentObj) {
            // alert(agentObj)
            consumerMarker.getPosition(function(result) {
                var consumerObj = new plugin.google.maps.LatLng(result.lat, result.lng);
                map.addPolyline({
                    points: [
                        consumerObj,
                        agentObj
                    ],
                    'color': '#28a54c',
                    'width': 5,
                    'geodesic': true
                }, function(polyline) {
                    globalpolyline = polyline;
                });
            });
        }
        $scope.$on("$destroy", function() {
            map.remove();
            map.setDiv(null);
            document.getElementById("side-menu-right").style.display = "block";
        });



        $scope.goToPendingList = function(id) {
            $state.go('main.viewappnts');
        }


    });
