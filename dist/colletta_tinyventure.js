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
		d.scale(d.ratio);
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
	function INGAME()
	{
		this.currentWorld="world1";
		this.colletta=null;
		this.world=null;
		this.setup=function()
		{
			this.colletta=new PLAYER(this);
			this.world=new WORLD(this);
			d.sceneNo++;
		}
		this.run=function()
		{
			d.image(d.resourceBox.image.bg[0],0,0);
			this.colletta.view();
			d.drawSprites();
		}
		function PLAYER(g)
		{
			this.x=d.resourceBox.map[g.currentWorld].playerSpawn[0]*d.tileSize;
			this.y=d.resourceBox.map[g.currentWorld].playerSpawn[1]*d.tileSize;
			this.sprite=d.createSprite(this.x,this.y,d.tileSize,d.tileSize*1.5);
			var animeBox=d.resourceBox.image.colletta;
			for(var action in animeBox)
			{
				this.sprite.addAnimation(action+1,animeBox[action][0]);
				this.sprite.addAnimation(action+2,animeBox[action][1]);
			}
			this.sprite.setCollider("rectangle",0,0,d.tileSize,d.tileSize*1.5);
			this.sprite.debug=true;
		}
		PLAYER.prototype.view=function()
		{
			this.sprite.changeAnimation('idle1');
//			d.drawSprite(this.sprite);
			
		}
		function WORLD(g)
		{
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
			console.log(g,i,j,tileNo);
			a.debug=true;
			if(tileNo!=0) a.addImage(d.resourceBox.image.platform[tileNo-1]);
			else a.remove();
			switch(tileNo)	
			{
				case 1: case 2: case 3: case 4: case 5:
				case 6: case 7: case 8: case 9:
				case 25: case 27:
				case 10:console.log('a'); this.ground.add(a); break;
				case 11: case 12: case 13:
				case 14:console.log('b'); this.tree.add(a); break;
				case 15: case 16:
				case 17:console.log('c'); this.moving.add(a); break;
				case 18: case 19: case 20:
				case 21:console.log('d'); this.wood.add(a); break;
				case 22: case 23:
				case 24:console.log('e'); this.Vrope.add(a); break;
				case 26:console.log('f'); this.Hrope.add(a); break;
				default:console.log('z');
			}
		}
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
		imgBox.colletta.wall[0]=this.loadAnimData([d.urlData.colletta.wall[0]],function(){this.count++;}.bind(this));
		imgBox.colletta.wall[1]=this.loadAnimData([d.urlData.colletta.wall[1]],function(){this.count++;}.bind(this));
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
