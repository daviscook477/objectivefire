describe('test', function() {

  var ObjectiveFire, ObjectClass, Properties, $timeout, PrimitiveProperty, ObjectProperty, ObjectArrayProperty;
  var objFire;


  beforeEach(function () {
    module('objective-fire');
    inject(function (_ObjectiveFire_, _ObjectClass_, _Properties_, _$timeout_, _PrimitiveProperty_, _ObjectProperty_, _ObjectArrayProperty_) {
      ObjectiveFire = _ObjectiveFire_;
      ObjectClass = _ObjectClass_;
      Properties = _Properties_;
      $timeout = _$timeout_;
      PrimitiveProperty = _PrimitiveProperty_; ObjectProperty = _ObjectProperty_; ObjectArrayProperty = _ObjectArrayProperty_;
    });
    var dogConstructor = function(name, color) {
    this.name = name;
    this.color = color;
  };
  var dogMethods = {
    description: function() {return this.name + " is " + this.color;}
  };
  dogProperties = new Properties();
  var name = new PrimitiveProperty("name");
  var color = new PrimitiveProperty("color");
  dogProperties.addProperty(name).addProperty(color);
  var dogClass = new ObjectClass("dog", dogConstructor, dogMethods, dogProperties);

  var userConstructor = function(first, last) {
    this.first = first;
    this.last = last;
  };
  var userMethods = {
    fullName: function() {return this.first + " " + this.last;}
  };
  var userProperties = new Properties();
  var firstName = new PrimitiveProperty("first");
  var lastName = new PrimitiveProperty("last");
  var dog = new ObjectProperty("dog", "dog");
  var dog2 = new ObjectProperty("dog2", "dog");
  userProperties.addProperty(firstName).addProperty(lastName).addProperty(dog).addProperty(dog2);
  var userClass = new ObjectClass("user", userConstructor, userMethods, userProperties);

  objFire = new ObjectiveFire(new Firebase("https://objective-fire.firebaseio.com"));
  objFire.registerObjectClass(userClass);
  objFire.registerObjectClass(dogClass);
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  it("will obtain data from the firebase", function(done) {
    var user = objFire.getObjectClass("user");
    var myUser = user.instance("user:1");
    function setTimeout1() {
      setTimeout(function() {
	$timeout.flush();
        setTimeout1();
      }, 1000);
    }
    setTimeout1();
myUser.$load("dog2");
    myUser.$loaded().then(function() {
    expect(myUser.first).toEqual("Davis")
    expect(myUser.last).toEqual("Cook")
    expect(typeof myUser.dog2).toBe("object");
    expect(typeof myUser.dog).not.toBe("object");
      done()
    });
  });

})
