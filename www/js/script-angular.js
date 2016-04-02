/*
    Outstanding: 
    
    - Make responsive, get window dimensions to set canvas on init
    - Provide smooth transition on new data entering the graph
    - Prettify the dom with CSS and nice buttons.
    - Expose and position the stats as the graph updates.
*/

(function(angular) {
    'use strict';
    var beanApp = angular.module('beanApp', [])

    .controller('MainCtrl', ['$scope', function($scope) {}])
    /* 
        graphCtrl, keep it slim! 
    */
    .controller('graphCtrl', ['$scope', 'graphRenderer', 'graphData', '$window', function($scope, graphRenderer, graphData, $window) {
        graphRenderer.init(graphData);
        $scope.graph = graphRenderer;

        var graphContainer = angular.element(document.querySelector('#graph-container'));
        $scope.w = angular.element($window);
        $scope.$watch(
            function () {
            	/*
            	var width = graphContainer[0].offsetWidth;
            	var height = graphContainer[0].offsetHeight; */
            	/*
            	if(width < height){
            		console.log("width is less than height");
            		height = (width / 100) * 60;
            		console.log(height);
            	}else{
            		console.log("width more or equal to height");
            		height = 500;
            		console.log(height);
            	};*/
            	/*
            	graphRenderer.updateGraph({
            		'height' : height,
            		'width' : width
            	});*/
            	
            }
        );
        $scope.w.bind('resize', function(){
            $scope.$apply();
            $scope.$digest();
        });
        
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
        settings = {
            poleMin: 60,
            poleMax: 240,
            rangeMin: 1,
            rangeMax: 200
        };
        var data = [20, 30, 50, 46, 36, 20, 21, 35, 67, 89, 90, 26, 78, 46];

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        function getData(){
            if(currentInterval == randomInterval){
                randomInterval = getRandomInt(settings.poleMin, settings.poleMax);
                randomValue = getRandomInt(settings.rangeMin, settings.rangeMax);
                data.push(randomValue);
                data.shift();
                currentInterval = 0;
            }else{
               currentInterval++; 
            }
            return data;
        };

        function init(){
            return {
                getData : function(){
                    return getData();
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
            canvas, context, active = false, dataObject, graphContainer;

        function setCanvas(){
            canvas = document.getElementById("mycanvas");
            context = canvas.getContext("2d");
            /*graphContainer = document.getElementById("graph-container");*/
            var graphContainer = angular.element(document.querySelector('#graph-container'));
            canvas.width = graphContainer[0].offsetWidth;
            canvas.height = graphContainer[0].offsetHeight;
            //canvas.width = graphContainer.clientWidth;
            //canvas.height = graphContainer.clientHeight;*/
        };

        function clear() {
            context.clearRect(0, 0, canvas.width, canvas.height);
        };

        function Animate(){
            if (active) {    
                requestAnimationFrame(function () {
                    clear();
                    drawGraph(dataObject.getData());
                    Animate();
                });
            }
        };

        function drawGraph(data){
            var points = getPoints(data);
            var len = points.x.length;
            context.beginPath();
            for(var i = 0; i < len; i++){
                context.lineTo(points.x[i], points.y[i]);
            }
            //context.strokeStyle="red";
            context.stroke();            
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

        function updateGraphDimensions(newDimensions){
        	canvas.height = newDimensions.height;
        	canvas.width = newDimensions.width;
        };

        /* 
            The functions returned provide an interface 
            for the graph directive.
        */
        return {
            init: function(graphData) {
                dataObject = graphData;
                setCanvas();
            },
            stop: function(){
                active = false;
            },
            start: function(){
                active = true;
                Animate();
            },
            reset: function(){
                setCanvas();
            },
            isActive: function(){
                return active;
            },
            updateGraph: function(newDimensions){
            	updateGraphDimensions(newDimensions);
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