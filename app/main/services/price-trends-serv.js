'use strict';
angular.module('main')
.factory('PriceTrends', function ($global, httpService) {
   return {
            getPriceTrends: function() {
                var url = $global.getApiUrl() + $global.getApiObject().getPriceTrends;
                var $request = httpService.httpRequest(url, "G");
                return $request;
            }
        };

});
