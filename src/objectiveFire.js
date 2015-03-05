"use strict";
angular.module('objective-fire')
.factory('ObjectiveFire', ["FireObject", function(FireObject, Properties, ObjectClass) {
  /**
   * All classes should be registered in an instance of ObjectiveFire created at
   * your Firebase.
   * @class ObjectiveFire
   * @constructor Creates instance of ObjectiveFire at the Firebase reference.
   * @param ref {Firebase} Firebase object at the URL that is your Firebase.
   * Provide a Firebase object - NOT a URL. This Firebase object may be a
   * location in the Firebase - it doesn't have to be at the root. Doing
   * as such will cause all objectivefire operations to be done from only within
   * that location in the Firebase.
   */
  function ObjectiveFire(ref) {
    if (!this instanceof ObjectiveFire) {
      return new ObjectiveFire(ref);
    }
    this.ref = ref;
    // registry of objects
    this.objects = {};
  }
  ObjectiveFire.prototype = {
    /**
     * Registers a class from an ObjectClass object.
     * @method registerFromObjectClass
     * @param objectClass {ObjectClass} The ObjectClass from which to create the class.
     * @return The registered class.
     */
    registerFromObjectClass: function(objectClass) {
      this.objects[objectClass.name] = new FireObject(objectClass, this.ref, this);
      return this;
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
     *         a_primitive_property: {type: "primitive", name: "a_name"}, // these must match exactly
     *         an_object_property: {type: "object", name: "a_name", objectClassName: "a_class_name"},
     *         an_object_array_property: {type: "objectArray", name: "a_name", objectClassName: "a_class_name"}
     *       }
     *     }
     ```
     * @method registerFromObject
     * @param object The object from which to create the class.
     * @return The registered class.
     */
    registerFromObject: function(object) {
      var properties = new Properties(); // find proeprties
      for (var param in object.properties) {
        if (object.properties.hasOwnProperty(param)) {
          var cur = object.properties[param];
          var type = cur.type;
          if (type === "primitive") {
            properties.addPrimitiveProperty(cur.name);
          } else if (type === "object") {
            properties.addObjectProperty(cur.name, cur.objectClassName);
          } else if (type === "objectArray") {
            properties.addObjectArrayProperty(cur.name, cur.objectClassName);
          }
        }
      }
      var theClass = new ObjectClass(object.name, object.objectConstructor, object.objectMethods, properties);
      this.objects[object.name] = theClass;
      return theClass;
    },
    /**
     * Gets registered class by name.
     * @method getByName
     * @param name {String} The name of the class.
     * @return The class for the specified name.
     */
    getByName: function(name) {
      return this.objects[name];
    }
  };
  return ObjectiveFire;
}]);
