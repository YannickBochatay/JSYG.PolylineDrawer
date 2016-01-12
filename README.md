# JSYG.PolylineDrawer
Draw polylines and polygon with [JSYG framework](https://github.com/YannickBochatay/JSYG)

##### Demo
[http://yannickbochatay.github.io/JSYG.PolylineDrawer/](http://yannickbochatay.github.io/JSYG.PolylineDrawer/)

##### Installation
```shell
bower install jsyg-polylinedrawer
```

##### Example
```javascript
var pencil = new JSYG.PolylineDrawer();
            
$("svg").on("mousedown",function(e) {

   if (pencil.inProgress) return;

   var poly = JSYG('<polyline>').appendTo(this);

   pencil.draw(poly,e);

});
```
