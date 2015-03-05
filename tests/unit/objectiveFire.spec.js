describe('ObjectiveFire', function() {

  // DOES NOT REQUIRE INTERACTION WITH THE FIREBASE

  var FireObject, ObjectiveFire, ObjectClass, mockObjectClass, ref, myObjectiveFire, registeredObject;

  beforeEach(function() {
    module('objective-fire');
    inject(function (_FireObject_, _ObjectiveFire_, _ObjectClass_) {
      FireObject = _FireObject_;
      ObjectiveFire = _ObjectiveFire_;
      ObjectClass = _ObjectClass_;
    });
    mockObjectClass = {name:"test"};
    ref = new Firebase("https://objective-fire.firebaseio.com");
  });

  describe('constructor', function() {
    it('should be able to be invoked as a function', function() {
      var myObjectiveFire = ObjectiveFire(ref);
      expect(myObjectiveFire instanceof ObjectiveFire).toEqual(true);
    });
    it('should throw an exception if not passed arguments', function() {
      expect(function() {var myObjectiveFire = new ObjectiveFire();}).toThrow(
        new Error("must pass a Firebase reference to ObjectiveFire constructor")
      );
    });
  });

  describe('registerFromObjectClass', function() {
    it('should register the class', function() {
      myObjectiveFire = new ObjectiveFire(ref);
      registeredObject = myObjectiveFire.registerFromObjectClass(mockObjectClass);
      expect(myObjectiveFire.objects["test"]).toEqual(registeredObject);
    });
    it('should return a FireObject', function() {
      myObjectiveFire = new ObjectiveFire(ref);
      registeredObject = myObjectiveFire.registerFromObjectClass(mockObjectClass);
      expect(registeredObject instanceof FireObject).toEqual(true);
    });
  });

  describe('registerFromObject', function() {
    var testConstructor, methods;

    beforeEach(function() {
      myObjectiveFire = new ObjectiveFire(ref);
      tesConstructor = function() {};
      methods = {
        method1: function() {}
      };
      mockObjectClass.objectConstructor = testConstructor;
      mockObjectClass.objectMethods = methods;
      mockObjectClass.properties = {
        primitive: [
          {name:"a_prop"},
          {name:"b_prop"}
        ],
        objectP: [
          {name:"c_prop",objectClassName:"test_class"}
        ],
        arrayP:  [
          {name:"d_prop",objectClassName:"test_class"}
        ]
      };
      registeredObject = myObjectiveFire.registerFromObjectClass(mockObjectClass);
    });

    it('should parse name', function() {
      expect(registeredObject.objectClass.name).toEqual("test");
    });
    it('should parse constructor', function() {
      expect(registeredObject.objectClass.objectConstructor).toEqual(testConstructor);
    });
    it('should parse methods', function() {
      expect(registeredObject.objectClass.objectMethods).toEqual(methods);
    });
    it('should parse properties', function() {
      expect(registeredObject.objectClass.properties.primitive).toEqual([
        {name:"a_prop"},
        {name:"b_prop"}
      ]);
      expect(registeredObject.objectClass.properties.objectP).toEqual([
        {name:"c_prop",objectClassName:"test_class"}
      ]);
      expect(registeredObject.objectClass.properties.arrayP).toEqual([
        {name:"d_prop",objectClassName:"test_class"}
      ]);
    });
    it('should return a FireObject', function() {
      expect(registeredObject instanceof FireObject).toEqual(true);
    });
  });

  describe('getByName', function() {

    it('should return a FireObject', function() {
      myObjectiveFire = new ObjectiveFire(ref);
      registeredObject = myObjectiveFire.registerFromObjectClass(mockObjectClass);
      expect(myObjectiveFire.getByName("test") instanceof FireObject).toEqual(true);
    });

    it('should return the registered object if it exists', function() {
      myObjectiveFire = new ObjectiveFire(ref);
      registeredObject = myObjectiveFire.registerFromObjectClass(mockObjectClass);
      expect(myObjectiveFire.getByName("test")).toEqual(registeredObject);
    });

    it('should return undefined if it doesn\'t exist', function() {
      myObjectiveFire = new ObjectiveFire(ref);
      expect(myObjectiveFire.getByName("hello")).toEqual(undefined);
    });

  });

});
