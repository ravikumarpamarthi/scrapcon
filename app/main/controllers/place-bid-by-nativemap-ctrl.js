'use strict';
angular.module('main')
    .controller('PlaceBidByNativemapCtrl', function($scope, $global, $moment, BidService, profile, $state, $timeout, $ionicLoading, $ionicScrollDelegate, $ionicSideMenuDelegate) {
        $scope.onHold = function() {
            $scope.vm.place = '';
            $scope.vm.formattedAddress = '';
            $scope.data.consumerAddressId = null;
        }
        var sellRequestObj = $global.getSellRequest();
        if (!sellRequestObj) {
            $state.go("main.dashboard");
            return;
        };
        $scope.vm = {};
        $scope.data = {
            "consumerId": $global.consumerId,
            "items": []
        };
        profile.getAddress().then(function(res) {
            if (res.status == $global.SUCCESS) {
                $scope.locations = res.data.addresses;
                if ($scope.locations[0]) {
                    var location = $scope.locations[0];
                    $scope.vm.selectedItem = $scope.locations[0];
                    var obj = {};
                    $scope.data.addressId = location.addressId;
                    obj = new plugin.google.maps.LatLng(location.latitude, location.longitude)
                
                    setLocation(obj);
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
                $scope.data.addressId = null;
            }

        }
        $scope.addressSelect = function() {
            var obj = {};
            $scope.vm.place = '';
            $scope.vm.formattedAddress = '';
            var location = $scope.vm.selectedItem;
            $scope.data.addressId = location.addressId;
            obj = new plugin.google.maps.LatLng(location.latitude, location.longitude)
            setLocation(obj);
        }



        var map;
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
            if (consumerMarker !== undefined) {
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
            map.remove();
            map.setDiv(null);
            document.getElementById("side-menu-right").style.display = "block";
        });

        $scope.placeBid = function() {
            var place = $scope.vm.place;
            var addressId = $scope.data.addressId;
            if (!place && !addressId) {
                $scope.placeError = true;
            } else {
                $ionicLoading.show();
                if (place) {
                    var address = $global.getAddressObj(place);
                    address.userId = $global.consumerId;
                    address.userType = "CONSUMER";
                    address.formattedAddress = $scope.vm.formattedAddress;
                    profile.saveCosumerAddress(address).then(function(res) {
                        $scope.data.addressId = res.data.address.addressId;
                        BidService.placeBid($scope.data).then(function(res) {
                            if (res.status == $global.SUCCESS) {
                                $state.go("main.bid-confirmation", {
                                    id: res.data.confirmationId
                                });
                            } else if (res.status == $global.FAILURE) {
                                $ionicLoading.hide();
                                $scope.errorMessage = res.error.message;
                                $global.showToastMessage(res.error.message)
                            }
                        })
                    })
                } else {
                    BidService.placeBid($scope.data).then(function(res) {
                        if (res.status == $global.SUCCESS) {
                            $state.go("main.bid-confirmation", {
                                id: res.data.confirmationId
                            });
                        } else if (res.status == $global.FAILURE) {
                            $ionicLoading.hide();
                            $scope.errorMessage = res.error.message;
                            $global.showToastMessage(res.error.message)

                        }
                    })
                }
            }

        }


    });
