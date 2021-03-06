﻿/*
    Outstanding: 

    - Expose and position the stats as the graph updates.
        - Expose 'previous duration'

    - Colour of stroke, hues, button and h1 (blue)?

    - Refactor 

    - inc with portfolio

*/
(function(angular) {
    'use strict';
    var beanApp = angular.module('beanApp', [])

    .controller('MainCtrl', ['$scope', function($scope) {}])
    /* 
        graphCtrl, keep it slim! 
    */
    .controller('graphCtrl', ['$scope', 'graphRenderer', 'graphData', '$window', function($scope, graphRenderer, graphData, $window) {
        graphRenderer.init(graphData, $scope, $window);
        $scope.graph = graphRenderer;
    }]);
    /* 
        graphData acts as a real-time data feed, it returns a predefined array, 
        that appends a new random value (within a fixed range) at a random 
        interval (within a fixed range) while maintaining the original length.

        In a live system, this factory would poll an API at a set interval.

    */
    beanApp.factory('graphData', function(){
        var currentInterval = 0,
        randomInterval = 0,
        randomValue,
        existingData,
        timeElapsed = 0,
        startTime,
        poled = false,
        settings = {
            poleMin: 30,
            poleMax: 320,
            rangeMin: 1,
            rangeMax: 200,
            points:14
        },
        data = defaultData();
        
        function defaultData(){
            var randomArray = [];
            for(var i = 0; i < settings.points; i++){
                randomArray.push(
                    getRandomInt(settings.rangeMin, settings.rangeMax)
                );
            };
            return randomArray;
        };

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        function returnData(){
            randomInterval = getRandomInt(settings.poleMin, settings.poleMax);
            randomValue = getRandomInt(settings.rangeMin, settings.rangeMax);
            data.push(randomValue);
            data.shift();
            currentInterval = 0;
            existingData = data;
            timeElapsed = 0;
            startTime - Date.now();
        };

        function init(){
            return {
                getData : function(reset){
                    if(currentInterval == randomInterval || reset){
                        poled = true;
                        returnData();
                    }else{
                       currentInterval++; 
                       poled = false;
                    }
                    return data;
                },
                resetData : function(){
                    data = defaultData();
                },
                getExistingData : function(){
                    return existingData;
                },
                getTimeElapsed : function(){
                    timeElapsed = Date.now() - startTime;
                    return timeElapsed;
                },
                getPoled : function(){
                    return poled;
                }
            };
        };       
        return init();
    });
    /*
        graphRenderer provides an interface for the graph directive to action 
        graph functions. It handles the logic for manipulating the canvas, 
        maintains its own state, calculates position values, plots and updates
        the canvas with the graph data within an (requestAnimationFrame) animation loop. 
    */
    beanApp.factory('graphRenderer', function(){

        var requestAnimationFrame = window.requestAnimationFrame,
            canvas, context, active = false, dataObject, graphContainer, 
            scope, Window, resetValue = false, timeElapsed = 0 , lastTime = 0, runningTime = 0, oldPoints;

        function setCanvas($scope, $window){
            scope = $scope;
            Window = $window;
            canvas = document.getElementById("mycanvas");
            context = canvas.getContext("2d");
            graphContainer = angular.element(document.querySelector('#graph-container'));
            $scope.w = angular.element($window);
            $scope.$watch(
                function () {
                    canvas.width = graphContainer[0].clientWidth;
                    canvas.height = graphContainer[0].clientHeight; 
                    drawGraph();
                }
            );
            $scope.w.bind('resize', function(){
                $scope.$apply();
                $scope.$digest();
            });
        };

        function clear() {
            context.clearRect(0, 0, canvas.width, canvas.height);
        };

        function Animate(elapsed){
            runningTime = elapsed;
            if (active) {  
                requestAnimationFrame(function(elapsed){
                    clear();
                    drawGraph(elapsed);
                    Animate(elapsed);
                });
            }
        };

        function drawGraph(elapsed){
            var points;
            if(resetValue == true){
                points = getPoints(dataObject.getData(resetValue));
                Window.cancelAnimationFrame(elapsed);
                timeElapsed = 0; elapsed ? lastTime = elapsed : lastTime = 0;
            }else if(dataObject.getExistingData() && (active == false)){
                points = getPoints(dataObject.getExistingData());
                timeElapsed = 0; elapsed ? lastTime = elapsed : lastTime = 0;
            }else{
                points = getPoints(dataObject.getData());
                if(dataObject.getPoled() === true){
                    timeElapsed = 0; lastTime = elapsed;
                }else{
                    timeElapsed = round_number(((elapsed - lastTime) / 1000), 2);
                }
            }
            var len = points.x.length;
            context.beginPath();
            for(var i = 0; i < len; i++){
                context.lineTo(points.x[i], points.y[i]);
            }
            oldPoints = points;
            context.strokeStyle="red";
            context.stroke(); 
            resetValue = false;  
            setStats(elapsed);   
        };
        /* 
            interpolate the graph data against the canvas dimensions, 
            within the range defined by the lowest and highest values 
            in the graph data array, and return corresponding x / y 
            position values. 
        */    
        function getPoints(data){
            var x = [],
                y = [],
                count = 0,
                len = data.length,
                lowest = getLowestValue(data),
                rangeY = getHeighestValue(data) - lowest,
                rangeX = len-1,
                incrementY = canvas.height / rangeY,
                incrementX = Math.floor(canvas.width / rangeX);
            for(var i=0; i<len;i++){
                y.push(canvas.height - (data[i] - lowest) * incrementY);
            }   
            x.push(count);
            for(var i = 0; i < rangeX; i++){
                count += incrementX;
                x.push(count);
            };
            return {
                x : x,
                y : y
            }
        };

        function getHeighestValue(values){
            return Math.max.apply(null, values);
        };

        function getLowestValue(values){
            return Math.min.apply(null, values);
        };

        function round_number(num, dec) {
            return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
        };

        function setStats(elapsed){
            elapsed = round_number((elapsed / 1000), 2);
            var existingData = dataObject.getExistingData();
            var currentValue = existingData[existingData.length -1];
            var previousValue = existingData[existingData.length -2];
            var diffValue = difference(currentValue, previousValue);
            var cElement = angular.element(document.querySelector('#current-value'));
            var pElement = angular.element(document.querySelector('#previous-value'));
            var dElement = angular.element(document.querySelector('#diff-value'));
            var tElement = angular.element(document.querySelector('#time-elapsed'));
            cElement.text(currentValue); 
            pElement.text(previousValue); 
            dElement.text(diffValue);
            tElement.text(timeElapsed);
        };

        function getTimeElapsed(){

        };

        function difference(a, b){
            return (a > b)? a-b : b-a;
        }
        /* 
            The functions returned provide an interface 
            for the graph directive.
        */
        return {
            init: function(graphData, $scope, $window) {
                dataObject = graphData;
                setCanvas($scope, $window);
            },
            stop: function(){
                active = false;
                lastTime = runningTime;
            },
            start: function(){
                active = true;
                Animate();
            },
            reset: function(){
                dataObject.resetData();
                clear();
                resetValue = true;
                setCanvas(scope, Window);
            },
            isActive: function(){
                return active;
            },
            getTimeElapsed: function(){
                return timeElapsed;
            }
        };
    });    
 
    /* Declare the graph directive as Element type */
    beanApp.directive('graph', function() {    
        return {
            restrict: 'E',
            templateUrl: 'views/canvas.html'
        }
    });

})(window.angular);