'use strict';
angular.module('main')
    .controller('SellnowByNativeMapCtrl', function($scope, $global, $moment, SellNow, profile, $state, $timeout, $ionicLoading, $ionicScrollDelegate, $ionicSideMenuDelegate, $ionicPopup,$rootScope) {
        var sellRequestObj = $global.getSellRequest();
        if (!sellRequestObj) {
            $state.go("main.dashboard");
            return;
        }
        $scope.$emit('setHelp', { show: true, key: "help_sell" });

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
        $scope.$watch(function() {
                return $rootScope.walkThroughIsActive;
            },
            function(active) {
                if (active) {
                    $scope.mapSetClickable(false);
                } else {
                    $scope.mapSetClickable(true);
                }
            });
        document.addEventListener("deviceready", function() {
            var div = document.getElementById("map_canvas");
            map = plugin.google.maps.Map.getMap(div);
            var hyd = new plugin.google.maps.LatLng(17.3700, 78.4800);
            map.moveCamera({
                'target': hyd,
                'tilt': 60,
                'zoom': 17,
                'bearing': 140
            }, function() {});
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
            "preferredPaymentMethod": $global.paymentModes[0].value,
            "preferredDate": $moment().format('DD-MMM-YYYY'),
            "items": []
        };

        SellNow.getSlots().then(function(res) {
            $scope.allslots = res.data;
            var noslots = true;
            var slots = res.data.presentDaySlots;
            for (var i = slots.length - 1; i >= 0; i--) {
                if (slots[i].status != "Disabled") {
                    $scope.data.preferredSlot = slots[i].slotId;
                    noslots = false;
                    break;
                }
            };
            if (noslots == true) {
                slots = res.data.allSlots;
                $scope.data.preferredDate = $moment().add(1, 'days').format('DD-MMM-YYYY');
                $scope.data.preferredSlot = slots[0].slotId;
            }
            $scope.slots = slots;
        })
        $ionicLoading.show();
        profile.getAddress().then(function(res) {
            if (res.status == $global.SUCCESS) {
                $scope.locations = res.data.addresses;
                if ($scope.locations[0]) {
                    var location = $scope.locations[0];
                    $scope.vm.selectedItem = $scope.locations[0];
                    var obj = {};
                    $scope.data.consumerAddressId = location.addressId;
                    /*obj.lat = location.latitude;
                    obj.lng = location.longitude;*/
                    obj = new plugin.google.maps.LatLng(location.latitude, location.longitude)
                    setLocation(obj, false, true);
                } else {
                    $scope.vm.newlocation = true;
                    map.getMyLocation(option, function(result) {
                        setLocation(result.latLng);
                    });
                }
            }
            $ionicLoading.hide();
        });

        for (var i = sellRequestObj.length - 1; i >= 0; i--) {
            var item = {};
            if (sellRequestObj[i].items && sellRequestObj[i].items.length > 0) {
                item.categoryId = sellRequestObj[i].items[0].categoryId;
                item.categoryName = sellRequestObj[i].items[0].name;
                item.quantity = sellRequestObj[i].qty;
                item.pricePerUnit = sellRequestObj[i].items[0].price;
                item.image = sellRequestObj[i].items[0].image;

                $scope.data.items.push(item);
            }
        };

        $scope.placeChanged = function() {
            $scope.mapSetClickable(true);
            $scope.vm.place = this.getPlace();
            var obj = {};
            /*obj.lat = $scope.vm.place.geometry.location.lat();
            obj.lng = $scope.vm.place.geometry.location.lng();*/
            obj = new plugin.google.maps.LatLng($scope.vm.place.geometry.location.lat(), $scope.vm.place.geometry.location.lng())
            setLocation(obj, true);
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
                $scope.vm.place = '';
                $scope.vm.formattedAddress = '';
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
            setLocation(obj, false, true);
        }

        var consumerMarker;

        function setLocation(obj, fromautocomplete, noneedTosetPlaceObj) {
            map.clear();
            map.off();
            // map.trigger("test");
            map.moveCamera({
                'target': obj,
                'tilt': 60,
                'zoom': 17,
                'bearing': 140
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
                        if (!noneedTosetPlaceObj) {
                            setPlaceObject(obj, fromautocomplete);
                        }
                        if ($scope.vm.SELLTYPE == 'DROP') {
                            getAgents(obj);
                        }
                        // marker.setAnimation(plugin.google.maps.Animation.BOUNCE);
                    });
                });
            });
        }

        function setPlaceObject(latlng, fromautocomplete) {
            $global.getGeocode(latlng).then(function(res) {
                $scope.vm.place = res;
                $scope.withinArea = res.withinArea;
                if (!res.withinArea) {
                    $global.showToastMessage('Sorry, we are not serving in your location yet!', 'short', 'center');
                }
                if (!fromautocomplete) {
                    $scope.vm.formattedAddress = res.formatted_address;
                }
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
            $scope.$emit('setHelp', { show: false, key: "help_sell" });
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
            // map.clear();
            // map.off();
            $scope.data.sellSubType = 'NOW';
            if ($scope.data.preferredSlot == 'next') {
                $scope.data.preferredSlot = 0;
            }
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
            if (place && !place.withinArea) {
                $global.showToastMessage('Sorry, we are not serving in your location yet!', 'short', 'center');
                return false;
            }
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
                        SellNow.sellNow($scope.data, SELLTYPE).then(function(res) {
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
                    })
                } else {
                    SellNow.sellNow($scope.data, SELLTYPE).then(function(res) {
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
            $global.removeSellRequest();
            $global.showToastMessage('Thanks for your booking, we will be touch soon. Your booking Id is:' + id);
            $state.go('main.viewappnts');
            /* var alertPopup = $ionicPopup.alert({
                    title: 'Confirmation',
                    template: 'Request successfully created.\n <br>Confirmation Id:' + id,
                    okType:'button-balanced'
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
