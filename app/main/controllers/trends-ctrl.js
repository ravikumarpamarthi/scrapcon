'use strict';
angular.module('main')
    .controller('TrendsCtrl', function($global, $scope, PriceTrends, $ionicLoading) {
        $ionicLoading.show();
        PriceTrends.getPriceTrends().then(function(res) {
            if (res.status == $global.SUCCESS) {
                var priceTrends =$scope.priceTrends = res.data.priceTrends;
                var data=[];
                for (var i = priceTrends.length - 1; i >= 0; i--) {
                    var row={
                        "data":[],"labels":[],"series": "SeriesA",
                    };
                    row.name=priceTrends[i].name;var td=[]
                      for (var j = priceTrends[i].trend.length - 1; j >= 0; j--) {
                          
                         td.push(priceTrends[i].trend[j].value);
                         
                          row.labels.push(priceTrends[i].trend[j].name);
                      };
                      row.data.push(td)
                      data.push(row);
                };
                $scope.chartPriceTrends=data;
            } else {

            }
            $ionicLoading.hide();
        })

        $scope.getPriceTrendObj = function(trend, index) {
            var chart;
            if (index) {
                chart = "ColumnChart";
            } else {
                chart = "LineChart";
            }
            return $global.getPriceTrendObj(trend, chart);
        }
        $scope.getData=function(trend){
            var data=[];
            for (var i = trend.length - 1; i >= 0; i--) {
                data.push(trend[i].value);
            };
            console.log(data);
            var result=[data]
            return result;
        }
        $scope.getLabels=function(trend){
            var labels=[];
            for (var i = trend.length - 1; i >= 0; i--) {
                labels.push(trend[i].name);
            };
            return labels;
        }
        $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
        $scope.series = ['Series A'];
        $scope.data = [
            [28, 48, 40, 19, 86, 27, 90]
        ];
    });
