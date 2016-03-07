$(function () {

    //gloabl definitions
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    var canvas = document.getElementById('my-canvas');
    var context = canvas.getContext('2d');

    canvas.width = 1000;
    canvas.height = 500;

    var lineDefaults = {
        movePos: {
            x: 1000,
            y: 300
        },
        linePos: {
            x: 900,
            y: 300
        },
        count:0,
        end:300
    }

    function AnimateLine() {

        context.beginPath();
        context.moveTo(lineDefaults.movePos.x, lineDefaults.movePos.y);
        context.lineTo(lineDefaults.linePos.x, lineDefaults.linePos.y);
        context.stroke();
        context.closePath();

        lineDefaults.linePos.x-100;

        if (lineDefaults.count < lineDefaults.end) {
            requestAnimationFrame(function () {
                AnimateLine();
                lineDefaults.count++;
            });
        }else{
            reset();
        }
    }

    function reset(){
        clear();
        lineDefaults.count = 0;
        lineDefaults.linePos.x = 0;
        AnimateLine();
    }

    function clear() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    AnimateLine();

});