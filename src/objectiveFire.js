"use strict";
angular.module('objective-fire')
.factory('ObjectiveFire', ["FireObject", "Properties", "ObjectClass", "Factories", function(FireObject, Properties, ObjectClass, Factories) {
  /**
   * All classes should be registered in an instance of ObjectiveFire created at
   * your Firebase.
   * @class ObjectiveFire
   * @constructor Creates instance of ObjectiveFire at the Firebase reference.
   * @param ref {Firebase} Firebase object at the URL that is your Firebase.
   * Provide a Firebase object - NOT a URL. This Firebase object must be the root of your Firebase.
   */
  function ObjectiveFire(ref) {
    if (!(ref instanceof Firebase)) {
      throw new Error("must pass a Firebase reference to ObjectiveFire constructor");
    }
    if (!(this instanceof ObjectiveFire)) {
      return new ObjectiveFire(ref);
    }
    this.ref = ref;
    // registry of objects
    this.objects = {};
    this.arrayFactories = {};
  }
  ObjectiveFire.prototype = {
    /**
     * Registers a class from an ObjectClass object.
     * @method registerFromObjectClass
     * @param objectClass {ObjectClass} The ObjectClass from which to create the class.
     * @return {FireObject} The registered class.
     */
    registerFromObjectClass: function(objectClass) {
      var theFireObject = new FireObject(objectClass, this.ref, this);
      this.objects[objectClass.name] = theFireObject;
      this.arrayFactories[objectClass.name] = Factories.arrayFactory(theFireObject);
      return theFireObject;
    },
    /**
     * Registers a class from an object that follows a specific format.
     * The object must provided in this format.
     ```
     *     // TODO: fix the broken formatting in the documentation
     *     {
     *       name: name, // see ObjectClass documentation
     *       objectConstructor: objectConstructor, // see ObjectClass documentation
     *       objectMethods: { // see ObjectClass documentation
     *         a_method: function() {},
     *         another_method: function() {}
     *       },
     *       properties: { // see ObjectClass documentation
     *         primitive: [{name: "a_name"},{name: "another_name"}], // Primitive Properties
     *         objectP: [{name: "a_name", objectClassName: "a_class_name"}], // Object Properties
     *         arrayP: [{name: "a_name", objectClassName: "a_class_name"}], // Object Array Properties
     *       }
     *     }
     ```
     * @method registerFromObject
     * @param object The object from which to create the class.
     * @return {FireObject} The registered class.
     */
    registerFromObject: function(object) {
      var properties = new Properties(); // find properties
      var i, prop;
      if (object.properties.primitive) {
        for (i = 0; i < object.properties.primitive.length; i++) {
          prop = object.properties.primitive[i];
          properties.addPrimitiveProperty(prop.name);
        }
      }
      if (object.properties.objectP) {
        for (i = 0; i < object.properties.objectP.length; i++) {
          prop = object.properties.objectP[i];
          properties.addObjectProperty(prop.name, prop.objectClassName);
        }
      }
      if (object.properties.arrayP) {
        for (i = 0; i < object.properties.arrayP.length; i++) {
          prop = object.properties.arrayP[i];
          properties.addObjectArrayProperty(prop.name, prop.objectClassName);
        }
      }
      if (!object.objectConstructor) {
        object.objectConstructor = null;
      }
      if (!object.objectMethods) {
        object.objectMethods = null;
      }
      var theClass = new ObjectClass(object.name, object.objectConstructor, object.objectMethods, properties);
      var theFireObject = new FireObject(theClass, this.ref, this);
      this.objects[object.name] = theFireObject;
      this.arrayFactories[object.name] = Factories.arrayFactory(theFireObject);
      return theFireObject;
    },
    /**
     * Gets registered class by name.
     * @method getByName
     * @param name {String} The name of the class.
     * @return {FireObject} The class for the specified name.
     */
    getByName: function(name) {
      return this.objects[name];
    },
    /**
     * Gets an array factory for the class specified by name
     * @method getArrayFactory
     * @param name {String} The name of the class.
     * @return {$firebaseArray} An extended $firebaseArray factory for the specified class.
     * The constructor is returned so in order to create an instance it should
     * be invoked with new.
     */
    getArrayFactory: function(name) {
      return this.arrayFactories[name];
    }
  };
  return ObjectiveFire;
}]);
