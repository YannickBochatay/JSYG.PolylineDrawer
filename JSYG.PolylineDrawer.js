/*jshint forin:false, eqnull:true*/
/* globals JSYG*/

(function(factory) {
    
    if (typeof define != "undefined" && define.amd) define("jsyg-polylinedrawer",["jsyg-path"],factory);
    else if (typeof JSYG != "undefined") {
        if (JSYG.Path) factory(JSYG);
        else throw new Error("You need JSYG.Path");
    }
    else throw new Error("JSYG is needed");
    
})(function(JSYG) {
    
    "use strict";
    
    /**
     * Tracé de chemins SVG à la souris
     * @param arg optionnel, argument JSYG faisant référence à un chemin SVG. Si non défini, un nouveau chemin est créé.
     * Il pourra étre modifié par la méthode setNode.
     * @param opt optionnel, objet définissant les options.
     * @returns {PolylineDrawer}
     */
    function PolylineDrawer(arg,opt) {
        
        if (opt) this.set(opt);
        
        if (!arg) arg = '<'+this.shape+'>';
        
        this.setNode(arg);
    }
    
    PolylineDrawer.prototype = new JSYG.StdConstruct();
    
    PolylineDrawer.prototype.constructor = PolylineDrawer;
    
    PolylineDrawer.prototype.defaultShape = "polyline";
    
    /**
     * zone sur laquelle on affecte les écouteurs d'évènements (si null, prend le parent svg le plus éloigné)
     */
    PolylineDrawer.prototype.area = null;
    /**
     * Indique si un tracé est en cours ou non
     */
    PolylineDrawer.prototype.inProgress = false;    
    /**
     * Indique la force de l'aimantation en pixels écran des points extremes entre eux.
     * La valeur null permet d'annuler l'aimantation
     */
    PolylineDrawer.prototype.strengthClosingMagnet = 5;
    /**
     * fonction(s) à éxécuter pendant le tracé
     */
    PolylineDrawer.prototype.ondraw = false;
    /**
     * fonction(s) à éxécuter avant la fin du tracé
     */
    PolylineDrawer.prototype.onbeforeend = false;
    /**
     * fonction(s) à éxécuter à la fin du tracé
     */
    PolylineDrawer.prototype.onend = false;
    /**
     * fonction(s) à éxécuter avant un nouveau point (type "point2point" uniquement)
     */
    PolylineDrawer.prototype.onbeforenewseg = false;
    /**
     * fonction(s) à éxécuter à la création d'un nouveau point
     */
    PolylineDrawer.prototype.onnewseg = false;
            
    function isClosed(points) {
        
        var seg1 = points.getItem(0),
        seg2 = points.getItem(points.numberOfItems-1);
        
        return seg1.x == seg2.x && seg1.y == seg2.y;
    }
    /**
     * Commence le tracé point à point.
     * @param e objet JSYG.Event
     * @returns {PolylineDrawer}
     */
    PolylineDrawer.prototype.draw = function(e) {
        
        if (!this.node.parentNode) throw new Error("Il faut attacher l'élément à l'arbre DOM");
        
        var poly = new JSYG(this.node),
        jSvg = this.area ? new JSYG(this.area) : poly.offsetParent('farthest'),
        mtx = poly.getMtx('screen').inverse(),
        xy = new JSYG.Vect(e.clientX,e.clientY).mtx(mtx),
        points = this.node.points,
        that = this;
        
        function mousemove(e) {
            
            var mtx = poly.getMtx('screen').inverse(),
            xy = new JSYG.Vect(e.clientX,e.clientY).mtx(mtx),
            nbSegs = points.numberOfItems,
            seg = points.getItem(nbSegs-1),
            pos,first,ref;
            
            if (that.strengthClosingMagnet!=null) {
                
                first = points.getItem(0);
                ref = new JSYG.Vect(first.x,first.y).mtx(mtx.inverse());
                pos = new JSYG.Vect(e.clientX,e.clientY);
                
                if (JSYG.distance(ref,pos) < that.strengthClosingMagnet) {
                    xy.x = first.x;
                    xy.y = first.y;
                }
            }
            
            seg.x = xy.x;
            seg.y = xy.y;
            
            points.replaceItem(seg,nbSegs-1);
            
            that.trigger('draw',that.node,e);
        }
        
        function mousedown(e) {
            
            if (that.trigger('beforenewseg',that.node,e) === false) return;
            
            //si la courbe est fermée, un clic suffit pour terminer.
            if (points.numberOfItems > 3 && isClosed(points)) {
                
                if (that.trigger('beforeend',that.node,e) === false) return;
                return that.end();
            }
            
            if (e.detail === 2) return; //pas d'action au double-clic
            
            var mtx = poly.getMtx('screen').inverse(),
            xy = new JSYG.Vect(e.clientX,e.clientY).mtx(mtx);
            
            points.appendItem( xy.toSVGPoint() );
            
            that.trigger('newseg',that.node,e);
        }
        
        function dblclick(e,keepLastSeg) {
            
            points.removeItem(points.numberOfItems-1);
            
            if (that.trigger('beforeend',that.node,e) === false) return;
            
            points.removeItem(points.numberOfItems-1);
            
            that.end();
        }
        
        this.end = function() {
            
            var first;
                        
            jSvg.off({
                'mousemove':mousemove,
                'mousedown':mousedown,
                'dblclick':dblclick
            });
            
            this.inProgress = false;
            
            this.trigger('end',that.node,e);
            
            this.end = function() { return this; };
        };
        
        if (points.numberOfItems === 0) points.appendItem( xy.toSVGPoint() );
        
        this.inProgress = true;
        
        jSvg.on({
            'mousemove':mousemove,
            'mousedown':mousedown,
            'dblclick':dblclick
        });		
        
        mousedown(e);
        
        return this;
    };
    
    /**
     * Termine le tracé.
     * @returns {PolylineDrawer}
     */
    PolylineDrawer.prototype.end = function() { return this; };
    
    JSYG.PolylineDrawer = PolylineDrawer;
    
    return PolylineDrawer;
    
});