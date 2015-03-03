/*!
 * ObjectiveFire is a utility library that makes interactions with firebase easy by representing data as objects
 *
 * ObjectiveFire 0.0.0
 * https://github.com/daviscook477/objectivefire/
 * Date: 03/03/2015
 * License: MIT
 */
angular.module('objective-fire', ['firebase']);

angular.module('objective-fire')
.factory('Factories', ["$firebaseObject", "$firebaseArray", "$q", function($firebaseObject, $firebaseArray, $q) {
  var factories = {
    objectFactory: function(objectClass, rootRef, objFire) {
      return $firebaseObject.$extend({
        // things that must be accessible
        _objectClass: objectClass,
        _rootRef: rootRef,
        _objFire: objFire,
        // methods to override
        $load: function(name) {
          var properties = this._objectClass.properties;
          var pps = properties.primitive;
          var ops = properties.objectP;
          var oaps = properties.arrayP;
          //TODO/WARNING THIS METHOD DOESN'T WORK! IT SIMPLY COPIES OLD CODE FOR REFERENCE
          var deffered = $q.defer();
          if (typeof name !== "string") {
            throw "name must be of type string";
          }
          if (!this._doLoad[name]) { // if property is already loaded don't do anything
            // find the actual property definition
            var property = undefined;
            var kind = "";
            for (var i = 0; i < ops.length; i++) {
              if (ops[i].name === name) {
                property = ops[i];
                kind = "op";
                break;
              }
            }
            for (var i = 0; i < oaps.length; i++) {
              if (oaps[i].name === name) {
                property = oaps[i];
                kind = "oap";
                break;
              }
            }
            this._doLoad[name] = true; // require that the property is loaded
            if (this._loaded) { // if already loaded then manually load the property
              if (kind === "op") {
                var objectClassName = property.objectClassName;
                var objectClass2 = objFire.getObjectClass(objectClassName);
                var obj = objectClass2.instance(this[name]); // create the object
                this[name] = obj;
                this._isLoaded[name] = true;
                deffered.resolve(this[name]);
              } else if (kind === "oap") {
                var objectClassName = property.objectClassName;
                var objectClass2 = objFire.getObjectClass(objectClassName);
                var arr = new ObjectArray(rootRef.child(objectClass.name).child(this.$id).child(name), objectClass2);
                this[name] = arr;
                this._isLoaded[name] = true;
                deffered.resolve(this[name]);
              }
            } else { // if we haven't loaded, it will be loaded when the object is loaded
              // this means that simply changing this._doLoad[name] will load it

              // make sure it is actually loaded in the object loading (could not due to synchronization issues (I think))
              this.$loaded().then(function(self) {
                if (!self._isLoaded[name]) { // if for some reason not loaded manually load the property
                  if (kind === "op") {
                    var objectClassName = property.objectClassName;
                    var objectClass2 = objFire.getObjectClass(objectClassName);
                    var obj = objectClass2.instance(self[name]); // create the object
                    self[name] = obj;
                  } else if (kind === "oap") {
                    var objectClassName = property.objectClassName;
                    var objectClass2 = objFire.getObjectClass(objectClassName);
                    var arr = new ObjectArray(rootRef.child(objectClass.name).child(self.$id).child(name), objectClass2);
                    self[name] = arr;
                  }
                }
                self._isLoaded[name] = true;
                deffered.resolve(self[name]);
              });
            }
          } else {
            deffered.resolve(this[name]);
          }
          return deffered.promise;
        },
        $toJSON: function(rec) {
          var properties = this._objectClass.properties;
          var pps = properties.primitive;
          var ops = properties.objectP;
          var oaps = properties.arrayP;
          var data = {};
          for (var i = 0; i < pps.length; i++) { // save primitives
            var name = pps[i].name;
            data[name] = rec[name];
          }
          for (var i = 0; i < ops.length; i++) { // save object references
            var name = ops[i].name;
            if (typeof rec[name] === "object") {
              data[name] = rec[name].$id; // save just the id of the object
            } else {
              data[name] = rec[name];
            }
          }
          for (var i = 0; i < oaps.length; i++) { // save object array references
            var name = oaps[i].name;
            if (typeof rec[name] === "object") {
              data[name] = [];
              for (var j = 0; j < rec[name].length; j++) {
                data[name][j] = rec[name][j].$id; // save just the id of each element in the array
              }
            } else {
              data[name]= rec[name]; // if it is not object it is just the reference so save the reference back
            }
          }
          for (var param in data) { // sanatize firebase input
            if (data[param] === undefined) {
              data[param] = null;
            }
          }
          return data; // return the data that we made
        },
        $fromJSON: function(snap) {
          var properties = this._objectClass.properties;
          var pps = properties.primitive;
          var ops = properties.objectP;
          var oaps = properties.arrayP;
          var data = snap.val();
          if (data === null) {
            data = {};
          }
          var newRec = {};
          for (var i = 0; i < pps.length; i++) { // replace all primitive properties
            var name = pps[i].name;
            newRec[name] = data[name]; // simply replace primitives
          }
          for (var i = 0; i < ops.length; i++) { // replace all object properties
            var name = ops[i].name;
            if (this._doLoad[name]) { // only load property if it should be
              // only create a new object if the object has changed
              if (!this[name] || this[name].$id !== data[name]) { // in the firebase only the object reference is stored so if the reference isn't the same as the id of the existing object they must be different
                var objectClassName = ops[i].objectClassName;
                var objectClass = this._objFire.getObjectClass(objectClassName);
                var obj = objectClass.instance(data[name]);
                this._isLoaded[name] = true;
                newRec[name] = obj;
              } else {
                newRec[name] = this[name];
              }
            } else {
              newRec[name] = data[name]; // just save the reference if not supposed to load it
            }
          }
          for (var i = 0; i < oaps.length; i++) { // replace all object array properties
            var name = oaps[i].name;
            if (this._doLoad[name]) {
              if (!this._isLoaded[name]) { // arrays actually must only be loaded once
                var objectClassName = oaps[i].objectClassName;
                var objectClass = this._objFire.getObjectClass(objectClassName);
                var Factory = factories.arrayFactory(objectClass, this._rootRef, this._objFire);
                var arr = new Factory(this._rootRef.child(this._objectClass.name).child(this.$id).child(name)); // we are obtaining a constructor by a function with parameters then calling that function
                this._isLoaded[name] = true;
                newRec[name] = arr;
              } else {
                newRec = this[name]; // pull the object of the current object if it exists
              }
            } else {
              newRec[name] = data[name]; // just save the reference if not supposed to load it
            }
          }
          return newRec;
        }
      });
    },
    arrayFactory: function(fireObject, rootRef, objFire) {
      return $firebaseArray.$extend({
        // things that must be accessible
        _fireObject: fireObject,
        _rootRef: rootRef,
        _objFire: objFire,
        // methods to override
        $toJSON: function(rec) {
          return rec.$id; // a record should be saved by its reference
        },
        $fromJSON: function(snap) {
          var ob = this._fireObject.instance(snap.val());
          return ob; // create an object from the snapshot
        }
      });
    }
  };
  return factories;
}]);

angular.module('objective-fire')
.factory('FireObject', ["Factories", function(Factories) {
  /**
  Object created from class that has methods for creating instances of that class
  @class FireObject
  @constructor
  @param objectClass {ObjectClass} The class that this FireObject makes
  @param rootRef {Firebase} Firebase object that is the root of the Firebase
  @param objFire {ObjectiveFire} References to the ObjectiveFire that made this FireObject
  */
  function FireObject(objectClass, rootRef, objFire) {
    /**
    The class that this FireObject makes
    @property objectClass
    @type ObjectClass
    */
    this.objectClass = objectClass;
    /**
    Firebase object that is the root of the Firebase
    @property rootRef
    @type Firebase
    */
    this.rootRef = rootRef;
    /**
    Firebase object that is the root of the Firebase
    @property objFire
    @type ObjectiveFire
    */
    this.objFire = objFire;
    // not documented because it is private
    this.Factory = Factories.objectFactory(objectClass, rootRef, objFire);
  }
  /**
  Creates a new instance of the class.
  Important: The parameters passed to this method should be those for the class's constructor
  @method new
  @return New instance of the class
  */
  FireObject.prototype.new = function() {
    // obtain the angularfire object
    var ref = this.rootRef.child(this.objectClass.name).push(); // create a new location for the object we are making
    var obj = new this.Factory(ref);
    // construct the new instance
    obj._loaded = false; // private property that states if the object has been loaded
    obj.$loaded().then(function() { // make the _loaded property change to true when the object loads
      obj._loaded = true;
    });
    obj._isLoaded = {};
    obj._doLoad = {}; // this is private property that determines if an object property should be loaded
    if (this.objectClass.objectConstructor !== null && typeof this.objectClass.objectConstructor === "function") {
      this.objectClass.objectConstructor.apply(obj, arguments); // call the constructor for new objects
    } else {
      throw "new may only be called for classes that have constructors";
    }
    // tell the object that all changed properties have been loaded
    var properties = this.objectClass.properties;
    var ops = properties.objectP;
    var oaps = properties.arrayP;
    for (var i = 0; i < ops.length; i++) {
      var name = ops[i].name;
      if (name in obj) {
        obj._isLoaded[name] = true;
        obj._doLoad[name] = true;
      }
    }
    for (var i = 0; i < oaps.length; i++) {
      var name = oaps[i].name;
      if (name in obj) {
        obj._isLoaded[name] = true;
        obj._doLoad[name] = true;
      }
    }
    obj.$save(); // save the new constructed object
    return obj;
  };
  /**
  Creates an instance of the class from data existing in the Firebase
  @method instance
  @param id {String} The id of this object in the Firebase (it's key)
  @return Existing instance of the class
  */
  FireObject.prototype.instance = function(id) {
    // obtain the angularfire object
    var ref = this.rootRef.child(this.objectClass.name).child(id);
    var obj = new this.Factory(ref);
    // construct the existing instance
    obj._loaded = false; // private property that states if the object has been loaded
    obj.$loaded().then(function() { // make the _loaded property change to true when the object loads
      obj._loaded = true;
    });
    obj._isLoaded = {};
    obj._doLoad = {}; // this is private property that determines if an object property should be loaded
    return obj;
  };
  return FireObject;
}])
;

angular.module('objective-fire')
.factory('ObjectArray', ["$firebaseArray", function($firebaseArray) {
  var getFactory = function(fireObject) {
    return $firebaseArray.$extend({
      $$added: function(snapshot) {
        return fireObject.instance(snapshot.val());
      },
      $$updated: function(snapshot) {
        var changed = false;
        var curO = this.$getRecord(snapshot.val());
        var newO = fireObject.instance(snapshot.val());
        if (!angular.equals(curO, newO)) {
          change = true;
        }
        return changed;
      }
    });
  };
  /**
  An array of objects in the Firebase. The objects are of some class.
  @class ObjectArray
  @constructor
  @param ref {Firebase} Firebase reference to the location where this ObjectArray resides
  @param fireObject {FireObject} FireObject that is the class that each element of this array will be
  */
  return function(ref, fireObject) {
    var obj = new getFactory(fireObject);
    return obj;
  };
}]);

angular.module('objective-fire')
.factory('ObjectClass', function() {
  /**
  Class of objects in the database
  @class ObjectClass
  @constructor
  @param name {String} The name by which this class will be referenced throughout ObjectiveFire.
  @param objectConstructor {Function} The constructor that will be used to create instances of this class
  @param objectMethods {Object with Function} The methods that will be available on objects of this class. They are provided on an object in which the name of the function on that object will be the name of the function on the instances of the class
  @param properties {Properties} The properties that objects of this class will have
  */
  function ObjectClass(name, objectConstructor, objectMethods, properties) {
    if (!this instanceof ObjectClass) { // failsafe for accidental function call instead of constructor call
      return new ObjectClass(name, objectConstructor, objectMethods, properties);
    }
    if(typeof name !== "string") {
      throw "name must be of type string";
    }
    if (typeof objectConstructor !== "function" && objectConstructor !== null) {
      throw "objectConstructor must be of type function or null";
    }
    if (typeof objectMethods !== "object" && objectMethods !== null) {
      throw "objectMethods must be of type object or null";
    }
    if (typeof properties !== "object" && properties !== null) {
      throw "properties must be of type object or null";
    }
    /**
    @property name
    @type String
    */
    this.name = name;
    /**
    @property objectConstructor
    @type Function
    */
    this.objectConstructor = objectConstructor;
    /**
    @property objectMethods
    @type Object with Function
    */
    this.objectMethods = objectMethods;
    /**
    @property properties
    @type Properties
    */
    this.properties = properties;
  }
  return ObjectClass;
});

angular.module('objective-fire')
.factory('ObjectiveFire', ["FireObject", function(FireObject) {
  /**
  TODO: Define the ObjectiveFire Object
  @class ObjectiveFire
  @constructor
  @param ref {Firebase} Firebase object at the URL that is your Firebase
  */
  function ObjectiveFire(ref) {
    if (!this instanceof ObjectiveFire) {
      return new ObjectiveFire(ref);
    }
    /**
    Firebase object at the URL that is your Firebase
    @property ref
    @type Firebase
    */
    this.ref = ref;
    /**
    Object that contains all registered classes
    @property objects
    @type Object
    */
    this.objects = {};
  }
  ObjectiveFire.prototype = {
    /**
    Registers a class
    @method registerObjectClass
    @param objectClass {ObjectClass} The class to register
    @return this
    @chainable
    */
    registerObjectClass: function(objectClass) {
      this.objects[objectClass.name] = new FireObject(objectClass, this.ref, this);
      return this;
    },
    /**
    Gets the class stored in this ObjectiveFire for the specified name
    @method getObjectClass
    @param name {String} The name of the class
    @return the class for the specified name
    */
    getObjectClass: function(name) {
      return this.objects[name];
    }
  };
  return ObjectiveFire;
}]);

angular.module('objective-fire')
.factory("ObjectProperty", function() {
  /**
  Property that is an object
  @class ObjectProperty
  @constructor
  @param name {String} The name of this property
  @param objectClassName {String} The name of the class of object this property is
  */
  function ObjectProperty(name, objectClassName) {
    if (!this instanceof ObjectProperty) {
      return new ObjectProperty(name, objectClassName);
    }
    if (typeof name !== "string") {
      throw "name must be of type string";
    }
    /**
    The name of this property
    @property name
    @type {String}
    */
    this.name = name;
    /**
    The name of the class of object this property is
    @property objectClassName
    @type {String}
    */
    this.objectClassName = objectClassName;
  }
  return ObjectProperty;
})
.factory("ObjectArrayProperty", function() {
  /**
  Property that is an array of objects
  @class ObjectArrayProperty
  @constructor
  @param name {String} The name of this property
  @param objectClassName {String} The name of the class of object this property is
  */
  function ObjectArrayProperty(name, objectClassName) {
    if (!this instanceof ObjectArrayProperty) {
      return new ObjectArrayProperty(name, objectClassName);
    }
    if (typeof name !== "string") {
      throw "name must be of type string";
    }
    /**
    The name of this property
    @property name
    @type {String}
    */
    this.name = name;
    /**
    The name of the class of object this property is
    @property objectClassName
    @type {String}
    */
    this.objectClassName = objectClassName;
  }
  return ObjectArrayProperty;
})
.factory("PrimitiveProperty", function() {
  /**
  Property that is raw data
  @class PrimitiveProperty
  @constructor
  @param name {String} The name of this property
  */
  function PrimitiveProperty(name) {
    if (!this instanceof PrimitiveProperty) {
      return new PrimitiveProperty(name);
    }
    if (typeof name !== "string") {
      throw "name must be of type string";
    }
    /**
    The name of this property
    @property name
    @type String
    */
    this.name = name;
  }
  return PrimitiveProperty;
})
.factory("Properties", ["PrimitiveProperty", "ObjectProperty", "ObjectArrayProperty", function(PrimitiveProperty, ObjectProperty, ObjectArrayProperty) {
  /**
  Group of properties
  @class Properties
  @constructor
  */
  function Properties() {
    if (!this instanceof Properties) {
      return new Properties();
    }
    /**
    Array of all the PrimtiveProperty
    @property primitive
    @type Array of PrimitiveProperty
    */
    this.primitive = [];
    /**
    Array of all the ObjectProperty
    @property objectP
    @type Array of ObjectProperty
    */
    this.objectP = [];
    /**
    Array of all the ObjectArrayProperty
    @property arrayP
    @type Array of ObjectArrayProperty
    */
    this.arrayP = [];
  }
  Properties.prototype = {
    /**
    Adds a property to this group of properties
    @method addProperty
    @param property {PrimitiveProperty || ObjectProperty || ObjectArrayProperty} the property to be added
    @return this
    @chainable
    */
    addProperty: function(property) {
      if (property instanceof PrimitiveProperty) {
        this.primitive.push(property);
      } else if (property instanceof ObjectProperty) {
        this.objectP.push(property);
      } else if (property instanceof ObjectArrayProperty) {
        this.arrayP.push(property);
      } else {
        throw "property must be of type PrimitiveProperty || ObjectProperty || ObjectArrayProperty";
      }
      return this;
    },
    // TODO: doc these and test them
    addPrimitiveProperty: function(name) {
      if (!typeof name === "string") {
        throw "name must have type of string";
      } else {
        this.primitive.push(new PrimitiveProperty(name));
      }
    },
    addObjectProperty: function(name, objectClassName) {
      if (!typeof name === "string") {
        throw "name must have type of string";
      } else {
        this.objectP.push(new ObjectProperty(name, objectClassName));
      }
    },
    addObjectArrayProperty: function(name, objectClassName) {
      if (!typeof name === "string") {
        throw "name must have type of string";
      } else {
        this.arrayP.push(new ObjectArrayProperty(name, objectClassName));
      }
    }
  };
  return Properties;
}])
;
