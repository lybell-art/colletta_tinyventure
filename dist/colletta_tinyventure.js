var game=function(d)
{
	d.isPC=true;
	d.sceneNo=-1;
	d.resourceBox=new RESOURCE_BOX();
	d.loading=new LOADING();
	d.urlData=null;
	d.colletta=null;
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
		switch(d.sceneNo)
		{
			case -1:d.loading.execute(); break;
			case 0:d.colletta=new PLAYER(); d.sceneNo++; break;
			default:
				d.background(255);
				d.colletta.view();
		}
	};
	d.windowResized=function()
	{
		d.resizeCanvas(window.innerWidth,window.innerHeight);
	}
	function PLAYER()
	{
		this.x=d.width/2;
		this.y=d.height/2;
		this.sprite=d.createSprite(this.x,this.y,120,180);
		this.sprite.addAnimation("idle",d.resourceBox.image.colletta.idle);
	}
	PLAYER.prototype.view=function()
	{
		d.drawSprite(this.sprite);
	}
	function RESOURCE_BOX()
	{
		this.map=[];
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
		d.resourceBox.image.bg[0]=d.loadImage(d.urlData.background[0],function(){this.count++;}.bind(this));
		for(var key in d.urlData.colletta)
		{
			for(var i in d.urlData.colletta[key])
			{
				d.resourceBox.image.colletta[key][i]=d.loadImage(d.urlData.colletta[key][i],function(){this.count++;}.bind(this));
			}
		}
		for(var i in d.urlData.item)
		{
			d.resourceBox.image.item[i]=d.loadImage(d.urlData.item[i],function(){this.count++;}.bind(this));
		}
		for(var i in d.urlData.objects)
		{
			d.resourceBox.image.objects[i]=d.loadImage(d.urlData.objects[i],function(){this.count++;}.bind(this));
		}
		for(var i in d.urlData.platform)
		{
			d.resourceBox.image.platform[i]=d.loadImage(d.urlData.platform[i],function(){this.count++;}.bind(this));
		}
		for(var i in d.urlData.UI)
		{
			d.resourceBox.image.UI[i]=d.loadImage(d.urlData.UI[i],function(){this.count++;}.bind(this));
		}
		this.max=91;
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
