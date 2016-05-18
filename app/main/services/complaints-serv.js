'use strict';
angular.module('main')
    .factory('Complaints', function($global, httpService) {
        return {
        	complaintCategories: function() {
                var url = $global.getApiUrl() + $global.getApiObject().complaintsCategory;
                var $request = httpService.httpRequest(url, "G", "");
                return $request;
            },
            complaintsType: function(id) {
                var url = $global.getApiUrl() + $global.getApiObject().complaintsType.replace(":cid", id);
                var $request = httpService.httpRequest(url, "G", "");
                return $request;
            },
            postComplaint: function(data) {
                var url = $global.getApiUrl() + $global.getApiObject().postComplaint;
                var $request = httpService.httpRequest(url, "P", data);
                return $request;
            },
            getRatingTags: function(rating) {
                var url = $global.getApiUrl() + $global.getApiObject().getRatingTags.replace(":id", rating);
                var $request = httpService.httpRequest(url, "G");
                return $request;
            },
            getRatings: function(rating) {
                var url = $global.getApiUrl() + $global.getApiObject().getRatings;
                var $request = httpService.httpRequest(url, "G");
                return $request;
            },
            getPendingFeedBacks: function() {
                var cid=$global.consumerId;
                var url = $global.getApiUrl() + $global.getApiObject().getPendingFeedBacks.replace(":cid", cid);
                var $request = httpService.httpRequest(url, "G");
                return $request;
            },
            submitFeedBack: function(data) {
                var url = $global.getApiUrl() + $global.getApiObject().submitFeedBack;
                var $request = httpService.httpRequest(url, "P",data);
                return $request;
            },
            skipFeedBack:function(id){
                 var url = $global.getApiUrl() + $global.getApiObject().skipFeedBack.replace(":id", id);
                var $request = httpService.httpRequest(url, "P");
                return $request;
            }
            
        }

    });
