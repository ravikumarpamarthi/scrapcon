'use strict';
angular.module('main')
    .controller('SellNowCtrl', function($scope, $global, NgMap, SellNow, $moment, profile, $state, $timeout, $ionicLoading, $ionicScrollDelegate) {
       
        $scope.maps = [];
        $scope.$on('mapInitialized', function(evt, evtMap) {
            $scope.maps.push(evtMap);
        });

        $scope.paymentModes=$global.paymentModes;
        $scope.reRednerMap = function() {
            $timeout(function() {
                angular.forEach($scope.maps, function(map) {
                    var currCenter = map.getCenter();
                    google.maps.event.trigger(map, 'resize');
                    map.setCenter(currCenter);
                });
            }, 500);
        }
        $scope.reInitDrop=function(){
            NgMap.getMap({id:'drop'}).then(function(evtMap) {
                // google.maps.event.trigger(evtMap, 'resize');
                evtMap.setZoom(15);
            });
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
        var sellRequestObj = $global.getSellRequest();
        if (!sellRequestObj) {
            $state.go("main.dashboard");
            return;
        };
        SellNow.getSlots().then(function(res) {
            $scope.slots = res.data.presentDaySlots;
            for (var i = $scope.slots.length - 1; i >= 0; i--) {
                 if($scope.slots[i].status!="Disabled"){
                    $scope.data.preferredSlot = $scope.slots[i].slotId;
                    break;
                 }
            };

            
        })
        profile.getAddress().then(function(res) {
            $scope.locations = res.data.addresses;
            if ($scope.locations[0] && $scope.locations[0].defaultAddress == 'YES') {
                $scope.selectedItem = $scope.locations[0];
                $scope.setMap($scope.selectedItem);
                $scope.reRednerMap();
            } else {
                $scope.center = "current-position";
            }
            $scope.init=true;
            $ionicLoading.hide();
        },function(err){
            $ionicLoading.hide();
        });
        $scope.data = {
            "consumerId": $global.consumerId,
            "preferredPaymentMethod": $global.paymentModes[0].value,
            "items": []
        };
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


        $scope.data.preferredDate = $moment().format('DD-MMM-YYYY');
        $scope.drop = {};

        function getAgents(obj) {
            $scope.drop = {};
            $ionicLoading.show();
            SellNow.getAgents(obj.lat, obj.lng).then(function(res) {
                if (res.status == $global.SUCCESS) {
                    $scope.agents = res.data.addresses;
                }
                $ionicLoading.hide();
                $scope.reRednerMap();
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
        $scope.getAgents=function(location){
            if (location) {
                var obj = {};
                obj.lat = location.latitude;
                obj.lng = location.longitude;
                getAgents(obj);
            }
        }
        $scope.setAgents=function(){
           if($scope.place){
              var latlng= $global.getLatlngByGeolocation($scope.place);
               getAgents(latlng);
           }else if($scope.selectedItem){
             $scope.getAgents($scope.selectedItem)
           }
        }
        
        $scope.setMap = function(location, drop) {
            if (location) {
                $scope.place='';
                $scope.vm={}
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
        $scope.scrollToBottom = function(){
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
       $scope.newlocation=false;
       $scope.managePlaceObject=function(newlocation,drop){
        if(newlocation==false){
         $scope.place = '';
         $scope.vm={};
         $scope.setMap($scope.selectedItem,drop);
        }else{
            $scope.data.consumerAddressId=null;
            $scope.setCurrentLocation(drop);
        }
         
       }

        $scope.setCurrentLocation = function(drop) {
            $global.getCurrentLocation().then(function(latlng) {
                $scope.center = latlng.lat + "," + latlng.lng;
                $scope.reRednerMap();
                setPlaceObject(latlng)
                if(drop){
                    getAgents(latlng);
                }
            })
        }
        $scope.markerDragEnd = function(event,drop) {
            $timeout(function() {
                var latlng = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                };
                setPlaceObject(latlng);
                $scope.center = latlng.lat + "," + latlng.lng;
                if(drop){
                    getAgents(latlng);
                }
            });
            $scope.newlocation=true;
        }

    });
