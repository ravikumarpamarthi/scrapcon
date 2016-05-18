'use strict';
angular.module('main')
    .controller('EditSellnowCtrl', function($scope, $global, $moment, SellNow, profile, $state, $timeout, $ionicLoading, $ionicScrollDelegate, $ionicSideMenuDelegate) {
        $scope.onHold = function() {
            $scope.vm.place = '';
            $scope.vm.formattedAddress = '';
            $scope.data.consumerAddressId = null;
        }
        /*var sellRequestObj = $global.getSellRequest();
        if (!sellRequestObj) {
            $state.go("main.dashboard");
            return;
        };*/
        $scope.vm = {};
        $scope.data = {
            "consumerId": $global.consumerId,
            "preferredPaymentMethod": $global.paymentModes[0].value,
            "items": []
        };
        /*date picker */
        var disablePreviousDates = new Date();
        disablePreviousDates.setDate(disablePreviousDates.getDate() - 1);

        var disabledDates = [];
        var monthList = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
        $scope.datepickerObject = {};
        $scope.datepickerObject.inputDate = new Date();
        $scope.datepickerObjectPopup = {
            titleLabel: 'Select date', //Optional
            todayLabel: 'Today', //Optional
            closeLabel: 'Close', //Optional
            setLabel: 'Set', //Optional
            errorMsgLabel: 'Please select time.', //Optional
            setButtonType: 'button-default', //Optional
            modalHeaderColor: 'bar-positive', //Optional
            modalFooterColor: 'bar-positive', //Optional
            templateType: 'popup', //Optional
            inputDate: $scope.datepickerObject.inputDate, //Optional
            mondayFirst: false, //Optional
            // disabledDates: disabledDates, //Optional
            monthList: monthList, //Optional
            from: disablePreviousDates, //Optional
            callback: function(val) { //Optional
                datePickerCallbackPopup(val);
            }
        };
        $scope.paymentModes = $global.paymentModes;

        var datePickerCallbackPopup = function(val) {
            $scope.mapSetClickable(true);
            if (typeof(val) === 'undefined') {} else {
                $scope.datepickerObjectPopup.inputDate = val;
                var today = $moment().format('DD-MMM-YYYY')
                var current = $moment($scope.datepickerObjectPopup.inputDate).format('DD-MMM-YYYY')
                if (today != current) {
                    $scope.slots = $scope.allslots.allSlots;
                    $scope.data.preferredSlot = $scope.slots[0].slotId;
                } else {
                    if ($scope.allslots)
                        $scope.slots = $scope.allslots.presentDaySlots;
                }
            }
        };
        /*date picker end */
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
                slots.unshift({
                    slotId: "100",
                    slotName: "Set Next Slot",
                    status: "Enable"
                });
                $scope.data.preferredSlot = "100";
            }
            $scope.slots = slots;
            $scope.allslots.presentDaySlots = slots;
        });

        profile.getAddress().then(function(res) {
            if (res.status == $global.SUCCESS) {
                $scope.locations = res.data.addresses;
                SellNow.getSellById($stateParams.id).then(function(res) {
                	var data=res.data;
                	var consumerAddress=data.consumerAddress;
                    var location =$filter('filter')($scope.locations, {
                        addressId: data.consumerAddress.addressId
                    })[0];;
                    $scope.vm.selectedItem = location;
                    var obj = {};
                    $scope.data=data;
                    obj = new plugin.google.maps.LatLng(consumerAddress.latitude, consumerAddress.longitude)
                    setLocation(obj);
                   

                });
            }
            $ionicLoading.hide();
        });
        $scope.placeChanged = function() {
            $scope.mapSetClickable(true);
            $scope.vm.place = this.getPlace();
            var obj = {};
            /* obj.lat = $scope.vm.place.geometry.location.lat();
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
        $scope.addressSelect = function() {
            var obj = {};
            $scope.vm.place = '';
            $scope.vm.formattedAddress = '';
            var location = $scope.vm.selectedItem;
            $scope.data.consumerAddressId = location.addressId;
            obj = new plugin.google.maps.LatLng(location.latitude, location.longitude)
            setLocation(obj);
        }



        var map;
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
        var option = {
            enableHighAccuracy: true
        };

        function onMapReady() {
            map.clear();
            map.off();
            /* map.getMyLocation(option, function(result) {
                 setLocation(result.latLng);
             });*/
        }

        $scope.setCurrentLocation = function() {
            $scope.vm.newlocation = true;
            map.getMyLocation(option, function(result) {
                setLocation(result.latLng);
            });
        }
        var consumerMarker;

        function setLocation(obj) {
            if (consumerMarker) {
                consumerMarker.remove();
            }
            map.clear();
            map.off();
            // map.trigger("test");
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
                        setPlaceObject(obj);
                        marker.hideInfoWindow();
                        marker.setTitle("Long press on marker to locate your location");
                        marker.setDraggable(true);
                        marker.on(plugin.google.maps.event.MARKER_DRAG_END, onMarkerDragged);
                        marker.showInfoWindow();
                        // marker.setAnimation(plugin.google.maps.Animation.BOUNCE);
                    });
                }, 500);
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
                $scope.vm.newlocation = true;
            });
        }

        $scope.$on("$destroy", function() {
            document.getElementById("side-menu-left").style.display = "block";
            map.remove();
            map.setDiv(null);
        });



        $scope.sellNow = function() {
            $scope.data.sellSubType = 'APPOINTMENT';
            var place = $scope.vm.place;
            var consumerAddressId = $scope.data.consumerAddressId;
            if (!place && !consumerAddressId) {
                $scope.placeError = true;
            } else {
                $ionicLoading.show();
                $scope.data.preferredDate = $moment($scope.datepickerObjectPopup.inputDate).format('DD-MMM-YYYY');
                if (place) {
                    var address = $global.getAddressObj(place);
                    address.userId = $global.consumerId;
                    address.userType = "CONSUMER";
                    address.formattedAddress = $scope.vm.formattedAddress;
                    profile.saveCosumerAddress(address).then(function(res) {
                        $scope.data.consumerAddressId = res.data.address.addressId;
                        SellNow.sellNow($scope.data).then(function(res) {
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
                    SellNow.sellNow($scope.data).then(function(res) {
                        if (res.status == $global.SUCCESS) {
                            /* $state.go("main.sellconfirm", {
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
                    // globalpolyline = polyline;
                });
            })

        }

        function setAgentMarker(obj) {
            $timeout(function() {
                map.addMarker({
                    'position': obj,
                    'animation': plugin.google.maps.Animation.DROP,
                    'icon': 'www/main/assets/images/agent.png'
                }, function(marker) {
                    var data = {
                        latitude: obj.lat,
                        longitude: obj.lng
                    }
                    setPolyLine(data)
                });
            });
        }

        function confirmation(id) {
            $global.removeSellRequest();
            $ionicLoading.show();
            SellNow.getSellById(id).then(function(res) {
                if (res.status == $global.SUCCESS) {
                    $scope.vm.confirmation = true;
                    $scope.sellDetails = res.data.sell;

                    if ($scope.sellDetails.consumerAddress) {
                        /*var obj = new plugin.google.maps.LatLng($scope.sellDetails.consumerAddress.latitude, $scope.sellDetails.consumerAddress.longitude);*/
                        if ($scope.sellDetails.agentAddress) {
                            var agentObj = new plugin.google.maps.LatLng($scope.sellDetails.agentAddress.latitude, $scope.sellDetails.agentAddress.longitude);
                            setAgentMarker(agentObj);
                        }
                        // setConsumerMarker(obj, agentObj);
                    }

                }
                $ionicLoading.hide();
            });
        }

        $scope.goToPendingList = function(id) {
            $state.go('main.viewappnts');
        }


    });
