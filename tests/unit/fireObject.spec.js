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
      var obj = fireObject.new();
    })
  });

  describe('instance', function() {
    it('should exist', function() {
      fireObject = new FireObject(mockClass, ref, mockObjectiveFire);
      expect(typeof fireObject.new).toEqual("function");
    });
  });


});
