

!function(){

	window._type = "Phone";
	//PC/移动端判断
	var IsPC = function()
	{
       var userAgentInfo = navigator.userAgent;  
       var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");  
       var flag = true;  
       for (var v = 0; v < Agents.length; v++) {  
           if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }  
       }  
       return flag;  
	}
	if(IsPC())
		window._type = "PC";


	//菜单
	lcg.bind("menus",function(){
		//初始化Dom
		this.extend("dom-module");

		window.topMenu = this;

		//切换顶部菜单
		this.change = function(key){
			for(var i in this.ids)
				this.ids[i].style["display"] = "none";
			if(this.ids[key])
				this.ids[key].style["display"] = "";
		}
	});

	//主菜单
	lcg.bind("ui-main",function(){
		this.extend("dom-module");
		window.mainMenu = this;

		//移动端处理
		if(_type == "Phone")
			this.ids["edit"].style["display"] = "none";

		//进入编辑器
		this.goEdit = function(){
			this._proxy.style["display"] = "none";
			window["editor-map"].load();
		}

		//进入关卡选择
		this.goLevel = function(){
			this._proxy.style["display"] = "none";
			levelMenu.show();
		}

		//进入社区
		this.goBlog = function(){
			this._proxy.style["display"] = "none";
			blog.show();
		}

		//显示界面
		this.show = function(){
			this._proxy.style["display"] = "";
			//切换菜单
			topMenu.change("none");
		}
	});

	//选关界面
	lcg.bind("ui-levels",function(){
		//初始化dom
		this.extend("dom-module");
		window.levelMenu = this;

		//移动端处理
		if(_type == "Phone")
			this._proxy.className += " phone";

		var ass = {};

		//加入关卡
		for(var i in Levels){
			var a = document.createElement("a");
			a.innerText = i;
			a.data = Levels[i];
			ass[i] = a;
			a.onclick = function(){
				levelMenu._proxy.style["display"] = "none";
				var a = this;
				//进入关卡
				var story = lcg.create("story",this.data,function(val){
					var next = ass[Number(a.innerText)+1];
					if(val == "win" && next)
						return next.onclick();
					levelMenu._proxy.style["display"] = "";
					//切换菜单
					topMenu.change("level");
				});
				story.run();
			}
			this.ids["panle"].appendChild(a);
			a.className = "ui-box";
		}

		//显示界面
		this.show = function(){
			this._proxy.style["display"] = "";
			//切换菜单
			topMenu.change("level");
		}

		//隐藏
		this.close = function(){
			this._proxy.style["display"] = "none";
			mainMenu.show();
		}
	});


	//登陆栏
	lcg.bind("login",function(){
		//初始化dom
		this.extend("dom-module");
		window.login = this;

		if(window._type == "Phone")
			this._proxy.style["display"] = "none";


		//界面切换
		this.render = function(){
			if(localStorage["openid"] != null)
			{
				this.ids["n"].style["display"] = "none";
				this.ids["s"].style["display"] = "";
			}else{
				this.ids["n"].style["display"] = "";
				this.ids["s"].style["display"] = "none";
			}
		}

		this.render();

		//登陆账号
		this.login = function(){
			window.open("login/oauth/qq_login.php","TencentLogin","width=450,height=320,menubar=0,scrollbars=1, resizable=1,status=1,titlebar=0,toolbar=0,location=1");
		}

		//获取用户信息
		this.info = function(oInfo,uInfo){
			oInfo = JSON.parse(oInfo);
			uInfo = JSON.parse(uInfo);
			//存储信息
			localStorage["openid"] = oInfo.openid;
			localStorage["name"] = uInfo.nickname;
			localStorage["img"] = uInfo.figureurl_qq_1;
			this.render();
		}

		//退出登陆
		this.logout = function(){
			delete localStorage["openid"];
			delete localStorage["name"];
			delete localStorage["img"];
			this.render();
		}
	});


	//社区界面
	lcg.bind("ui-blog",function(){
		//初始化dom
		this.extend("dom-module");
		var self = window.blog = this;

		//移动端处理
		if(_type == "Phone"){
			this.ids["my"].style["display"] = "none";
			this._proxy.className += " phone";
		}

		//显示界面
		this.show = function(){
			this._proxy.style["display"] = "";
			//切换菜单
			topMenu.change("blog");
		}

		//隐藏
		this.close = function(){
			this._proxy.style["display"] = "none";
			mainMenu.show();
		}

		//切换框
		var ass = this._proxy.querySelectorAll(".left>a");
		for(var i = 0;i < ass.length;i++)
			ass[i].onclick = function(){
				self.load(this.getAttribute("key"));
			}

		//载入右侧面板
		var _key;
		this.load = function(key){
			key = key || _key;
			_key = key;
			//清空内容
			self.ids["right"].innerText = "";
			//如果是我的地图面板
			if(key == "my"){
				if(localStorage["openid"] == null)
					return alert("请先在右上角登陆!");
				//请求地图表
				lcg.ajax.get("login/getMaker.php",{oid:localStorage["openid"]},function(res){
					res = JSON.parse(res);
					for(var i in res)
						self.ids["right"].appendChild(lcg.create("ui-blog-mymap",res[i]));
				});
			}
			//如果是地图列表
			if(key == "maps"){
				//请求地图表
				lcg.ajax.get("login/getMaker.php",function(res){
					res = JSON.parse(res);
					for(var i in res)
						self.ids["right"].appendChild(lcg.create("ui-blog-map",res[i]));
				});
			}
		}
		this.load("maps");
	});


	lcg.dm.bind("ui-blog-mymap",
	`<div class="ui-blog-map">
		<img lid="img"/>
		<a>{{name}}</a>
		<p>
			<a onclick="this.$root.edit();">编辑</a>
			<a onclick="this.$root.del();">删除</a>
		</p>
	</div>`
	,function(d){
		//初始化dom
		this.extend("dom-module",d);

		//设置头像
		this.ids["img"].src = d.img;

		//编辑事件
		this.edit = function(){
			blog._proxy.style["display"] = "none";
			lcg.ajax.get("login/getMap.php",{id:d.id},function(res){
				res = JSON.parse(res);
				window["editor-map"].load(res,function(){
					blog._proxy.style["display"] = "";
					//切换菜单
					topMenu.change("blog");
					blog.load();
				},{id:d.id});
			});
		}

		//删除事件
		this.del = function(){
			if(confirm("确定要删除地图吗？")){
				lcg.ajax.get("login/delMap.php",{id:d.id,uid:localStorage["openid"]},function(res){
					blog.load();
				});
			}
		}
	});


	lcg.dm.bind("ui-blog-map",
	`<div class="ui-blog-map">
		<img lid="img"/>
		<a>{{name}}</a>
		<p>
			<a onclick="this.$root.play();">游玩</a>
		</p>
	</div>`
	,function(d){
		//初始化dom
		this.extend("dom-module",d);

		//设置头像
		this.ids["img"].src = d.img;

		//编辑事件
		this.play = function(){
			blog._proxy.style["display"] = "none";
			lcg.ajax.get("login/getMap.php",{id:d.id},function(res){
				res = JSON.parse(res);

				var story = lcg.create("story",res,function(){
					blog._proxy.style["display"] = "";
					//切换菜单
					topMenu.change("blog");
				});
				story.run();
			});
		}
	});

}();