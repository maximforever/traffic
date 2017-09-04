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
    setInterval(draw, 10);
}

// test car:

    var c1 = new Car(0.5, 3, 1);
    var c2 = new Car(1, 2.5, 1);
    var c3 = new Car(1, 0.5, 2);
    var c4 = new Car(1, 1.5, 2);
    var c5 = new Car(1, 2, 3);
    var c6 = new Car(1, 1, 3);

    cars.push(c1, c2, c3, c4, c5, c6);
    placeCars();
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

    updateView();

    rect(0, 0, borderWidth, HEIGHT, "black");
    rect(borderWidth, 0, laneWidth, HEIGHT, "gray");
    rect((borderWidth+laneWidth), 0, laneWidth, HEIGHT, "gray");
    rect((borderWidth+(laneWidth*2)), 0, laneWidth, HEIGHT, "gray");
    rect((borderWidth+(laneWidth*3)), 0, borderWidth, HEIGHT, "black");

    /* draw cars: */

    cars.forEach(function(car){


        var carColor = "orange";
        var lightColor = "white";

        /* check for collision against every other car */
        if(car.checkForCollision()){
            car.collided = true;
        } else {
            car.collided = false;
        }

        if(car.lookAhead()){
            car.slowingDown = true;
        } else {
            car.slowingDown = false;
        }
        
        if(car.collided){
            carColor = "red";
        } 

        if(car.slowingDown){
            lightColor = "red";
        }

        rect(car.x, car.y, car.width, car.height, carColor);
        circle((car.x + 5 ), (car.y + car.height - 6), 3, lightColor);
        circle((car.x + car.width - 5 ), (car.y + car.height - 6), 3, lightColor);


                      // check if this car is colliding with anyone (by cycling through every other car - wildly inefficient)
        

        /* make a decision about speed */

        /* later, we'll need to control for this based on the skill setting                                                                             
        that is - can this driver hold speed? */

        if(car.collided){
            car.speed = 0;
        } else if(car.lookAhead()){
            console.log(car.lookAhead()); 
            car.speed -= (car.speed/3);
        } else if(car.speed <= (0.95 * car.desiredSpeed)){
            car.speed *= 1.05;
        } else {
            car.speed *= (1 + randBetween(-0.05, 0.05)*car.skill);
        }

        if(car.speed > 3){
            car.speed = 3;
        }




        car.y -= (car.speed);                             // this is the bit that makes the car move forward
            

        // if we're off the top of the canvas, reposition to bottom of canvas

        if((car.y+car.height) < 0){
            car.y = HEIGHT;
        }

        if((car.y) > HEIGHT){
            car.y = 0;
        }


    });

}

function placeCars(){
    console.log("later, we'll place cars randomly");
}


    
function Car(skill, speed, lane){
    
    if(lane != 1 && lane != 2 && lane != 3){
        lane = 3;
    }

    this.id = Math.floor(Math.random()*1000)*Math.floor(Math.random()*1000);
    this.height = 35;
    this.width = 20;

    this.speed = speed;
    this.desiredSpeed = speed;

    this.lane = lane;
    this.nextLane = lane;

    this.x = (borderWidth + laneWidth*(lane-1) + (laneWidth - this.width)/2);
    this.y = HEIGHT - Math.random()*1000;

    this.collided = false;
    this.slowingDown = false;
    this.skill = 1;                 // fow now, this'll control things like breaking


    this.checkForCollision = function(){

        var self = this;
        var colliding = false;


        cars.forEach(function(otherCar){

            if(self.id != otherCar.id && self.lane == otherCar.lane){       // this is a problem, but I don't know why it doesn't work without the lane bit
                var xCollision = false;
                var yCollision = false;
/*
                console.log("self: " + self.x + ", " + self.y);
                console.log("Other car: " + otherCar.x + ", " + otherCar.y);

*/
                if(self.x >= otherCar.x && self.x <= (otherCar.x + otherCar.width)){
                    xCollision = true;
                    
                }

                if((self.x+self.width) >= otherCar.x  && (self.x+self.width) <= (otherCar.x + otherCar.width)){
                    xCollision = true;
                    
                }

                if(self.y >= otherCar.y && self.y <= (otherCar.y + otherCar.height)){
                    yCollision = true;
                    
                }

                if((self.y+self.height) >= otherCar.y && (self.y+self.height) <= (otherCar.y + otherCar.height)){
                    yCollision = true;
                    
                }

                if(xCollision && yCollision){
                    self.collided = true;
                    colliding = true;
                } else {
                    self.collided = false;
                    colliding = false;
                }
            }

        });

        return colliding;

    }

    this.lookAhead = function(){

        self = this;
        var slowingDown = false;

        cars.forEach(function(otherCar){

                var futureCollisionX = false;
                var futureCollisionY = false;

                if(otherCar.x >= self.x && otherCar.x <= (self.x+self.width)){
                    futureCollisionX = true;

                }

                if((otherCar.x + otherCar.width) >= self.x && (otherCar.x + otherCar.width) <= (self.x+self.width)){
                    futureCollisionX = true;
                }

                var verticalDistance;

                if((self.y - self.height*self.skill*2) <= 0){
                    verticalDistance = HEIGHT-(self.height*self.skill*2 - self.y);
                } else {
                    verticalDistance = (self.y - self.height*self.skill*2);
                }

                if(verticalDistance  <= (otherCar.y + otherCar.height) && verticalDistance >= otherCar.y){
                    futureCollisionY = true;
                }

                if(futureCollisionX && futureCollisionY && self.speed > 0){
                    slowingDown = true;
                }  

        });

        return slowingDown;

    }

}


function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);                 // creates a rectangle the size of the entire canvas that clears the area
}


// LIBRARY CODE

function circle(x,y,r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, true);               // start at 0, end at Math.PI*2
    ctx.closePath();
    ctx.fillStyle = color;
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
 

 


/* other functions */

function randBetween(min, max){
    return Math.random() * (max - min) + min;
}


/* update view:*/

function updateView(){
    $("#car-info").empty();

    cars.forEach(function(car){
    $("#car-info").append("<p> Car " + car.id + ", lane: " + car.lane + " is at <" + Math.floor(car.y) + "> traveling with the speed of " + Math.round(car.speed*100)/100 + ". Colliding: " + car.collided + "</p>")

});
}




