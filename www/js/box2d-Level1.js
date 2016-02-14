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
    var spike;
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
                
            case "spike":
                spike.x = pos.x * physics.scale;
				spike.y = pos.y * physics.scale;
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
	//console.log(pos.y);
	/*if(pos.y<cph*50)
	{
		alert('over den helft');
	}*/
	//alert(pos.y/cph);
	if(pos.y < cph*6 &&  cpw*45 < pos.x && pos.x < cpw*55)
    {
		goLevel2();
    }
    
	/*console.log(ball);
	for (b = world.GetBodyList(); b; b = b.GetNext()) {
		alert('the object is located at (' + b.position.x + ',' + b.position.y + ')');
	} */
	
}

//--------------------Page switcher -----------------------------
function goLevel2()
{
   //alert('win');
   var dirPath = dirname(location.href);
   fullPath = dirPath + "/index2.html";
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
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
		var degToRad = Math.PI / 180;

	    physics = window.physics = new Physics(canvas);
	 	//physics.debug();//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<------------------------------

		var s = physics.scale;

		physics.stage = new createjs.Stage(canvas);

		physics.collision();
    // Create some walls
    var cph = (canvas.height / 100)/s;
    var cpw = (canvas.width / 100)/s;
    
    new Body(physics, { type: "static", x: cpw* 50, y: cph* 0.5 , height: cph* 1,  width: cpw * 100 , name:"wallTop"});
    new Body(physics, { type: "static", x: cpw* 50, y: cph* 99.5 , height: cph* 1,  width: cpw* 100 , name:"wallBottom"});
    new Body(physics, { type: "static", x: cpw* 0.5 , y: cph*50 , height: cph * 100 , width: cpw *1 , name:"wallLeft"});
    new Body(physics, { type: "static", x: cpw* 99.5 , y: cph*50, height: cph * 100 , width: cpw *1 , name:"wallRight" });

    new Body(physics, { type: "static", x: cpw*45, y: cph*3, height: cph * 6, width: cpw*1, name:"pipeLeft"});
    new Body(physics, { type: "static", x: cpw*55, y: cph*3, height: cph * 6, width: cpw*1, name:"pipeRight"});
 
    new Body(physics, { type: "static", friction:0, x: cpw*50 , y: cph*90, height: cph * 2 , width: cpw * 76 });
    new Body(physics, { type: "static", friction:0, x: cpw*36 , y:cph*78, height: cph *2, width: cpw * 72});
    new Body(physics, { type: "static", friction:0, x: cpw*56 , y:cph*64, height: cph *2, width: cpw * 88});
    new Body(physics, { type: "static", friction:0, x: cpw*20.5 , y:cph*36, height: cph*2 , width: cpw*39});
    new Body(physics, { type: "static", friction:0, x: cpw*79.5 , y:cph*36, height: cph*2 , width: cpw*39});

    new Body(physics, { type: "static", friction:0, x: cpw*22 , y:cph*14, height: cph*2 , width: Math.sqrt(Math.pow(cpw*40,2)+Math.pow(cph*20,2)), angle: -38*degToRad});
    new Body(physics, { type: "static", friction:0, x: cpw*78 , y:cph*14, height: cph*2 , width: Math.sqrt(Math.pow(cpw*40,2)+Math.pow(cph*20,2)), angle: 38*degToRad});

    //new Body(physics, { type: "static", friction:0, x: 150/s , y:350/s, height: 10/s, width: 200/s, name:"muur8"});
    
    //Spike
    //new Body(physics, { type: "static", name: "spike", shape: "polygon", points: [ { x: 0/s, y: 0/s }, { x: 40/s, y: 0/s },{ x: 20/s, y: 30/s }   ],x: 250/s, y: 200/s });
    
    
    
	 
    //new Body(physics, { x: 5, y: 8, width: 50 / s, height: 60 / s, name:"spahe1", density:3, friction:0 });		// Box van 40 x 40 pixels <<<<<<< HEAD
	ballon = new Body(physics, {color:"blue", x: cpw*50, y: cph*96, shape: "circle", radius : cpw*2, name:"ball" });	// Cirkel van 2.5 * 20 = 50 pixels radius=======
	//ball = new Body(physics, {color:"blue", x: 260/s, y: 450/s, shape: "circle", radius: 5 / s, name:"balloon", friction: 1000 });	// Cirkel van 2.5 * 20 = 50 pixels radius	>>>>>>> 368a9f26c1b662efdf3ccce0e4d71567a188fe01
    //new Body(physics, { x: 8, y: 2, shape: "circle", radius:3, name:"shape2" });
    //console.log(ball);
    
    // CREATEJS
	 	ball = new createjs.Bitmap("img/ballon.png");
	 	ball.x = cpw * 50 * s;
	 	ball.y = cph*96 * s;
	 	ball.name = 'ball';
	 	ball.regX = 64 ;
	 	ball.regY = 32;
	 	ball.scaleX = ball.scaleY = .3;
	 	physics.stage.addChild(ball); 
        
	 	console.log(ball);

        spike = new createjs.Bitmap("img/spike.png");
        spike.x = 20;
        spike.y = 5;
        spike.name = 'spike';
        spike.regX = 20;
        spike.regY = 15;
        spike.scaleX = spike.scaleY = 0.1;
        physics.stage.addChild(spike);
        
        
      
    ballon.contact = function (contact) {
        console.log(contact.m_nodeA.other.m_userData.details.name); 
        console.log(contact.m_nodeB.other.m_userData.details.name); 
        if(contact.m_nodeA.other.m_userData.details.name == 'ball'
        		&& contact.m_nodeB.other.m_userData.details.name == 'spike')
        {
        	alert('dowd!');
        	var dirPath = dirname(location.href);
		   fullPath = dirPath + "/index.html";
		   window.location=fullPath;
        }
    };
 
    requestAnimationFrame(gameLoop);
    
    level1song = new Media("/android_asset/www/Level1.mp3");
    level1song.setVolume('0.6');
    level1song.play(); 
    
    /*--------------------------- COLLISSION  -----------------------------------*/


  
}