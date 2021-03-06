"use strict";
angular.module('objective-fire')
.factory('ObjectClass', function() {
  /**
   * "Class" of objects. Similar to a class in other programming languages like java.
   * It defines the constructor, methods, and properties of any object of the class.
   * @class ObjectClass
   * @constructor
   * @param name {String} The name by which this class will be referenced.
   * throughout ObjectiveFire.
   * @param objectConstructor {Function} The constructor that will be used to
   * create instances of this class. May be null.
   * @param objectMethods {Object with Function} The methods that will be
   * available on objects of this class. May be null.
   * @param properties {Properties} The properties that objects of this class
   * will have. May not be null.
   */
  function ObjectClass(name, objectConstructor, objectMethods, properties) {
    if (arguments.length !== 4) {
      throw new Error("ObjectClass constructor may only be invoked with all parameters defined");
    }
    if (!(this instanceof ObjectClass)) { // failsafe for accidental function call instead of constructor call
      return new ObjectClass(name, objectConstructor, objectMethods, properties);
    }
    if(typeof name !== "string") {
      throw new Error("name must be of type string");
    }
    if (typeof objectConstructor !== "function" && objectConstructor !== null) {
      throw new Error("objectConstructor must be of type function or null");
    }
    if (typeof objectMethods !== "object" && objectMethods !== null) {
      throw new Error("objectMethods must be of type object or null");
    }
    if (typeof properties !== "object" && properties !== null) {
      throw new Error("properties must be of type object or null");
    }
    if (properties === null) {
      console.warn("did you mean to create an ObjectClass without properties?");
      properties = {
        primitive: [],
        objectP: [],
        arrayP: []
      };
    }
    this.name = name;
    this.objectConstructor = objectConstructor;
    this.objectMethods = objectMethods;
    this.properties = properties;
  }
  return ObjectClass;
});
