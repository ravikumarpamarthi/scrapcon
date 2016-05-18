'use strict';
angular.module('main')
.controller('Bid-confirmationCtrl', function ($scope,$stateParams,BidService,$global,$ionicLoading) {
   var id = $stateParams.id;
   $global.removeSellRequest();
   BidService.getBidById(id).then(function(res){
   		if(res.status==$global.SUCCESS){
   			$ionicLoading.hide();
   			$scope.bidDetails=res.data;
   		}
       
   })
});
