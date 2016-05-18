'use strict';
angular.module('main')
    .controller('FbCtrl', function($scope,$state, Complaints, $filter,$timeout,$global) {
        $scope.item = {};
        Complaints.getPendingFeedBacks().then(function(res){
             if(res.status==$global.SUCCESS){
                var feedback=res.data.feedbacks;
               if(feedback.length>0){
                  $scope.feedback=feedback[0];
                  $scope.item.feedbackId=feedback[0].feedbackId;
                  $scope.feedback=feedback[0];
               }else{
                   $state.go("main.dashboard");
               }
             }
        })
        Complaints.getRatings().then(function(res) {
            $scope.ratings = res.data.ratingInfos;
        })
        $scope.$watch('item.rating', function(newValue, oldValue) {
            resetRatingTags(newValue);

        });

        function resetRatingTags(rating) {
          $scope.item.feedback=[];
            if (rating && $scope.ratings) {
                 $scope.rating = $filter('filter')($scope.ratings, {
                    rating: rating
                })[0];
                  $scope.ratingTags=$scope.rating.tags;
            }
        }

        $scope.submit=function(form){
          console.log(form);
          if(form.$valid){
              Complaints.submitFeedBack($scope.item).then(function(res){
                 if(res.status==$global.SUCCESS){
                    $scope.feedbackSuccess=res.data.message || "Thank you for your feedback";
                    $global.feedBackChecked=true;
                    $timeout(function(){
                       $state.go('main.dashboard');
                    },2000);
                 }
              })
            }
        }
        $scope.skip=function(){
          Complaints.skipFeedBack($scope.item.feedbackId).then(function(res){
            $global.feedBackChecked=true;
            $state.go('main.dashboard');
          })
        }
    });
