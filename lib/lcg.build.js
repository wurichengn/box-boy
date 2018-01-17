!function(){
	window.lcg = window.lcg || {};

	//组件表
	var modules = {};

	//调试模式
	lcg.debug = true;

	//整体提示
	lcg.log = function(str){
		if(lcg.debug == true)
			console.log("LCG.JS:"+str);
		throw "LCG.JS:"+str;
	}

	//绑定组件
	lcg.bind = function(key,init){
		if(modules[key] != null)
			lcg.log("覆盖了原有的'"+key+"'组件!");
		modules[key] = init;
	}

	//给现有组件添加插件
	lcg.bind.plugin = function(key,func){
		if(modules[key] == null)
			return;
		if(modules[key].plugins == null)
			modules[key].plugins = [];
		modules[key].plugins.push(func);
	}

	//创建组件
	lcg.create = function(key){
		if(key == null)
			return lcg.log("无法创建组件，因为没有传递组件名");
		//判断组件是否存在
		if(typeof key == "string" && modules[key] == null)
			return lcg.log("'"+key+"'组件不存在!");
		//截取参数表
		var vals = [];
		for(var i = 1;i < arguments.length;i++)
			vals.push(arguments[i]);
		//构建
		return new Builder(key,vals);
	}

	//附着组件
	lcg.use = function(proxy,key){
		//截取参数表
		var vals = [];
		for(var i = 2;i < arguments.length;i++)
			vals.push(arguments[i]);
		lcg.create.option(key,{proxy:proxy},vals);
	}

	//带参数创建
	lcg.create.option = function(key,option,vals){
		//判断组件是否存在
		if(modules[key] == null)
		{
			lcg.log("'"+key+"'组件不存在!");
			return;
		}
		//构建
		return new Builder(key,vals,option);
	}

	//组件是否存在
	lcg.hasModule = function(key){
		if(modules[key] == null)
			return false;
		return true;
	}




	//=======构建器======
	var Builder = function(key,vals,option){
		//如果是匿名组件
		var initFunc;
		if(typeof key == "function"){
			initFunc = key;
			key = "__noName__";
		}
		//记录配置
		var option = this._option = option || {};
		var proxy = option.proxy || this._proxy;
		this._types = [key];
		this._moduleType = this._nowType = key;
		//加入getModule方法
		if(proxy == null || proxy.lModule == null)
		{
			this.getModule = function(key){
				return this.getModule.modules[key] || this.getModule.modules_a[key];
			}.bind(this);
			this.getModule.modules = {};
			this.getModule.modules_a = [];
			if(proxy)
				proxy._mainModule = this;
		}
		else
			this.getModule = proxy.lModule;
		//加入到组件表中
		this.getModule.modules[key] = this;
		this.getModule.modules_a.push(this);

		//附着指定对象
		if(proxy)
			this.proxy(proxy);
		//强制继承
		var extendVals = [""];
		for(var i in vals)
			extendVals.push(vals[i]);
		if(this._option.extends){
			if(typeof this._option.extends == "string")
				this._option.extends = [this._option.extends];
			for(var i in this._option.extends){
				extendVals[0] = this._option.extends[i];
				this.extend.apply(this,extendVals);
			}
		}
		//执行构造
		(initFunc?initFunc:modules[key]).apply(this,vals);
		//循环执行插件
		if(modules[key] && modules[key].plugins)
			for(var i in modules[key].plugins)
				modules[key].plugins[i].apply(this,vals);

		//如无代理则以自身为代理
		if(this._proxy == null)
			this.proxy(this);

		//返回代理对象
		return this._proxy;
	}

	//构建器核心
	Builder.prototype = {
		//代理
		proxy:function(proxy,cover){
			if(this._proxy == null || cover)
			{
				this._proxy = proxy;
				//加入lModule方法
				if(this._proxy.lModule == null){
					this._proxy.lModule = this.getModule;
					this._proxy._mainModule = this;
				}else{
					this._proxy.lModule.modules[this._types[0]] = this;
					this._proxy.lModule.modules_a.push(this);
					this.getModule = this._proxy.lModule;
				}
			}
			return this._proxy;
		},
		//继承
		extend:function(key){
			//加入type栈
			this._types.push(key);
			//记录type
			var _type = this._nowType;
			this._nowType = key;
			//如果没有组件
			if(modules[key] == null){
				lcg.log("没有'"+key+"'组件，无法继承!");
				return;
			}
			//截取参数表
			var vals = [];
			for(var i = 1;i < arguments.length;i++)
				vals.push(arguments[i]);
			var re = modules[key].apply(this,vals);
			//循环执行插件
            if(modules[key].plugins)
                for(var i in modules[key].plugins)
                    modules[key].plugins[i].apply(this,vals);
            //恢复type
            this._nowType = _type;
            this._types.splice(this._types.length-1,1);
            return re;
		},
		//绑定消息
		message:function(key,value){
			if(typeof key != "string"){
				for(var i in key)
					this.message(i,key[i]);
				return;
			}
			if(this._msgs == null)
				this._msgs = {};
			if(this._msgs[key] == null)
				this._msgs[key] = [];
			this._msgs[key].push(value);
		},
		//发送消息
		sendMessage:function(name){
			//截取参数表
			var vals = [];
			for(var i = 1;i < arguments.length;i++)
				vals.push(arguments[i]);
			
			//触发消息
			var msgs = [];
			if(this._msgs == null)
				this._msgs = {};
			if(this._proxy == null)
				for(var i in this._msgs[name]){
					this._msgs[name][i].apply(this,vals);
				}
			else
				for(var i in this._proxy.lModule.modules){
					var ms = this._proxy.lModule.modules[i];
					if(ms._msgs == null)
						ms._msgs = {};
					for(var j in ms._msgs[name])
						ms._msgs[name][j].apply(ms,vals);
				}
		}
	};


	//创建消息处理函数
	var addMessage = function(target,key,value){
		//消息处理主体
		var message = function(){
			for(var i in message._messages)
				message._messages[i].apply(target,arguments);
		}

		//判断是否已经生成过处理方法
		if(target[key] == null || target[key]._messages == null){
			target[key] = message;
			message._messages = [];
		}

		//插入消息内容
		target[key]._messages.push(value);
	}
}();//======钩子模块======
//用于数据变化帧听
!function(){
    var hook = {};
    lcg.hook = hook;

    //复制数组
    lcg.copyArray = function(arr,end,start){
        var end = end || 9999999;
        var start = start || 0;
        var re = [];
        for(var i = start;i < arr.length && i<end;i++)
            re.push(arr[i]);
        return re;
    }

    //绑定数组
    hook.bindArray = function(arr,cbp,cbd){
        var push = arr.push;
        var splice = arr.splice;

        //重写push
        arr.push = function(){
            //执行原来的方法
            push.apply(arr,arguments);
            cbp(arguments);
        }

        //重写 splice
        arr.splice = function(start,del,add){
            //执行原来的方法
            splice.apply(arr,arguments);
            //如果删除了
            if(del > 0)
                cbd(start,del);
            //如果插入了
            if(arguments.length > 2)
            {
                var adds = lcg.copyArray(arguments,null,2);
                cbp(adds,start);
            }
        }
        return {push:push,splice:splice};
    }


    //绑定对象的key
    hook.bindKeySet = function(dom,key,set,data){
        var myvals = dom[key];
        var getter = function(){
            return myvals;
        };
        var setter = function(val){
            myvals = val;
            if(set)
                set(val,key,data);
        }

        //添加getter、setter
        if (Object.defineProperty){
            Object.defineProperty(dom, key, {get: getter,set: setter});
        }else{
            Object.prototype.__defineGetter__.call(dom, key, getter);
            Object.prototype.__defineSetter__.call(dom, key, setter);
        }
    }
}();!function(){
	//======事件系统======
	//事件表
	var events = {
		"bind":[]
	};

	//帧听事件
	lcg.on = function(name,cb){
		if(events[name] == null)
			events[name] = [];
		events[name].push(cb);

		//初始化
		if(name == "ready" && isReady == true)
			cb();
	}

	//触发事件
	var trigger = function(name,vals){
		if(events[name] == null)
			events[name] = [];
		var isEnd = false;
		vals = vals || {};
		vals.stop = function(){
			isEnd = true;
		}
		vals.type = name;
		//循环触发回调
		var es = events[name];
		for(var i in events[name])
		{
			//去除空回调
			if(!es[i])
				es.splice(i,1);
			//触发回调
			var re = es[i](vals);
			if(isEnd)
				return re;
		}
	}
	lcg.trigger = trigger;

	//文档载入完毕事件
	var ready = function(fn){
        if(document.addEventListener){//兼容非IE  
            document.addEventListener("DOMContentLoaded",function(){  
                //注销事件，避免反复触发  
                document.removeEventListener("DOMContentLoaded",arguments.callee,false);  
                fn();//调用参数函数  
            },false);  
        }else if(document.attachEvent){//兼容IE
            document.attachEvent("onreadystatechange",function(){  
                if(document.readyState==="complete"){  
                    document.detachEvent("onreadystatechange",arguments.callee);  
                    fn();  
                }  
            }); 
        }
        //if(document.readyState == "complete" || document.readyState == "interactive")
        //	fn();
    }

    var isReady = false;

    //帧听文档事件触发ready
    lcg._ready = function(){
    	if(isReady)
    		return;
    	//触发插件准备事件
    	trigger("plugin-ready");
    	//触发准备完毕事件
    	trigger("ready");
    	isReady = true;
    }
    ready(lcg._ready);

    //全局时钟间隔
    lcg.delayTime = 20;

    //全局时钟
    var step = function(){
    	setTimeout(step,lcg.delayTime);
    	trigger("dt");
    }
    step();

    //Dom节点事件
    lcg.domEvent = function(dom,name,cb){
    	if(typeof name == "string")
    		name = [name];
    	for(var i in name){
	    	if(dom.addEventListener)
	    		dom.addEventListener(name[i],cb,false);
	    	else
	    		dom.attachEvent("on"+name[i],cb);
    	}
    }
}();!function(){

	var init;

	//定义vue组件
	lcg.bind("dom-vue",function(data){
		var self = this;
		//数据外内容缺省
		if(data.data == null)
			data = {data:data};
		//设置dom对象
		data.el = data.el || this._proxy;
		//初始化事件
		data.created = function(){
			this._l_module = self;
		}
		//初始化Vue
		this._vue = new Vue(data);
	});

	//定义mf-dom功能
	lcg.bind("mf-dom",function(d,par,i,list){
		this.destory = function(){
			if(Object.prototype.toString.call(list) == '[object Array]')
				list.splice(id,1);
			else
				Vue.delete(list,id);
		}

		var id = i;
		var list = list;

		this.message({
			"mf-update":function(i,l){id = i;list = l}
		});
	});

	//module列表的实现
	!function(){
		init = function(el,bd,node){
			el.innerHTML = "";
			var list = bd.value[0];
		  	var key = bd.value[1];
		  	for(var i in list)
		  		el.appendChild(lcg.create.option(key,{extends:["mf-dom"]},[list[i],node.context._l_module,i,list]));

		  	//记录当前值
		  	el._jl = {};
		  	for(var i in list)
		  		el._jl[i] = list[i];
		}

		//获取数组间的改动
		var aeq = function(l1,l2,el,bd,node){
			for(var i in l1)
				if(l1[i] != l2[i])
					return init(el,bd,node);
			for(var i in l2)
				if(l2[i] != l1[i])
					return init(el,bd,node);
		}

		//初始化vue定义
		lcg.initVue = function(){
			Vue.directive('mf', {
			  bind:function(el,bd,node,onode){
			  	bd.def.update(el,bd,node,onode,true);
			  },
			  // 当绑定元素插入到 DOM 中。
			  update: function (el,bd,node,onode,spd) {
			    //如果是初始化
			    if(spd)
			    	return init(el,bd,node);

			    //判断值是否变动
			    var ol = onode.data.directives[0].value;
			    var ok = ol[1],ol = ol[0];
			    var nl = node.data.directives[0].value;
			    var nk = nl[1],nl = nl[0];

			    //直接变动
			    if(ok != nk || ol != nl)
			    	return init(el,bd,node);

			    //数组内有同值
			    for(var i in nl){
			    	var num = 0;
			    	for(var j in nl)
			    		if(nl[i] == nl[j]){
			    			if(num == 1)
			    				return init(el,bd,node);
			    			num++;
			    		}
			    }

			    //数组变动判断
			    if(ol == nl)
			    	aeq(el._jl,nl,el,bd,node);
			  }
			});
		}

		//定义组件列表项
		if(window.Vue)
			lcg.initVue();
	}();

}();/**
 * Dom结构新版本框架
 */
!function(){

	//定义基本对象
	var dm = lcg.dm = lcg.domModule = {};

	//定义dom-module基本组件
	lcg.bind("dom-module",function(key,init){
		//初始化ids
		this.initIDS = function(){
            //初始化编号获取
            initIDS(this._proxy,this);
        }

        //初始化$root
        this.initModuleRoot = function(){
            //初始化子节点的ModuleRoot
            initModuleRoot(this._proxy,this);
        }

        //初始化Dom结构
        this.initDom = function(key){
        	//如果已经有代理对象则不执行该项
        	if(this._proxy != null)
        		return
            //创建Dom结构
            var dom = document.createElement("div");
            dom.innerHTML = prefabs[key] || prefabs[((this._nowType == "dom-module")?
            	this._types[this._types.length-2]:this._nowType)];
            var domz = dom.querySelector("*");
            moveAttribute(dom,domz);
            //删除原本的DOM
            if(dom.parentNode)
            {
                dom.parentNode.insertBefore(domz,dom);
                dom.parentNode.removeChild(dom);
            }
            this.proxy(domz);
        }

        //初始化子预制
        this.initPrefab = function(){
            var ids = initPrefab(this._proxy);
            this.ids = this.ids || {};
            for(var i in ids)
                this.ids[i] = ids[i];
        }

        //初始化所有功能
        this.initAll = function(key){
            this.initDom(key);
            this.initModuleRoot();
            this.initIDS();
            this.initPrefab();
        }

        //初始化vue
        this.vue = function(data){
            this.extend("dom-vue",data);
            return this._vue;
        }
        //初始化vue
        if(typeof key == "object" && key != null){
            var dt = key;
            key = dt.module;
            init = dt.init;
            this.initDom(key);
            this.vue = this.vue(dt);
            this.proxy(this.vue.$el,true);
        }
        //参数移动
        if(typeof key != "string"){
            init = key;
            key = null;
        }
        //默认自动初始化
        if(init == null)
            init = true;

        //自动初始化
        if(init)
        	this.initAll(key);

        //======常用方法======
        this.getAttr = function(){
        	return getAttr(this._proxy);
        }
	});

	//获取dom属性
	var getAttr = function(dom){
		var re = {};
    	var attr = dom.attributes;
    	for(var i = 0;i < attr.length;i++){
            var val = attr[i].value;
            //布尔值判断
            if(val == "true")
                val = true;
            else if(val == "false")
                val = false;
            else if(Number(val).toString() != "NaN")//数字判断
                val = Number(val);
            else if(val[0] == "{" && val[1] == "{")
                val = eval("("+val.substr(2,val.length-4)+")");
    		re[attr[i].name] = val;
        }
    	return re;
	}

	//初始化ID表
    var initIDS = function(dom,module){
        var ids = {};
        var idoms = dom.querySelectorAll("*[lid]");
        for(var i = 0;i < idoms.length;i++)
        {
            var attr = idoms[i].getAttribute("lid");
            if(ids[attr] == null)
                ids[attr] = idoms[i];
        }
        module.ids = ids;
    }

    //======moduleRoot传递======
    var initModuleRoot = function(dom,module){
        var dlist = dom.querySelectorAll("*");
        for(var i = 0;i < dlist.length;i++)
            if(dlist[i].$root == null)
                dlist[i].moduleRoot = dlist[i].$root = module;
    }

	//结构保存用表
	prefabs = {};
	//带结构式定义
	dm.bind = function(key,model,init){
		lcg.bind(key,init);
		dm.add(key,model);
	}
	//只定义结构
	dm.add = function(key,model){
		if(typeof model == "string")
			prefabs[key] = model;
		else if(typeof model == "function"){
			var str = new String(model);
			prefabs[key] = str.substring(str.indexOf("/*") + 2, str.lastIndexOf("*/"));
		}else
			prefabs[key] = model.outerHTML;
	}

	//文档载入事件
    lcg.on("ready",function(){
        //保存组件相应的HTML
        var doms = document.querySelectorAll("*[dom-module]");
        for(var i = doms.length - 1;i >= 0;i--){
            var dom = doms[i];
            var key = dom.getAttribute("dom-module");
            dom.removeAttribute("dom-module");
            prefabs[key] = dom.outerHTML;
        }

        //逻辑引用
        var logics = document.querySelectorAll("*[dom-logic]");
        for(var i = 0;i < logics.length;i++){
        	var key = logics[i].getAttribute("dom-logic");
        	logics[i].removeAttribute("dom-logic");
        	var ks = key.split(";");
        	for(var j in ks)
        		if(ks[j] != null && ks[j] != "")
        			lcg.use(logics[i],ks[j]);
        }

        //删除原本的节点
        for(var i = 0;i < doms.length;i++)
	        if(doms[i].parentNode)
	            doms[i].parentNode.removeChild(doms[i]);

	    //初始化文档中的预制
	    initPrefab(document);
    });

    //初始化预制
    var initPrefab = function(dom){
        //ids返回
        var ids = {};
        //查找dom
    	var prefabs = dom.querySelectorAll("*[dom-prefab]");
    	for(var i = 0;i < prefabs.length;i++){
            //循环处理dom
    		var dom = prefabs[i];
    		var key = dom.getAttribute("dom-prefab");
    		var attr = getAttr(dom);
            var domz = lcg.create(key,attr);
            moveAttribute(dom,domz);
    		dom.parentNode.insertBefore(domz,dom);
    		dom.parentNode.removeChild(dom);
            //ids处理
            if(dom.getAttribute("lid"))
                ids[dom.getAttribute("lid")] = domz;
    	}
        return ids;
    }


    //================通用方法=======================
    //转移属性
    var keyssFab = {
        "dom-prefab":true
    };
    var moveAttribute = function(from,to){
        //从属性获取初值
        for(var j = 0;j < from.attributes.length;j++)
        {
            var atts = from.attributes[j];
            if(keyssFab[atts.name] != true)
                to.setAttribute(atts.name,atts.value);
        }
    }

}();


/**
 * ============================================================================
 * ======================基于dom-module的其他基本功能组件======================
 * ============================================================================
 */
!function(){

	//数据代理组件
	lcg.bind("dom-proxy",function(datas,useNew){
		var model = {},datas = datas || {};
		//对象绑定
		var list = initDomVal(this._proxy,null,null,model);
		//创建代理对象
		var proxy = lcg.create("lcg.proxy",model,(useNew)?{}:datas);
		//开始侦听
		proxy.on("set",function(val,path){
			for(var i in list[path]){
				var item = list[path][i];
				if(item.dom)
					item.dom.set(path,val);
			}
		});

		//赋值
		var dg = function(dom,init,model){
			for(var i in model){
				if(typeof model[i] == "object")
					dg(dom[i],init[i]||{},model[i]);
				else
					dom[i] = init[i];
			}
		}
		dg(proxy.model,datas,model);

		//返回代理dom
		return proxy.model;
	});

	//======对象绑定======
    var initDomVal = function(dom,root,hash,model){
    	hash = hash || {};
    	model = model || {};
        root = root || dom;
        //缺省计算模型
        var addModel = function(key){
        	//model缺省计算
            var ks = key.split(".");
            var now = model;
            while(ks.length){
            	if(ks.length > 1){
            		if(!now[ks[0]] || typeof now[ks[0]] != "object")
            			now[ks[0]] = {};
            	}else{
            		if(!now[ks[0]])
            			now[ks[0]] = true;
            	}
            	now = now[ks[0]];
            	ks.splice(0,1);
            }
        }
        //如果是注解
        if(dom.nodeName == "#comment")
            return;
        //如果是文本
        if(dom.nodeName == "#text"){
            var re = dom.data.match(/{{.*?}}/g);
            var domObj;
            var ks = {};
            while(re && re.length > 0)
            {
            	//初始化控制器
            	domObj = domObj || new domSetter(dom);
            	var key = re[0].substr(2,re[0].length-4);
            	if(ks[key] == true){
            		re.splice(0,1);
            		continue;
            	}
            	ks[key] = true;
            	//加入侦听表
            	if(hash[key] == null)
            		hash[key] = [];
                hash[key].push({
                	dom:domObj
                });
                re.splice(0,1);
                addModel(key);
            }
            return;
        }
        //判断是否需要绑定
        var re = dom.outerHTML.match(/{{.*?}}/);
        if(re && re.length > 0)
        {
            //判断子节点
            for(var i = 0;i < dom.childNodes.length;i++)
                initDomVal(dom.childNodes[i],root,hash,model)
        }
        //判断属性是否绑定
        for(var i = 0;i < dom.attributes.length;i++){
            var atts = dom.attributes[i];
            var re = atts.value.match(/{{.*?}}/g);
            var attrObj;
            var ks = {};
            while(re && re.length > 0)
            {
            	//初始化控制器
            	attrObj = attrObj || new domSetter(atts,"value");
            	var key = re[0].substr(2,re[0].length-4);
            	if(ks[key] == true){
            		re.splice(0,1);
            		continue;
            	}
                //加入侦听表
            	if(hash[key] == null)
            		hash[key] = [];
                hash[key].push({
                	dom:attrObj
                });
                re.splice(0,1);
                addModel(key);
            }
        }
        return hash;
    }

    //Dom变更处理
    var domSetter = function(dom,offset){
    	var offset = offset || "data";
    	//解析列表
    	var list = dom[offset].match(/\{\{.*?\}\}|[^{]+/g);
    	//变量表
    	var vals = {};
    	for(var i in list){
    		if(list[i].substr(0,2) == "{{" && list[i].length > 4)
    		{
    			var key = list[i].substr(2,list[i].length-4);
    			if(vals[key] == null)
    				vals[key] = [];
    			vals[key].push(i);
    		}
    	}

    	//设置值
    	this.set = function(key,val){
    		val == null?val = "":"";
    		for(var i in vals[key])
    			list[vals[key][i]] = val;
    		dom[offset] = list.join("");
    	}
    }

}();/*Ajax扩展*/
!function(){


	//默认参数
	var initOptions = {
		//地址
		url:"",
		//方法类型
		method:"GET",
		//是否异步
		async:true,
		//用户名
		user:"",
		//密码
		password:"",
		//头部表
		headers:null,
		//成功返回
		onSuccess:null,
		//返回失败
		onError:null,
		//参数
		vars:null
	};


	//ajax核心方法
	var ajax = function(option)
	{
		//参数设置
		for(var i in initOptions)
			if(option[i] == null)
				option[i] = initOptions[i];

		//ajax定义
		var xmlhttp;
		if (window.XMLHttpRequest)
		{
			//高版本浏览器
			xmlhttp=new XMLHttpRequest();
		}
		else
		{
			//低版本IE
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}

		//状态变化时事件
		xmlhttp.onreadystatechange=function()
		{
			//执行结束
			if(xmlhttp.readyState==4){
				//返回成功
				if(xmlhttp.status==200){
					if(option.onSuccess)
						option.onSuccess(xmlhttp);
				}
				else
				{
					//返回失败
					if(option.onError)
						option.onError(xmlhttp);
				}
			}
		}

		//设置头部
		if(option.headers)
			for(var i in option.headers)
				xmlhttp.setRequestHeader(i,option.headers[i]);

		//参数生成
		var vars = [];
		var sendVar = null;
		if(option.vars)
			for(var i in option.vars)
				vars.push(encodeURI(i)+"="+encodeURI(option.vars[i]));

		//POST传值
		if(option.method == "POST")
			sendVar = vars.join("&");

		//GET传值
		if(option.method == "GET")
		{
			if(/\?/.test(option.url))
				option.url += "&" + vars.join("&");
			else
				option.url += "?" + vars.join("&");
		}

		//打开方法
		xmlhttp.open("GET",option.url,option.async);
		//发送
		xmlhttp.send(sendVar);
	}



	//发送GET数据
	ajax.get = function(url,vars,cb,async){
		//参数缺省
		if(typeof vars == "function")
		{
			async = cb;
			cb = vars;
		}

		//使用参数
		var option = {
			url:url,
			vars:vars,
			method:"GET",
			onSuccess:function(res){
				if(cb)
					cb(res.responseText,false,res);
			},
			onError:function(res){
				if(cb)
					cb("",true,res);
			},
			async:async
		}

		ajax(option);
	}

	//发送POST数据
	ajax.post = function(url,vars,cb,async){
		//参数缺省
		if(typeof vars == "function")
		{
			async = cb;
			cb = vars;
		}

		//使用参数
		var option = {
			url:url,
			vars:vars,
			method:"POST",
			onSuccess:function(res){
				if(cb)
					cb(res.responseText,false,res);
			},
			onError:function(res){
				if(cb)
					cb("",true,res);
			},
			async:async
		}

		ajax(option);
	}

	lcg.ajax = ajax;
}();//======Dom构造器======
//可以把形如a[a:www,b:ddd]{b[aaa:aaa,bbb:bbb]:aaaa}构造成dom结构
!function(){
	//构造Dom核心函数
	lcg.buildDom = function(str){
		return arr2Dom(str2Arr(str));
	}

	//特殊词
	var tag = {
		"[":true,
		"]":true,
		",":true,
		":":true,
		"{":true,
		"}":true,
		";":true
	};

	//JSON生成Dom
	var arr2Dom = function(dom,root){
		//生成标签
		var d = document.createElement(dom.tag);
		if(root == null)
		{
			root = d;
			d.ids = {};
		}
		//设置属性
		if(dom.attr)
			for(var i in dom.attr)
			{
				d.setAttribute(i,dom.attr[i]);
				if(i == "lid")
					root.ids[dom.attr[i]] = d;
			}
		//设置text
		if(dom.text)
			d.innerText = dom.text;
		//加入子节点
		if(dom.childs)
			for(var i in dom.childs)
				d.appendChild(arr2Dom(dom.childs[i],root));
		return d;
	}

	//字符串分析为数组
	var str2Arr = function(str){
		var dom = {};
		var now = "";
		var state = 0;
		var level = 0;
		var list = [];
		//根据关键字设置状态
		var setState = function(key){
			if(key == "[")
				state = 1;
			if(key == "{")
				state = 2;
			if(key == ":")
				state = 3;
		}
		//循环分析
		for(var i = 0;i < str.length;i++)
		{
			//获取标签名
			if(state == 0)
			{
				if(tag[str[i]])
				{
					if(dom.tag == null)
						dom.tag = now;
					now = "";
					setState(str[i]);
					continue;
				}
				now += str[i];
			}
			//获取属性
			else if(state == 1)
			{
				if(str[i] == "]")
				{
					dom.attr = str2Attr(now);
					state = 0;
					continue;
				}
				now += str[i];
			}
			//解析子项
			else if(state == 2)
			{
				if(str[i] == "{")
					level--;
				if(str[i] == "}")
				{
					level++;
					if(level >= 1)
					{
						if(now != "")
							list.push(now);
						dom.childs = [];
						for(var i in list)
							dom.childs.push(str2Arr(list[i]));
						break;
					}
				}
				if(str[i] == ";" && level == 0)
				{
					list.push(now);
					now = "";
					continue;
				}
				now += str[i];
			}
			//解析innerText
			else if(state == 3){
				dom.text = str.substr(i);
				break;
			}
		}
		if(dom.tag == null)
			dom.tag = now;
		return dom;
	}

	//解析出属性
	var str2Attr = function(str){
		var re = {};
		var list = str.split(",");
		for(var i in list){
			var kv = list[i].split(":");
			re[kv[0]] = kv[1];
		}
		return re;
	}
}();