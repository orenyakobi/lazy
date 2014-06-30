/*! Lazy.JS - v1.0.0 - 2014-07-01
* Lightweight lazy loader for JS, CSS & LESS assets.
* http://orenyakobi.github.io/lazy
*
* Copyright (c) 2014 Oren yakobi <orenykb@gmail.com>;
* Licensed under the MIT license */
var lazy = (function(){
    'use strict';
    var cachedFiles = {}; 
    
    return {
        load: function( files, externalClbk ){ 
            
            var removeFileString = function(fileString){
                return function(){
                    for(var i=0, len=files.length; i<len; i++){
                        if(files[i] === fileString){
                            files.splice((i>0 ? i-- : i), 1);
                        }
                    }
                    // Invoke the external callback
                    if(!files.length){ 
                        externalClbk();
                    }
                };
            };
    
            var buildFileObject = function( fileString ){
                var fileObj = {};
                fileObj.ext = extractFileExtention( fileString );
                if( fileObj.ext ){
                    fileObj.path = fileString.split(/\#|\?/)[0];
                    return fileObj;
                }else{
                    return false;
                } 
            };
 
            var extractFileExtention = function( fileString ){ 
                var ext = fileString.split(/\#|\?/)[0].split('.').pop();
                if( !/^\w+$/.test(ext) ){
                    dumpError( 'File extension is not specified ( '+fileString+' )' );
                    return false;
                }else{
                    return ext;
                }
            };
            
            var createDomElement = function( fileObj ){
                switch( fileObj.ext ){
                    case 'css':
                        var elm = document.createElement('link');
                        elm.href = fileObj.path;
                        elm.rel = 'stylesheet';
                        return elm;
                    case 'js':
                        var elm = document.createElement('script');
                        elm.src = fileObj.path;
                        elm.type = 'text/javascript';
                        return elm;
                    case 'less':
                        var elm = document.createElement('style'); 
                        elm.id = 'lazyStyle';
                        return elm;
                    default:
                        dumpError('Unsupported extension ( '+ext+' )');
                        return false;
                }
            };
            
            var dumpError = function( msg ){
                console.log('~ Lazy Error: '+msg);
            };

            var getXmlHttp = function(){
                if (window.XMLHttpRequest) {
                    var xmlhttp=new XMLHttpRequest();
                }else if (window.ActiveXObject) {
                    var xmlhttp=new ActiveXObject('Microsoft.XMLHTTP');
                }
                if (xmlhttp === null) {
                    dumpError('Your browser does not support XMLHTTP');
                }
                return xmlhttp;
            };
            
            var stageFileString = function( fileString, clbk ){
                //if any case of 'file1,file2,file3' (not an array of files)
                var fileSrtingArr = fileString.split(',');
                for( var i=0, len = fileSrtingArr.length; i < len; i++ ){    
                    if( typeof( cachedFiles[ fileSrtingArr[i] ] ) === 'undefined' ){ 
                       // If not cached, Loading the file
                       var fileObj = buildFileObject( fileString );
                       if(fileObj){
                           //valid file
                           loadFile( fileObj, clbk );
                       }else{
                           break;
                       }
                   }
               }
            };
            
            var loadFile = function( fileObj, clbk ){
                cachedFiles[fileObj.path] = 1; 
                if( fileObj.ext === 'less' ){
                    loadLess( fileObj, clbk ); 
                }else{
                    var elm = createDomElement( fileObj ),
                        done = false,
                        head = document.getElementsByTagName('head')[0];
                
                    head.appendChild(elm);
                    if(fileObj.ext === 'css'){
                        //Hack for listening to link tag onload event 
                        var img = document.createElement('img');
                        img.onerror = function(){
                            if( typeof(clbk) !== 'undefined' ) clbk();
                        };
                        img.src = fileObj.path;
                    }else{ 
                        elm.onload = elm.onreadystatechange = function () {
                            if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                                done = true;
                                // Handle memory leak in IE
                                elm.onload = elm.onreadystatechange = null;
                                if (head && elm.parentNode) {
                                    head.removeChild(elm);
                                }
                                if( typeof(clbk) !== 'undefined' ) clbk();
                            }
                        };
                    }
                }
            };

            var loadLess = function( fileObj, clbk ){ 
                if( typeof(less) !== 'undefined' ){
                    cachedFiles[fileObj.path] = 1;
                    var xmlhttp = getXmlHttp(); 
                    xmlhttp.onreadystatechange = function() {
                        if (xmlhttp.readyState===4) {
                            var parser = new less.Parser();
                            parser.parse(xmlhttp.responseText, function (err, tree) {
                                var csscode = tree.toCSS();
                                if( !document.getElementById('lazyStyle') ){
                                    var elm = createDomElement( fileObj );
                                    document.getElementsByTagName('head')[0].appendChild(elm);
                                }
                                document.getElementById('lazyStyle').innerHTML = document.getElementById('lazyStyle').innerHTML + csscode;
                            });
                            if( typeof(clbk) !== 'undefined' ) clbk();
                        }
                    };
                    xmlhttp.open("GET", fileObj.path, true);
                    xmlhttp.send(null);
                }else{
                    dumpError('Can\'t load .less file, less.js is missing');
                }
            };

            // Constructor -----------------------------------------------------------------
            
            files = files instanceof Array ? files : [files]; 
            for( var i=0, len = files.length; i < len; i++ ){
                var fileString = files[i].replace(/\s+/g, ''); //strip spaces

                if( fileString.lastIndexOf('<') > 2 ){ 
                    //Handling dependencies
                     (function(){
                        var filesString = files[i];
                        var dependencies = fileString.split('<');
                        return (function loadDependency(){
                            if(dependencies.length){  
                                //loading dependencies recursively
                                stageFileString( dependencies.pop(), loadDependency );
                            }else{
                                // no more dependencies, remove file string (dependencies string)
                                removeFileString( filesString )();
                            }
                        }());
                    }());
                }else{
                    //load non-depency file string asynchronically
                    stageFileString( fileString, removeFileString( files[i] ) );
                }  
            }
        }
    };
})();