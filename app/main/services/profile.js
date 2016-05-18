'use strict';


angular.module('main')
    .factory('profile', function($global, httpService) { return {
            updateProfile: function(data) {
                var url = $global.getApiUrl() + $global.getApiObject().updateProfile;
                var $request = httpService.httpRequest(url, "P", data);
                return $request;
            },
            userCategories: function(data) {
                var url = $global.getApiUrl() + $global.getApiObject().consumerCategories;
                var $request = httpService.httpRequest(url, "G");
                return $request;
            },
            getProfile: function() {
                var consumerId=$global.consumerId;
                var url = $global.getApiUrl() + $global.getApiObject().getProfile.replace(":cid",consumerId);
                var $request = httpService.httpRequest(url, "G");
                return $request;
            },
            saveCosumerAddress: function(data) {
                var consumerId=$global.consumerId;
                var url = $global.getApiUrl() + $global.getApiObject().saveAddress;
                var $request = httpService.httpRequest(url, "P",data);
                return $request;
            },
            setDefaultAdd: function(id) {
                var url = $global.getApiUrl() + $global.getApiObject().setDefault.replace(":id",id);
                var $request = httpService.httpRequest(url, "P");
                return $request;
            },
            getAddress:function(id){
                var consumerId=$global.consumerId;
                var url = $global.getApiUrl() + $global.getApiObject().getAddress+"?userid="+consumerId;
                var $request = httpService.httpRequest(url, "G");
                return $request;
            },
            deleteAddres:function(id){
                var url = $global.getApiUrl() + $global.getApiObject().deleteAddress.replace(":id",id);
                var $request = httpService.httpRequest(url, "P");
                return $request;
            },
            forgotPassword:function(usertext){
                var url = $global.getApiUrl() + $global.getApiObject().forgotpassword.replace(":usertext",usertext);
                var $request = httpService.httpRequest(url, "P");
                return $request;
            },
            changePwd: function(data) {

                var consumerId=$global.consumerId;
                data.userId = consumerId;
                var url = $global.getApiUrl() + $global.getApiObject().resetPwd;
                var $request = httpService.httpRequest(url, "P",data);
                return $request;
            },
        };
});