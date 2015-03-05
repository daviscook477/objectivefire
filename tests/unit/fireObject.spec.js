describe('FireObject', function() {
  var mockObjectiveFire, mockClass, ref, FireObject, fireObject, spy, theConstructor;

  beforeEach(function() {
    module('objective-fire');
    inject(function (_FireObject_) {
      FireObject = _FireObject_;
    });
    mockClass = {
      name: "test",
      objectConstructor: null,
      objectMethods: null,
      properties: {
        primitive: [],
        objectP: [],
        arrayP: []
      }
    };
    ref = new Firebase("https://objective-fire.firebaseio.com");
    mockObjectiveFire = {};
  });

  describe('new', function() {

    // DOES NOT REQUIRE INTERFACING WITH FIREBASE

    it('should exist', function() {
      fireObject = new FireObject(mockClass, ref, mockObjectiveFire);
      expect(typeof fireObject.instance).toEqual("function");
    });

    it('should throw an exception if called on a class without a constructor', function() {
      fireObject = new FireObject(mockClass, ref, mockObjectiveFire);
      expect(function() {
        fireObject.new();
      }).toThrow(new Error("new may only be called for classes that have constructors"));
    });

    it('should call the constructor if it exists', function() {
      theConstructor = function() {};
      mockClass.objectConstructor = theConstructor;
      spy = spyOn(mockClass, "objectConstructor");
      fireObject = new FireObject(mockClass, ref, mockObjectiveFire);
      fireObject.new();
      expect(spy).toHaveBeenCalled();
    });

    it('should call the constructor with the arguments passed to "new"', function() {
      theConstructor = function() {};
      mockClass.objectConstructor = theConstructor;
      spy = spyOn(mockClass, "objectConstructor");
      fireObject = new FireObject(mockClass, ref, mockObjectiveFire);
      fireObject.new(1, 2, 3);
      expect(spy).toHaveBeenCalledWith(1, 2, 3);
    });

    it('should call the constuctor with a "this" of the object it returns', function() {
      var theThis;
      theConstructor = function() {theThis = this};
      mockClass.objectConstructor = theConstructor;
      spy = spyOn(mockClass, "objectConstructor").and.callThrough();
      fireObject = new FireObject(mockClass, ref, mockObjectiveFire);
      var obj = fireObject.new();
      expect(theThis).toEqual(obj);
    });

    it('should allow the constructor to set properties on "this"', function() {
      theConstructor = function(a) {
        this.testProperty = a;
      }
      mockClass.objectConstructor = theConstructor;
      mockClass.properties.objectP.push({
        name:"testProperty",
        objectClassName:"mockClass"
      });
      fireObject = new FireObject(mockClass, ref, mockObjectiveFire);
      var testValue = {
        test: "a_test"
      };
      var obj = fireObject.new(testValue);
      expect(obj.testProperty).toEqual(testValue);
    });

    it('should set properties created in the constructor to be "loaded"', function() {
      theConstructor = function(a) {
        this.testProperty = a;
      }
      mockClass.objectConstructor = theConstructor;
      mockClass.properties.objectP.push({
        name:"testProperty",
        objectClassName:"mockClass"
      });
      fireObject = new FireObject(mockClass, ref, mockObjectiveFire);
      var obj = fireObject.new("test");
      expect(obj._doLoad["testProperty"] && obj._isLoaded["testProperty"]).toEqual(true);
    });

    // REQUIRES INTERFACING WITH FIREBASE - WILL FAIL WITHOUT INTERNET OR WITH VERY SLOW INTERNET

    it('should trigger a "child_added" event in the Firebase', function(done) {
      var ref2 = ref.child("test");
      theConstructor = function(a) {this.a = a};
      mockClass.objectConstructor = theConstructor;
      mockClass.properties.primitive.push({
        name: "a"
      });
      fireObject = new FireObject(mockClass, ref, mockObjectiveFire);
      var obj = fireObject.new("test_value"); // create an object and check if it is added
      var id = obj.$id;
      ref2.on("child_added", function(snap) {
        if (snap.key() === id) {
          done();
        }
      });
    });
  });

  describe('instance', function() {

    // DOES NOT REQUIRE INTERFACING WITH FIREBASE

    it('should exist', function() {
      fireObject = new FireObject(mockClass, ref, mockObjectiveFire);
      expect(typeof fireObject.new).toEqual("function");
    });

    it('should obtain the object from the specified id', function() {
      mockClass.name = "readonly";
      fireObject = new FireObject(mockClass, ref, mockObjectiveFire);
      var id = "obj:1";
      var obj = fireObject.instance(id);
      expect(obj.$id).toEqual(id);
    });

    it('should interpret every parameter past the first to be a property to "load"', function() {
      mockClass.name = "readonly";
      fireObject = new FireObject(mockClass, ref, mockObjectiveFire);
      var id = "obj:1";
      var obj = fireObject.instance(id, "test_prop", "test_prop_2");
      expect(obj._doLoad).toEqual({"test_prop":true,"test_prop_2":true});
    });

  });

});
