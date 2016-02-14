    var b2Vec2 = Box2D.Common.Math.b2Vec2;
	var b2BodyDef = Box2D.Dynamics.b2BodyDef;
	var b2Body = Box2D.Dynamics.b2Body;
	var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
	var b2Fixture = Box2D.Dynamics.b2Fixture;
	var b2World = Box2D.Dynamics.b2World;
	var b2MassData = Box2D.Collision.Shapes.b2MassData;
	var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
	var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
	var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
    var ball, ballon;
   // var linkseForce new b2Vec2(0,-9.8);
    

	var Physics = window.Physics = function(element,scale) {
	    var gravity = new b2Vec2(0,-9.8);
	    this.world = new b2World(gravity, true);
	    this.element = element;
	    this.context = element.getContext("2d");
	    this.scale = scale || 20;
	    this.dtRemaining = 0;
	    this.stepAmount = 1/60;
	};

	Physics.prototype.step = function (dt) {
	    this.dtRemaining += dt;
	    while (this.dtRemaining > this.stepAmount) {
	        this.dtRemaining -= this.stepAmount;
	        this.world.Step(this.stepAmount,
	        8, // velocity iterations
	        3); // position iterations
	    }

		if (this.debugDraw) {
		    this.world.DrawDebugData();
		} else {
		      var obj = this.world.GetBodyList();
		   while (obj) {
		        var body = obj.GetUserData();
		        if (body) {
		            body.draw(this.context);
		        }
		 
		        obj = obj.GetNext();
		    }
		    physics.stage.update();
		}
	}

	Physics.prototype.debug = function() {
	    this.debugDraw = new b2DebugDraw();
	    this.debugDraw.SetSprite(this.context);
	    this.debugDraw.SetDrawScale(this.scale);
	    this.debugDraw.SetFillAlpha(0.3);
	    this.debugDraw.SetLineThickness(1.0);
	    this.debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
	    this.world.SetDebugDraw(this.debugDraw);
	};

	var Body = window.Body = function (physics, details) {
	    this.details = details = details || {};
	 
	    // Create the definition
	    this.definition = new b2BodyDef();
	 
	    // Set up the definition
	    for (var k in this.definitionDefaults) {
	        this.definition[k] = details[k] || this.definitionDefaults[k];
	    }
	    this.definition.position = new b2Vec2(details.x || 0, details.y || 0);
	    this.definition.linearVelocity = new b2Vec2(details.vx || 0, details.vy || 0);
	    this.definition.userData = this;
	    this.definition.type = details.type == "static" ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
	 
	    // Create the Body
	    this.body = physics.world.CreateBody(this.definition);
	 
	    // Create the fixture
	    this.fixtureDef = new b2FixtureDef();
	    for (var l in this.fixtureDefaults) {
	        this.fixtureDef[l] = details[l] || this.fixtureDefaults[l];
	    }
	 
	 
	    details.shape = details.shape || this.defaults.shape;
	 
	    switch (details.shape) {
	        case "circle":
	            details.radius = details.radius || this.defaults.radius;
	            this.fixtureDef.shape = new b2CircleShape(details.radius);
	            break;
	        case "polygon":
	            this.fixtureDef.shape = new b2PolygonShape();
	            this.fixtureDef.shape.SetAsArray(details.points, details.points.length);
	            break;
	        case "block":
	        default:
	            details.width = details.width || this.defaults.width;
	            details.height = details.height || this.defaults.height;
	 
	            this.fixtureDef.shape = new b2PolygonShape();
	            this.fixtureDef.shape.SetAsBox(details.width / 2,
	            details.height / 2);
	            break;
	    }
	 
	    this.body.CreateFixture(this.fixtureDef);
	};

// ----------------------Collision---------------------------------------

    Physics.prototype.collision = function () {
    	console.log('sthing');
        this.listener = new Box2D.Dynamics.b2ContactListener();
        this.listener.BeginContact = function (contact) {
            var bodyA = contact.GetFixtureA().GetBody().GetUserData(),
                bodyB = contact.GetFixtureB().GetBody().GetUserData();

            if (bodyA.contact) {
                bodyA.contact(contact);
            }
            if (bodyB.contact) {
                bodyB.contact(contact);
            }

        };
        this.world.SetContactListener(this.listener);
    };
	 
	Body.prototype.defaults = {
	    shape: "block",
	    width: 5,
	    height: 5,
	    radius: 2.5
	};
	 
	Body.prototype.fixtureDefaults = {
	    density: 2,
	    friction: 1,
	    restitution: 0.2
	};
	 
	Body.prototype.definitionDefaults = {
	    active: true,
	    allowSleep: false,
	    angle: 0,
	    angularVelocity: 0,
	    awake: true,
	    bullet: false,
	    fixedRotation: false
	};

	Body.prototype.draw = function (context) {
	   var pos = this.body.GetPosition(),
	        angle = this.body.GetAngle();

	    var radToDeg = 180 / Math.PI;
	 	 
		switch(this.details.name)
		{
			case "ball":
				ball.x = pos.x * physics.scale;
				ball.y = pos.y * physics.scale;
				ball.rotation = angle * radToDeg;

				break;
		}
	 	 
	    // Draw the shape outline if the shape has a color
	    /*if (this.details.color) {
	 
	        switch (this.details.shape) {
	            case "circle":
	                context.beginPath();
	                context.arc(0, 0, this.details.radius, 0, Math.PI * 2);
	                context.fill();
	                break;
	            case "polygon":
	                var points = this.details.points;
	                context.beginPath();
	                context.moveTo(points[0].x, points[0].y);
	                for (var i = 1; i < points.length; i++) {
	                    context.lineTo(points[i].x, points[i].y);
	                }
	                context.fill();
	                break;
	            case "block":
	                context.fillRect(-this.details.width / 2, -this.details.height / 2,
	                this.details.width,
	                this.details.height);
	            default:
	                break;
	        }
	    }
	 
	    // If an image property is set, draw the image.
	    if (this.details.image) {
	        context.drawImage(this.details.image, -this.details.width / 2, -this.details.height / 2,
	        this.details.width,
	        this.details.height);
	 
	    }*/
	 
	};

var physics,
lastFrame = new Date().getTime();

window.gameLoop = function() {
    var tm = new Date().getTime();
    requestAnimationFrame(gameLoop);
    var dt = (tm - lastFrame) / 1000;
    if(dt > 1/15) { dt = 1/15; }
    physics.step(dt);
    lastFrame = tm;
    startWatch();
};

function onSuccess(acceleration) {
       	var gravY;
       	if(acceleration.y > 0)
        {
        	gravY = -9.8;
        } else
        {
        	gravY = 9.8;
        }
        
            
        if(Math.abs(acceleration.x) > 2) //NAAR LINKS
        {
            physics.world.SetGravity(new b2Vec2(acceleration.x *2, gravY));
        }
        else
        {
            physics.world.SetGravity(new b2Vec2( 0 , gravY));
        }
        
        checkWin();
}


function startWatch() {

        // Update acceleration every 3 seconds
        var options = { frequency: 100 };
        watchID = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);
}

function gamestep(){
    alert('step');
    navigator.accelerometer.getCurrentAcceleration(onSuccess, onError);
    
}

function checkWin(){
	var pos = ballon.body.GetPosition();//ball.definition.position.y;
	var canvas = document.getElementById("b2dCanvas");
	var s = physics.scale;
	cpw = canvas.width / 100 / s;
	cph = canvas.height / 100 / s;

	if(pos.y < cph*6 &&  cpw*5 < pos.x && pos.x < cpw*15)
    {
		//alert('winner winner \nchicken dinner');
		goEnd();
    }
    

}

//--------------------Page switcher -----------------------------

function goEnd()
{
   var dirPath = dirname(location.href);
   fullPath = dirPath + "/end.html";
   window.location=fullPath;
}
function dirname(path)
{
   return path.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
}
//---------------------------------------------------------------




// onError: Failed to get the acceleration
//
function onError() {
    alert('onError!');
}
 
function init() {
    var canvas = document.getElementById("b2dCanvas");
    var degToRad = Math.PI / 180;
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    physics = window.physics = new Physics(canvas);
    // physics.debug();//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<------------------------------

    var s = physics.scale;

    physics.stage = new createjs.Stage(canvas);
    physics.collision();


    // Create some walls
    var cph = (canvas.height / 100)/s;
    var cpw = (canvas.width / 100)/s;
    


//cph*3 cpw*5

new Body(physics, { type: "static", x: cpw* 50, y: cph* 0.5 , height: cph* 1, width: cpw * 100 , name:"wallTop"});
new Body(physics, { type: "static", x: cpw* 50, y: cph* 99.5 , height: cph* 1, width: cpw* 100 , name:"wallBottom"});
new Body(physics, { type: "static", x: cpw* 0.5 , y: cph*50 , height: cph * 100, width: cpw *1 , name:"wallLeft"});
new Body(physics, { type: "static", x: cpw* 99.5 , y: cph*50, height: cph * 100 , width: cpw *1 , name:"wallRight" });
new Body(physics, { type: "static", x: cpw*5, y: cph*3, height: cph * 6, width: cpw*1, name:"pipeLeft"});
new Body(physics, { type: "static", x: cpw*15, y: cph*3, height: cph * 6,width: cpw*1, name:"pipeRight"});
new Body(physics, { type: "static", x: cpw*15, y: cph*97, height: cph * 6,width: cpw*2, name:"pipeRight"});
new Body(physics, { type: "static", x: cpw*28, y: cph*3, height: cph * 10, width: cpw*2, name:"pipeRight"});
new Body(physics, { type: "static", friction:0, x: cpw*17.5 , y: cph*85, height: cph * 2 , width: cpw * 23 });
new Body(physics, { type: "static", friction:0, x: cpw*86 , y: cph*80, height: cph * 2 , width: cpw * 28 });
new Body(physics, { type: "static", friction:0, x: cpw*50 , y: cph*70, height: cph * 2 , width: cpw * 36 });
new Body(physics, { type: "static", friction:0, x: cpw*18 , y: cph*60, height: cph * 2 , width: cpw * 36 });
new Body(physics, { type: "static", friction:0, x: cpw*60 , y: cph*50, height: cph * 2 , width: cpw * 80 });
new Body(physics, { type: "static", friction:0, x: cpw*14 , y: cph*16, height: cph * 2 , width: cpw * 25 });
    
new Body(physics, { type: "static", friction:0, x: cpw*85 , y:cph*27, height: cph*2 , width:  Math.sqrt(Math.pow(cpw*32,2)+Math.pow(cph*20,2)), angle: -45*degToRad});
new Body(physics, { type: "static", friction:0, x: cpw*40 , y:cph*27, height: cph*2 , width: Math.sqrt(Math.pow(cpw*32,2)+Math.pow(cph*20,2)), angle:45*degToRad});
    
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 }],x: cpw*2, y: cph*15 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 }],x: cpw*7, y: cph*15 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*12, y: cph*15 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*17, y: cph*15 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*2, y: cph*59 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*7, y: cph*59 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*12, y: cph*59 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*93, y: cph*49 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*88, y: cph*49 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*83, y: cph*49 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*30, y: cph*1 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*35, y: cph*1 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*40, y: cph*1 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*45, y: cph*1 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*50, y: cph*1 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*55, y: cph*1 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*60, y: cph*1 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*65, y: cph*1 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*70, y: cph*1 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*75, y: cph*1 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*80, y: cph*1 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*85, y: cph*1 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*90, y: cph*1 });
new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: cpw*0, y: cph*1 }, { x: cpw*5, y: cph*1 },{ x: cpw*2.5, y: cph*7.5 } ],x: cpw*95, y: cph*1 });
	 
	 
    //new Body(physics, { x: 5, y: 8, width: 50 / s, height: 60 / s, name:"spahe1", density:3, friction:0 });		// Box van 40 x 40 pixels
	ballon = new Body(physics, {color:"blue", x: cpw*10, y: cph*96, shape: "circle", radius: cpw*2, name:"ball" });	// Cirkel van 2.5 * 20 = 50 pixels radius
 		//ballon = new Body(physics, {color:"blue", x: cpw*10, y: cph*8, shape: "circle", radius: cpw*2, name:"ball" });	// Cirkel van 2.5 * 20 = 50 pixels radius

    //new Body(physics, { x: 8, y: 2, shape: "circle", radius:3, name:"shape2" });
    //console.log(ball);
    // CREATEJS
	 ball = new createjs.Bitmap("img/ballon.png");
	 	ball.x = cpw * 10 * s;
	 	ball.y = cph*96 * s;
	 	ball.name = 'ball';
	 	ball.regX = 64 ;
	 	ball.regY = 32;
	 	ball.scaleX = ball.scaleY = .3;
	 	physics.stage.addChild(ball); 
 
    requestAnimationFrame(gameLoop);
    
    level3song = new Media("/android_asset/www/tetris.mp3");
    level3song.setVolume('0.6');
    level3song.play();
    
    plofSound = new Media("/android_asset/www/fail.mp3");
    plofSound.setVolume('1.0');
    
    endLevel2Sound = new Media("/android_asset/www/yay.wav");
    endLevel2Sound.setVolume('1.0');
    endLevel2Sound.play();
    
    /*--------------------------- COLLISSION  -----------------------------------*/

    ballon.contact = function (contact) {
        console.log(contact.m_nodeA.other.m_userData.details.name); 
        console.log(contact.m_nodeB.other.m_userData.details.name); 
        if(contact.m_nodeA.other.m_userData.details.name == 'ball'
        		&& contact.m_nodeB.other.m_userData.details.name == 'spike')
        {
            level3song.stop();    
            plofSound.play(); 
        	alert('dowd!');
        	var dirPath = dirname(location.href);
		    fullPath = dirPath + "/index3.html";
		    window.location=fullPath;
        }
    };

  
}