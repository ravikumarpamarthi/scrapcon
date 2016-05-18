'use strict';
angular.module('main')
    .controller('placeBidCtrl', function($scope, $global, $state, NgMap, $ionicLoading, BidService, profile, $timeout) {
        $ionicLoading.show();
        var sellRequestObj = $global.getSellRequest();
        if (!sellRequestObj) {
            $state.go("main.dashboard");
            return;
        };
        $scope.data = {
            "consumerId": $global.consumerId,
            "items": []
        };
        for (var i = sellRequestObj.length - 1; i >= 0; i--) {
            var item = {};
            if (sellRequestObj[i].items && sellRequestObj[i].items.length > 0) {
                item.categoryId = sellRequestObj[i].items[0].categoryId;
                item.categoryName = sellRequestObj[i].items[0].name;
                item.quantity = sellRequestObj[i].qty;
                item.image = sellRequestObj[i].items[0].image;
                item.bidPrice = parseFloat(sellRequestObj[i].items[0].price);

                $scope.data.items.push(item);
            }
        };
        $scope.decreaseQty = function(index) {
            if ($scope.data.items[index].quantity > 1)
                $scope.data.items[index].quantity = parseInt($scope.data.items[index].quantity) - 1;
        }
        $scope.increaseQty = function(index) {
            $scope.data.items[index].quantity = parseInt($scope.data.items[index].quantity) + 1;
        }
        $scope.decreasePrice = function(index) {
            if ($scope.data.items[index].bidPrice > 1)
                $scope.data.items[index].bidPrice = parseFloat($scope.data.items[index].bidPrice) - 1;
        }
        $scope.increasePrice = function(index) {
            $scope.data.items[index].bidPrice = parseFloat($scope.data.items[index].bidPrice) + 1;
        }
        $scope.maps = [];
        $scope.$on('mapInitialized', function(evt, evtMap) {
            $scope.maps.push(evtMap);
        });
        $scope.reRednerMap = function() {
            $timeout(function() {
                angular.forEach($scope.maps, function(map) {
                    // google.maps.setCenter($scope.center);
                    var currCenter = map.getCenter();
                    google.maps.event.trigger(map, 'resize');
                    map.setCenter(currCenter);
                });
            }, 1000);
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
            if ($scope.locations[0] && $scope.locations[0].defaultAddress == 'YES') {
                $scope.selectedItem = $scope.locations[0];
                $scope.setMap($scope.selectedItem);
                $scope.reRednerMap();
            } else {
                $scope.center = "current-position";
            }
            $ionicLoading.hide();

        }, function(err) {
            $ionicLoading.hide();
        });
        $scope.setMap = function(location) {
            if (location) {
                var obj = {};
                $scope.data.addressId = location.addressId;
                obj.lat = location.latitude;
                obj.lng = location.longitude;
                $scope.setLocation(obj);
            } else {
                $scope.data.addressId = null;
            }
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
        $scope.setCurrentLocation = function() {
            $global.getCurrentLocation().then(function(latlng) {
                $scope.center = latlng.lat + "," + latlng.lng;
                $scope.reRednerMap();
                setPlaceObject(latlng)
            })
        }

        $scope.placeChanged = function(drop) {
            $scope.place = this.getPlace();
            var obj = {};
            obj.lat = $scope.place.geometry.location.lat();
            obj.lng = $scope.place.geometry.location.lng();
            $scope.setLocation(obj);
        }

        $scope.markerDragEnd = function(event) {
            $timeout(function() {
                var latlng = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                };
                setPlaceObject(latlng);
                $scope.center = latlng.lat + "," + latlng.lng;
            });
            $scope.newlocation=true;
        }
        $scope.managePlaceObject = function(newlocation) {
            if (newlocation == false) {
                $scope.place = '';
                $scope.vm = {};
                $scope.setMap($scope.selectedItem);
            } else {
                $scope.data.consumerAddressId=null;
                $scope.setCurrentLocation();
            }

        }
        $scope.placeBid = function(drop) {
            if (!$scope.place && !$scope.data.addressId) {
                $scope.placeError = true;
            } else {
                $ionicLoading.show();
                if ($scope.place) {
                    var address = $global.getAddressObj($scope.place);
                    address.userId = $global.consumerId;
                    address.userType = "CONSUMER";
                    address.formattedAddress = $scope.vm.formattedAddress;
                    profile.saveCosumerAddress(address).then(function(res) {
                        $scope.data.addressId = res.data.address.addressId;
                        BidService.placeBid($scope.data, drop).then(function(res) {
                            if (res.status == $global.SUCCESS) {
                                $state.go("main.bid-confirmation", {
                                    id: res.data.confirmationId
                                });
                            } else if (res.status == $global.FAILURE) {
                                $ionicLoading.hide();
                                $scope.errorMessage = res.error.message;
                            }
                        })
                    })
                } else {
                    BidService.placeBid($scope.data, drop).then(function(res) {
                        if (res.status == $global.SUCCESS) {
                            $state.go("main.bid-confirmation", {
                                id: res.data.confirmationId
                            });
                        } else if (res.status == $global.FAILURE) {
                            $ionicLoading.hide();
                            $scope.errorMessage = res.error.message;
                        }
                    })
                }
            }

        }
    });
