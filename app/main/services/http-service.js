'use strict';
angular.module('main')
    .factory('httpService', function($http, $q, $global, $ionicLoading, $log) {
        function setToastMessage(res) {
            $global.showToastMessage(res.error.message, 'short', 'center');
        }
        return {
            httpJsonp: function(url) {
                if ($global.debugmode == true) {
                    $log.log('Executing Get Method Url' + url);
                }
                var deffered = $q.defer();
                $http.jsonp(url, {
                        headers: $global.getAuthorization()
                    })
                    .success(function(data) {
                        if ($global.debugmode == true) {
                            $log.log('Success Result of' + url + '=' + JSON.stringify(data));
                        }
                        deffered.resolve(data);
                    }).error(function(error) {
                        if ($global.debugmode == true) {
                            $log.log('Error Result of' + url + '=' + JSON.stringify(error));
                        }
                        deffered.reject(error);
                    });
                return deffered.promise;
            },
            httpLogin: function(url, header) {
                var deffered = $q.defer();
                $http.post(url, "", {
                    headers: header
                }).success(function(res) {
                    if (res.error && res.error.code && res.error.code == "EC_INVALID_APITOKEN") {
                        $global.invalidApiToken();
                        deffered.reject(res);
                    } else {
                        if (res.error && res.error.message) {
                            setToastMessage(res)
                        }
                        deffered.resolve(res);
                    }
                }, {
                    'Content-Type': 'application/json;charset=UTF-8'
                }).error(function(error) {
                    $ionicLoading.hide();
                    $global.setBadRequest();
                    deffered.reject(error);
                });
                return deffered.promise;
            },
            httpRequest: function(url, method, data) {
                var deffered = $q.defer();

                if (method == 'P') {
                    if ($global.debugmode == true) {
                    $log.log('Post Method Executing method' + url + "/data=" + JSON.stringify(data));
                }
                    $http.post(url, data, {
                        headers: $global.getAuthorization()
                    }).success(function(res) {
                        if ($global.debugmode == true) {
                            $log.log('Post Method Success Result of' + url + '=' + JSON.stringify(res));
                        }
                        if (res.error && res.error.code && res.error.code == "EC_INVALID_APITOKEN") {
                            $global.invalidApiToken();
                            deffered.reject(res);
                        } else {
                            if (res.error && res.error.message) {
                                setToastMessage(res)
                            }
                            deffered.resolve(res);
                        }
                    }).error(function(error) {
                        if ($global.debugmode == true) {
                            $log.log('Post Method  error Result of' + url + '=' + JSON.stringify(error));
                        }
                        $ionicLoading.hide();
                        $global.setBadRequest();
                        deffered.reject(error);;
                    });

                }
                if (method == 'PU') {
                    $http.put(url, data, {
                        headers: $global.getAuthorization()
                    }).success(function(res) {
                        if (res.error && res.error.code && res.error.code == "EC_INVALID_APITOKEN") {
                            $global.invalidApiToken();
                            deffered.reject(res);
                        } else {
                            if (res.error && res.error.message) {
                                setToastMessage(res)
                            }
                            deffered.resolve(res);
                        }
                    }).error(function(error) {
                        $ionicLoading.hide();
                        $global.setBadRequest();
                        deffered.reject(error);
                    });
                }
                if (method == 'G') {
                    if ($global.debugmode == true) {
                        $log.log('Get Method Executing method' + url);
                    }
                    $http.get(url, {
                        headers: $global.getAuthorization()
                    }).success(function(res) {
                        if ($global.debugmode == true) {
                            $log.log('Get Method  Success Result of' + url + '=' + JSON.stringify(res));
                        }
                        if (res.error && res.error.code && res.error.code == "EC_INVALID_APITOKEN") {
                            $global.invalidApiToken();
                            deffered.reject(res);
                        } else {
                            if (res.error && res.error.message) {
                                setToastMessage(res)
                            }
                            deffered.resolve(res);
                        }
                    }).error(function(error) {
                        $ionicLoading.hide();
                        $global.setBadRequest();
                        deffered.reject(error);
                    });
                }
                if (method == 'D') {
                    $http.delete(url, {
                        headers: $global.getAuthorization()
                    }).success(function(res) {
                        if (res.error && res.error.code && res.error.code == "EC_INVALID_APITOKEN") {
                            $global.invalidApiToken();
                            deffered.reject(res);
                        } else {
                            if (res.error && res.error.message) {
                                setToastMessage(res)
                            }
                            deffered.resolve(res);
                        }
                    }).error(function(error) {
                        if ($global.debugmode == true) {
                            $log.log('Error Result of' + url + '=' + JSON.stringify(error));
                        }
                        $ionicLoading.hide();
                        $global.setBadRequest();
                        deffered.reject(error);
                    });
                }
                return deffered.promise;
            }

        };
    });
