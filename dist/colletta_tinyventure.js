var game=function(d)
{
	d.isPC=true;
	d.sceneNo=-1;
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
		switch(d.sceneNo)
		{
			case -1:d.loading.execute(); break;
			default:d.background(255);
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
		var animeBox=d.resourceBox.image.colletta;
		for(var action in animeBox)
		{
			this.sprite.addAnimation(action+1,animeBox[action][0]);
			this.sprite.addAnimation(action+2,animeBox[action][1]);
		}
	}
	PLAYER.prototype.view=function()
	{
		this.sprite.changeAnimation('idle1');
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
		var imgBox=d.resourceBox.image;
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
		this.max=71;
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
