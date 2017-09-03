var canvas = document.getElementById("canvas");
var ctx;

var cars = [];


var WIDTH = canvas.width;
var HEIGHT = canvas.height;
console.log("Canvas dimensions: " + HEIGHT + ", " + WIDTH);

init();

function init(){
    ctx = canvas.getContext("2d");
    setInterval(draw, 50)
}

// test car:

    var c1 = new Car(10, HEIGHT, 2, "red");

    var c2 = new Car(10, (HEIGHT + c1.height + 10), 1, "green");

    cars.push(c1, c2);
    console.log(cars);



function draw(){

/* 
    1. draw the highway
    2. draw the lanes
    3. draw the dividers
    4. draw the borders
    5. draw the cars 
*/

    /* draw the track */

    rect(0,                         0, 10, HEIGHT, "black");
    rect(10,                        0, (WIDTH-20)/3, HEIGHT, "gray");
    rect((10+(WIDTH-20)/3),         0, (WIDTH-20)/3, HEIGHT, "gray");
    rect((10+((WIDTH-20)/3*2)),     0, (WIDTH-20)/3, HEIGHT, "gray");
    rect((10+((WIDTH-20)/3*3)),     0, 10, HEIGHT, "black");

    /* draw cars: */

    cars.forEach(function(car){

        rect((car.x + car.width), car.y, car.width, car.height, car.color);
        console.log("Car position: [" + car.x + ", " + car.y + "]");

        car.y -= car.speed;

        if((car.y+car.height) < 0){
            car.y = HEIGHT;
        }
    });

}



// LIBRARY CODE

function circle(x,y,r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, true);               // start at 0, end at Math.PI*2
    ctx.closePath();
    ctx.fill();
}

function rect(x,y,w,h, color) {
    ctx.beginPath();
    ctx.rect(x,y,w,h);
    ctx.closePath();

    ctx.strokeStyle = "black";
    ctx.fillStyle = color;
    ctx.stroke();
    ctx.fill();
}
 
    
function Car(x, y, speed, color){
    this.x = x,
    this.y = y;
    this.speed = speed;
    this.height = 10;
    this.width = 30;
    this.color = color;
}


function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);                 // creates a rectangle the size of the entire canvas that clears the area
}