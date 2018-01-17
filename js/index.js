!function(){
	//基本类型映射表
	var hxs = G.hxs;

	//游戏主体
	lcg.bind("game",function(){
		//全局变量
		window._game = this;

		//初始化dom
		this.extend("dom-module");
		var self = this;

		//地图对象表
		var map = this.map = [];
		//物体对象表
		this.items = [];

		//单局数据
		this.data = {
			left:0,
			top:0
		};

		//游戏是否运行中
		this.run = false;

		//步事件
		var step = function(){
			setTimeout(step,20);
			//是否运行中判定
			if(!self.run)
				return;
			//发送步事件
			for(var i in self.items)
				self.items[i].sendMessage("step");
			for(var i in map)
				for(var j in map[i])
					map[i][j].sendMessage("step");
		}
		step();

		//添加对象
		this.addItem = function(type,x,y,data){
			var box = lcg.create("box",{type:type,x:x,y:y},self,data);
			self.ids["panle"].appendChild(box);
			self.items.push(box._mainModule);
		}

		//删除对象
		this.removeItem = function(item){
			for(var i in self.items)
				if(self.items[i] == item)
					return self.items.splice(i,1);
		}

		//触发对象消息
		this.itemMessage = function(type,val,query,items){
			query = query || {};
			items = items || self.items;

			//循环触发消息
			for(var i in items){
				var it = items[i];
				//坐标筛选
				if(query.loc){
					var loc = it.getLoc();
					if(query.loc.x != null && loc.x != query.loc.x)
						continue;
					if(query.loc.y != null && loc.y != query.loc.y)
						continue;
				}
				//不触发自身
				if(query.target)
					if(query.target == it)
						continue;
				//触发消息
				it.sendMessage(type,val);
			}
		}

		//触发所有对象消息
		this.allMessage = function(type,val,query){
			this.itemMessage(type,val,query);
			this.itemMessage(type,val,query,self.maps);
		}

		//当前关卡数据
		var nowData = null;

		//游戏结束
		this.gameOver = function(key,val){
			var args = arguments;
			self.run = false;
			//发送清除事件
			for(var i in self.items)
				self.items[i].sendMessage("del");
			for(var i in map)
				for(var j in map[i])
					map[i][j].sendMessage("del");
			//隐藏地图
			self.ids["panle"].className = "hide";
			//切换菜单
			if(key == "close"){
				self.ids["about"].style["display"] = "none";
				topMenu.change("none");
			}
			//0.5秒后清除dom
			setTimeout(function(){
				//重置当前关
				if(key == "ref")
					self.start(nowData,self.nowStory);
				//如果是初始化新层
				if(typeof key != "string")
					self.start.apply(self,args);
				//如果结束关卡
				if(key == "close"){
					self._proxy.style["display"] = "none";
					self.nowStory.close(val);
				}
			},500);
		}

		//设置提示文本
		this.setText = function(a){
			a = a.replace(/\[(.*?)\]/g,"<a class='ui-box'>$1</a>");
			self.ids["about"].innerHTML = a;
			self.ids["about"].style["top"] = self._proxy.offsetHeight/2 + nowData.map.length*40/2+20+"px";
			self.ids["about"].style["display"] = "none";
			setTimeout(function(){
				self.ids["about"].style["display"] = "";
			})
		}

		//初始化
		this.start = function(d,story){
			//切换菜单
			topMenu.change("game");
			//显示层
			self._proxy.style["display"] = "";

			nowData = d;
			self.nowStory = story;
			//地图数据
			var datas = d.map;
			self.setText(d.about || "");
			//初始化内容
			self.ids["panle"].innerText = "";
			self.ids["panle"].className = "";
			map = self.map = [];
			self.maps = [];
			self.items = [];
			self.run = true;
			//循环初始图表
			for(var i in datas){
				var list = [];
				self.data.left = -datas[0].length/2*G.w;
				self.data.top = -datas.length/2*G.h;
				for(var j in datas[i]){
					if(typeof datas[i][j] == "number")
						var dom = lcg.create("box",{type:hxs[datas[i][j]],x:j,y:i},self);
					else
						var dom = lcg.create("box",{type:datas[i][j][0],x:j,y:i},self,datas[i][j][1]);
					list.push(dom._mainModule);
					self.maps.push(dom._mainModule);
					self.ids["panle"].appendChild(dom);
				}
				map.push(list);
			}

			//创建地图上部件
			for(var i in d.item){
				for(var j in d.item[i]){
					var di = d.item[i][j];
					self.addItem(di[0],j,i,di[1]);
				}
			}

			//创建玩家
			self.addItem("player",d.x,d.y);
		};

		//this.start(GD[0]);
	});

	//方块
	lcg.dm.bind("box",
	`<div class="box bottom">
		<div v-html="html" lid="panle"></div>
	</div>`,function(d,p,dt){
		//初始化dom
		this.extend("dom-module",{
			//内部html内容
			html:"",
			//z-index偏移量（整数）
			py:-1
		});
		var self = this;

		this.data = this.vue;

		//设置坐标
		this.x = d.x;
		this.y = d.y;

		//继承子逻辑
		if(d.type)
			this.extend("box-"+d.type,d,p,dt);
		else
			this._proxy.style["display"] = "none";
		self.type = d.type;

		//返回坐标
		this.getLoc = function(){
			return {x:this.x,y:this.y};
		}

		//渲染
		this.render = function(){
			//this._proxy.style["left"] = (this.x*G.w+p.data.left)+"px";
			//this._proxy.style["top"] = this.y*G.h+"px";
			this._proxy.style["transform"] = "translate3d("+(this.x*G.w+p.data.left)+"px,"+(this.y*G.h + p.data.top)+"px,"+(Number(this.y) + (this.data.py || 0))+"px)";
			//this._proxy.style["z-index"] = Math.floor(this.y + (this.data.py || 0));
		}
		this.render();
	});

	//地板
	lcg.bind("box-floor",function(){
		this._proxy.className += " box-floor bottom";
	});

	//墙壁
	lcg.bind("box-walls",function(d,p){
		this.extend("box-stone",d,p);
		p.addItem("wall",d.x,d.y);
		this._proxy.style["display"] = "none";
	});

	//终点
	lcg.bind("box-end",function(d,p,dt){
		var self = this;
		this.message({
			//玩家进入
			"move-over":function(pl){
				if(num > 0 || pl.type != "player")
					return;
				pl.stop();
				p.gameOver("close","win");
			},
			//需求量变更
			"end-add":function(data){
				num-=data.num;
				render();
			}
		});

		//需求量
		dt = dt || {};
		var num = Number(dt.num || 0);
		//内容渲染
		var render = function(){
			if(num > 0)
				self.data.html = "<a>"+num+"</a>";
			else
				self.data.html = "";
		}

		//首次渲染
		render();

		//设置样式
		this._proxy.className += " box-end bottom";
	});

	//石头地面
	lcg.bind("box-stone",function(d,p){
		//进入后停止移动
		this.message({
			"move-over":function(p){
				p.stop();
			}
		});
		//设置样式
		this._proxy.className += " box-stone bottom";
	});

	//陷阱地面
	lcg.bind("box-trap",function(){
		//进入后停止移动
		this.message({
			"move-over":function(p){
				if(p.type != "player")
					return;
				p.stop();
				p.die();
			}
		});
		//设置样式
		this._proxy.className += " box-trap bottom";
		this.data.html = 
		`<a>
			<i class="if icon-ci"></i>
			<i class="if icon-ci"></i>
			<i class="if icon-ci"></i>
			<i class="if icon-ci"></i>
			<i class="if icon-ci"></i>
			<i class="if icon-ci"></i>
			<i class="if icon-ci"></i>
			<i class="if icon-ci"></i>
			<i class="if icon-ci"></i>
		</a>`;
	});

	//转向地面
	lcg.bind("box-spd",function(d,p,data){
		//设置样式
		this._proxy.className += " box-spd bottom";
		var self = this;

		var fx = data.fx;

		var render = function(){
			//方向替换
			if(fx == "up")
				self.data.html = "<div style='transform:rotateZ(0deg);'><i class='if icon-jiantou'></i><div>";
			if(fx == "right")
				self.data.html = "<div style='transform:rotateZ(90deg);'><i class='if icon-jiantou'></i><div>";
			if(fx == "down")
				self.data.html = "<div style='transform:rotateZ(180deg);'><i class='if icon-jiantou'></i><div>";
			if(fx == "left")
				self.data.html = "<div style='transform:rotateZ(270deg);'><i class='if icon-jiantou'></i><div>";
		}
		render();

		//顺时针旋转表
		var rh = {
			"up":"right",
			"right":"down",
			"down":"left",
			"left":"up"
		};

		//事件触发
		this.message({
			"move-over":function(pl){
				pl.changeFX(fx);
			},
			//旋转
			"spd-rotate":function(data){
				var num = Number(data.num)
				while(num < 0)
					num+=4;
				for(var i = 0;i < num;i++)
					fx = rh[fx];
				render();
			},
			//转向
			"spd-value":function(data){
				fx = data.fx;
				render();
			}
		});
	});

	//跳转地面
	lcg.bind("box-jump",function(d,p,data){
		//设置样式
		this._proxy.className += " box-jump bottom";
		this.data.html = "<i class='if icon-jump'></i>";
		//事件触发
		this.message({
			"move-over":function(pl){
				pl.stop();
				p.nowStory.changeMap(data.map,data.x,data.y);
			}
		});
	});

}();