'use strict';
angular.module('main')
    .controller('NgmapCtrl', function($scope, $state, $global, SellNow, profile, NgMap, $ionicLoading, $timeout, $cordovaGeolocation) {


        $scope.data = [];
        $scope.positions = [];
        var location = {};
        var map;
        NgMap.getMap().then(function(evtMap) {
            map = evtMap;
        });
        $ionicLoading.show();

        function setPlaceObject(latlng) {
            $global.getLocationByLatLng(latlng).then(function(res) {
                $scope.place = res;
                $scope.vm.formattedAddress = res.formatted_address;

            })
        }

        function reRednerMap() {
            $timeout(function() {
                if(!map)
                    return;
                // var currCenter = map.getCenter();
                google.maps.event.trigger(map, 'resize');
                // map.setCenter(currCenter);
            }, 500);
        }
        $scope.setCurrentLocation = function() {
            $global.getCurrentLocation().then(function(latlng) {
                $scope.center = latlng.lat + "," + latlng.lng;
                reRednerMap();
                setPlaceObject(latlng);
                $ionicLoading.hide();
            },function(err){
                $ionicLoading.hide();
            })
        }
        $scope.setCurrentLocation();
        $scope.disableTap = function() {
            var container = document.getElementsByClassName('pac-container');
            angular.element(container).attr('data-tap-disabled', 'true');
            angular.element(container).on("click", function() {
                document.getElementById('autocomplete').blur();
            });
        }

        $scope.placeChanged = function() {
            $scope.place = this.getPlace();
            var obj = {};
            obj.lat = $scope.place.geometry.location.lat();
            obj.lng = $scope.place.geometry.location.lng();
            $scope.setLocation(obj);
        }
        $scope.center="current-location";
        $scope.setLocation = function(obj) {
            var center = [];
            center.push(obj.lat);
            center.push(obj.lng);
            $scope.center = center.join();
        }
        $scope.vm = {};
        $scope.addLocation = function() {
            if(!$scope.place || !$scope.vm.formattedAddress ){
                $scope.errorMessage=true;
                return;
            }
            $ionicLoading.show();
            var address = $global.getAddressObj($scope.place);
            address.userId = $global.consumerId;
            address.userType = "CONSUMER";
            address.formattedAddress = $scope.vm.formattedAddress;
            profile.saveCosumerAddress(address).then(function(res) {
                $ionicLoading.hide();
                $scope.data.addressId = res.data.address.addressId;

            })
            $state.go('main.myaccount');
        };
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
