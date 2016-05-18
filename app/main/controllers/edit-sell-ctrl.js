'use strict';
angular.module('main')
    .controller('EditSellCtrl', function($scope, $global, $filter, NgMap, SellNow, $moment, profile, $state, $stateParams, $timeout, $ionicLoading, $ionicScrollDelegate) {
        /*date picker */
        function setDatePicker(date) {
            var disablePreviousDates = new Date();
            disablePreviousDates.setDate(disablePreviousDates.getDate() - 1);

            var disabledDates = [];
            var monthList = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
            $scope.datepickerObject = {};
            $scope.datepickerObjectPopup = {
                titleLabel: 'Select date', //Optional
                todayLabel: 'Today', //Optional
                closeLabel: 'Close', //Optional
                setLabel: 'Set', //Optional
                errorMsgLabel: 'Please select time.', //Optional
                setButtonType: 'button-assertive', //Optional
                modalHeaderColor: 'bar-positive', //Optional
                modalFooterColor: 'bar-positive', //Optional
                templateType: 'popup', //Optional
                inputDate: date, //Optional
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
        }
        /*date picker end */
        var map;
        NgMap.getMap().then(function(evtMap) {
            map = evtMap;
        });
        $scope.paymentModes = $global.paymentModes;
        $scope.reRednerMap = function() {
            $timeout(function() {
                if (!map)
                    return;
                var currCenter = map.getCenter();
                map.setCenter(currCenter);
                google.maps.event.trigger(map, 'resize');

            }, 500);
        }
        var geocoder = new google.maps.Geocoder;
        $scope.vm = {};
        $scope.disableTap = function(drop) {
            var container = document.getElementsByClassName('pac-container');
            angular.element(container).attr('data-tap-disabled', 'true');
            angular.element(container).on("click", function() {
                if (drop) {
                    document.getElementById('dropautocomplete').blur();
                } else
                    document.getElementById('autocomplete').blur();
            });
        }
        $scope.chosenPlace = {};
        profile.getAddress().then(function(res) {
            $scope.locations = res.data.addresses;
            SellNow.getSellById($stateParams.id).then(function(res) {
                if (res.status == $global.SUCCESS) {
                    $scope.data = res.data.sell;
                    $scope.selectedItem = $filter('filter')($scope.locations, {
                        addressId: $scope.data.consumerAddress.addressId
                    })[0];
                    $scope.setMap($scope.selectedItem);
                    var obj = {};
                    obj.lat = $scope.data.consumerAddress.latitude;
                    obj.lng = $scope.data.consumerAddress.longitude;
                    $scope.setLocation(obj);
                    if ($scope.data.subType == "APPOINTMENT") {
                        SellNow.getSlots().then(function(res) {
                            $scope.allslots = res.data;
                            
                            var date = new Date($scope.data.preferredDate);
                            var today = $moment().format('DD-MMM-YYYY')
                            if ($scope.data.preferredDate && today == $scope.data.preferredDate) {
                                var slots = res.data.presentDaySlots;
                                for (var i = slots.length - 1; i >= 0; i--) {
                                    if ($scope.data.preferredSlot==slots[i].slotName && slots[i].status == "Disabled") {
                                        slots[i].status="Enable";
                                        break;
                                    }
                                }
                                $scope.slots=slots;
                            }else{
                                $scope.slots=angular.copy($scope.allslots.allSlots);
                               // $scope.data.preferredSlot
                            }
                            
                            setDatePicker(date);
                        })
                    }

                }
                $ionicLoading.hide();
            })
        }, function(err) {
            $ionicLoading.hide();
        });

        function getAgents(obj) {
            $ionicLoading.show();
            SellNow.getAgents(obj.lat, obj.lng).then(function(res) {
                if (res.status == $global.SUCCESS) {
                    $scope.agents = res.data.addresses;
                }
                $ionicLoading.hide();
            })
        }
        $scope.placeChanged = function(drop) {
            $scope.place = this.getPlace();
            var obj = {};
            obj.lat = $scope.place.geometry.location.lat();
            obj.lng = $scope.place.geometry.location.lng();
            $scope.setLocation(obj);
            // $ionicScrollDelegate.scrollBottom(true);
        }
        $scope.dropPlaceChanged = function() {
            $scope.place = this.getPlace();
            var obj = {};
            obj.lat = $scope.place.geometry.location.lat();
            obj.lng = $scope.place.geometry.location.lng();
            getAgents(obj);
            $scope.setLocation(obj);
            // $ionicScrollDelegate.scrollBottom(true);
        }
        $scope.getLatLng = function(obj) {
            if (obj && obj.latitude) {
                var latLng = [];
                latLng.push(obj.latitude);
                latLng.push(obj.longitude);
                return latLng.join();
            }

        }
        $scope.setAgent = function() {
            $scope.drop.agentId = this.data
            $scope.data.agentId = this.data.userId;
        }
        $scope.setDropAgent = function(userId) {
            for (var i = $scope.agents.length - 1; i >= 0; i--) {
                if ($scope.agents[i].userId == userId) {
                    $scope.drop.agentId = $scope.agents[i];
                    break;
                }
            };
            // $ionicScrollDelegate.scrollBottom(true);

        }

        $scope.updateRequest = function() {
            if (!$scope.place && !$scope.data.consumerAddressId) {
                return;
            }
            if ($scope.data.subType == 'NOW' || $scope.data.subType == 'APPOINTMENT') {
                $ionicLoading.show();
                if ($scope.place) {
                    var address = $global.getAddressObj($scope.place);
                    address.userId = $global.consumerId;
                    address.userType = "CONSUMER";
                    address.formattedAddress = $scope.vm.formattedAddress;
                    profile.saveCosumerAddress(address).then(function(res) {
                        $scope.data.consumerAddressId = res.data.address.addressId;
                        var updatedata = getUpdateData();
                        SellNow.updatePickup(updatedata).then(function(res) {
                            if (res.status == $global.SUCCESS) {
                                $global.showToastMessage(res.message, 'short', 'center');
                                $state.go("main.viewappnts")
                            } else if (res.status == $global.FAILURE) {
                                $ionicLoading.hide();
                                $scope.errorMessage = res.error.message;
                            }
                        })
                    })
                } else {
                    var updatedata = getUpdateData();
                    SellNow.updatePickup(updatedata).then(function(res) {
                        if (res.status == $global.SUCCESS) {
                            $global.showToastMessage(res.message, 'short', 'center');
                            $state.go("main.viewappnts")
                        } else if (res.status == $global.FAILURE) {
                            $ionicLoading.hide();
                            $scope.errorMessage = res.error.message;
                        }
                    })
                }
            }
        }

        function getUpdateData() {
            var data = {
                items: $scope.data.items,
                consumerAddressId: $scope.data.consumerAddressId,
                preferredPaymentMethod: $scope.data.preferredPaymentMethod,
                preferredDate: $scope.data.preferredDate,
                preferredSlot: $scope.data.preferredSlotId,
                sellId: $scope.data.sellObjId
            }

            return data;

        }


        $scope.sellNow = function(drop) {
            $scope.data.sellSubType = 'NOW';
            if (!$scope.place && !$scope.data.consumerAddressId) {
                return;
            }
            if (drop == 'DROP') {
                if (!$scope.drop.agentId || $scope.drop.agentId.userId == null) {
                    return;
                }
                $scope.data.agentId = $scope.drop.agentId.userId;
                $scope.data.agentAddressId = $scope.drop.agentId.addressId;
            }
            $ionicLoading.show();
            if ($scope.place) {
                var address = $global.getAddressObj($scope.place);
                address.userId = $global.consumerId;
                address.userType = "CONSUMER";
                address.formattedAddress = $scope.vm.formattedAddress;
                profile.saveCosumerAddress(address).then(function(res) {
                    $scope.data.consumerAddressId = res.data.address.addressId;
                    SellNow.sellNow($scope.data, drop).then(function(res) {
                        if (res.status == $global.SUCCESS) {
                            $state.go("main.sellconfirm", {
                                id: res.data.confirmationId
                            });
                        } else if (res.status == $global.FAILURE) {
                            $ionicLoading.hide();
                            $scope.errorMessage = res.error.message;
                        }
                    })
                })
            } else {
                SellNow.sellNow($scope.data, drop).then(function(res) {
                    if (res.status == $global.SUCCESS) {
                        $state.go("main.sellconfirm", {
                            id: res.data.confirmationId
                        });
                    } else if (res.status == $global.FAILURE) {
                        $ionicLoading.hide();
                        $scope.errorMessage = res.error.message;
                    }
                })
            }
        }
        $scope.getAgents = function(location) {
            if (location) {
                var obj = {};
                obj.lat = location.latitude;
                obj.lng = location.longitude;
                getAgents(obj);
            }
        }
        $scope.setMap = function(location, drop) {
            if (location) {

                $scope.place = '';
                $scope.vm = {}
                var obj = {};
                $scope.data.consumerAddressId = location.addressId;
                obj.lat = location.latitude;
                obj.lng = location.longitude;
                if (drop) {
                    getAgents(obj);
                }
                $scope.setLocation(obj);
                // $ionicScrollDelegate.scrollBottom(true);
            } else {
                $scope.data.consumerAddressId = null;
            }
        }
        $scope.scrollToBottom = function() {
            $ionicScrollDelegate.scrollBottom(true);
        }
        $scope.setLocation = function(obj) {
            var center = [];
            center.push(obj.lat);
            center.push(obj.lng);
            $scope.center = center.join();
        }

        function setPlaceObject(latlng) {
            $global.getLocationByLatLng(latlng).then(function(res) {
                $scope.place = res;
                $scope.vm.formattedAddress = res.formatted_address;

            })
        }
        $scope.setCurrentLocation = function(drop) {
            $global.getCurrentLocation().then(function(latlng) {
                $scope.center = latlng.lat + "," + latlng.lng;
                $scope.reRednerMap();
                setPlaceObject(latlng)
                if (drop) {
                    getAgents(latlng);
                }
            })
        }
        $scope.markerDragEnd = function(event) {
            $timeout(function() {
                var latlng = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                };
                setPlaceObject(latlng);
                $scope.center = latlng.lat + "," + latlng.lng;
            })
        }

    });
