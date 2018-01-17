!function(){

	//UI部分组件
	
	//展开面板
	lcg.dm.bind("ui-open",
	`<div class="ui-open">
		<p lid="title">{{title}}</p>
		<div v-mf="[list,type]"></div>
	</div>`,function(d){
		//初始化dom-module
		this.extend("dom-module",d);
		var p = this._proxy;

		//收缩处理
		this.ids["title"].onclick = function(){
			if(p.className == "ui-open hide")
				p.className = "ui-open";
			else
				p.className = "ui-open hide";
		}
	});

	//表单处理项
	lcg.dm.bind("ui-input",
	`<div class="ui-input e-item">
		<p>{{title}}</p>
		<div lid="ipt"></div>
	</div>`,
	function(dom){
		//初始化dom-module
		this.extend("dom-module",{
			title:""
		});
		this.vue.title = dom.title;
		
		//清空输入内容
		this.ids["ipt"].innerText = "";
		//根据数据类型继承处理逻辑
		this.extend("ui-input-"+dom.type,dom);
		this.ids["ipt"].appendChild(this.ipt);
		this.ipt.value = dom.dom[dom.key];
		this.ipt.onchange = function(){
			dom.dom[dom.key] = this.value;
			if(dom.change)
				dom.change(this.value);
		}
	});

	//表单构造器
	lcg.bind("ui-input-select",function(dom,domkey){
		//构造选择项
		var sel = "<select>";
		for(var i in dom){
			var str = dom[i];
			if(domkey)
				str = str[domkey];
			sel += "<option value="+i+">"+str+"</option>";
		}
		sel += "</select>";
		var dom = document.createElement("div");
		dom.innerHTML = sel;
		dom = dom.querySelector("select");
		this.ipt = dom;
	});

	//地图层选择表单
	lcg.bind("ui-input-map",function(){
		//构造选择项
		this.extend("ui-input-select",window["editor-map"].story.maps,"name");
	});

	//地图层选择表单
	lcg.bind("ui-input-fx",function(){
		//构造选择项
		this.extend("ui-input-select",{
			"up":"上",
			"left":"左",
			"right":"右",
			"down":"下"
		});
	});

	//颜色选择器
	lcg.bind("ui-input-color",function(){
		//构造选择项
		this.extend("ui-input-select",{
			"#ff7272":"红",
			"#61e473":"绿",
			"#61d6e4":"蓝",
			"#848484":"黑",
			"#d854d2":"紫"
		});
	});

	//数字输入器
	lcg.bind("ui-input-number",function(){
		this.ipt = document.createElement("input");
		this.ipt.type = "number";
	});

	//文字输入器
	lcg.bind("ui-input-string",function(){
		this.ipt = document.createElement("input");
		this.ipt.type = "text";
	});

	//按钮输入器
	lcg.bind("ui-input-btn",function(dom){
		this.ipt = document.createElement("a");
		this.ipt.innerText = dom.dom[dom.key];
		this.ipt.onclick = function(){
			if(dom.click)
				dom.click();
		}
	});



	//触发器数据预设
	var Ts = {
		"end-add":{
			name:"终点:需求值减少",
			args:{
				"num":["number",1,"减少的数量"]
			}
		},
		"spd-rotate":{
			name:"强制转向：相对旋转",
			args:{
				"num":["number",1,"顺时针旋转次数"]
			}
		},
		"spd-value":{
			name:"强制转向：绝对旋转",
			args:{
				"fx":["fx",1,"旋转到的方向"]
			}
		}
	}


	//触发器输入器
	lcg.bind("ui-input-msg",function(dom){
		this.ipt = lcg.create("ui-msg",dom);
	});

	//触发器
	lcg.dm.bind("ui-msg",
	`<div>
		<div lid="sel"></div>
		<div lid="panle" v-mf="[args,'ui-input']"></div>
	</div>`
	,function(dom){
		//初始化dom
		this.extend("dom-module",{
			args:[]
		});
		var self = this;
		var p = this._proxy;

		//构造选择项
		var sel = "<select>";
		for(var i in Ts){
			var str = Ts[i].name;
			sel += "<option value="+i+">"+str+"</option>";
		}
		sel += "</select>";
		var selDom = document.createElement("div");
		selDom.innerHTML = sel;
		selDom = selDom.querySelector("select");
		this.ids["sel"].appendChild(selDom);
		selDom.onchange = function(){
			console.log("change");
			p.value[0] = this.value;
			initArgs(true);
		}

		//参数保留
		p.value = [];

		//构造参数项
		var initArgs = function(ref){
			var type = p.value[0];
			//清空内容
			self.vue.args.splice(0,self.vue.args.length);

			if(ref)
				p.value[1] = {};

			//细节参数
			var _args = Ts[type].args || {};
			for(var i in _args){
				var _d = _args[i];
				if(ref)
					p.value[1][i] = _d[1];
				self.vue.args.push({title:_d[2] || i,type:_d[0],dom:p.value[1],key:i,change:function(){
					
				}});
			}
		}

		//延迟获取初始值
		setTimeout(function(){
			selDom.value = p.value[0];
			initArgs();
		});
	})

}();