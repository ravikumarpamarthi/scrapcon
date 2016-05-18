'use strict';
angular.module('main')
    .controller('EditSellNowByNativeCtrl', function($scope, $stateParams, $global, $moment, SellNow, profile, $state, $timeout, $ionicLoading, $ionicScrollDelegate, $ionicSideMenuDelegate, $ionicPopup, $filter) {
        var id = $stateParams.id;
        /*map initialization start*/
        var map;
        var option = {
            enableHighAccuracy: true
        };
        $scope.$watch(function() {
                return $ionicSideMenuDelegate.isOpenLeft();
            },
            function(isOpen) {
                if (isOpen) {
                    document.getElementById("side-menu-left").style.display = "block";
                } else {
                    document.getElementById("side-menu-left").style.display = "none";
                }
            });
        document.addEventListener("deviceready", function() {
            var div = document.getElementById("map_canvas");
            map = plugin.google.maps.Map.getMap(div);
             var hyd = new plugin.google.maps.LatLng(17.3700, 78.4800);
            map.moveCamera({
              'target': hyd,
              'tilt': 60,
              'zoom': 16,
              'bearing': 140
            });
            map.on(plugin.google.maps.event.MAP_READY, onMapReady);
        }, false);

        $scope.disableTap = function() {
            var container = document.getElementsByClassName('pac-container');
            angular.element(container).attr('data-tap-disabled', 'true');
            angular.element(container).on("click", function() {
                document.getElementById('autocomplete').blur();
            });
            $scope.mapSetClickable(false);
        }
        $scope.mapSetClickable = function(val) {
            map.setClickable(val);
        }

        function onMapReady() {

        }

        $scope.setCurrentLocation = function() {
            $scope.vm.newlocation = true;
            map.getMyLocation(option, function(result) {
                setLocation(result.latLng);
            });
        }


        /*map initialization end*/

        $scope.paymentModes = $global.paymentModes;
        $scope.vm = {
            SELLTYPE: 'PICKUP'
        };
        $scope.data = {
            "consumerId": $global.consumerId,
        };
        $ionicLoading.show();
        SellNow.getSellById(id).then(function(res) {
            // $scope.sellDetails = res.data.sell;
            var sell = res.data.sell;
            $scope.data.preferredPaymentMethod = sell.preferredPaymentMethod;
            $scope.data.items = sell.items;
            $scope.data.preferredDate = sell.preferredDate;
            $scope.data.preferredSlot = sell.preferredSlotId;
            $scope.data.sellId = sell.sellObjId;
            $scope.data.consumerAddressId = sell.consumerAddress.addressId;
            var obj = {};
            obj = new plugin.google.maps.LatLng(sell.consumerAddress.latitude, sell.consumerAddress.longitude)
            profile.getAddress().then(function(res) {
                if (res.status == $global.SUCCESS) {
                    $scope.locations = res.data.addresses;
                }
                $ionicLoading.hide();
                $scope.vm.selectedItem = $filter('filter')(res.data.addresses, { addressId: sell.consumerAddress.addressId })[0];
            });
            SellNow.getSlots().then(function(res) {
                $scope.allslots = res.data;
                var noslots = true;
                var today=$moment().format('DD-MMM-YYYY');
                if(sell.preferredDate==today){
                    var slots = res.data.presentDaySlots;
                    for (var i = slots.length - 1; i >= 0; i--) {
                        if (slots[i].slotId == $scope.data.preferredSlot) {
                            slots[i].status = 'Enabled';
                        }
                    }
                }else{
                    var slots = res.data.allSlots;
                }
                $scope.slots = slots;
            })
            setLocation(obj, true);
        })

        $scope.placeChanged = function() {
            $scope.mapSetClickable(true);
            $scope.vm.place = this.getPlace();
            var obj = {};
            /*obj.lat = $scope.vm.place.geometry.location.lat();
            obj.lng = $scope.vm.place.geometry.location.lng();*/
            obj = new plugin.google.maps.LatLng($scope.vm.place.geometry.location.lat(), $scope.vm.place.geometry.location.lng())
            setLocation(obj);
        }

        $scope.managePlaceObject = function(newlocation) {
            if (newlocation == false) {
                $scope.vm.place = '';
                $scope.vm.formattedAddress = '';
                var obj = {};
                var location = $scope.vm.selectedItem;
                $scope.data.consumerAddressId = location.addressId;
                obj = new plugin.google.maps.LatLng(location.latitude, location.longitude)
                setLocation(obj);
            } else {
                $scope.data.consumerAddressId = null;
            }

        }
        $scope.onHold = function() {
            $scope.vm.place = '';
            $scope.vm.formattedAddress = '';
            $scope.data.consumerAddressId = null;
        }
        $scope.addressSelect = function() {
            var obj = {};
            $scope.vm.place = '';
            $scope.vm.formattedAddress = '';
            var location = $scope.vm.selectedItem;
            $scope.data.consumerAddressId = location.addressId;
            obj = new plugin.google.maps.LatLng(location.latitude, location.longitude)
            map.clear();
            map.off();
            map.animateCamera({
                tilt: 10,
                bearing: 230,
                target: obj,
                zoom: 14
            }, function() {
                $timeout(function() {
                    map.addMarker({
                        'position': obj,
                        'title': "long press on marker to locate your location",
                        'animation': plugin.google.maps.Animation.DROP,
                        'draggable': true,
                        'icon': 'www/main/assets/images/consumer.png'
                    }, function(marker) {
                        consumerMarker = marker;
                        marker.on(plugin.google.maps.event.MARKER_DRAG_END, onMarkerDragged);
                        marker.showInfoWindow();
                        if ($scope.vm.SELLTYPE == 'DROP') {
                            getAgents(obj);
                        }
                    });
                });
            });
        }

        var consumerMarker;
         
        function setLocation(obj, init) {
            map.clear();
            map.off();
            map.animateCamera({
                tilt: 10,
                bearing: 230,
                target: obj,
                zoom: 14
            }, function() {
                $timeout(function() {
                    map.addMarker({
                        'position': obj,
                        'title': "long press on marker to locate your location",
                        'animation': plugin.google.maps.Animation.DROP,
                        'draggable': true,
                        'icon': 'www/main/assets/images/consumer.png'
                    }, function(marker) {
                        consumerMarker = marker;
                        marker.on(plugin.google.maps.event.MARKER_DRAG_END, onMarkerDragged);
                        marker.showInfoWindow();
                        if (init == undefined) {
                            setPlaceObject(obj);
                        }
                        if ($scope.vm.SELLTYPE == 'DROP') {
                            getAgents(obj);
                        }
                        // marker.setAnimation(plugin.google.maps.Animation.BOUNCE);
                    });
                });
            });
        }

        function setPlaceObject(latlng) {
            $global.getGeocode(latlng).then(function(res) {
                $scope.vm.place = res;
                $scope.vm.formattedAddress = res.formatted_address;
            })
        }

        function onMarkerDragged(marker) {
            marker.getPosition(function(latLng) {
                setPlaceObject(latLng);
                if ($scope.vm.SELLTYPE == 'DROP') {
                    getAgents(latLng);
                }
                $scope.vm.newlocation = true;
            });
        }

        $scope.$on("$destroy", function() {
            map.remove();
            map.setDiv(null);
            document.getElementById("side-menu-left").style.display = "block";
        });

        function getAgents(obj) {
            $ionicLoading.show();
            SellNow.getAgents(obj.lat, obj.lng).then(function(res) {
                if (res.status == $global.SUCCESS) {
                    $scope.agents = res.data.addresses;
                    plotAgents();
                }
                $ionicLoading.hide();
            })
        }
        var globalpolyline;

        function removePolyline() {
            if (globalpolyline !== undefined) {
                globalpolyline.remove();
            }
        }

        function setPolyLine(data) {
            var consumer;
            var agent = new plugin.google.maps.LatLng(data.latitude, data.longitude);
            consumerMarker.getPosition(function(result) {
                consumer = new plugin.google.maps.LatLng(result.lat, result.lng);
                map.addPolyline({
                    points: [
                        consumer,
                        agent
                    ],
                    'color': '#28a54c',
                    'width': 5,
                    'geodesic': true
                }, function(polyline) {
                    globalpolyline = polyline;
                });
            })

        }

        var agentMarkers = [];

        function setAgent(data) {
            $scope.vm.agent = data;
            $scope.data.agentId = data.userId;
            removePolyline();
            setPolyLine(data);
            $scope.$apply();
        }
        $scope.setDropAgent = function(userId) {
            for (var i = $scope.agents.length - 1; i >= 0; i--) {
                if ($scope.agents[i].userId == userId) {
                    $scope.vm.agent = $scope.agents[i];
                    $scope.data.agentId = $scope.agents[i].userId;
                    removePolyline();
                    setPolyLine($scope.agents[i]);
                    break;
                }
            };
        }

        function plotAgents() {
            removeMarkers();
            var agents = angular.copy($scope.agents);
            if (agents.length) {
                for (var i = agents.length - 1; i >= 0; i--) {
                    if (agents[i].latitude && agents[i].longitude) {
                        map.addMarker({
                            'position': new plugin.google.maps.LatLng(agents[i].latitude, agents[i].longitude),
                            'data': agents[i],
                            'icon': 'www/main/assets/images/agent.png'
                        }, function(marker) {
                            agentMarkers.push(marker);
                            marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, function() {
                                setAgent(marker.get('data'));
                            });
                        });
                    }
                }
            }
        }

        function removeMarkers() {
            for (var i = agentMarkers.length - 1; i >= 0; i--) {
                agentMarkers[i].remove();
            }
            agentMarkers = [];
        }
        $scope.$watch(function() {
                return $scope.vm.SELLTYPE;
            },
            function(SELLTYPE) {
                if (SELLTYPE == 'DROP') {
                    if (consumerMarker !== undefined) {
                        consumerMarker.getPosition(function(latLng) {
                            getAgents(latLng);
                        })
                    }
                } else if (SELLTYPE == 'PICKUP') {
                    removeMarkers();
                    removePolyline();
                    delete $scope.data.agentId;
                    delete $scope.vm.agent;
                }
            });
        $scope.sellNow = function() {
            $scope.data.sellSubType = 'NOW';
            var SELLTYPE = $scope.vm.SELLTYPE;
            if (SELLTYPE == 'DROP') {
                if (!$scope.vm.agent || $scope.vm.agent.userId == null) {
                    $global.showToastMessage("Please Select Agent");
                    return;
                }
                $scope.data.agentAddressId = $scope.vm.agent.addressId;
            }
            var place = $scope.vm.place;
            var consumerAddressId = $scope.data.consumerAddressId;
            if (!place && !consumerAddressId) {
                $global.showToastMessage("Please Select address");
                $scope.placeError = true;
            } else {
                $ionicLoading.show();
                if (place) {
                    var address = $global.getAddressObj(place);
                    address.userId = $global.consumerId;
                    address.userType = "CONSUMER";
                    address.formattedAddress = ($scope.vm.customadd != '' && $scope.vm.customadd != undefined) ? $scope.vm.customadd + ', ' + $scope.vm.formattedAddress : $scope.vm.formattedAddress;
                    // address.formattedAddress = $scope.vm.formattedAddress;
                    profile.saveCosumerAddress(address).then(function(res) {
                        $scope.data.consumerAddressId = res.data.address.addressId;
                        SellNow.updatePickup($scope.data, SELLTYPE).then(function(res) {
                            if (res.status == $global.SUCCESS) {
                                confirmation(res.data.confirmationId);
                            } else if (res.status == $global.FAILURE) {
                                $ionicLoading.hide();
                                $scope.errorMessage = res.error.message;
                                $global.showToastMessage(res.error.message)
                            }
                        })
                    })
                } else {
                    SellNow.updatePickup($scope.data).then(function(res) {
                        if (res.status == $global.SUCCESS) {
                            /*$state.go("main.sellconfirm", {
                                id: res.data.confirmationId
                            });*/
                            confirmation(res.data.confirmationId);
                        } else if (res.status == $global.FAILURE) {
                            $ionicLoading.hide();
                            $scope.errorMessage = res.error.message;
                            $global.showToastMessage(res.error.message)
                        }
                    })
                }
            }
        }

        function setAgentMarker(obj) {
            $timeout(function() {
                map.addMarker({
                    'position': obj,
                    'animation': plugin.google.maps.Animation.DROP,
                    'icon': 'www/main/assets/images/agent.png'
                }, function(marker) {
                    var data = { latitude: obj.lat, longitude: obj.lng }
                    setPolyLine(data)
                });
            });
        }

        function confirmation(id) {
            $ionicLoading.hide();
            $scope.mapSetClickable(false);
            $global.showToastMessage('Your booking is now updated');
            $state.go('main.viewappnts');
            /*var alertPopup = $ionicPopup.alert({
                title: 'confirmation',
                template: 'Request Updated Successfully',
                okType: 'button-balanced'
            });
            alertPopup.then(function(res) {
                $state.go('main.viewappnts');
            });*/
            /*removePolyline();
            removeMarkers();
            $global.removeSellRequest();
            $ionicLoading.show();
            SellNow.getSellById(id).then(function(res) {
                if (res.status == $global.SUCCESS) {
                    $scope.vm.confirmation = true;
                    $scope.sellDetails = res.data.sell;

                    if ($scope.sellDetails.consumerAddress) {
                        if ($scope.sellDetails.agentAddress) {
                            var agentObj = new plugin.google.maps.LatLng($scope.sellDetails.agentAddress.latitude, $scope.sellDetails.agentAddress.longitude);
                            setAgentMarker(agentObj);
                        }
                    }
                }
                $ionicLoading.hide();
            });*/
        }

        $scope.goToPendingList = function(id) {
            $state.go('main.viewappnts');
        }
    });