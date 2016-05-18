'use strict';
angular.module('main')
    .controller('ComplaintsCtrl', function($scope, Complaints, $global, $ionicLoading) {
        $scope.complaint = {};
        $ionicLoading.show();
        Complaints.complaintCategories().then(function(res) {
            if (res.status == "SUCCESS") {
                console.log(res.data.categoryList)
                $scope.categories = res.data.categories;

            }
            $ionicLoading.hide();
        },function(error){
            $ionicLoading.hide();
        });
        $scope.changeCategories = function(categorie) {
            if(categorie){
                Complaints.complaintsType(categorie.name).then(function(res) {
                    if (res.status && res.status == "SUCCESS") {
                        $scope.compaintType = res.data.types;

                    } else {
                        //growl.error("Complaint error");

                    }
                });
            }else{
                $scope.compaintType=null;
            }
        };
        $scope.vm = {};
        $scope.disableTap = function(drop) {
            var container = document.getElementsByClassName('pac-container');
            angular.element(container).attr('data-tap-disabled', 'true');
            angular.element(container).on("click", function() {
                if (drop) {
                    document.getElementById('dropautocomplete').blur();
                } else
                    document.getElementById('autocomplete').blur();
            });
        }
        $scope.complaintSubmit = function(form) {
            if(form.$valid){
                $ionicLoading.show();
                var complaint={};
                complaint.category=$scope.complaint.categorie.value;
                // complaint.type=$scope.complaint.type.value;
                complaint.description=$scope.complaint.description;
                // complaint.address=$scope.vm.formattedAddress;
                complaint.consumerId=$global.consumerId;
              Complaints.postComplaint(complaint).then(function(res) {
                if (res.status && res.status == "SUCCESS") {
                    $ionicLoading.hide();
                    $scope.complaintMessage=res.data.message;
                    $scope.complaintResData=res.data;
                } else {
                    $ionicLoading.hide();
                }
            });
            }
        };





    });
