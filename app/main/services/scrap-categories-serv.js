'use strict';
angular.module('main')
.factory('ScrapCategories', function ($global, httpService) {
      return {
            
            getCategories: function() {
                var consumerId=$global.consumerId;
                var url = $global.getApiUrl() + $global.getApiObject().ScrapCategories;
                var $request = httpService.httpRequest(url, "G");
                return $request;
            }
        };
});
