# importJS
  This js module can help you manage your import module of js or js file more efficiently. The importJS will help you to import or remove the js file everywhere in the js context. And the importance is that it's so easy for coder. So if your web frontend project is very complex, please taste that, i promise that you will love it.
# What's it?
  The importJS is the js library which is used to import remote js files or scripts more simply and efficiently. 
  
  In some single page of h5, we often use <script> label to load the remote js, or use import or npm to load the remote js module, it's work, but they are static and you cannot control the imported-js in the running-time. If you want to test some module in the running-time, it's cannot be work. So you have to use another test library,and reload or import it, then run it again. 
  
  And the other problem is that when you load an js-script, but the script just for a little bit of code to run. When it run over, the import-js resource always be there.In some complex enviroment, it shall cause an unexpected error,becuase the other variable is polluted by the import-js resource.So the best way to deal with this situation is that we remove it in time when we run over the code which depend it.
  
  For solving these problems, i am developing it. The importJS can remove the wasted-jsresource dynamically.And it support async mode,sync mode and mixed mode. When you use sync mode , the remote resource must be allowed across-origin. When you use mixed mode, the priority list of import-mode is that sync > async. But if the application occur some error , the async's code also can be runned except the import js-resource cannot be loaded. The importJS also can help you remove the remote-jssource which is import repeatedly.So it's help you save the network resource,improve your web application's performance.
  
  Well, let's go for it!

# How to use it?
  Simple!
  
  · First
    ```
    import { importClass } from './importJS.js'
    ```
    
  · Second 
    ```
    var importInstance = importClass.getInstance(4,300,false);
    ```
    
   .Third
    ```
    importInstance.import([
      'https://xxx.com/xx.js',
      'https://xxx.com/xxxx.js'
    ]).load().then(function() {
      [run your code]
    })
    ```
 # The API
 
 · importClass.getInstance(retryTime, importTimeout, mode)
 
   ·retryTime: the max reloaded times when the importfile cannot be reloaded by some problems.
   
   ·importTimeout: the max waiting time of a loading period.
   
   ·mode: true:async,  false:sync
