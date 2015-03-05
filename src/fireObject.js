"use strict";
angular.module('objective-fire')
.factory('FireObject', ["Factories", function(Factories) {
  /**
   * Internally used "class" of objects - it has methods for initiating new or
   * existing objects of that class in the Firebase
   *  This class should not be created directly! (Unless you know what you are doing)
   * @class FireObject
   * @constructor
   * @param objectClass {ObjectClass} The class that this FireObject makes.
   * @param rootRef {Firebase} Firebase object that is the root of the Firebase.
   * @param objFire {ObjectiveFire} References to the ObjectiveFire that made this FireObject.
   */
  function FireObject(objectClass, rootRef, objFire) {
    if (typeof objectClass !== "object") {
      throw new Error("objectClass must be of type ObjectClass");
    }
    this.objectClass = objectClass;
    this.rootRef = rootRef;
    this.objFire = objFire;
    // the extended angularfire object factory
    this.Factory = Factories.objectFactory(objectClass, rootRef, objFire);
  }
  /**
   * Creates a new instance of the class. It invokes the classes' constructor
   * with the arguments provided to this method. If no constructor is provided
   * an empty object will be created.
   * Any properties created by the constructor will be $save (d) to the Firebase.
   * @method new
   * @return New instance of the class
   */
  FireObject.prototype.new = function() {
    console.log("creating new", this.objectClass.name);
    // create a new location in the Firebase
    var ref = this.rootRef.child(this.objectClass.name).push();
    console.log("at firebase rec", ref.toString());
    var obj = new this.Factory(ref); // create an object at that location
    // private properties of the object
    obj._isLoaded = {}; // list of properties that are loaded
    obj._doLoad = {}; // list of properties that should be loaded
    // call constructor if it exists
    if (this.objectClass.objectConstructor !== null && typeof this.objectClass.objectConstructor === "function") {
      // call the object constructor with the correct "this" and pass the arguments
      this.objectClass.objectConstructor.apply(obj, arguments);
    } else {
      throw new Error("new may only be called for classes that have constructors");
    }
    // tell the object that all changed properties have been loaded

    // this information should not be visible to users of objectivefire
    var properties = this.objectClass.properties;
    var ops = properties.objectP;
    var oaps = properties.arrayP;
    var i, name;
    // check any object properties and set them to be loaded
    for (i = 0; i < ops.length; i++) {
      name = ops[i].name;
      if (name in obj) {
        obj._isLoaded[name] = true;
        obj._doLoad[name] = true;
      }
    }
    // check any object array properties and set them to be loaded
    for (i = 0; i < oaps.length; i++) {
      name = oaps[i].name;
      if (name in obj) {
        obj._isLoaded[name] = true;
        obj._doLoad[name] = true;
      }
    }
    obj._loaded = true; // new objects are always loaded
    obj.$save(); // save the new constructed object
    return obj;
  };
  /**
   * Creates an instance of the class from data existing in the Firebase.
   * Any parameters passed after id will be interpreted as properties to load.
   * Ex: myObject.instance("some_firebase_id", "some_property", "some_other_property");
   * This would cause myObject to automatically $load() "some_property" and "some_other_property"
   * @method instance
   * @param id {String} The id of this object in the Firebase. (it's key)
   * @return Existing instance of the class
   */
  FireObject.prototype.instance = function(id) {
    // get reference at this object location
    var ref = this.rootRef.child(this.objectClass.name).child(id);
    var toLoad = Array.prototype.slice.call(arguments, [1]); // pull all arguments except id
    var obj = new this.Factory(ref); // create the object
    // private properties again
    obj._loaded = false; // private property that states if the object has been loaded
    obj.$loaded().then(function() { // make the _loaded property change to true when the object loads
      obj._loaded = true;
    });
    obj._isLoaded = {};
    obj._doLoad = {};
    for (var i = 0; i < toLoad.length; i++) {
      if (typeof toLoad[i] !== "string") {
        throw new Error("typeof properties to load must be string");
      } else {
        obj._doLoad[toLoad[i]] = true; // set the property to be loaded
      }
    }
    return obj;
  };
  return FireObject;
}])
;
