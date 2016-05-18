'use strict';
angular.module('main')
    .controller('BookAppointmentConfirmCtrl', function($scope,SellNow,$stateParams,$timeout,$ionicLoading,$global) {
      
        $ionicLoading.show();  
        
      var id=$stateParams.id;
      SellNow.getSellById(id).then(function(res){
        $ionicLoading.show();
        if(res.status=="SUCCESS"){
          $ionicLoading.hide();
           $scope.sellDetails=res.data.sell;
           var obj={};
           obj.lat=$scope.sellDetails.address.latitude;
           obj.lng=$scope.sellDetails.address.longitude;
           $scope.setLocation(obj);
        }
        $timeout(function(){
            $ionicLoading.hide();
        },500);
      })
        $scope.setLocation = function(obj) {
            var center = [];
            center.push(obj.lat);
            center.push(obj.lng);
            $scope.center = center;
            $scope.positions = [{
                pos: center
            }];
        };


    });
