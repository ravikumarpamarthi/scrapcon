'use strict';
angular.module('main')
    .controller('Add-locationCtrl', function($scope, $global,$rootScope, profile, $ionicSideMenuDelegate, $timeout, $ionicLoading, $ionicPopup, $state) {
        $scope.$emit('setHelp', { show: true, key: "location-help" });
        $scope.onHold = function() {
            $scope.place = '';
            $scope.vm.formattedAddress = '';
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
            var hyd = new plugin.google.maps.LatLng(17.3700, 78.4800);
            // map.setMyLocationEnabled(true);
            map.moveCamera({
                'target': hyd,
                'tilt': 60,
                'zoom': 17,
                'bearing': 140
            });
            map.on(plugin.google.maps.event.MAP_READY, onMapReady);
            /*map.addEventListener(plugin.google.maps.event.MY_LOCATION_BUTTON_CLICK, function onMapInit(map) {
              setLocation(map.latLng);
            });*/

        }, false);

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
        $scope.placeChanged = function() {
            $scope.mapSetClickable(true);
            var place = this.getPlace();
            var obj = {};
            obj.lat = place.geometry.location.lat();
            obj.lng = place.geometry.location.lng();
            setLocation(obj, true);
        }

        var option = {
            enableHighAccuracy: true
        };

        function onMapReady() {
            map.getMyLocation(option, function(result) {
                setLocation(result.latLng);
            });
        }
        var consumerMarker;

        function setLocation(obj, fromautocomplete) {
            if (consumerMarker) {
                consumerMarker.remove();
            }
            map.clear();
            map.off();
            // map.trigger("test");
           /* map.animateCamera({
                tilt: 10,
                bearing: 230,
                target: obj,
                zoom: 17
            }*/
            map.moveCamera({
                'target': obj,
                'tilt': 60,
                'zoom': 17,
                'bearing': 140
            }, function() {
                $timeout(function() {
                    map.addMarker({
                        'position': obj,
                        'animation': plugin.google.maps.Animation.DROP,
                        'icon': 'www/main/assets/images/consumer.png'
                    }, function(marker) {
                        consumerMarker = marker;
                        setPlaceObject(obj, fromautocomplete);
                        marker.setTitle("Hold on your finger on the marker two seconds then drag & drop it.");
                        marker.setDraggable(true);
                        marker.on(plugin.google.maps.event.MARKER_DRAG_END, onMarkerDragged);
                        marker.showInfoWindow();
                        // marker.setAnimation(plugin.google.maps.Animation.BOUNCE);
                    });
                }, 500);
            });
        }
        $scope.vm = {};

        function setPlaceObject(latlng, fromautocomplete) {
            $global.getGeocode(latlng).then(function(res) {
                $scope.place = res;
                $scope.withinArea = res.withinArea;
                if (!res.withinArea) {
                    $global.showToastMessage('Sorry, we are not serving in your location yet!', 'short', 'center');
                }
                if (!fromautocomplete) {
                    $scope.vm.formattedAddress = res.formatted_address;
                }
            })
        }

        $scope.setCurrentLocation = function() {
            map.getMyLocation(option, function(result) {
                setLocation(result.latLng);
            });
        }

        function onMarkerDragged(marker) {
            marker.getPosition(function(latLng) {
                setPlaceObject(latLng);
            });
        }
        // $scope.$watch(function() {
        //         return $scope.vm.sameasabove;
        //     },
        //     function(isTrue) {
        //         if (isTrue) {
        //             $scope.vm.customadd = angular.copy($scope.vm.formattedAddress);
        //         } else {
        //             $scope.vm.customadd = '';
        //         }
        //     });


        function getFormateAddress() {
            // An elaborate, custom popup
            $scope.vm.sameasabove = false;
            var myPopup = $ionicPopup.show({
                templateUrl: 'main/templates/formattedaddress-modal.html',
                title: 'Your Selected location',
                subTitle: $scope.vm.formattedAddress,
                scope: $scope,
                buttons: [{
                    text: '<b>Save</b>',
                    type: 'button-balanced',
                    onTap: function(e) {
                        if ($scope.vm.customadd == '') {
                            $scope.vm.customaddError = true;
                            e.preventDefault();
                        } else {}
                    }
                }]
            });

            myPopup.then(function(res) {
                $ionicLoading.show();
                var address = $global.getAddressObj($scope.place);
                address.userId = $global.consumerId;
                address.userType = "CONSUMER";
                // address.formattedAddress = $scope.vm.formattedAddress;
                address.formattedAddress = $scope.vm.customadd;
                profile.saveCosumerAddress(address).then(function(res) {
                    $ionicLoading.hide();
                    // $scope.data.addressId = res.data.address.addressId;
                    $state.go('main.myaccount', { from: 'addlocation' });

                }, function() {
                    $ionicLoading.hide();
                })
            });


        }
        $scope.addLocation = function() {
            if ($scope.place && !$scope.place.withinArea) {
                $global.showToastMessage('Sorry, we are not serving in your location yet!', 'short', 'center');
                return false;
            }
            $scope.mapSetClickable(false);
            $scope.vm.customaddError = false;
            if (!$scope.place || !$scope.vm.formattedAddress) {
                $global.showToastMessage('Please Select Location');
                $scope.errorMessage = true;
                return false;
            }
            $ionicLoading.show();
            var address = $global.getAddressObj($scope.place);
            address.userId = $global.consumerId;
            address.userType = "CONSUMER";
            address.formattedAddress = ($scope.vm.customadd != '' && $scope.vm.customadd != undefined) ? $scope.vm.customadd + ', ' + $scope.vm.formattedAddress : $scope.vm.formattedAddress;
            profile.saveCosumerAddress(address).then(function(res) {
                    $ionicLoading.hide();
                    // $scope.data.addressId = res.data.address.addressId;
                    $state.go('main.myaccount', { from: 'addlocation' });

                }, function() {
                    $ionicLoading.hide();
                })
                /*getFormateAddress();
                return;*/
        };

        $scope.$on("$destroy", function() {
            map.remove();
            map.setDiv(null);
            document.getElementById("side-menu-left").style.display = "block";
            $scope.$emit('setHelp', { show: false, key: "location-help" });
        });
    });
