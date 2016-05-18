'use strict';
angular.module('main')
    .service('commonSevices', function($global, httpService) {
        return {
            getAbout: function() {
                var url = $global.getApiUrl() + $global.getApiObject().getAbout;
                var $request = httpService.httpRequest(url, "G");
                return $request;
            },
            getFaqs: function() {
                var url = $global.getApiUrl() + $global.getApiObject().getFaqs;
                var $request = httpService.httpRequest(url, "G");
                return $request;
            },
            getLocations: function() {
                console.log(globalLocations);
                // return globalLocations;
            },
            getReferral: function() {
                var consumerId = $global.consumerId;
                var url = $global.getApiUrl() + $global.getApiObject().getReferral.replace(":cid",consumerId);
                var $request = httpService.httpRequest(url, "G");
                return $request;
            },
            getOfferDetails: function() {
                var consumerId = $global.consumerId;
                var url = $global.getApiUrl() + $global.getApiObject().getOfferDetails.replace(":cid",consumerId);
                var $request = httpService.httpRequest(url, "G");
                return $request;
            },
            getOffercount: function() {
                var consumerId = $global.consumerId;
                var url = $global.getApiUrl() + $global.getApiObject().getOffercount.replace(":cid",consumerId);
                var $request = httpService.httpRequest(url, "G");
                return $request;
            }
        };

    });
