angular.module('objective-fire')
.factory('ObjectiveFire', ["FireObject", function(FireObject) {
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
     * {
     *   name: name, // see ObjectClass documentation
     *   objectConstructor: objectConstructor, // see ObjectClass documentation
     *   objectMethods: { // see ObjectClass documentation
     *     a_method: function() {},
     *     another_method: function() {}
     *   },
     *   properties: { // see ObjectClass documentation
     *     a_primitive_property: {type: "primitive", name: "a_name"}, // these must match exactly
     *     an_object_property: {type: "object", // creates an
     *     an_object_array_property: "objectArray"
     *   }
     * }
     * @method registerFromObject
     * @param object The object from which to create the class.
     * @return The registered class.
     */
    registerFromObject: function(object) {
      var theClass = undefined; // TODO: actual FireObject creation
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
