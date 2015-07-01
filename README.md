# phaser-multisort.js
Easily sort nested groups in Phaser

Phaser support only a basic sort function for groups, this function can sort just the children directly belonging to the group (limitation due to the way how PIXI render the objects). 

This simple script allows you to perform a sort function considering not only the children of the group but also the children of all the nested groups, and get them rendered in the order you want even if they actually belong to different groups.

This solution has been inspired by [this discussion](http://www.html5gamedevs.com/topic/3085-depth-sort-multiple-groups) and in particular by [this post](www.html5gamedevs.com/topic/3085-depth-sort-multiple-groups/#post_id_34989).

I also suggest to have a look to the [Phaser Isometric plug-in](http://rotates.org/phaser/iso/) especially if you are looking for more complex features.

##How to use it

Put `phaser-multisort.js` just between Phaser and the code of your game, like this:
```html
  <script src='phaser.js' type='text/javascript'></script>
  <script src='phaser-multisort.js' type='text/javascript'></script>
  <script src='mygame.js' type='text/javascript'></script>
```
*If you use any js task runner (as grunt or gulp) to build your code, make sure of the position of phaser-multisort.js*

Now the function `Phaser.Group.sort` will take an additional parameter of type boolean that, if set to `true` will make the sort function perform a recursive sort considering all the nested groups.
If set to `false` or missing, the sort function will work as usual according to the [Phaser's documentation](https://phaser.io/docs/2.3.0/Phaser.Group.html#sort).

```javascript
function create() {
  //Create some group for our game
  var cats = game.add.group();
  var dogs = game.add.group();
  var animals = game.add.group();

  //Cats and dogs are animals, no?
  animals.add(cats);
  animals.add(dogs);

  /*....here we create or add our sprites in the groups we just create...*/
}

function update() {
  
  /*....insert here all the operations we need to perform in order to update the game...*/
  
  //We can finally perform a depth sort trough all the animals
  animals.sort('y', Phaser.Group.SORT_ASCENDING, true);
}
```

After a call of the sort function with the last parameter set to `true`,when rendering the group Phaser will not look any more to the array containing all the children of the group (`Phaser.Group.children`), instead it will render the objects direclty from another array where they have been sorted (`Phaser.Group.drawCache`).
To come back to a normal rendering you can set the property `renderDrawCache` to `false` (for the above example `animals.renderDrawCache = false`) or perform a normal sort (`animals.sort('y')`).
If you are rendering from `drawCache` make sure it is up to date performing a new sort at the end of every call of the `update` function or manually supervising the objects inside the `drawCache`.


###TODO
Build a faster way to update `drawCache`. Should work without the need to collect recursively all the objects one by one at every update, but just taking track of the new created or destroyed objects belonging to that group or nested groups, in order to perform a faster sort.

