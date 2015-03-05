describe('Objects created by Factories', function() {

  // ALL OF THESE TESTS REQUIRE FIREBASE TO RUN - THEY ARE BASICALLY INTEGRATION TESTS

  var FireObject, ObjectiveFire, ObjectClass, myObjFire, $timeout, Properties;
  inject(function(_$timeout_) {
    $timeout = _$timeout_;
  });
  var timer = function() {
    setInterval(function() {
      try {$timeout.flush();}catch(err){}

      timer();
    }, 100);
  };
  timer();

  beforeEach(function() {
    module('objective-fire');
    inject(function (_FireObject_, _ObjectiveFire_, _ObjectClass_, _Properties_) {
      FireObject = _FireObject_;
      ObjectiveFire = _ObjectiveFire_;
      ObjectClass = _ObjectClass_;
      Properties = _Properties_;
    });
    myObjFire = new ObjectiveFire(new Firebase("https://objective-fire.firebaseio.com/"));
    myObjFire.registerFromObject({
      name: "group",
      objectConstructor: function(name, adminUser) {
        this.name = name;
        this.admin = adminUser;
      },
      objectMethods: {
        addUser: function(user) {
          this.users.$add(user);
        },
        postMessage: function(msg) {
          this.messages.$add(msg);
        }
      },
      properties: {
        primitive: [{name: "name"}],
        objectP: [{name: "admin", objectClassName: "user"}],
        arrayP: [{name: "users", objectClassName: "user"},
        {name: "messages", objectClassName: "message"}]
      }
    });
    myObjFire.registerFromObjectClass(new ObjectClass("user",
      function(name) {
        this.name=name;
      }, {
        addMessage: function(msg) {
          this.messages.$add(msg);
        }
      }, new Properties().addPrimitiveProperty("name").addObjectArrayProperty("messages", "message")));
    /*myObjFire.registerFromObject({ // ISSUE!!! registerFromObject doesn't store stuff in the firebase!!!
      name: "user",
      objectConstructor: function(name) {
        this.name = name;
      },
      properties: {
        primitive: [{name: "name"}]
      }
    });*/
    myObjFire.registerFromObjectClass(new ObjectClass("message",
      function(text, author) {
        this.text = text;
        this.author = author;
      }, null, new Properties().addPrimitiveProperty("text").addObjectProperty("author", "user")
    ));
    /*myObjFire.registerFromObject({
      name: "message",
      objectConstructor: function(text, author) {
        this.text = text;
        this.author = author;
      },
      properties: {
        primitive: [{name: "text"}],
        objectP: [{name: "author", objectClassName: "user"}]
      }
    });*/
  });

  // IDEA!! There should be an array factory created for each object type and they can be obtained from the ObjectiveFire

  it('should work', function(done) {
    var user = myObjFire.getByName("user");
    var me = user.new("Davis");
    var msg = myObjFire.getByName("message");
    var myMSG = msg.new("test msg", me);
    me.$load("messages");
    me.addMessage(myMSG);
    console.log(me);
  });

  it('does stuff', function(done) {
    var user = myObjFire.getByName("user");
    var me = user.new("Davis");
  });

});
