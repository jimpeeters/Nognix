	var b2Vec2 			= Box2D.Common.Math.b2Vec2;
	var b2BodyDef 		= Box2D.Dynamics.b2BodyDef;
	var b2Body 			= Box2D.Dynamics.b2Body;
	var b2FixtureDef 	= Box2D.Dynamics.b2FixtureDef;
	var b2Fixture 		= Box2D.Dynamics.b2Fixture;
	var b2World 		= Box2D.Dynamics.b2World;
	var b2MassData 		= Box2D.Collision.Shapes.b2MassData;
	var b2PolygonShape 	= Box2D.Collision.Shapes.b2PolygonShape;
	var b2CircleShape 	= Box2D.Collision.Shapes.b2CircleShape;
	var b2DebugDraw 	= Box2D.Dynamics.b2DebugDraw;
    var ball;
    var contact			= Box2D.Dynamics.b2ContactListener;
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

	Physics.prototype.collision = function () {
		alert('collision');
	    this.listener = new Box2D.Dynamics.b2ContactListener();
	    this.listener.PostSolve = function (contact, impulse) {
	        var bodyA = context.GetFixtureA().GetBody().GetUserData(),
	            bodyB = context.GetFixtureB().GetBody().GetUserData();
	 
	        if (bodyA.contact) {
	            bodyA.contact(contact, impulse, true)
	        }
	        if (bodyB.contact) {
	            bodyB.contact(contact, impulse, false)
	        }
	 
	    };
	    this.world.SetContactListener(this.listener);
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
        //var collision = ndgmr.checkPixelCollision(circle,square, 0,true);

       // if(collision == null) {

        if(Math.abs(acceleration.x) > 2 && Math.abs(acceleration.x) < 9)
        {
            
            if(acceleration.x > 0) //NAAR LINKS
            {
                //alert(acceleration.x);
                physics.world.SetGravity(new b2Vec2(acceleration.x *2, -9.8));
                //document.getElementById("test").InnerHTML = physics.world.gravity;
                //alert(physics.world.gravity);
                
            }
            if(acceleration.x < 0) // NAAR RECHTS
            {
                physics.world.SetGravity(new b2Vec2( acceleration.x *2 , -9.8));
            }

        }

        checkWin();
}

function startWatch() {

        // Update acceleration every 3 seconds
        var options = { frequency: 100 };
        //watchID = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);
}

function gamestep(){
    alert('step');
    navigator.accelerometer.getCurrentAcceleration(onSuccess, onError);
    
}

function checkWin(){
	contact.beginContact
	var pos = ball.body.GetPosition();///ball.definition.position.y;
	if(pos.y<.1 && pos.x < 2)
		alert('winner, winner, \nchicken dinner!');
	/*console.log(ball);
	for (b = world.GetBodyList(); b; b = b.GetNext()) {
		alert('the object is located at (' + b.position.x + ',' + b.position.y + ')');
	}*/
	
}

// onError: Failed to get the acceleration
//
function onError() {
    alert('onError!');
}
 
function init() {
    var canvas = document.getElementById("b2dCanvas");
		var degToRad = Math.PI / 180;

	    physics = window.physics = new Physics(canvas);
	 	physics.debug();//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<------------------------------

		var s = physics.scale;

		physics.stage = new createjs.Stage(canvas);


    // Create some walls
    new Body(physics, { type: "static", x: 0, y: 0, height: 50,  width: 0.5 });
    new Body(physics, { type: "static", x:22, y: 0, height: 50,  width: 0.5});
    new Body(physics, { type: "static", x:62, y: 0, height: 0.5, width: 120 });
    new Body(physics, { type: "static", x:0, y:25, height: 0.5, width: 120 });
 
    new Body(physics, { type: "static", friction:0, x: 300/s , y:450/s, height: 20/s, width: 20/s, name:"muur5" , angle: 15 * degToRad});
    new Body(physics, { type: "static", friction:0, x: 200/s , y:200/s, height: 10/s, width: 200/s, name:"muur6"});
    new Body(physics, { type: "static", friction:0, x: 100/s , y:300/s, height: 10/s, width: 200/s, name:"muur7", angle: 1 * degToRad});
    new Body(physics, { type: "static", friction:0, x: 150/s , y:350/s, height: 10/s, width: 200/s, name:"muur8"});

    new Body(physics, { type: "static", friction:0, x: 260/s, y: 220/s, height: 30/s, width: 30/s, name:'piek1'});
    
	 
    //new Body(physics, { x: 5, y: 8, width: 50 / s, height: 60 / s, name:"spahe1", density:3, friction:0 });		// Box van 40 x 40 pixels
	ball = new Body(physics, { friction:1000,x: 260/s, y: 450/s, shape: "circle", radius: 5 / s, name:"balloon" });	// Cirkel van 2.5 * 20 = 50 pixels radius
    //new Body(physics, { x: 8, y: 2, shape: "circle", radius:3, name:"shape2" });

    ball.contact = function (contact, impulse, first) {
    	alert('contact');
	    var magnitude = Math.sqrt(
	    impulse.normalImpulses[0] * impulse.normalImpulses[0] + impulse.normalImpulses[1] * impulse.normalImpulses[1]),
	        color = Math.round(magnitude / 2);
	 
	    if (magnitude > 10) {
	        this.details.color = "rgb(" + color + ",50,50)";
	    }
	};

    console.log(ball);
    // CREATEJS
	 	/*ball = new createjs.Bitmap("img/ball.png");
	 	ball.x = 260;
	 	ball.y = 160;
	 	ball.name = 'ballon';
	 	ball.regX = 30;
	 	ball.regY = 30;
	 	ball.scaleX = ball.scaleY = 0.5;
	 	physics.stage.addChild(ball);*/
 
    requestAnimationFrame(gameLoop);
}