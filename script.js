var canvas = document.getElementById("canvas");
var ctx;

var cars = [];
var tempArray = [];                         // temporary array used to create cars

var WIDTH = canvas.width;
var HEIGHT = canvas.height;
console.log("Canvas dimensions: " + HEIGHT + ", " + WIDTH);

var numLanes = 5;
var numberOfCars = 10;

var laneWidth = (WIDTH-20)/numLanes;
var borderWidth = 10;


var carCounter = 0;

 init();

function init(){
    ctx = canvas.getContext("2d");
    setInterval(draw, 20);
}

// test car:


    

    for(var i = 0; i < numberOfCars; i++){
        var newCar = new Car(1, Math.floor(Math.random()*2.5)+0.5, (Math.floor(Math.random()*numLanes)+1));
        tempArray.push(newCar);
    }

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


    for(var i = 0; i < numLanes; i ++){
        rect((borderWidth+laneWidth*i), 0, laneWidth, HEIGHT, "gray");
    }




    rect((borderWidth+(laneWidth*numLanes)), 0, borderWidth, HEIGHT, "black");




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
            car.frustration++;
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
        circle((car.x + 0.25*car.width ), (car.y + 0.8*car.height), laneWidth/22, lightColor);
        circle((car.x + 0.75*car.width), (car.y + 0.8*car.height), laneWidth/22, lightColor);
        
        text(car.id, (car.x+car.width/2) , car.y + 15);

                      // check if this car is colliding with anyone (by cycling through every other car - wildly inefficient)
        

        /* make a decision about speed */

        /* later, we'll need to control for this based on the skill setting                                                                             
        that is - can this driver hold speed? */

        if(car.collided){
            car.speed = 0;
        } else if(car.slowingDown){ 
            car.speed -= (car.speed/2);
        } else if(!car.collided && car.speed < 0.5){
            car.speed += 0.5;
        } else if(car.speed <= (0.95 * car.desiredSpeed)){
            car.speed *= 1.05;
        } else {
            car.speed *= (1 + randBetween(-0.05, 0.05)*car.skill);
        }



        
        // to merge, the car should not be colliding, should be safe to merge,  should not be in the leftmost lane, and should not already be merging
        if(!car.collided && car.safeToMerge() && car.lane > 1 && (car.lane == car.desiredLane)){
            if(car.frustration > 30*car.skill){         // less skilled car should merge more often;
                car.desiredLane--;                  // decrease lane by 1 => move left
            }
            
        }

        if(car.speed > 3){
            car.speed = 3;
        }


        // if we're off the top of the canvas, reposition to bottom of canvas


        if((car.y + car.height) <= 0){
            car.y = (HEIGHT-car.height);
        }

        if(car.y <= 0){                 // this creates a dummy car visual
            var tempY = HEIGHT + car.y;
            rect(car.x, tempY, car.width, car.height, carColor);
            circle((car.x + 5 ), (tempY + car.height - 6), 3, lightColor);
            circle((car.x + car.width - 5 ), (tempY + car.height - 6), 3, lightColor);
            text(car.id, (car.x+car.width/2) , tempY + 15);
        }


        /*!! MOVE CAR !! */

        car.y -= (car.speed);                             // this is the bit that makes the car move forward

        if(car.desiredLane != car.lane && car.x > borderWidth){
            car.x -= car.width/(20 *(1/car.skill))*(car.lane - car.desiredLane);            // merge based on skill (less skill - more abrupt merge);
                                                                                              // move in the direction of the desired lane;

            if((car.x + car.width/2) <= (borderWidth + (car.desiredLane-1)*laneWidth + laneWidth/2)){
                car.lane = car.desiredLane;
                car.frustration = 0;                        // reset frustration;
            }

        }


    });

}

function placeCars(){

    cars.push(tempArray[0]);
    tempArray[0].y = HEIGHT - Math.random()*HEIGHT;                     // place the first car randomly

    /* place second car until it doesn't collide */
    if(tempArray.length > 1){
        for(var i = 1; i < tempArray.length; i++){
            var carPlaced = false;
            while(!carPlaced){  
                cars.push(tempArray[i]);
                cars[cars.length-1].y = HEIGHT - Math.random()*HEIGHT;                // cars[cars.length-1] is the last element in the array
                var collided = cars[cars.length-1].checkForCollision();
                console.log("collided at placement: " + collided);
                if(!collided){
                    carPlaced = true;
                    console.log("Car " + cars[cars.length-1].id + " has been placed!");
                } else {
                    cars.pop();                                      // remove last element (the colliding car);
                }
            }
        }
    }

    ///
}




    
function Car(skill, speed, lane){
    


    this.id = carCounter;
    carCounter++;
//    this.id = Math.floor(Math.random()*1000)*Math.floor(Math.random()*1000);
    this.height = laneWidth/1.8;
    this.width = laneWidth/3;

    this.speed = speed;
    this.desiredSpeed = speed;

    this.lane = lane;
    this.desiredLane = lane;

    this.x = (borderWidth + laneWidth*(lane-1) + (laneWidth - this.width)/2);
    this.y = HEIGHT - Math.random()*1000;

    this.collided = false;
    this.slowingDown = false;
    this.skill = skill;                 // fow now, this'll control things like breaking
    this.frustration = 0;               // this will measure how many turns the car has spent driving slow;


    this.checkForCollision = function(){

        var self = this;
        var colliding = false;
        cars.forEach(function(otherCar){

            if(self.id != otherCar.id && self.lane == otherCar.lane){       // this is a problem, but I don't know why it doesn't work without the lane bit
                var xCollision = false;
                var yCollision = false;

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
                    self.collided = true;
                //    console.log("colliding " + self.id);
                } else {
                    self.collided = false;
                    colliding = false;
                //    console.log("not colliding " + self.id);
                }
            }

        });

        return colliding;

    }

    this.checkForSpecificCollision = function(x, y){                // checks a coordinate for collision



        var specificCollision = false;
        var self = this;

        cars.forEach(function(otherCar){

            if(self.id != otherCar.id){       
                if(x >= otherCar.x && x <= (otherCar.x + otherCar.width) && y >= otherCar.y && y <= (otherCar.y + otherCar.height)){
                    specificCollision = true;
                }
            }

        });

        return specificCollision;
    }

    this.lookAhead = function(){                                    // looks a few cars ahead (based on skills) for collisions

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

                var safeDistance;

                if((self.y - self.height*self.skill*2) <= 0){
                    safeDistance = HEIGHT+(self.y - self.height*self.skill*2);
                } else {
                    safeDistance = (self.y - self.height*self.skill*2);
                }

                if(otherCar.y <= 0){                                 // edge case when the car is... literally on the edge of the map
                    safeDistance = (self.y - self.height*self.skill*2); 
                    if(safeDistance >= otherCar.y && safeDistance <= (otherCar.y+otherCar.height)){
                          
                        futureCollisionY = true;
                    }
                } else {
                    if(safeDistance <= (otherCar.y + otherCar.height) && safeDistance >= otherCar.y){    
                        futureCollisionY = true;
                    }
                }
    


                if(futureCollisionX && futureCollisionY && self.speed > 0){
                    slowingDown = true;
                }  

        });

        return slowingDown;

    }

    this.safeToMerge = function() {

        // check 8 points for merge:

        /*
            __
            __  |    |
            __  | [] |
            __  |    |
        */
        var safeToChangeLanes = true;
        

        if(this.lane > 1){

            var left = this.x - laneWidth;
            var right = this.x - laneWidth + this.width;

            /* draw the testing circles */
            console.log(this.frustration);
            if(this.frustration > 30){
                var signalCircleRadius = laneWidth/22;
                circle(left, this.y, signalCircleRadius, "black");
                circle(right, this.y, signalCircleRadius, "black");
                circle(left, this.y+this.height, signalCircleRadius, "black");
                circle(right, this.y+this.height, signalCircleRadius, "black");
                circle(left, this.y-this.height, signalCircleRadius, "black");
                circle(right, this.y-this.height, signalCircleRadius, "black");
                circle(left, this.y+this.height*2, signalCircleRadius, "black");
                circle(right, this.y+this.height*2, signalCircleRadius, "black");
            }

            // front left
            if(this.checkForSpecificCollision(left, this.y)){
                safeToChangeLanes = false;
            }
            // front right
            if(this.checkForSpecificCollision(right, this.y)){
                safeToChangeLanes = false;
            }

            // back left
            if(this.checkForSpecificCollision(left, this.y+this.height)){
                safeToChangeLanes = false;
            }
            // back right
            if(this.checkForSpecificCollision(right, this.y+this.height)){
                safeToChangeLanes = false;
            }

            // one this ahead left
            if(this.checkForSpecificCollision(left, this.y - this.height)){
                safeToChangeLanes = false;
            }
            // one this ahead right
            if(this.checkForSpecificCollision(right, this.y - this.height)){
                safeToChangeLanes = false;
            }

            // one this behind left
            if(this.checkForSpecificCollision(left, this.y+this.height*2)){
                safeToChangeLanes = false;
            }
            // one this behind right
            if(this.checkForSpecificCollision(right, this.y+this.height*2)){
                safeToChangeLanes = false;
            } 
        } else {
            safeToChangeLanes = false;
        }

        return safeToChangeLanes;

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

function text(text, x, y){
    ctx.font = "15px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(text, x, y);
}
 

 


/* other functions */

function randBetween(min, max){
    return Math.random() * (max - min) + min;
}


/* update view:*/

function updateView(){
    $("#car-info").empty();

    cars.forEach(function(car){
        $("#car-info").append("<p> Car " + car.id + ", lane: " + car.lane + " is at <" + Math.floor(car.y) + "> traveling with the speed of " + Math.round(car.speed*10)/10 + ". Frustration: " + car.frustration + ". Colliding: " + car.collided + "</p>")
        $("#car-info").append(" <p>Lane: " + car.lane + ", desiredLane: " + car.desiredLane + "</p>")

    });
}




