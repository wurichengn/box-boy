!function(){

	//故事处理器
	//一关可以由多个地图层组成，组合在一起的整个逻辑处理为一个故事
	lcg.bind("story",function(d,cb){
		//以自身为代理
		this.proxy(this);
		//复制数据对象
		d = JSON.parse(JSON.stringify(d));

		//转换地图
		this.changeMap = function(cname,x,y){
			var map = d.maps[cname];
			map.x = x,map.y = y;
			_game.gameOver(map,this);
		}

		//运行故事
		this.run = function(){
			var map = d.maps[d.start];
			map.x = d.x;
			map.y = d.y;
			_game.start(map,this);
		}

		//结束故事
		this.close = function(val){
			if(cb)
				cb(val);
		}
	});

	//ready
	lcg.on("ready",function(){
		//var story = lcg.create("story",Story);
		//story.run();
	});

}();