var canvas = document.getElementById("canvas");
var ctx;

var cars = [];


var WIDTH = canvas.width;
var HEIGHT = canvas.height;
console.log("Canvas dimensions: " + HEIGHT + ", " + WIDTH);

var laneWidth = (WIDTH-20)/3;
var borderWidth = 10

init();

function init(){
    ctx = canvas.getContext("2d");
    setInterval(draw, 20)
}

// test car:

    var c1 = new Car(2, 1);

    var c2 = new Car(1.5, 2);

    var c3 = new Car(1, 3);

    var c4 = new Car(2, 3);

    cars.push(c1, c2, c3, c4);
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

    rect(0, 0, borderWidth, HEIGHT, "black");
    rect(borderWidth, 0, laneWidth, HEIGHT, "gray");
    rect((borderWidth+laneWidth), 0, laneWidth, HEIGHT, "gray");
    rect((borderWidth+(laneWidth*2)), 0, laneWidth, HEIGHT, "gray");
    rect((borderWidth+(laneWidth*3)), 0, borderWidth, HEIGHT, "black");

    /* draw cars: */

    cars.forEach(function(car){


        /* check for collision against every other car */


        var color = "orange";

        accident(car);              // check if this car is colliding with anyone (by cycling through every other car - wildly inefficient)

        if(car.collided){
            color = "red";
        }

        rect(car.x, car.y, car.width, car.height, color);
        car.y -= car.speed;

        if((car.y+car.height) < 0){
            car.y = HEIGHT;
        }
    });

}



function accident(car){


    cars.forEach(function(otherCar){

        if( car.id != otherCar.id){
            var xCollision = false;
            var yCollision = false;

            if(otherCar.x >= car.x && otherCar.x <= (car.x+car.width)){
                xCollision = true;
                console.log("xcol");
            }

            if((otherCar.x + otherCar.width) >= car.x && (otherCar.x + otherCar.width) <= (car.x+car.width)){
                xCollision = true;
                console.log("xcol");
            }

            if(otherCar.y >= car.y && otherCar.y <= (car.y+car.height)){
                yCollision = true;
                console.log("ycol");
            }

            if((otherCar.y+otherCar.height) >= car.y && (otherCar.y+otherCar.height) <= (car.y+car.height)){
                yCollision = true;
                console.log("ycol");
            }

            if(xCollision && yCollision){
                console.log("COLLIDING!");
                car.collided = true;
                otherCar.collided = true;
            } else {
                car.collided = false;
                otherCar.collided = false;
            }
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
 
    
function Car(speed, lane){
    this.id = Math.floor(Math.random()*1000)*Math.floor(Math.random()*1000);
    this.height = 10;
    this.width = 30;

    this.speed = speed;

    if(lane != 1 && lane != 2 && lane != 3){
        lane = 3;
    }

    this.x = (borderWidth + laneWidth*(lane-1) + (laneWidth - this.width)/2);
    this.y = HEIGHT;

    collided = "false";

    this.skill = 1;                 // fow now, this'll control things like breaking

}


function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);                 // creates a rectangle the size of the entire canvas that clears the area
}