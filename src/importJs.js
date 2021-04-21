const importClass = (function() {

    	let loadedpaths = [];
	let uid = 1;
				
	let localImClass = function() {
					
		let importCount = 0;
		let importTimeout = 100;
		let retryTimes = 3;
		let useAsync = false;
	    	let body = document.getElementsByTagName('head')[0];
					
		let asyncId = null;
		let that = null;
		let startId = 0;
		let loaded = 0;
		let asyncEventHanders = [];
		let uniqueId = 'js_';
		let importJsFiles = [];
		let gc_importJsFiles = [];
		let state_importJsFiles = [];
		let owner_importJsFiles = [];
		let curContext = [];
					
	   	let getOwner = function(path) {
			if(owner_importJsFiles[path] == undefined) {
				return null;
			}
			return owner_importJsFiles[path];
		};
					
		let setOwner = function(path, owner) {
			owner_importJsFiles[path] = owner;
			return owner;
		}
					
		let addGc = function(path) {
			if(gc_importJsFiles[path]!== undefined) {
				gc_importJsFiles[path]++;
			} else {
				gc_importJsFiles[path] = 1;
			}
			return gc_importJsFiles[path];
		}
					
		let decGc = function(path) {
			if(gc_importJsFiles[path] > 0) {
				gc_importJsFiles[path]--;
			}
			return gc_importJsFiles[path];
		}
					
		let changeState = function(path, who) {
			let state = who.getUseAsync();
			if(state_importJsFiles[path] === undefined) {
				state_importJsFiles[path] = state;
			} else {
				if(!state) {
					state_importJsFiles[path] = state;
				}
			}
			return state_importJsFiles[path];
		}
					
		let getState = function(path) {
			if(state_importJsFiles[path] === undefined) {
				state_importJsFiles[path] = true;
			}
			return state_importJsFiles[path];
        	}
					
		let handAsyncEvents = function() {
			while(asyncEventHanders.length) {
				let handler = asyncEventHanders.shift();
				handler();
			}
		}
					
		let checkLoaded = function() {
			if(importCount < importJsFiles.length -1) {
				return false;
			}
			return true;
		}
					
		let checkInImportFile = function(path) {
			for(let i = 0; i < importJsFiles.length; i++) {
				if(importJsFiles[i].src == path) {
								
					return true;
				}
			}
			return false;
		}
					
		let createJs = function(path, id) {
			let js = document.createElement('script');
						
			js.setAttribute('type', 'text/javascript');
			js.setAttribute('id', uniqueId + id);
			if(useAsync) {
				js.addEventListener('load', importHandler);
			}
			js.setAttribute('src', path);
						
			return js;
		}
					
		let loadPathToLoaded = function(path) {
			let inx = loadedpaths.indexOf(path);
			if(inx < 0) {
				loadedpaths.push(path);
			}
		}
					
		let unloadPathToLoaded = function(path) {
			let inx = loadedpaths.indexOf(path);
			if(inx >= 0) {
				loadedpaths.splice(inx, 1);
			}
		}
					
		let importHandler = function(e) {
			let path = '';
			if(typeof e == 'string') {
				path = e;
			} else {
				let scriptObj = e.target;
				path = scriptObj.src;
			}
			loadPathToLoaded(path);
			importCount++;
		}
        
		let removeJsByHand = function(context, who) {

			for(let j = 0; j < context.length; j++) {
				let path = '';
				if(context[j].src) {
					path = context[j].src;
				} else if(context[j].tsrc) {
					path = context[j].tsrc;
				} else {
					throw new Error("something was wrong in your pack context,please debug it");
				}
				if(gc_importJsFiles[path] > 1) {
					decGc(path);
				} else {
								
				    if(document.getElementById(context[j].id)) {
						unloadPathToLoaded(path);
						body.removeChild(context[j]);
						who.recoverEnvContext(window, path);
					}
				}
			}
		}
					
		let removeJs = function(who = null) {
		    let path = '';
			for(let i = 0; i < importJsFiles.length; i++) {
				path = importJsFiles[i].src ? importJsFiles[i].src :importJsFiles[i].tsrc;
				unloadPathToLoaded(path);
				if(document.getElementById(importJsFiles[i].id)){
								
					try {
						body.removeChild(importJsFiles[i]);
						if(who != null) {
							who.recoverEnvContext(window, path);
						}
					} catch(e) {
									
					}
								
				}
			}
			importCount = 0;
			return true;
		}
        
		let clearJs = function() {
			while(importJsFiles.length) {
				importJsFiles.pop();
			}
			importCount = 0;
			return true;
		}
					
		let checkHandler = function(loadHandler, who) {
			if(checkLoaded()){
				clearJs();
				return true;
			}
			removeJs();
			if(!retryTimes) {
				clearJs();
				clearTimeout(asyncId);
				asyncId = null;
				throw new Error("The js file can not be loaded,please check your network or server or the file's path");
			}
			retryTimes--;
			console.log("load the files again");
			loadHandler(who);
		}
        
		let XMLObj = (function() {
			let xmlObj = null;
			if(window.XMLHttpRequest) {
				xmlObj = new XMLHttpRequest();
			} else {
				xmlObj = new ActiveXObject("Microsoft.XMLHTTP");
			}
			return xmlObj;
		})();
					
		let copy = function(source) {
			let tmp = [];
			for(let i = 0; i < source.length; i++) {
				tmp.push(source[i]);
			}
			return tmp;
		}
					
		let copyEnvContext = function(envContext) {
			let tmp = {};
			for(ep in envContext) {
				tmp[ep] = envContext[ep];
			}
			return tmp;
		}
					
		let instance = null;
		let _curPack = null;
		let pack = function(){
			let myuid = uid;
			let rT = retryTimes;
			let iT = importTimeout;
			let uA = useAsync;
			let context = null;
			let envContexts = [];
			this.getUid = function() {
				return myuid;
			};
			this.getRetryTimes = function() {
				return rT;
			};
			this.getImportTime = function() {
				return iT;
			};
			this.getUseAsync = function() {
				return uA;
			};
			this.setContext = function(who, ct) {
				if(who != this) {
					throw new Error("the pack's context must be setted by the importClass");
				}
			
				context = copy(ct);
			};
			this.getContext = function() {
				return context;
			};
			this.pushEnvContext = function(envContext,path = null) {
				if(typeof envContext != 'object') {
					throw new Error("the env's context must be object");
				}
			    	let tmp_envContext = copyEnvContext(envContext);
						
				envContexts.push({'env':tmp_envContext,'path':path});
			};
            
			let popEnvContext = function() {
				if(envContexts.length <= 0) {
					throw new Error("the env was exhausted by the remove, you must use it in your need");
				}
				return envContexts.pop();
			};
            
			let getEnvContextByPath = function(path) {
				if(typeof path != 'string' && path != null) {
					throw new Error("the env path must be a string serialize");
				}
							
				let tmp_env = null;
				let pos = 0;
				for(let j = envContexts.length-1; j >= 0; j--) {
					if(envContexts[j]['path'] != path){
						continue;
					}
					//console.log("the path is"+path);
					tmp_env = copyEnvContext(envContexts[j]['env']);
					pos = j;
					break;
				}
							
				console.log("要删除的环境：" + path);
							
				return [tmp_env,pos];
			};
			this.recoverEnvContext = function(curEnvContext, path = null) {
							
				let beforeEnvContext = null;
				let realEnvContext = getEnvContextByPath(path);
				if(realEnvContext[0] == null) {
					throw new Error("oh,something is wrong in the env context,please check your importfile");
				}
				//repair the after realEnvContext
				let realEnvDiff = [];
				let curEnvDiff = [];
				if(realEnvContext[1] > 0) {
					let realBeforeEnvContext = copyEnvContext(envContexts[realEnvContext[1] - 1]['env']);
					for(p in realEnvContext[0]) {
						if(realBeforeEnvContext[p] == undefined) {
							realEnvDiff.push(p);
						}
					}
					for(curP in curEnvContext) {
						if(envContexts[envContexts.length - 1]['env'][curP] == undefined) {
							curEnvDiff.push(curP);
						}
					}
					for(let j = realEnvContext[1]; j < envContexts.length; j++) {
						for(let n = 0; n < realEnvDiff.length; n++) {
							if(envContexts[j]['env'][realEnvDiff[n]] == undefined) {
								continue;
							}
							delete envContexts[j]['env'][realEnvDiff[n]];
						}
					}
					beforeEnvContext = copyEnvContext(envContexts[envContexts.length - 1]['env']);
					//console.log("实际环境中的环境栈数："+envContexts.length);
					envContexts.splice(realEnvContext[1], 1);
				} else {
					throw new Error("there must be an error in your env or you must operate it illegally");
				}
				for(curP in curEnvContext) {
					if(beforeEnvContext[curP] == undefined && curEnvDiff.indexOf(curP) < 0) {
						delete curEnvContext[curP];
						continue;
					}
					if(curEnvContext[curP] != beforeEnvContext[curP]) {
						curEnvContext[curP] = beforeEnvContext[curP];
					}
				}
			}
		};
        
		let getCurPack = function(who) {
			if(_curPack == null) {
				_curPack = who;
				importJsFiles = copy(_curPack.getContext());
				let tmp = [];
				for(let i = 0; i < importJsFiles.length; i++) {
					let path = '';
					if(importJsFiles[i].src) {
						path = importJsFiles[i].src;
					} else if(importJsFiles[i].tsrc) {
						path = importJsFiles[i].tsrc;
					}
					if(loadedpaths.indexOf(path) < 0) {
									
						tmp.push(importJsFiles[i]);
					}
				}
				importJsFiles = copy(tmp);
 			}
			return _curPack;
		};
					
		let clearCurPack = function() {
			_curPack = null;
		}
		pack.prototype = {
			'import': function(path=[]) {
							
				that = this;
				let paths = path;
				if(that.getContext()) {
					throw new Error("you cannot import twice in the same instance of importClass");
				}
				if(typeof path == 'string') {
					paths = [];
					paths.push(path);
				}
				let context = [];
				for(let j=0; j < paths.length; j++) {
				
					if(paths.indexOf(paths[j]) != j) {
						continue;
					}
					let js = createJs(paths[j], startId + j);
					context.push(js);
					if(loadedpaths.indexOf(paths[j]) >= 0) {
						addGc(paths[j]);
						continue;
					}
								
					importJsFiles.push(js);
					changeState(paths[j], that);
					addGc(paths[j]);
					setOwner(paths[j], that.getUid());
					startId++;
				}
				that.setContext(that, context);
				importJsFiles = [];
				loaded = 0;
				return this;
			},
            
			'load': function(self = null) {
				let _that = self ? self :this;
				if(self != null && self != that) {
					throw new Error("you cannot put some arguments into load method");
				}
				if(_that.getUseAsync()) {
				
					asyncId = setTimeout(
							unction(self) {
							let that = self ? self : getCurPack(_that);
										
							for(let i=0; i< importJsFiles.length; i++) {
											
								if(getOwner(importJsFiles[i].src) == that.getUid() 
									&& getState(importJsFiles[i].src)
								)
								{
									body.appendChild(importJsFiles[i]);
								}
							}
							try {
								if(checkHandler(that.load, that)) {
									clearTimeout(asyncId);
									asyncId = null;
									loaded = 1;
									clearCurPack();	
									handAsyncEvents();
								}
							} catch(e) {
								clearTimeout(asyncId);
								asyncId = null;
								asyncEventHanders = [];
								clearCurPack();	
								throw e;
							}
						}
					, importTimeout);
								
				} else {
					let timeObj = new Date();
					let startTime = timeObj.getTime();
					let waitTime = importTimeout;
					let that = self ? self : getCurPack(_that);
					if(!self) {
						//save the script of context
						this.pushEnvContext(window);
					}
					try {
										
						while(true) {
							for(let i = 0;i < importJsFiles.length; i++) {
											
								let path = importJsFiles[i].getAttribute('src');
								if(getState(path) || getOwner(path) != that.getUid()) {
									continue;
								}
								XMLObj.open('GET', path, false);
								try {
									XMLObj.send();
								} catch (e) {
									throw e;
								}
								importJsFiles[i].removeAttribute('src');
								importJsFiles[i].removeEventListener('load', importHandler);
								importJsFiles[i].tsrc = path;
								importJsFiles[i].textContent = XMLObj.responseText;
								if(importJsFiles[i].textContent) {
									body.appendChild(importJsFiles[i]);
									console.log("存放的环境："+path);
									that.pushEnvContext(window, path);
									importHandler(path);
								}
					
							}
							if(checkLoaded()) {
								loaded = 1;
								loadPathToLoaded();
								clearJs();
								clearCurPack();
								console.log("加载完成");
								return that;
							}
							let timeObj = new Date();
							let curTime = timeObj.getTime();
							if(curTime - startTime >= waitTime) {
								break;
							}
											
						}
						if(checkLoaded()) {
							loaded = 1;
							loadPathToLoaded();
							clearJs();
							clearCurPack();	
						} else {
							console.log('load again');
							removeJs(this);
										
							retryTimes--;
							if(!retryTimes) {
								clearJs();
								clearCurPack();	
								throw new Error("The js file can not be loaded,please check your network or server or the file's path");
							}else{
								that.load(that);
							}
						}
					} catch(e) {
										
						throw e;
					}

				}
				return that;
			},
                     
			'quickLoad': function(path) {
				this.import(path);
				this.load();
			},
                
			'then': function(callback) {
				if(!loaded && asyncId == null) {
					throw new Error('you must load the importfile firstly');
				}
				if(this.getUseAsync()) {
					asyncEventHanders.push(callback);
									
					return that;
				} else {
								
					callback();
				}
			},
                
			'remove': function() {
				if(this.getUseAsync()) {
					throw new Error("you just cannot use the context of remove when the state of import is async");
				}
				if(!this.getContext()) {
					throw new Error("you cannot use the remove before you load the importfile");
				}
				removeJsByHand(this.getContext(), this);
				console.log("well done");
			}
	    };
	    return {
		    'getInstance': function(rT, iT, uAsync = false){
			    retryTimes = rT;
			    importTimeout = iT;
			    useAsync = uAsync;
			    instance = new pack();
						
			    uid++;
			    return instance;
		    }
	    };
    };
				
    return new localImClass();
})();

export default importClass;
