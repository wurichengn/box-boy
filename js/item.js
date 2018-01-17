!function(){

	lcg.bind("item",function(){
		this._proxy.className = "box";
		this.data.py = 0.1;
	});

	//移动对象
	lcg.bind("box-move",function(p){
		this.extend("item");
		this.data.py = 0.11;
		var self = this;

		//z-index偏移
		this.data.py = 0.95;

		//消息侦听
		this.message({
			//步事件
			"step":function(){
				//处理移动动画
				moveAni();
				//渲染
				self.render();
			}
		});

		//方向反向表
		var move_hx = {
			"left":"right",
			"up":"down",
			"right":"left",
			"down":"up"
		}

		//移动参数
		var fx = "";
		var moving = false;

		//转向
		this.changeFX = function(f){
			fx = f;
		}
		this.getFX = function(){
			return fx;
		}

		//移动
		this.move = function(type){
			//无效指令去除
			if(move_hx[type] == null || moving)
				return;
			//处理参数
			moving = true;
			fx = type;

			this.moveAct();
		};

		//停止移动
		this.stop = function(){
			moving = false;
		}

		//死亡
		this.die = function(){
			this.sendMessage("die");
			this._proxy.style["opacity"] = 0;
			p.removeItem(this);
		}

		//移动处理
		this.moveAct = function(ani){
			//如果停止移动则不执行
			if(moving == false)
				return;
			//获取目标块和当前块
			var target = null,now = p.map[this.y][this.x],t = {};

			//获取下一块
			if(fx == "down")
				t = {y:Number(this.y)+1,x:this.x};
			if(fx == "up")
				t = {y:Number(this.y)-1,x:this.x};
			if(fx == "left")
				t = {y:this.y,x:Number(this.x)-1};
			if(fx == "right")
				t = {y:this.y,x:Number(this.x)+1};
			//上一块
			u = {x:Number(this.x)+(this.x-t.x),y:Number(this.y)+(this.y-t.y)};
			var uper = p.map[u.y][u.x]

			//如果由动画结束执行，则触发out-end和over事件
			if(ani){
				uper.sendMessage("move-out-end",this);
				p.itemMessage("move-out-end",this,{loc:{x:u.x,y:u.y},target:this});
				//如果停止移动则不执行后续内容
				if(moving == false)
					return;
				now.sendMessage("move-over",this);
				p.itemMessage("move-over",this,{loc:{x:this.x,y:this.y},target:this});
				//如果停止移动则不执行后续内容
				if(moving == false)
					return;
			}

			//触发当前块的out事件
			now.sendMessage("move-out",this);
			p.itemMessage("move-out",this,{loc:{x:this.x,y:this.y},target:this});
			//如果停止移动则不执行后续内容
			if(moving == false)
				return;

			//重新获取下一块
			if(fx == "down")
				t = {y:Number(this.y)+1,x:this.x};
			if(fx == "up")
				t = {y:Number(this.y)-1,x:this.x};
			if(fx == "left")
				t = {y:this.y,x:Number(this.x)-1};
			if(fx == "right")
				t = {y:this.y,x:Number(this.x)+1};
			//获取目标
			target = p.map[t.y][t.x];

			//触发下一块的in事件
			target.sendMessage("move-in",this);
			p.itemMessage("move-in",this,{loc:{x:t.x,y:t.y},target:this});
			//如果停止移动则不执行后续内容
			if(moving == false)
				return;

			//移动动画
			aniTo(t.x,t.y);
		}

		//动画移动到
		var aniTo = function(x,y,time){
			if(aniIng)
				return;
			aniIng = true;
			a_sx = Number(self.x);
			a_sy = Number(self.y);
			a_ex = Number(x);
			a_ey = Number(y);
			a_now = 0;
			a_time = time || 100;
		}

		//返回坐标
		this.getLoc = function(){
			return {x:a_ex,y:a_ey};
		}

		var aniIng = false,a_sx,a_sy,a_ex = this.x,a_ey = this.y,a_time,a_now;

		//移动动画处理
		var moveAni = function(){
			if(aniIng == false)
				return;
			a_now += 20;
			if(a_now >= a_time)
				a_now = a_time;
			self.x = a_now/a_time*(a_ex-a_sx)+a_sx;
			self.y = a_now/a_time*(a_ey-a_sy)+a_sy;
			//如果动画结束
			if(a_now == a_time){
				aniIng = false;
				self.moveAct(true);
			}
		}
	});

	//箱子
	lcg.bind("box-box",function(d,p,dt){
		//继承自移动对象
		this.extend("box-move",p);
		var self = this;

		//设置样式
		this._proxy.className += " box-box";

		//事件侦听
		this.message({
			"move-in":function(pl){
				pl.stop();
				self.move(pl.getFX());
			}
		});
	});

	//touch侦听
	var tcb;
	touch.on(document,"touchmove",function(e){
		e.preventDefault();
	});
	touch.on(document,"swipe",function(e){
		if(tcb)
			tcb(e.direction);
	});

	//玩家盒子
	lcg.bind("box-player",function(d,p,dt){
		//继承自移动对象
		this.extend("box-move",p);

		var self = this;

		//设置样式
		this._proxy.className += " box box-player";
		this.data.html = "<i class='if icon-xiaolian'></i>";

		//颜色
		this.color = "#ff7272";
		this.changeColor = function(color){
			this.color = color;
			this._proxy.setAttribute("style","--color:"+color+";");
		}

		//移动逻辑
		window.onkeydown = function(e){
			if(!p.run)
				return;
			self.move(e.key.substr(5).toLowerCase());
		}
		tcb = function(fx){
			if(!p.run)
				return;
			self.move(fx);
		}

		this.message({
			//死亡侦听
			"die":function(){
				this.data.html = "<i class='if icon-kulian'></i>";
				this._proxy.className += " player-die";
				p.gameOver("ref");
			},
			//阻止箱体移动
			"move-in":function(pl){
				pl.stop();
			}
		})
	});

	//墙体
	lcg.bind("box-wall",function(d,p,dt){
		this.extend("item");
		//样式
		this._proxy.className += " box box-wall";
		this.data.html = "<a></a>";

		//消息处理
		this.message({
			"move-in":function(player){
				player.stop();
			}
		});
	});

	//变色器
	lcg.bind("box-color-change",function(d,p,dt){
		//继承自基本对象
		this.extend("item");

		//颜色
		var color = dt.color || "ff7272";
		this.ids["panle"].style["border-color"] = color;
		this._proxy.className = "box-base box-color-change bottom";

		//侦听事件
		this.message({
			"move-over":function(pl){
				//类型判断
				if(pl.type == "player"){
					pl.changeColor(color);
				}
			}
		});
	});

	//颜色门
	lcg.bind("box-color-door",function(d,p,dt){
		//继承自基本对象
		this.extend("item");

		//z-index偏移
		this.data.py = 1;

		//样式
		this._proxy.className += " box-color-door";
		var color = dt.color || "ff7272";
		this._proxy.style["color"] = color;

		//侦听事件
		this.message({
			"move-in":function(pl){
				//类型判断
				if(pl.type == "player"){
					if(pl.color != color)
						pl.stop();
				}
			}
		});
	});

	//单次开关
	lcg.bind("box-switch-one",function(d,p,dt){
		//继承自基本对象
		this.extend("item");
		var self = this;
		this.data.html = "<a>"+dt.text+"</a>";

		//样式
		this._proxy.className = "box-base box-switch-base bottom";
		var open = false;
		var loc = {};
		if(dt.x != "不筛选" && dt.x != "")
			loc.x = dt.x;
		if(dt.y != "不筛选" && dt.y != "")
			loc.y = dt.y;

		//侦听事件
		this.message({
			"move-over":function(pl){
				if(open)
					return;
				open = true;
				//改变样式
				self._proxy.className = "box-base box-switch-base bottom open";
				//触发事件
				p.allMessage(dt["down-msg"][0],dt["down-msg"][1],{loc:loc});
			}
		});
	});

	//多次开关
	lcg.bind("box-switch-many",function(d,p,dt){
		//继承自基本对象
		this.extend("item");
		var self = this;
		this.data.html = "<a>"+dt.text+"</a>";

		//样式
		this._proxy.className = "box-base box-switch-base bottom box-switch-many";
		var loc = {};
		if(dt.x != "不筛选" && dt.x != "")
			loc.x = dt.x;
		if(dt.y != "不筛选" && dt.y != "")
			loc.y = dt.y;

		//侦听事件
		this.message({
			"move-over":function(pl){
				//触发事件
				p.allMessage(dt["down-msg"][0],dt["down-msg"][1],{loc:loc});
			}
		});
	});

	//按压开关
	lcg.bind("box-switch-press",function(d,p,dt){
		//继承自基本对象
		this.extend("item");
		var self = this;
		this.data.html = "<a>"+dt.text+"</a>";

		//样式
		this._proxy.className = "box-base box-switch-base bottom box-switch-press";
		var loc = {};
		if(dt.x != "不筛选" && dt.x != "")
			loc.x = dt.x;
		if(dt.y != "不筛选" && dt.y != "")
			loc.y = dt.y;

		//侦听事件
		this.message({
			"move-over":function(pl){
				//触发事件
				p.allMessage(dt["down-msg"][0],dt["down-msg"][1],{loc:loc});
			},
			"move-out-end":function(pl){
				//触发事件
				p.allMessage(dt["up-msg"][0],dt["up-msg"][1],{loc:loc});
			}
		});
	});

	//单次开关
	lcg.bind("box-switch-open",function(d,p,dt){
		//继承自基本对象
		this.extend("item");
		var self = this;
		this.data.html = "<a>"+dt.text+"</a>";
		
		//样式
		this._proxy.className = "box-base box-switch-base bottom box-switch-open";
		var open = false;
		var loc = {};
		if(dt.x != "不筛选" && dt.x != "")
			loc.x = dt.x;
		if(dt.y != "不筛选" && dt.y != "")
			loc.y = dt.y;

		//侦听事件
		this.message({
			"move-over":function(pl){
				if(open){
					open = false;
					//改变样式
					self._proxy.className = "box-base box-switch-base bottom box-switch-open";
					//触发事件
					p.allMessage(dt["up-msg"][0],dt["up-msg"][1],{loc:loc});
				}else{
					open = true;
					//改变样式
					self._proxy.className = "box-base box-switch-base bottom box-switch-open open";
					//触发事件
					p.allMessage(dt["down-msg"][0],dt["down-msg"][1],{loc:loc});
				}
			}
		});
	});

}();