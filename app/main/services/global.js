'use strict';
angular.module('main').service('$global', function(envService, localStorageService, $cordovaToast, $http, $q, $base64, $rootScope, $cordovaGeolocation, $ionicLoading) {
        this.defaultTimeout = 30000000;
        this.SUCCESS = "SUCCESS";
        this.backExit = false;
        this.FAILURE = "FAILURE";
        this.ERR_CONNECTION_REFUSED = "Unable to connect server";
        this.feedBackChecked = false;
        this.debugmode = envService.read("debugmode");
        this.setSellRequest = function(obj) {
            this.setLocalItem("sellReuestItems", obj, true);
            // this.sellRequestObj=obj;
        }
        this.setBadRequest = function() {
            $rootScope.$emit('badRequest', "ok");
        }
        this.invalidApiToken = function() {
            $rootScope.$emit('invalidApiToken', "ok");
        }

        this.setWalkThroughInvisible=function(key){
           this.setLocalItem(key, true);
        }
        this.showToastMessage = function(msg, duration, position) {
            duration = typeof duration !== 'undefined' ? duration : 'short';
            position = typeof position !== 'undefined' ? position : 'center';
            $cordovaToast.show(msg, duration, position);
        }
        this.paymentModes = [{
            name: "Cash",
            value: "Cash"
        }];
        this.recurringOptions = [{
            name: "Daily",
            value: "DAILY"
        },
        {
            name: "Weekly",
            value: "WEEKLY"
        },
        {
            name: "Monthly",
            value: "MONTHLY"
        }];
        this.getSellRequest = function() {
            var sellReuestItems = this.getLocalItem("sellReuestItems", true);
            return sellReuestItems;
        }
        this.removeSellRequest = function() {
            this.removeLocalItem("sellReuestItems");
        }
        this.init = function() {
            this.apiToken = "";
            this.authentication = null;
            this.consumerId = null;
            var data = this.getLocalItem("authentication", true);
            if (data) {
                this.authentication = data.data;
                this.apiToken = data.data.apiToken;
                this.consumerId = data.data.userId;
            }
        }
        this.objToQueryString = function(obj) {
            var k = Object.keys(obj);
            var s = "";
            for (var i = 0; i < k.length; i++) {
                s += k[i] + "=" + encodeURIComponent(obj[k[i]]);
                if (i != k.length - 1) s += "&";
            }
            return s;
        };

        this.apiUrl = envService.read("apiUrl");
        this.restApi = envService.read("restApi");

        this.setLanguage = function(lng) {
            localStorageService.set("lng", lng);
            this.translate();
        }
        this.setLocalItem = function(key, value, encoded) {
            value = JSON.stringify(value);
            if (encoded) {
                value = $base64.encode(value)
            }
            localStorageService.set(key, value);
        }
        this.removeLocalItem = function(key) {
            localStorageService.remove(key);
        }
        this.getLocalItem = function(key, decoded) {
            var value = localStorageService.get(key);
            value = (value) ? JSON.parse((decoded) ? $base64.decode(value) : value) : null;
            return value;
        }
        this.getLanguage = function() {
            localStorageService.get("lng");
        }

        this.getAuthorization = function() {
            var authorization = {
                'Authorization': 'Basic' + this.apiToken,
                'Client-Type': 'MOBILE',
                'App-Id': 'CONSUMER'
            }
            return authorization;
        }
        this.getLoginAuthorization = function(val) {
            val = $base64.encode(val);
            var authorization = {
                'Authorization': 'Basic' + val,
                'Client-Type': 'MOBILE',
                'App-Id': 'CONSUMER'
            }
            return authorization;
        }
        this.getApiUrl = function() {
            return this.apiUrl;
        }
        this.getApiObject = function() {
            return this.restApi;
        }
        this.getLatlngByGeolocation = function(geolocation) {
            var obj = {};
            var geometry = geolocation.geometry;
            obj.lat = geometry.location.lat();
            obj.lng = geometry.location.lng();

            return obj;
        }
        this.getAddressObj = function(geolocation, latLng) {
            var address = {};
            var geometry = geolocation.geometry;
            /*address.latitude = geometry.location.lat();
            address.longitude = geometry.location.lng();*/
            address.latitude = geolocation.maplatlnt.lat;
            address.longitude = geolocation.maplatlnt.lng;
            for (var i = geolocation.address_components.length - 1; i >= 0; i--) {
                if (geolocation.address_components[i].types[0] == "locality") {
                    address.locality = geolocation.address_components[i].long_name;
                }
                if (geolocation.address_components[i].types[0] == "administrative_area_level_1") {
                    address.state = geolocation.address_components[i].long_name;
                }
                if (geolocation.address_components[i].types[0] == "country") {
                    address.country = geolocation.address_components[i].long_name;
                }
                if (geolocation.address_components[i].types[0] == "postal_code") {
                    address.postalCode = geolocation.address_components[i].long_name;
                }
            };

            return address;
        }
        this.getLocationByLatLng = function(latlng) {
            var deffered = $q.defer();
            var geocoder = new google.maps.Geocoder;
            geocoder.geocode({
                'location': latlng
            }, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    deffered.resolve(results[0]);
                } else {
                    deffered.reject("unable to find location");
                }
            });
            return deffered.promise;
        }
        this.getGeocode = function(latLng) {
            var deffered = $q.defer();
            var geocoder = new google.maps.Geocoder;
            geocoder.geocode({
                'location': latLng
            }, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    results[0].maplatlnt = latLng;
                    /*withinArea Code*/

                    results[0].withinArea = false; //true if no need to restrict area
                    var administrativeAreaLevel2 = globalLocations;
                    for (var i = results[0].address_components.length - 1; i >= 0; i--) {
                        if (results[0].address_components[i].types[0] == "administrative_area_level_2" && administrativeAreaLevel2.indexOf(results[0].address_components[i].long_name) != -1) {
                            results[0].withinArea = true;
                            break;
                        }
                    };
                    /*withinArea Code end*/


                    deffered.resolve(results[0]);
                } else {
                    deffered.reject("unable to find location");
                }
            });
            return deffered.promise;
        }

        this.formateGeoCode = function(position) {
            var address = {};
            address.latitude = position[0].position.lat;
            address.longitude = position[0].position.lng;
            for (var i = position.length - 1; i >= 0; i--) {
                if (geolocation.address_components[i].types[0] == "locality") {
                    address.locality = geolocation.address_components[i].long_name;
                }
                if (geolocation.address_components[i].types[0] == "administrative_area_level_1") {
                    address.state = geolocation.address_components[i].long_name;
                }
                if (geolocation.address_components[i].types[0] == "country") {
                    address.country = geolocation.address_components[i].long_name;
                }
                if (geolocation.address_components[i].types[0] == "postal_code") {
                    address.postalCode = geolocation.address_components[i].long_name;
                }
            };
        }

        /*this.getCurrentLocation = function() {
            var deffered = $q.defer();
            var posOptions = {
                timeout: 5000,
                enableHighAccuracy: true
            };
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function(position) {
                    var latlng = {
                        "lat": position.coords.latitude,
                        "lng": position.coords.longitude
                    }
                    deffered.resolve(latlng);
                },function(error) {
                    deffered.reject(error);
                    $ionicLoading.hide();
                    $rootScope.$emit('badGps','ok');
                });
            return deffered.promise;
        }*/
        this.getCurrentLocation = function() {
            var deffered = $q.defer();
            var options = {
                timeout: 10000,
                enableHighAccuracy: true
            };
            navigator.geolocation.getCurrentPosition(function(position) {
                var latlng = {
                    "lat": position.coords.latitude,
                    "lng": position.coords.longitude
                }
                deffered.resolve(latlng);
            }, function(error) {
                $ionicLoading.hide();
                // $rootScope.$emit('badGps', 'ok');
                $cordovaToast.show('Unable get current location. Please type your location', 'short', 'center');
                deffered.reject(error);
            }, options);
            return deffered.promise;
        }

        this.init();
        $rootScope.getImageFileById = this.getApiUrl() + this.getApiObject().getImageFileById;

    });
