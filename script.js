var canvas = document.getElementById("canvas");
var ctx;

var cars = [];
var tempArray = [];                         // temporary array used to create cars

var WIDTH = canvas.width;
var HEIGHT = canvas.height;
console.log("Canvas dimensions: " + HEIGHT + ", " + WIDTH);

var numLanes = 4;
var numberOfCars = 12;

var maxFrustration = 90;                            // frustration dictates merges

var laneWidth = (WIDTH-20)/numLanes;
var borderWidth = 10;

var carCounter = 0;                                 // keep track of how many cars we have

additionalInfo = false;                                     // show collision info

init();

function init(){
    ctx = canvas.getContext("2d");
    setInterval(draw, 20);
}

if($('#additional').is(":checked")){
        console.log("checked!")
        additionalInfo = true;
}

$('#additional').change(function(){
    if($('#additional').is(":checked")){
        console.log("checked!")
        additionalInfo = true;
    } else {
        additionalInfo = false;
    }
});




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
        if(!car.collided && car.checkForCollision()){
            car.collided = true;
        }

        if(car.lookAhead()){
            car.slowingDown = true;
            if(car.frustration < maxFrustration){
                car.frustration++;
            }
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


        /* Draw a frustration bar */
        if(car.frustration <= (maxFrustration/3)){
            rect(car.x, car.y, car.width*(car.frustration/(maxFrustration/3)), car.height/15, "#d61515");
        } else {
            rect(car.x, car.y, car.width*(car.frustration/maxFrustration), car.height/15, "#14ccd6");
        }




                      // check if this car is colliding with anyone (by cycling through every other car - wildly inefficient)
        

        /* make a decision about speed */

        /* later, we'll need to control for this based on the skill setting                                                                             
        that is - can this driver hold speed? */

        if(car.collided){
            car.speed = 0;
        } else if(car.slowingDown){ 
            car.speed *= 0.5;
        } else if(car.speed < 0.5){ 
            car.speed += 0.25;
        } else if(car.speed <= (0.95 * car.desiredSpeed)){
            car.speed *= 1.05;
        } else {
            car.speed *= (1 + randBetween(-0.05, 0.05)*car.skill);
        }



        
        // to merge, the car should not be colliding, should be safe to merge,  should not be in the leftmost lane, and should not already be merging
        if(!car.collided && car.lane == car.desiredLane && car.safeToMerge() && car.frustration >= maxFrustration*car.skill  ){ // if we're in the leftmost lane, but really pissed, pass on the right
            car.desiredLane++;
            console.log("Car " + car.id + " is passing on the right ");
        } else if(!car.collided && car.lane == car.desiredLane && car.safeToMerge() && car.lane > 1 ){
            if(car.frustration > (maxFrustration/3)*car.skill){         // less skilled car should merge more often;
                car.desiredLane--;                  // decrease lane by 1 => move left
                console.log("Car " + car.id + " is passing on the left ");
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

            circle((car.x + 0.25*car.width ), (tempY + 0.8*car.height), laneWidth/22, lightColor);
            circle((car.x + 0.75*car.width), (tempY + 0.8*car.height), laneWidth/22, lightColor);


            text(car.id, (car.x+car.width/2) , tempY + 15);
        }


        /*!! MOVE CAR !! */

        car.y -= (car.speed);                             // this is the bit that makes the car move forward

        if(car.desiredLane != car.lane && car.x > borderWidth && (car.x + car.width) < (WIDTH-borderWidth)){
            car.safeToMerge();  
            car.x -= car.width/(20 *(1/car.skill))*(car.lane - car.desiredLane);            // merge based on skill (less skill - more abrupt merge);
            car.y -= car.height/50;                                                         // move in the direction of the desired lane;
                                                                                            // a merging car should be moving forward at least a little;

            if(car.desiredLane < car.lane){                                                                          // if we're meging left
                if((car.x + car.width/2) <= (borderWidth + (car.desiredLane-1)*laneWidth + laneWidth/2)){
                    car.lane = car.desiredLane;
                    car.frustration = 0;                                                                            // reset frustration;
                }
            } else if(car.desiredLane > car.lane) {                      // if we're meging right
                if((car.x + car.width/2) >= (borderWidth + (car.desiredLane-1)*laneWidth + laneWidth/2)){
                    car.lane = car.desiredLane;
                    car.frustration = 0;                        // reset frustration;
                }        
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

        tempX = this.x;
        tempY = this.y

        if(tempY - this.height < 0){                                   // need to account for going off the top of the map
            tempY = HEIGHT + (tempY);
        }


        if(this.checkForSpecificCollision(tempX, tempY)){
            colliding = true;
        }  
        if(this.checkForSpecificCollision(tempX + this.width, tempY)){
            colliding = true;
        }  
        if(this.checkForSpecificCollision(tempX, tempY + this.height)){
            colliding = true;
        }  
        if(this.checkForSpecificCollision(tempX + this.width, tempY + this.height)){
            colliding = true;
        }  

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

        var futureCollision = false;

        var signalCircleRadius = laneWidth/30;

        tempX = this.x;
        tempY = this.y

        if(tempY - this.height < 0){                                   // need to account for going off the top of the map
            tempY = HEIGHT + (tempY);
        }

        if(this.checkForSpecificCollision(tempX, (tempY-this.height)*skill)){
            futureCollision = true;
        }
        // front right
        if(this.checkForSpecificCollision(tempX+this.width, (tempY-this.height)*skill)){
            futureCollision = true;
        }

        if(this.checkForSpecificCollision(tempX, (tempY-this.height*2)*skill)){
            futureCollision = true;
        }
        // front right
        if(this.checkForSpecificCollision(tempX+this.width, (tempY-this.height*2)*skill)){
            futureCollision = true;
        }

        if(additionalInfo){
            circle(tempX, (tempY-this.height)*skill, signalCircleRadius, "black");
            circle((tempX+this.width), (tempY-this.height)*skill, signalCircleRadius, "black");
            circle(tempX, (tempY-this.height*2)*skill, signalCircleRadius, "black");
            circle((tempX+this.width), (tempY-this.height*2)*skill, signalCircleRadius, "black");
        }


        return futureCollision;

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
        var left;
        var right;

        

        if(this.lane > 1 || this.frustration >= maxFrustration){

            if(this.frustration >= maxFrustration && lane < numLanes){                          // merge right 
                left = this.x + laneWidth;
                right = this.x + laneWidth + this.width;
            } else {                                                                            // merge left
                left = this.x - laneWidth;
                right = this.x - laneWidth + this.width;
            }
            

            /* draw the testing circles */
            if(additionalInfo){
                if(this.frustration > (maxFrustration/3)){
                    var signalCircleRadius = laneWidth/22;
                    circle(left, this.y, signalCircleRadius, "black");
                    circle(right, this.y, signalCircleRadius, "black");
                    circle(left, this.y+this.height, signalCircleRadius, "black");
                    circle(right, this.y+this.height, signalCircleRadius, "black");
                    circle(left, this.y-this.height, signalCircleRadius, "black");
                    circle(right, this.y-this.height, signalCircleRadius, "black");
                    circle(left, this.y+this.height*2, signalCircleRadius, "black");
                    circle(right, this.y+this.height*2, signalCircleRadius, "black");

                    line(this.x, (this.y + (this.y + this.height))/2, right,  (this.y + (this.y + this.height))/2);

                    line(left, this.y - this.height, left, this.y + this.height*2);
                    line(right, this.y - this.height, right, this.y + this.height*2);
                    line(left, this.y - this.height, right, this.y - this.height);
                    line(left, this.y + this.height*2, right, this.y + this.height*2);
                }
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

function line(x1, y1, x2, y2){
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}
 

 


/* other functions */

function randBetween(min, max){
    return Math.random() * (max - min) + min;
}






