!function(){
	var edt,eInfo,eMap,ePanle;

	//地图编辑器
	lcg.bind("editor-map",function(){
		//初始化dom
		this.extend("dom-module");
		window["editor-map"] = edt = this;
		var self = this;
		//以自身为代理
		this.proxy(this);
		//当前地图数据
		var d;

		//隐藏
		this.close = function(){
			this._proxy.style["display"] = "none";
			if(callback)
				callback(retuVals);
			else
				mainMenu.show();
		}

		//回调
		var callback,retuVals;

		//载入现成的地图
		this.load = function(data,cb,rt){
			callback = cb;
			self.mapInfo = retuVals = rt || {};
			//切换菜单
			topMenu.change("edit");
			//显示
			this._proxy.style["display"] = "";
			//替换数据
			self.story = d = data || Story;

			//===初始化UI===
			this.ids["p-main"].innerText = "";
			//图层表
			ePanle["map"] = lcg.create("em-map-list",d.maps);;
			this.ids["p-main"].appendChild(ePanle["map"]);

			//方块刷子表
			ePanle["brush"] = lcg.create("em-brush");
			this.ids["p-main"].appendChild(ePanle["brush"]);

			//属性设置表
			ePanle["info"] = lcg.create("em-info");
			this.ids["p-main"].appendChild(ePanle["info"]);

			//调试项
			ePanle["debug"] = lcg.create("em-debug");
			this.ids["p-main"].appendChild(ePanle["debug"]);

			//默认选中图层项
			mns[0].onclick();
		}

		//载入图层
		this.initMap = function(map){
			this.ids["panle"].innerText = "";
			this.ids["panle"].appendChild(lcg.create("emp-map",map.map,map.item));
		}

		//UI内容
		//右侧菜单表
		var ePanle = {};
		//当前状态
		var state = "map";
		//菜单列表
		var mns = this.ids["menu"].querySelectorAll("i");
		for(var i = 0;i < mns.length;i++)
			mns[i].onclick = function(){
				changePage(this);
			}

		//菜单展开功能处理
		var changePage = function(dom){
			//设置样式
			for(var i = 0;i < mns.length;i++)
				mns[i].setAttribute("sel","false");
			dom.setAttribute("sel","true");
			state = dom.getAttribute("type");
			//窗口切换
			for(var i in ePanle)
				ePanle[i].style["display"] = "none";
			ePanle[state].style["display"] = "";
		}

		//刷子选择
		var nowBrush,brushType;
		this.selBrush = function(d,type){
			if(nowBrush)
				nowBrush.noSel();
			nowBrush = d;
			brushType = type;
		}

		//点选事件触发
		this.boxClick = function(box){
			//如果是刷子界面
			if(state == "brush")
				return box.changeBox(nowBrush.data,brushType);
			//如果是属性界面
			if(state == "info")
				return eInfo.showBox(box);
		}

		//开始测试
		this.debug = function(){
			this._proxy.style["display"] = "none";
			var story = lcg.create("story",self.story,function(){
				self._proxy.style["display"] = "";
				//切换菜单
				topMenu.change("edit");
			});
			story.run();
		}

		//替换item
		var Items = {},ItemData;
		this.changeItem = function(type,x,y,data){
			var re;
			if(Items[y] == null)
				Items[y] = {};
			/*if(Items[y][x])
				re = ePanle.changeBox(Items[y][x],type,data);
			else
				re = ePanle.addBox({type:});*/
		}
	});

	//ready
	lcg.on("ready",function(){
		//载入地图
		//window["editor-map"].load(Story);
	});

	//UI-图层表
	lcg.dm.bind("em-map-list",
		`<div>
			<div lid="list"></div>
			<div class="em-map-list">
				<p>全局设定</p>
				<div v-mf="[list,'ui-input']"></div>
				<a onclick="this.$root.addMap();">添加地图</a>
			</div>
		</div>`,
		function(maps){
		//初始化dom
		this.extend("dom-module",{
			list:[]
		});
		var self = eMap = this;

		//参数表
		var args = [];

		//刷新表单
		this.ref = function(){
			edt.story.name = edt.story.name || "测试地图";
			this.vue.list.splice(0,this.vue.list.length,{
				type:"string",
				dom:edt.story,
				key:"name",
				title:"地图名"
			},{
				type:"map",
				dom:edt.story,
				key:"start",
				title:"初始地图"
			},{
				type:"number",
				dom:edt.story,
				key:"x",
				title:"初始X"
			},{
				type:"number",
				dom:edt.story,
				key:"y",
				title:"初始Y"
			});
		}
		this.ref();

		//载入参数
		this.load = function(d,item){
			args.splice(0,args.length);
			args.push({
				type:"string",
				dom:d,
				key:"name",
				title:"图层名",
				change:function(v){
					item.vue.name = v;
					self.ref();
				}
			});
			args.push({
				type:"btn",
				dom:{name:"删除地图"},
				key:"name",
				title:"删除地图",
				click:function(){
					item.destory();
					args.splice(0,args.length);
					self.ref();
				}
			});
			args.push({
				type:"string",
				dom:d,
				key:"about",
				title:"地图下方文字"
			});
		}

		//添加地图
		this.addMap = function(){
			var w = Math.max(3,Math.min(25,Number(prompt("地图宽度","11"))));
			var h = Math.max(3,Math.min(14,Number(prompt("地图高度","11"))));
			console.log(w,h);
			var map = [];
			for(var i = 0;i < h;i++){
				var l = [];
				for(var j = 0;j < w;j++)
					l.push(0);
				map.push(l);
			}
			console.log(map);
			var offset = 0;
			for(var i in maps)
				if(i > offset)
					offset = i;
			Vue.set(maps,[Number(offset)+1],{name:"图层"+offset,about:"",map:map,item:JSON.parse(JSON.stringify(map))});
			self.ref();
		};

		//刷子列表
		this.ids["list"].appendChild(lcg.create("ui-open",{list:maps,type:"em-map",title:"地图层"}));
		this.ids["list"].appendChild(lcg.create("ui-open",{list:args,type:"ui-input",title:"图层属性"}));
	});

	//图层处理器
	lcg.dm.bind("em-map",
	`<div class="em-map e-item">
		<a>{{name}}</a>
	</div>`,function(d,p,id,xb){
		//初始化dom-module
		this.extend("dom-module",d);
		var self = this;

		//载入地图
		this._proxy.onclick = function(){
			edt.initMap(d);
			eMap.load(d,self);
		}

		//默认载入第一个
		var min = 9999;
		for(var i in xb)
			if(i < min)
				min = i;
		if(id == min)
			this._proxy.onclick();
	});

	//地图展示器
	lcg.dm.bind("emp-map",
	`<div class="emp-map"></div>`
	,function(d,id){
		//初始化dom
		this.extend("dom-module");
		ePanle = this;

		//替换指定盒子
		this.changeBox = function(cls,x,y,type,data){
			var dd = d;
			if(cls == "item")
				dd = id;
			var dom = getBox(cls,x,y);
			if(dom)
				this._proxy.removeChild(dom);
			if(typeof type == "number")
				dd[y][x] = type;
			else
				dd[y][x] = [type,data];
			return this.addBox(dd,x,y);
		}

		var maps = [];
		var items = [];

		//获取对象Dom
		var getBox = function(cls,x,y){
			var list = maps;
			if(cls == "item")
				list = items;
			for(var i in list)
				if(list[i].x == x && list[i].y == y){
					var re = list[i];
					list.splice(i,1);
					return re;
				}
		}

		//添加盒子
		this.addBox = function(d,x,y){
			if(d == id && d[y][x] == 0)
				return null;
			var dom = lcg.create("emp-box",d,x,y,this);
			dom.x = x,dom.y = y;
			this._proxy.appendChild(dom);
			if(d == id)
				items.push(dom);
			else
				maps.push(dom);
		}

		//创建对应的box
		for(var i in d)
			for(var j in d[i])
				this.addBox(d,j,i);

		//创建item
		for(var i in id)
			for(var j in id[i])
				this.addBox(id,j,i);
	});

	//鼠标按下
	var mouseDown = false;
	lcg.domEvent(document,["mousedown"],function(){
		mouseDown = true;
	});
	lcg.domEvent(document,["mouseup"],function(){
		mouseDown = false;
	});

	//地图展示项
	lcg.dm.bind("emp-box",
	`<div class="emp-box bottom">
		<div v-html="html" lid="panle"></div>
	</div>`
	,function(d,x,y,item){
		//初始化dom
		this.extend("dom-module",{
			html:"",
			py:0
		});
		var self = this;
		this.data = this.vue;

		//横坐标偏移
		var px = d[0].length/2*G.w - 140;

		//设置坐标
		this.x = x;
		this.y = y;

		//分析盒子类型
		var type = d[y][x],data = {};
		if(typeof type == "number")
			type = G.hxs[type];
		else{
			if(type[1] != null && typeof type[1] == "object")
				type[1] = JSON.parse(JSON.stringify(type[1]));
			data = type[1];
			type = type[0];
		}
		//继承子逻辑
		if(type)
			this.extend("box-"+type,{type:type,x:x,y:y},null,data);
		else
			this._proxy.setAttribute("style","--color:rgba(0,0,0,0);opacity:0.5;");
		this.type = type,this.datas = data;

		//渲染
		this.render = function(){
			//this._proxy.style["left"] = (this.x*G.w+p.data.left)+"px";
			//this._proxy.style["top"] = this.y*G.h+"px";
			this._proxy.style["transform"] = "translate3d("+(this.x*G.w-px)+"px,"+this.y*G.h+"px,"+(Number(this.y) + (this.data.py || 0))+"px)";
			//this._proxy.style["z-index"] = Math.floor(this.y + (this.data.py || 0));
		}
		this.render();

		//点击事件
		this._proxy.onclick = function(){
			edt.boxClick(self);
		}
		this._proxy.onmousemove = function(){
			if(mouseDown)
				edt.boxClick(self);
		}

		//切换盒子
		this.changeBox = function(box,cls){
			//判断类型是否相同
			var b_type = G.hxs[box.type] || box.type;
			if(b_type == type)
				return;
			//获取默认参数
			var datas = {};
			for(var i in box.args)
				datas[i] = box.args[i][1];
			ePanle.changeBox(cls,this.x,this.y,box.type,datas);
		}

		//保存数据
		this.save = function(){
			//设置值
			d[y][x] = [type,data];
			//刷新自身
			this.extend("box-"+type,{type:type,x:x,y:y},null,data);
		}
	});

	//UI-刷子列表
	lcg.dm.bind("em-brush",`<div></div>`,function(){
		//初始化dom
		this.extend("dom-module");

		//刷子列表
		this._proxy.appendChild(lcg.create("ui-open",{list:MainBox,type:"em-brush-box",title:"预设地面"}));
		this._proxy.appendChild(lcg.create("ui-open",{list:MainItem,type:"em-brush-item",title:"预设部件"}));
	});

	//方块展示项
	lcg.dm.bind("em-brush-box",
	`<div class="em-brush-item e-item">
		<span v-html="html" lid="sp"></span>
		<a>{{name}}</a>
	</div>`
	,function(d,p,id){
		d.html = d.html || "";
		//初始化dom
		this.extend("dom-module",d);
		var self = this;

		//设置颜色
		this.ids["sp"].setAttribute("style","--color:"+d.color+";");

		//记录参数
		this.data = d;

		//设置提示
		this._proxy.title = d.about;

		//取消选中
		this.noSel = function(){
			this._proxy.setAttribute("sel","false");
		}

		//选中
		this._proxy.onclick = function(){
			edt.selBrush(self,"box");
			this.setAttribute("sel","true");
		}

		//默认选中第一个
		if(id == "0")
			this._proxy.onclick();
	});

	//方块展示项-物体
	lcg.bind("em-brush-item",function(d,p,id){
		this.extend("em-brush-box",d,p,id);
		var self = this;

		//选中
		this._proxy.onclick = function(){
			edt.selBrush(self,"item");
			this.setAttribute("sel","true");
		}
	});

	//UI-属性列表
	lcg.dm.bind("em-info",
	`<div>
		<div class="em-info">
			<a class="e-item">请选择方块编辑参数</a>
			<a class="e-item">类型:{{type}}</a>
			<a class="e-item">x:{{x}}</a>
			<a class="e-item">y:{{y}}</a>
		</div>
		<div lid="p"></div>
	</div>`
	,function(){
		//初始化dom
		this.extend("dom-module",{
			x:0,
			y:0,
			type:"0"
		});

		eInfo = this;
		var args = [];

		//展示盒子属性
		this.showBox = function(box){
			this.vue.x = box.x;
			this.vue.y = box.y;
			this.vue.type = box.type;
			var info = getBoxInfoOfType(box.type);
			args.splice(0,args.length);
			//参数设置项
			var _args = info.args || {};
			for(var i in _args){
				var _d = _args[i]
				args.push({title:_d[2] || i,type:_d[0],dom:box.datas,key:i,change:function(){
					box.save();
				}});
			}
		}

		//参数列表
		this.ids["p"].appendChild(lcg.create("ui-open",{list:args,type:"ui-input",title:"参数设置"}));
	});

	//UI-测试
	lcg.dm.bind("em-debug",
	`<div class="em-debug">
		<a class="btn" onclick="this.$root.run();">运行</a>
		<a class="btn" onclick="this.$root.create();">生成代码</a>
		<textarea lid="text"></textarea>
		<a class="btn" onclick="this.$root.load();">载入代码</a>
		<a class="btn" onclick="this.$root.push();">提交地图</a>
		<a class="btn" onclick="this.$root.pushNew();">提交为新地图</a>
	</div>`
	,function(){
		//初始化dom
		this.extend("dom-module");

		//启动调试
		this.run = function(){
			edt.debug();
		}

		//生成代码
		this.create = function(){
			this.ids["text"].value = JSON.stringify(edt.story);
		}

		//载入代码
		this.load = function(){
			try{
				var story = JSON.parse(this.ids["text"].value);
			}catch(e){
				alert("代码格式有误!");
			}
			edt.load(story);
		}

		//提交地图
		this.push = function(){
			var data = {};
			data["id"] = edt.mapInfo.id;
			data["uid"] = localStorage["openid"];
			data["name"] = edt.story.name;
			data["value"] = JSON.stringify(edt.story);
			axios.post("login/saveMap.php",data).then(function(res){
				alert("提交成功！");
			});
		}

		//提交为新地图
		this.pushNew = function(){
			var data = {};
			data["id"] = null;
			data["uid"] = localStorage["openid"];
			data["name"] = edt.story.name;
			data["value"] = JSON.stringify(edt.story);
			axios.post("login/saveMap.php",data).then(function(res){
				alert("提交成功！");
			});
		}
	});

}();