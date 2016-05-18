'use strict';
angular.module('main')
    .directive('googleplace', function() {
        return {
            require: 'ngModel',
            scope: {
                ngModel: '=',
                details: '=',
                positions: '=',
                center: '=',

            },
            link: function(scope, element, attrs, model) {
                // var options = {
                //     types: [],
                //     componentRestrictions: {}
                // };
                scope.gPlace = new google.maps.places.Autocomplete(element[0]);

                google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                    scope.$apply(function() {
                        scope.details = scope.gPlace.getPlace();
                        model.$setViewValue(element.val());

                        var pos = [];
                          var  location = scope.details.geometry.location;
                            pos.push(location.lat());
                            pos.push(location.lng());
                        scope.positions = [{
                            pos: pos
                        }];
                        scope.center = pos;
                    });
                });
            }
        };
    });
