lazy
====

Lightweight (3KB!) lazy loader for JS, CSS &amp; LESS assets.

On demand assets loader built with ease, nested dependencies support and cache care.

Installation
----
Just include lazy.js on your DOM

Bower, CDN and minify versions coming soon...

Usage
----
### Asynchronic assets load
```javascript
lazy.load(['myScript.js','myStyle.css','myLessStyle.less']);`
```

And this is also fine:

```javascript
lazy.load('myScript.js,myStyle.css,myLessStyle.less');
```

### Dependencies
Use the '<' operator to define dependencies while x < y means: x depand on y, so Lazy will make sure y is being loaded before x. You can also use '<' to define nested dependcies:

```javascript
lazy.load(['loadMeLast.js < loadMeSecond.js < loadMeFirst.less'], ['LoadMeWhenEver.js', 'LoadMeWhenEverAsWell.js']);
```

loadMeLast.js depand on loadMeSecond.js, which depend on loadMeFirst.less

### Lazy loading with callback
You can send a function variable or an anonymous function as the second variable to be call when all the files are loaded

```javascript
lazy.load(['loadMeLast.js < loadMeFirst.less ', 'LoadMeWhenEver.js'], function(){
    console.log('All files have been loaded');
});
```

### Further reading
* Cache:
```javascript
lazy.load(['myScript.js','myOtherScript.js','myScript.js']);
```
myScript.js will be loaded only once

* Note: For using Lazy with LESS files you have to (*lazy*) load [less.js](https://github.com/less/less.js) first


