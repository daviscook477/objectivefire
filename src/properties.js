"use strict";
angular.module('objective-fire')
.factory("ObjectProperty", function() {
  /**
   * Property that is an object.
   * @class ObjectProperty
   * @constructor
   * @param name {String} The name of this property.
   * @param objectClassName {String} The name of the class of object this property is.
   */
  function ObjectProperty(name, objectClassName) {
    if (!(this instanceof ObjectProperty)) {
      return new ObjectProperty(name, objectClassName);
    }
    if (typeof name !== "string") {
      throw "name must be of type string";
    }
    /**
     * The name of this property.
     * @property name
     * @type {String}
     */
    this.name = name;
    /**
     * The name of the class of object this property is.
     * @property objectClassName
     * @type {String}
     */
    this.objectClassName = objectClassName;
  }
  return ObjectProperty;
})
.factory("ObjectArrayProperty", function() {
  /**
   * Property that is an array of objects.
   * @class ObjectArrayProperty
   * @constructor
   * @param name {String} The name of this property.
   * @param objectClassName {String} The name of the class of object this property is.
   */
  function ObjectArrayProperty(name, objectClassName) {
    if (!(this instanceof ObjectArrayProperty)) {
      return new ObjectArrayProperty(name, objectClassName);
    }
    if (typeof name !== "string") {
      throw "name must be of type string";
    }
    /**
     * The name of this property.
     * @property name
     * @type {String}
     */
    this.name = name;
    /**
     * The name of the class of object this property is.
     * @property objectClassName
     * @type {String}
     */
    this.objectClassName = objectClassName;
  }
  return ObjectArrayProperty;
})
.factory("PrimitiveProperty", function() {
  /**
   * Property that is raw data.
   * @class PrimitiveProperty
   * @constructor
   * @param name {String} The name of this property.
   */
  function PrimitiveProperty(name) {
    if (!(this instanceof PrimitiveProperty)) {
      return new PrimitiveProperty(name);
    }
    if (typeof name !== "string") {
      throw "name must be of type string";
    }
    /**
     * The name of this property.
     * @property name
     * @type String
     */
    this.name = name;
  }
  return PrimitiveProperty;
})
.factory("Properties", ["PrimitiveProperty", "ObjectProperty", "ObjectArrayProperty", function(PrimitiveProperty, ObjectProperty, ObjectArrayProperty) {
  /**
   * Group of properties.
   * @class Properties
   * @constructor
   */
  function Properties() {
    if (!(this instanceof Properties)) {
      return new Properties();
    }
    /**
     * Array of all the PrimtiveProperty.
     * @property primitive
     * @type Array of PrimitiveProperty
     */
    this.primitive = [];
    /**
     * Array of all the ObjectProperty.
     * @property objectP
     * @type Array of ObjectProperty
     */
    this.objectP = [];
    /**
     * Array of all the ObjectArrayProperty.
     * @property arrayP
     * @type Array of ObjectArrayProperty
     */
    this.arrayP = [];
  }
  Properties.prototype = {
    /**
     * Adds a property to this group of properties.
     * @method addProperty
     * @param property {PrimitiveProperty || ObjectProperty || ObjectArrayProperty} The property to be added.
     * @return this
     * @chainable
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
      this.primitive.push(new PrimitiveProperty(name));
      return this;
    },
    addObjectProperty: function(name, objectClassName) {
      this.objectP.push(new ObjectProperty(name, objectClassName));
      return this;
    },
    addObjectArrayProperty: function(name, objectClassName) {
      this.arrayP.push(new ObjectArrayProperty(name, objectClassName));
      return this;
    }
  };
  return Properties;
}]);
