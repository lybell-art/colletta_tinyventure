var game=function(d)
{
	d.ratio=Math.min(Math.min(window.innerWidth,window.innerHeight)/1080,1);
	d.tileSize=120;
	d.isPC=true;
	d.sceneNo=-1;
	d.ingame=new INGAME();
	d.resourceBox=new RESOURCE_BOX();
	d.loading=new LOADING();
	d.urlData=null;
	d.preload=function()
	{
		d.isPC=PCCheck();
		d.urlData=d.loadJSON("resource/resource_url.json");
	}
	d.setup=function()
	{
		d.createCanvas(window.innerWidth,window.innerHeight);
		d.loading.loadData();
	};
	d.draw=function()
	{
		d.camera.zoom=d.ratio;
		switch(d.sceneNo)
		{
			case -1:d.loading.execute(); break;
			case 0:d.ingame.setup(); break;
			default:d.ingame.run();
		}
	};
	d.windowResized=function()
	{
		d.resizeCanvas(window.innerWidth,window.innerHeight);
	}
	d.leftKey=function(){return d.keyDown(d.LEFT_ARROW)};
	d.rightKey=function(){return d.keyDown(d.RIGHT_ARROW);}
	d.jumpKey=function(){return d.keyWentDown(d.UP_ARROW);}
	d.wallJumpKey=function(dir){
		return d.keyDown(d.UP_ARROW)&&d.keyDown(dir==LEFT?d.RIGHT_ARROW:d.LEFT_ARROW);
	}
	d.scaleKey=function(){return d.keyWentDown('z');}
	function INGAME()
	{
		this.currentWorld="world1";
		this.colletta=null;
		this.world=null;
		this.setup=function()
		{
			this.colletta=new PLAYER(this);
			this.colletta.setImagineCollider();
			this.world=new WORLD(this);
			d.sceneNo++;
		}
		this.run=function()
		{
			d.background(255);
			d.image(d.resourceBox.image.bg[0],0,0);
			this.world.run(this.colletta);
			this.colletta.physic(this);
			this.colletta.move(this);
			this.colletta.pose(this);
			d.camera.position=this.colletta.sprite.position;
			d.drawSprites();
		}
		function PLAYER(g)
		{
			this.x=d.resourceBox.map[g.currentWorld].playerSpawn[0]*d.tileSize+d.tileSize/2;
			this.y=d.resourceBox.map[g.currentWorld].playerSpawn[1]*d.tileSize-15;
			this.heading=RIGHT;
			this.jumping=false;
			this.walling=false;
			this.roping=false;
			this.dropping=false;
			this.maxJump=1;
			this.gravity=0.9;
			this.jumpCount=this.maxJump;
			this.sprite=d.createSprite(this.x,this.y,d.tileSize,d.tileSize*1.5);
			var animeBox=d.resourceBox.image.colletta;
			for(var action in animeBox)
			{
				this.sprite.addAnimation(action+1,animeBox[action][0]);
				this.sprite.addAnimation(action+2,animeBox[action][1]);
			}
			this.sprite.setCollider("rectangle",0,45,d.tileSize,d.tileSize*1.5);
			this.sprite.debug=true;
			this.sprite.depth=20;
			//ceil/floor/wall checker
			this.ceilCollider=d.createSprite(this.x,this.y,1,1);
			this.floorCollider=d.createSprite(this.x,this.y,1,1);
			this.wallCollider=d.createSprite(this.x,this.y,1,1);
		}
		PLAYER.prototype.setImagineCollider=function()
		{
			var v_colid=[this.ceilCollider,this.floorCollider,this.wallCollider];
			for(var i=0;i<3;i++)
			{
				v_colid[i].position=this.sprite.position;
//				v_colid[i].visible=false;
				v_colid[i].debug=true;
			}
			this.ceilCollider.setCollider("rectangle",0,-40,100,10);
			this.floorCollider.setCollider("rectangle",0,130,100,10);
			this.wallCollider.setCollider("rectangle",0,45,120,160);
		}
		PLAYER.prototype.pose=function(g)
		{
			var P;
			var v=this.sprite.velocity.y;
			if(this.walling) P='wall';
			else if(this.jumping) P='jump';
			else if(this.roping) P='rope';
			else if(this.sprite.velocity.x!=0) P='walk';
			else P='idle';
			this.sprite.changeAnimation(P+this.heading);
			if(this.jumping)
			{
				if(v>2) this.sprite.animation.changeFrame(3);
				else if(v>0) this.sprite.animation.changeFrame(2);
				else if(v>-2) this.sprite.animation.changeFrame(1);
				else this.sprite.animation.changeFrame(0);
			}
		}
		PLAYER.prototype.physic=function(g)
		{
			var colid=this.sprite.collide(g.world.ground);
			var onewayOverlap=this.sprite.overlap(g.world.onewayPlatform);
			var onewayColid;
			if(!this.dropping)
			{
				onewayColid=d.conditionalCollide(this.sprite, g.world.onewayPlatform, function(a,b){
					if(typeof a==="object"&&typeof b==="object")
					{
						var p=a.previousPosition.copy().add(0,a.height/2);
						var q=b.position.copy().add(0,-b.height/2);
						var r=p5.Vector.sub(p,q);
						return Math.abs(r.y)<0.0001||r.heading()<=0;
					}
					else return false;
				});
			}
			else onewayColid=false;
			var onRope=this.sprite.overlap(g.world.Vrope);
			var onGround=this.floorCollider.overlap(g.world.allPlatform);
			var onWall=this.wallCollider.overlap(g.world.ground);
			var onCeil=this.ceilCollider.overlap(g.world.ground);
			if(onRope)
			{
				this.walling=false;
				this.roping=true;
				this.jumpCount=this.maxJump;
				if(!this.jumping||this.sprite.velocity.y>0)
				{
					this.sprite.velocity.y=0;
					this.jumping=false;
				}
			}
			else
			{
				this.roping=false;
				if(onWall)
				{
					if(!onGround)
					{
						if(!this.walling) this.jumpCount++;
						this.walling=true;
					}
					else
					{
						if(this.walling) this.heading=(this.heading==LEFT)?RIGHT:LEFT;
						this.walling=false;
					}
				}
				else this.walling=false;
			}
			console.log(onGround, this.dropping, this.jumping);
			if(onGround&&!this.dropping)
			{
//				if(!onewayOverlap||onewayColid)
//				{
					this.jumping=false;
					this.walling=false;
					this.roping=false;
					this.jumpCount=this.maxJump;
					this.sprite.velocity.y=0;
//				}
			}
			else
			{
				if(!onRope) this.jumping=true;
				if(this.roping||this.walling)
				{
					if(this.sprite.velocity.y>0) this.gravity=0.3;
					else this.gravity=0.9;
				}
				else this.gravity=0.9;
				this.sprite.velocity.y+=this.gravity;
			}
			console.log(onGround, this.dropping, this.jumping);
			if(colid)
			{
				if(!onWall)
				{
					this.sprite.velocity.y=0;
					this.dropping=false;
				}
			}
			if(onewayColid)
			{
				this.sprite.velocity.y=0;
				this.walling=false;
				this.dropping=false;
			}
		}
		PLAYER.prototype.move=function(g)
		{
			if(this.jumpCount>0)
			{
				if(this.walling&&d.wallJumpKey(this.heading))
				{
					this.sprite.velocity.y=-27;
					this.jumpCount--;
				}
				else if(!this.walling&&d.jumpKey())
				{
					this.sprite.velocity.y=-27;
					this.jumpCount--;
					this.jumping=true;
				}
			}
			if(d.leftKey())
			{
				this.sprite.velocity.x=-12;
				this.heading=LEFT;
			}
			else if(d.rightKey())
			{
				this.sprite.velocity.x=12;
				this.heading=RIGHT;
			}
			else this.sprite.velocity.x=0;
			this.x=this.sprite.position.x;
			this.y=this.sprite.position.y;
//			console.log(this.sprite.position, this.sprite.velocity);
		}
		function WORLD(g)
		{
			this.allPlatform=new d.Group();
			this.onewayPlatform=new d.Group();
			this.weighPlatform=[];
			this.ground=new d.Group();
			this.tree=new d.Group();
			this.mover=new d.Group();
			this.wood=new d.Group();
			this.Vrope=new d.Group();
			this.Hrope=new d.Group();
			var mapWid=d.resourceBox.map[g.currentWorld].platform.length;
			var mapHei=d.resourceBox.map[g.currentWorld].platform[0].length;
			for(var i=0;i<mapWid;i++)
			{
				for(var j=0;j<mapHei;j++)
				{
					this.makeSpriteSet(g,i,j);
				}
			}
		}
		WORLD.prototype.makeSpriteSet=function(g,i,j)
		{
			var a=d.createSprite((i+0.5)*d.tileSize,(j+0.5)*d.tileSize,d.tileSize,d.tileSize);
			var tileNo=d.resourceBox.map[g.currentWorld].platform[i][j];
			a.debug=true;
			if(tileNo!=0) a.addImage(d.resourceBox.image.platform[tileNo-1]);
			else a.remove();
			switch(tileNo)	
			{
				case 1: case 2: case 3: case 4: case 5:
				case 6: case 7: case 8: case 9:
				case 25: case 27:
				case 10:a.setCollider('rectangle',0,0,d.tileSize,d.tileSize);
					a.depth=21;
					this.ground.add(a); break;
				case 11: case 12: case 13:
				case 14:a.setCollider('rectangle',0,-d.tileSize/4,d.tileSize,d.tileSize/2);
					a.depth=10;
					this.tree.add(a); this.onewayPlatform.add(a); break;
				case 15: case 16:
				case 17:a.setCollider('rectangle',0,-d.tileSize/4,d.tileSize,d.tileSize/2);
					a.depth=10;
					this.mover.add(a); this.onewayPlatform.add(a); break;
				case 18: case 19: case 20:
				case 21:a.setCollider('rectangle',0,-d.tileSize/4,d.tileSize,d.tileSize/2);
					a.depth=10;
					this.wood.add(a);
					this.weighPlatform.push({sprite:a,weigh:0,isWeigh:false,respawnTime:100});
					this.onewayPlatform.add(a); break;
				case 22: case 23:
				case 24:a.setCollider('rectangle',0,0,d.tileSize/2,d.tileSize);
					a.depth=10;
					this.Vrope.add(a); break;
				case 26:a.setCollider('rectangle',0,-d.tileSize/4,d.tileSize,d.tileSize/2);
					a.depth=10;
					a.weigh=0; a.isWeigh=false;
					this.Hrope.add(a);
					this.weighPlatform.push({sprite:a,weigh:0,isWeigh:false});
					this.onewayPlatform.add(a); break;
			}
			if(tileNo!=0&&(tileNo<22||tileNo>24)) this.allPlatform.add(a);
		}
		WORLD.prototype.run=function(player)
		{
			this.runWeigh(player);
		}
		WORLD.prototype.runWeigh=function(player)
		{
			var pp=false, qq=false;
			for(var i in this.weighPlatform)
			{
				pp=player.floorCollider.overlap(this.weighPlatform[i].sprite);
				qq=qq||pp;
				this.weighPlatform[i].isWeigh=pp;
				if(this.weighPlatform[i].isWeigh) this.weighPlatform[i].weigh++;
				else this.weighPlatform[i].weigh=0;
				if(this.weighPlatform[i].weigh>=30) player.dropping=true;
			}
			if(!qq) player.dropping=false;
		}
	}
	d.conditionalCollide=function(my, other, condition)
	{
		var res=false;
		var real=[];
		if(other instanceof d.Sprite)
		{
			res=condition(my, other)&&my.collide(other);
		}
		else if(other instanceof Array)
		{
			for(var i=0; i<other.length; i++)
			{
				if(condition(my, other[i]))
				{
//					my.position.y+=1;
					res=my.collide(other[i])||res;
//					my.position.y-=1;
				}
			}
		}
		return res;
	}
	function RESOURCE_BOX()
	{
		this.map={};
		this.image={
			bg:[], 
			colletta:{idle:[],walk:[],jump:[],rope:[],wall:[]}, 
			item:[],
//			main-ui:[],
			objects:[],
			platform:[],
			UI:[]
		};
	}
	function LOADING()
	{
		this.count=0;
		this.max=0;
	}
	LOADING.prototype.loadData=function()
	{
		var imgBox=d.resourceBox.image;
		d.resourceBox.map=d.loadJSON("map/mapData.json",function(){this.count++;}.bind(this));
		imgBox.bg[0]=d.loadImage(d.urlData.background[0],function(){this.count++;}.bind(this));
		imgBox.colletta.idle[0]=this.loadAnimData([d.urlData.colletta.idle[0]],function(){this.count++;}.bind(this));
		imgBox.colletta.idle[1]=this.loadAnimData([d.urlData.colletta.idle[1]],function(){this.count++;}.bind(this));
		imgBox.colletta.walk[0]=this.loadAnimData([d.urlData.colletta.walk[0],d.urlData.colletta.walk[1]],function(){this.count++;}.bind(this));
		imgBox.colletta.walk[1]=this.loadAnimData([d.urlData.colletta.walk[2],d.urlData.colletta.walk[3]],function(){this.count++;}.bind(this));
		imgBox.colletta.jump[0]=this.loadAnimData([d.urlData.colletta.jump[0],d.urlData.colletta.walk[1]],function(){this.count++;}.bind(this));
		imgBox.colletta.jump[1]=this.loadAnimData([d.urlData.colletta.jump[2],d.urlData.colletta.walk[3]],function(){this.count++;}.bind(this));
		imgBox.colletta.wall[0]=this.loadAnimData([d.urlData.colletta.wall[1]],function(){this.count++;}.bind(this));
		imgBox.colletta.wall[1]=this.loadAnimData([d.urlData.colletta.wall[0]],function(){this.count++;}.bind(this));
		imgBox.colletta.rope[0]=this.loadAnimData([d.urlData.colletta.rope[0]],function(){this.count++;}.bind(this));
		imgBox.colletta.rope[1]=this.loadAnimData([d.urlData.colletta.rope[1]],function(){this.count++;}.bind(this));
		for(var i in d.urlData.item)
		{
			imgBox.item[i]=d.loadImage(d.urlData.item[i],function(){this.count++;}.bind(this));
		}
		for(var i in d.urlData.objects)
		{
			imgBox.objects[i]=d.loadImage(d.urlData.objects[i],function(){this.count++;}.bind(this));
		}
		for(var i in d.urlData.platform)
		{
			imgBox.platform[i]=d.loadImage(d.urlData.platform[i],function(){this.count++;}.bind(this));
		}
		for(var i in d.urlData.UI)
		{
			imgBox.UI[i]=d.loadImage(d.urlData.UI[i],function(){this.count++;}.bind(this));
		}
		this.max=72;
	}
	LOADING.prototype.loadAnimData=function(a, callback)
	{
		if(a.length==1) res=d.loadAnimation(a[0]);
		else if(a.length==2) res=d.loadAnimation(a[0],a[1]);
		if(typeof callback === 'function') {
        		callback();
		}
		return res;
	}
	LOADING.prototype.execute=function()
	{
		d.background(0);
		d.fill(255);
		d.noStroke();
		d.rect(0,0,d.map(this.count,0,this.max,0,d.width),50);
		if(this.count==this.max) d.sceneNo=0;
		console.log(this.count);
	}
};
const LEFT=2, RIGHT=1;
function PCCheck()
{
	var filter = "win16|win32|win64|mac|macintel";
	if ( navigator.platform )
	{
		if ( filter.indexOf( navigator.platform.toLowerCase() ) < 0 ) return false;
		else return true;
	}
}
new p5(game,"tinyventure");
