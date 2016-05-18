'use strict';
angular.module('main')
    .controller('DefaultCtrl', function($scope, commonSevices, $global, $ionicLoading, $timeout, $ionicSlideBoxDelegate) {

		
		    	
        $scope.next = function() {
            $ionicSlideBoxDelegate.next();
        };
        $scope.previous = function() {
            $ionicSlideBoxDelegate.previous();
        };


        $scope.slides = [{ name: "slide1.jpeg" },
                         { name: "slide2.jpeg" },
                         { name: "slide3.jpeg" },
                         { name: "slide4.jpeg" },
                         { name: "slide5.jpeg" },
                         { name: "slide6.jpeg" }];        

        
        // Called each time the slide changes
        $scope.slideChanged = function(index) {
            $scope.slideIndex = index;
        };
    });