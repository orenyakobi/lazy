lazy
====

Lightweight lazy loader for JS, CSS &amp; LESS assets.

On demand assets loader built with ease, nested dependencies support and cache care.

Installation
----
Just include lazy.js on your DOM

Bower installation coming soon...

Usage
----
### Asynchronic assets load
`lazy.load(['myScript.js','myStyle.css','myLessStyle.less']);`

And this is also fine:

`lazy.load('myScript.js,myStyle.css,myLessStyle.less');`

### Dependencies
Use the '<' operator to define dependencies while x < y means: x depand on y, so Lazy will make sure y is being loaded before x. You can also use '<' to define nested dependcies:

`lazy.load([' loadMeLast.js < loadMeSecond.js < loadMeFirst.less ', 'LoadMeWhenEver.js');`

loadMeLast.js depand on loadMeSecond.js, which depend on loadMeFirst.less

### Lazy loading with callback
You can send a function variable or an anonymous function to be call when all the files are loaded

  `lazy.load([' loadMeLast.js < loadMeFirst.less '], ['LoadMeWhenEver.js]', function(){
    console.log('All files have been loaded');
  });`

### Further reading
* Cache

`lazy.load(['myScript.js','myOtherScript.js','myScript.js']);`

myScript.js will be loaded only once

* Note: For using Lazy with LESS files you have to (lazy) load [less.js](https://github.com/less/less.js) first


