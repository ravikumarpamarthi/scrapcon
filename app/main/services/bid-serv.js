'use strict';
angular.module('main')
.factory('BidService', function ($global, httpService) { 
	return {
            placeBid: function(data) {
                var url = $global.getApiUrl() + $global.getApiObject().placeBid;
                var $request = httpService.httpRequest(url, "P", data);
                return $request;
            },
             getBidById: function(id) {
                var url = $global.getApiUrl() + $global.getApiObject().getBidById.replace(":id",id);
                var $request = httpService.httpRequest(url, "G");
                return $request;
            },
             getBids: function(params) {
             	var consumerId=$global.consumerId;
                params.consumerid=consumerId;
                var params="?"+$global.objToQueryString(params);
                var url = $global.getApiUrl() + $global.getApiObject().getBids+params;
                var $request = httpService.httpRequest(url, "G");
                return $request;
            }
        };
});
