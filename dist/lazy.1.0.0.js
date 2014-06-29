/*! Lazy.JS - v1.0.0 - 2014-07-01
* Lightweight lazy loader for JS, CSS & LESS assets.
* http://orenyakobi.github.io/lazy
*
* Copyright (c) 2014 Oren yakobi <orenykb@gmail.com>;
* Licensed under the MIT license */

var lazy = (function(){
    'use strict';
    var loadedFiles = {}; 
    return {
        load: function( files, clbk ){ 
            
            var fileObj = {};

            files = files instanceof Array ? files : [files]; 
            var numOfFilesToLoad = files.length;

            for( var i=0; i < files.length; i++ ){
                
                var file = files[i].replace(/\s+/g, ''), //strip spaces
                    lastIndexOfLessThan = file.lastIndexOf('<');
                
                if( lastIndexOfLessThan > 2 ){ 
                    //Handling dependencies
                    var fileToLoad = file.substr(0,lastIndexOfLessThan),
                        dependencies = file.substr(lastIndexOfLessThan+1);
                    lazy.load( dependencies, function(){ 
                        lazy.load(fileToLoad); 
                    });
                }else if( file.indexOf(',') > 0 ){
                    // Strings of files (no dependencies) ( i.e. file1,file2,file3 )
                    lazy.load( file.split(',') );
                }else if( typeof( loadedFiles[ file ] ) === 'undefined' && buildFileSuite( file ) ){ 
                    // If not cached, Loading the file
                    loadFile(file);
                }  
                checkIfDone(); 
            }
 
            function buildFileSuite( fileString ){
                fileObj.ext = extractFileExtention( fileString );
                if( fileObj.ext ){
                    fileObj.path = fileString.split(/\#|\?/)[0];
                    return true;
                }else{
                    return false;
                } 
            }
 
            function extractFileExtention( fileString ){ 
                var ext = fileString.split(/\#|\?/)[0].split('.').pop();
                if( !/^\w+$/.test(ext) ){
                    dumpError( 'File extension is not specified ( '+fileString+' )' );
                    return false;
                }else{
                    return ext;
                }
            }

            function loadFile( loadedFilesObj ){
                loadedFiles[fileObj.path] = 1;

                if( fileObj.ext === 'less' ){
                    loadLess( loadedFilesObj ); 
                }else{
                    var elementName = getElementNameByExtention( fileObj.ext ),
					    elm = document.createElement(elementName),
						head = document.getElementsByTagName('head')[0],
						done = false;
						
                    elm.src = fileObj.path; 
                    head.appendChild(elm);

                    elm.onload = elm.onreadystatechange = function () {
                        if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                            done = true;
                            // Handle memory leak in IE
                            elm.onload = elm.onreadystatechange = null;
                            if (head && elm.parentNode) {
                                head.removeChild(elm);
                            }
                        }
                    }; 
                }
            }

            function loadLess( loadedFilesObj ){ 
                if( typeof(less) !== 'undefined' ){
                    var xmlhttp = getXmlHttp(); 
                    xmlhttp.onreadystatechange = function() {
                        if (xmlhttp.readyState===4) {
                            var parser = new less.Parser();
                            parser.parse(xmlhttp.responseText, function (err, tree) {
                                var csscode = tree.toCSS();
                                if( !document.getElementById('lazyStyle') ){
                                    var elm = document.createElement('style'); 
                                    elm.id = 'lazyStyle';
                                    document.getElementsByTagName('head')[0].appendChild(elm);
                                }
                                document.getElementById('lazyStyle').innerHTML = document.getElementById('lazyStyle').innerHTML + csscode;
                                loadedFilesObj[fileObj.path] = 1;
                            });
                        }
                    };
                    xmlhttp.open("GET", fileObj.path, true);
                    xmlhttp.send(null);
                }else{
                    dumpError('Can\'t load .less file, less.js is missing');
                }
            }

            function getElementNameByExtention( ext ){
                switch( ext ){
                    case 'css':
                        return 'link';
                        break;
                    case 'js':
                        return 'script';
                        break;
                    default:
                        dumpError('Unsupported extension ( '+ext+' )');
                }
            }
            
            function checkIfDone(){ 
                if( typeof(clbk) === 'function' && --numOfFilesToLoad === 0 ){
                    clbk.call();
                }
            }
            
            function dumpError( msg ){
                console.log('~ Lazy Error: '+msg);
            }

            function getXmlHttp() {
                if (window.XMLHttpRequest) {
                    var xmlhttp=new XMLHttpRequest();
                }else if (window.ActiveXObject) {
                    var xmlhttp=new ActiveXObject('Microsoft.XMLHTTP');
                }
                if (xmlhttp === null) {
                    dumpError('Your browser does not support XMLHTTP');
                }
                return xmlhttp;
            }
        }
    };
})();   
