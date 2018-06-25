var game=function(d)
{
	d.ratio=Math.min(window.innerWidth,window.innerHeight)/1080;
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
//		d.camera.zoom=d.ratio;
		switch(d.sceneNo)
		{
			case -1:d.loading.execute(); break;
			case 10:d.ingame.setup(); break;
			case 11:d.ingame.run(); break;
			case 12:d.ingame.pause(); break;
//			default:d.ingame.run();
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
		this.ui=null;
		this.setup=function()
		{
			this.colletta=new PLAYER(this);
			this.colletta.setImagineCollider();
			this.world=new WORLD(this);
			this.ui=new UI(this);
			this.ui.setting();
			d.sceneNo++;
		}
		this.run=function()
		{
			d.camera.off();
			d.image(d.resourceBox.image.bg[0],0,0,window.innerWidth,window.innerHeight);
			d.camera.on();
			this.world.run(this.colletta);
			this.colletta.physic(this);
			this.colletta.move(this);
			this.colletta.pose(this);
			var p=this.colletta.sprite;
			d.camera.position=p.position;
			d.camera.zoom=d.ratio/p.scale;
			d.drawSprites();
			this.ui.run();
		}
		this.pause=function()
		{
			if(d.mouseWentUp(d.LEFT))
			{
				d.sceneNo=11;
				this.colletta.freeze(false);
			}
		}
		function PLAYER(g)
		{
			this.x=d.resourceBox.map[g.currentWorld].playerSpawn[0]*d.tileSize+d.tileSize/2;
			this.y=d.resourceBox.map[g.currentWorld].playerSpawn[1]*d.tileSize-15;
			this.vx=0;
			this.vy=0;
			this.scale=false;
			this.curScale=10;
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
			var isTwinning=this.curScale!=10&&this.curScale!=20;
			var colid=this.sprite.collide(g.world.ground);
			var onewayOverlap=this.sprite.overlap(g.world.onewayPlatform);
			var onewayColid;
			if(!this.dropping)
			{
				onewayColid=d.conditionalCollide(this.sprite, g.world.onewayPlatform, function(a,b){
					if(typeof a==="object"&&typeof b==="object")
					{
						if(!b.visible) return false;
						if(isTwinning) return true;
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
						if(!this.walling&&this.scale) this.jumpCount++;
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
			if(onGround&&!this.dropping)
			{
				if(colid||onewayColid)
				{
					this.jumping=false;
					this.walling=false;
					this.roping=false;
					this.jumpCount=this.maxJump;
					this.sprite.velocity.y=0;
				}
			}
			else
			{
				if(isTwinning&&this.sprite.velocity.x==0&&this.sprite.velocity.y==0) this.jumping=false;
				else if(!onRope) this.jumping=true;
				if(this.roping||this.walling)
				{
					if(this.sprite.velocity.y>0) this.gravity=0.3;
					else this.gravity=0.9;
				}
				else this.gravity=0.9;
				this.sprite.velocity.y+=this.gravity;
			}
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
			if(d.scaleKey()) this.scale=!this.scale;
			this.x=this.sprite.position.x;
			this.y=this.sprite.position.y;
			this.vx=this.sprite.velocity.x;
			this.vy=this.sprite.velocity.y;
			this.scaleTween();
//			console.log(this.sprite.position, this.sprite.velocity);
		}
		PLAYER.prototype.scaleTween=function()
		{
			var realScale;
			var myObj=[this.sprite,this.ceilCollider,this.floorCollider,this.wallCollider];
			var offsets=[new p5.Vector(0,45),new p5.Vector(0,-40),new p5.Vector(0,130),new p5.Vector(0,45)];
			if(this.scale)
			{
				if(this.curScale<20) this.curScale++;
			}
			else
			{
				if(this.curScale>10) this.curScale--;
			}
			realScale=1/(this.curScale/10);
			for(var i=0;i<4;i++)
			{
				myObj[i].scale=realScale;
				myObj[i].collider.offset=offsets[i].mult(realScale);
			}
			
		}
		PLAYER.prototype.freeze=function(tog)
		{
			if(tog)
			{
				this.vx=this.sprite.velocity.x;
				this.vy=this.sprite.velocity.y;
				this.sprite.velocity=new p5.Vector(0,0);
			}
			else
			{
				this.sprite.velocity=new p5.Vector(this.vx,this.vy);
			}
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
			this.width=mapWid*120;
			this.height=mapHei*120;
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
					this.weighPlatform.push({sprite:a,weigh:0,isWeigh:false,respawnTime:100,enable:true});
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
			this.viz(player);
			this.runWeigh(player);
		}
		WORLD.prototype.runWeigh=function(player)
		{
			var pp=false, qq=false;
			for(var i in this.weighPlatform)
			{
				var isWood=(this.weighPlatform[i].respawnTime!==undefined);
				pp=player.floorCollider.overlap(this.weighPlatform[i].sprite);
				qq=qq||pp;
				this.weighPlatform[i].isWeigh=pp;
				if(this.weighPlatform[i].isWeigh&&!player.scale) this.weighPlatform[i].weigh++;
				else this.weighPlatform[i].weigh=0;
				if(this.weighPlatform[i].weigh>=30)
				{
					player.dropping=true;
					this.weighPlatform[i].weigh=0;
					if(isWood)
					{
						this.weighPlatform[i].respawnTime=0;
						this.weighPlatform[i].enable=false;
						this.weighPlatform[i].sprite.visible=false;
					}
				}
				if(isWood&&!this.weighPlatform[i].enable)
				{
					this.weighPlatform[i].sprite.visible=false;
					this.weighPlatform[i].respawnTime++;
					if(this.weighPlatform[i].respawnTime>=100)
					{
						this.weighPlatform[i].enable=true;
						this.weighPlatform[i].sprite.visible=true;
					}
				}
			}
			if(!qq) player.dropping=false;
		}
		WORLD.prototype.viz=function()
		{
			var resol=window.innerWidth/window.innerHeight;
			var sw=1080/d.camera.zoom*resol;
			var sh=720/d.camera.zoom;
			var sx=d.camera.position.x;
			var sy=d.camera.position.y;
			console.log(sw,sh,sx,sy,d.ratio,d.camera.zoom,window.innerWidth,window.innerHeight);
			for(var i=0;i<this.allPlatform.length;i++)
			{
				var obj=this.allPlatform[i];
				if(obj.position.x>sx-sw&&obj.position.x<sx+sw&&obj.position.y>sy-sh&&obj.position.y<sy+sh)
				{
					obj.visible=true;
				}
				else obj.visible=false;
			}
		}
		function UI(g)
		{
			this.minimap=null;
			this.minimapButton=null;
			this.pauseButton=null;
			this.setting=function()
			{
				var my=this;
				this.minimap=new MINIMAP(my);
				this.minimapButton=new BUTTON(0,0,216*d.ratio,216*d.ratio,1);
				this.minimapButton.setImg(d.resourceBox.image.UI[11]);
				this.minimapButton.enable=false;
				this.minimapButton.func=function()
				{
					my.minimap.visible=true;
					my.minimap.button.enable=true;
					my.minimapButton.enable=false;
				}
				this.pauseButton=new BUTTON(40*d.ratio,40*d.ratio,80*d.ratio,80*d.ratio,2);
				this.pauseButton.setImg(d.resourceBox.image.UI[10]);
				this.pauseButton.func=function()
				{
					d.sceneNo=12;
					g.colletta.freeze(true);
					d.noStroke();
					d.fill(0,40);
					d.rect(0,0,window.innerWidth,window.innerHeight);
					d.image(d.resourceBox.image.UI[10],window.innerWidth/2-150,window.innerHeight/2-150,300,300);
				}
			}
			this.run=function()
			{
				d.camera.off();
				this.minimap.button.mousePress()||this.minimapButton.mousePress();
				this.pauseButton.mousePress();
				if(this.minimap.visible) this.minimap.draw();
				if(this.minimapButton.enable) this.minimapButton.draw();
				this.pauseButton.draw();
			}
			function MINIMAP(h)
			{
				var rawdata=d.resourceBox.map[g.currentWorld].platform;
				this.data=[];
				this.width=rawdata.length;
				this.height=rawdata[0].length;
				this.pos=g.colletta.sprite.position;
				this.visible=true;
				for(var i=0;i<this.width;i++)
				{
					this.data[i]=[];
					for(var j=0;j<this.height;j++)
					{
						if(rawdata[i][j]!=0) this.data[i][j]=1;
						else this.data[i][j]=0;
					}
				}
				this.button=new BUTTON(40*d.ratio,40*d.ratio,250*d.ratio,250*d.ratio,1);
				var my=this;
				var myBut=this.button;
				this.button.func=function(){
					my.visible=false;
					myBut.enable=false;
					h.minimapButton.enable=true;
				};
			}
			MINIMAP.prototype.draw=function()
			{
				var x=40*d.ratio;
				var y=40*d.ratio;
				var r=10*d.ratio;
				var Xpos=Math.floor(this.pos.x/120);
				var Ypos=Math.floor((this.pos.y+45)/120);
				d.noStroke();
				d.fill(0,50);
				d.rect(x,y,25*r,25*r);
				d.fill(0,128);
				for(var i=0; i<25; i++)
				{
					if(this.data[Xpos-12+i]===undefined) continue;
					for(var j=0; j<25; j++)
					{
						if(this.data[Xpos-12+i][Ypos-12+j]===undefined) continue;
						if(this.data[Xpos-12+i][Ypos-12+j]==1) d.rect(x+i*r,y+j*r,r,r);
					}
				}
				d.fill("#f398a5");
				d.rect(x+12*r,y+12*r,r,r);
				this.button.draw();
			}
			function BUTTON(_x,_y,_w,_h,_dir)
			{
				this.x=_x; this.y=_y;
				this.dir=_dir;
				if(_w!==undefined) this.width=_w;
				else this.width=100;
				if(_h!==undefined) this.height=_h;
				else this.height=100;
				this.enable=true;
				this.img=null;
				this.func=null;
			}
			BUTTON.prototype.setImg=function(_img)
			{
				this.img=_img;
			}
			BUTTON.prototype.onMouse=function()
			{
				var mx=d.mouseX, my=d.mouseY, w=this.width, h=this.height;
				var x=this.pin()[0],y=this.pin()[1];
				return this.enable && mx>x && mx<x+w && my>y && my<y+h;
			}
			BUTTON.prototype.mousePress=function()
			{
				var e=this.enable;
				if(d.mouseWentUp(d.LEFT)&&this.onMouse()) this.func();
				return e;
			}
			BUTTON.prototype.draw=function()
			{
				if(this.img!=null)
				{
					d.image(this.img,this.pin()[0],this.pin()[1],this.width,this.height);
				}
			}
			BUTTON.prototype.pin=function()
			{
				var x,y;
				switch(this.dir)
				{
					case 1:x=this.x, y=this.y; break;
					case 2:x=window.innerWidth-this.x-this.width, y=this.y; break;
					case 3:x=window.innerWidth-this.x-this.width, y=window.innerHeight-this.y-this.height; break;
					case 4:x=this.x, y=window.innerHeight-this.y-this.height; break;
				}
				return [x,y];
			}
		}
	}
	d.conditionalCollide=function(my, other, condition)
	{
		var res=false;
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
					res=my.collide(other[i])||res;
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
		d.resourceBox.map=d.loadJSON("map/demo.json",function(){this.count++;}.bind(this));
		imgBox.bg[0]=d.loadImage(d.urlData.background[0],function(){this.count++;}.bind(this));
		imgBox.colletta.idle[0]=this.loadAnimData([d.urlData.colletta.idle[0]],function(){this.count++;}.bind(this));
		imgBox.colletta.idle[1]=this.loadAnimData([d.urlData.colletta.idle[1]],function(){this.count++;}.bind(this));
		imgBox.colletta.walk[0]=this.loadAnimData([d.urlData.colletta.walk[0],d.urlData.colletta.walk[1]],function(){this.count++;}.bind(this));
		imgBox.colletta.walk[1]=this.loadAnimData([d.urlData.colletta.walk[2],d.urlData.colletta.walk[3]],function(){this.count++;}.bind(this));
		imgBox.colletta.jump[0]=this.loadAnimData([d.urlData.colletta.jump[0],d.urlData.colletta.jump[1]],function(){this.count++;}.bind(this));
		imgBox.colletta.jump[1]=this.loadAnimData([d.urlData.colletta.jump[2],d.urlData.colletta.jump[3]],function(){this.count++;}.bind(this));
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
		if(this.count==this.max) d.sceneNo=10;
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
