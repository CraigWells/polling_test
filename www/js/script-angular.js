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
    .controller('MainCtrl', ['$scope', function($scope) {}]);

    beanApp.factory('graphData', function(){

        function init(){
            var data = {};
            return data;
        };       

        return init();
    });

    beanApp.factory('graphRenderer', function(){
        
        var requestAnimationFrame = window.requestAnimationFrame;
        var canvas, context, lineDefaults;

        function init() {
            canvas = document.getElementById("mycanvas");
            context = canvas.getContext("2d");
            canvas.width = 1000;
            canvas.height = 500;
            lineDefaults = {

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
        }

        function clear() {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }

        function Animate(graphData){
            if (lineDefaults.count < lineDefaults.end) {
                requestAnimationFrame(function () {
                    clear();
                    drawline();
                    updatePositions();
                    lineDefaults.count++;
                    Animate();
                });
            }
            console.log("Animate");
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

        return function(a){
            init();
            return Animate;
        };
    });    

    beanApp.directive('graph', ['graphData', '$timeout', 'graphRenderer', function(graphData, $timeout, graphRenderer) {
        return {
            restrict: 'E',
            templateUrl: 'views/canvas.html',
            link: function(scope, element) {
                //scope.graphs = graphData;
                $timeout(function () {
                   var anaimate = graphRenderer(element); 
                   animate();
                });
            }
        }
    }]);

})(window.angular);