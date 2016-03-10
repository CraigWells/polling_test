// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());


(function(angular) {
    'use strict';
    var beanApp = angular.module('beanApp', [])

    .controller('MainCtrl', ['$scope', function($scope) {}])

    .controller('graphCtrl', ['$scope', 'graphRenderer', 'graphData', function($scope, graphRenderer, graphData) {
        graphRenderer.init(graphData);
        $scope.graph = graphRenderer;
    }]);

    beanApp.factory('graphData', function(){
        // just returns a static array of integers 
        var count = 0;
        var data = [20, 30, 50, 46, 36, 20, 21, 35, 67, 89, 90, 26, 78, 46];

        function getData(){
            if(count > 0){
                data.push(data[0]+2);
            }
            count++;
            console.log(data);
        }

        function init(){
            return {
                getData : getData
            };
        };       
        return init();
    });

    beanApp.factory('graphRenderer', function(){

        var requestAnimationFrame = window.requestAnimationFrame;
        var canvas, context, lineDefaults, active = false, dataObject;

        function init(graphData) {
            dataObject = graphData;
            setCanvas();
            lineDefaults = getDefaults();
        }

        function setCanvas(){
            canvas = document.getElementById("mycanvas");
            context = canvas.getContext("2d");
            canvas.width = 1000;
            canvas.height = 500;
        }

        function getDefaults(){
            return {
                startPos: {
                    x: 1000,
                    y: 300
                },
                endPos: {
                    x: 900,
                    y: 100
                },
                count:0,
                end:900
            }
        };

        function clear() {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }

        function Animate(){
            dataObject.getData();
            if ((lineDefaults.count < lineDefaults.end) && active) {
                requestAnimationFrame(function () {
                    clear();
                    drawline();
                    updatePositions();
                    lineDefaults.count++;
                    Animate();
                });
            }
        };

        function updatePositions(){
            lineDefaults.startPos.x -= 1;
            lineDefaults.endPos.x -= 1;
        }

        function drawline(){
            context.beginPath();
            context.moveTo(lineDefaults.startPos.x, lineDefaults.startPos.y);
            context.lineTo(lineDefaults.endPos.x, lineDefaults.endPos.y);
            context.stroke();
            context.closePath();
        }

        function stop(){
            active = false;
        }
        function start(){
            active = true;
            Animate();
        }
        function reset(){
            setCanvas();
            lineDefaults = getDefaults();
        }
        function isActive(){
            return active;
        }

        return {
            init: init,
            stop: stop,
            start: start,
            reset: reset,
            isActive: isActive
        };
    });    
 
    beanApp.directive('graph', function() {      
        return {
            restrict: 'E',
            templateUrl: 'views/canvas.html'
        }
    });

})(window.angular);