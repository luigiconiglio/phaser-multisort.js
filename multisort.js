
/**
* When sorting recursively this array will be updated with the sprites to render 
*/

Phaser.Group.prototype.drawCache = [];

/**
* If set to true Phaser will be rendering the sprites cached in the 'drawCache' of this Group
* instead of considering the 'children'. When sorting this property is automatically set to true,
* in case of recursive sort, false otherwise
*/

Phaser.Group.prototype.renderDrawCache = false;

/**
* Recursive function that will stick all nested children sprites in the drawCache so they're on the same level
* 
* @method _recursiveCache
* @param children {Array} - The array where to search recursively for sprites to push in the drawCache
*/

Phaser.Group.prototype._recursiveCache = function (children) {

    for (var i = 0; i < children.length; i++) {
	
        if (children[i] instanceof Phaser.Group) {
            this._recursiveCache(children[i].children);
        }
        else {
            this.drawCache.push(children[i]);
        }
    }

};

/**
* Update this.drawCache getting all the sprites belonging to this Group and all the nested groups
*
* @method updateDrawCache
*/

Phaser.Group.prototype.updateDrawCache = function () {

    //clear the cache
    this.drawCache.length = 0;

    //cache all children
    this._recursiveCache(this.children);

};


/**
* Renders the Group using the WebGL renderer
*
* @method _renderWebGL
* @param renderSession {RenderSession}
* @private
*/

Phaser.Group.prototype._renderWebGL = function(renderSession)
{
    if(!this.visible || this.alpha <= 0)return;

    if(this._cacheAsBitmap)
    {
        this._renderCachedSprite(renderSession);
        return;
    }

    var i;
    var objectsToRender;

    if (this.renderDrawCache)
	// render the drawCache
	objectsToRender = this.drawCache;
    else
	// simply render the children!
	objectsToRender = this.children;

    if(this._mask || this._filters)
    {
        if(this._mask)
        {
            renderSession.spriteBatch.stop();
            renderSession.maskManager.pushMask(this.mask, renderSession);
            renderSession.spriteBatch.start();
        }

        if(this._filters)
        {
            renderSession.spriteBatch.flush();
            renderSession.filterManager.pushFilter(this._filterBlock);
        }

		
        for (i = 0; i < objectsToRender.length; i++) {
                objectsToRender[i]._renderWebGL(renderSession);
         }

        renderSession.spriteBatch.stop();

        if(this._filters)renderSession.filterManager.popFilter();
        if(this._mask)renderSession.maskManager.popMask(renderSession);

        renderSession.spriteBatch.start();
    }
    else
    {
	for (i = 0; i < objectsToRender.length; i++) {
                objectsToRender[i]._renderWebGL(renderSession);
        }
    }
};


/**
* Renders the Group using the Canvas renderer
*
* @method _renderCanvas
* @param renderSession {RenderSession} 
* @private
*/

Phaser.Group.prototype._renderCanvas = function(renderSession)
{
    if (this.visible === false || this.alpha === 0) return;

    if (this._cacheAsBitmap)
    {
        this._renderCachedSprite(renderSession);
        return;
    }

    if (this._mask)
    {
        renderSession.maskManager.pushMask(this._mask, renderSession);
    }
    
    var objectsToRender;

    if (this.renderDrawCache)
	// render the drawCache
	objectsToRender = this.drawCache;
    else
	// simply render the children
	objectsToRender = this.children;

    for (var i = 0; i < objectsToRender.length; i++)
    {
        objectsToRender[i]._renderCanvas(renderSession);
    }

    if (this._mask)
    {
        renderSession.maskManager.popMask(renderSession);
    }
};


/**
* Sort the children in the group according to a particular key and ordering.
*
* Call this function to sort the group according to a particular key value and order.
* For example to depth sort Sprites for Zelda-style game you might call `group.sort('y', Phaser.Group.SORT_ASCENDING)` at the bottom of your `State.update()`.
*
* @method Phaser.Group#sort
* @param {string} [key='z'] - The name of the property to sort on. Defaults to the objects z-depth value.
* @param {integer} [order=Phaser.Group.SORT_ASCENDING] - Order ascending ({@link Phaser.Group.SORT_ASCENDING SORT_ASCENDING}) or descending ({@link Phaser.Group.SORT_DESCENDING SORT_DESCENDING}).
* @param {boolean} - If true get recursively the objects from all nested groups and sort them before rendering.
*/

Phaser.Group.prototype.sort = function (index, order, recursive) {
    
    if (this.children.length < 2) {
        //  Nothing to swap
        return;
    }

    if (typeof index === 'undefined') { index = 'z'; }
    if (typeof order === 'undefined') { order = Phaser.Group.SORT_ASCENDING; }

    this._sortProperty = index;

    // determine the array to sort
    var arrToSort;
    if (recursive) {

        // cache all children
        this.updateDrawCache();
	this.renderDrawCache = true;
        arrToSort = this.drawCache;
    }
    else {
	if (this.renderDrawCache) { this.renderDrawCache = false };
        arrToSort = this.children;
    }

    // sort the appropriate array in the appropriate way
    if (order === Phaser.Group.SORT_ASCENDING) {
        arrToSort.sort(this.ascendingSortHandler.bind(this));
    }
    else {
        arrToSort.sort(this.descendingSortHandler.bind(this));
    }

    this.updateZ();

};
