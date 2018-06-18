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
	function RESOURCE_BOX()
	{
		this.map=[];
		this.image={
			bg:[], 
			colletta:{idle:[],walk:[],jump:[],rope:[],wall:[]}, 
			item:[],
//			main-ui:[],
			objects:[],
//			platform:[],
//			ui:[]
		};
	}
	function LOADING()
	{
		this.count=0;
		this.max=0;
	}
	LOADING.prototype.loadData=function()
	{
		resourceBox.image.bg[0]=loadImage(d.urlData.background[0],function(){this.count++;}.bind(this));
		for(var key in d.urlData.colletta)
		{
			for(var i in d.urlData.colletta[key])
			{
				resourceBox.image.colletta[key][i]=loadImage(d.urlData.colletta[key][i],function(){this.count++;}.bind(this));
			}
		}
		for(var i in d.urlData.item)
		{
			resourceBox.image.item[i]=loadImage(d.urlData.item[i],function(){this.count++;}.bind(this));
		}
		for(var i in d.urlData.item)
		{
			resourceBox.image.objects[i]=loadImage(d.urlData.objects[i],function(){this.count++;}.bind(this));
		}
		this.max=56;//97
	}
	LOADING.prototype.execute=function()
	{
		d.background(0);
		d.fill(255);
		d.noStroke();
		d.rect(0,0,map(this.count,0,this.max,0,width),50);
		if(this.count==this.max) d.sceneNo=0;
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