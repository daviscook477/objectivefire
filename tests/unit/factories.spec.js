describe('Objects created by Factories', function() {

  // ALL OF THESE TESTS REQUIRE FIREBASE TO RUN - THEY ARE BASICALLY INTEGRATION TESTS

  var FireObject, ObjectiveFire, ObjectClass, myObjFire, Properties, $timeout, ref;
  var timer = function() {
    setInterval(function() {
      try {$timeout.flush();}catch(err){}

      timer();
    }, 50);
  };
  timer();

  describe('Storage Tests', function() {
    beforeEach(function() {
      module('objective-fire');
      inject(function (_FireObject_, _ObjectiveFire_, _ObjectClass_, _Properties_, _$timeout_) {
        FireObject = _FireObject_;
        ObjectiveFire = _ObjectiveFire_;
        ObjectClass = _ObjectClass_;
        Properties = _Properties_;
        $timeout = _$timeout_;
      });
      ref = new Firebase("https://objective-fire.firebaseio.com/")
      myObjFire = new ObjectiveFire(ref);
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
            return this.messages.$add(msg);
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
      /*myObjFire.registerFromObjectClass(new ObjectClass("message",
        function(text, author) {
          this.text = text;
          this.author = author;
        }, null, new Properties().addPrimitiveProperty("text").addObjectProperty("author", "user")
      ));*/
      myObjFire.registerFromObject({
        name: "message",
        objectConstructor: function(text, author) {
          this.text = text;
          this.author = author;
        },
        properties: {
          primitive: [{name: "text"}],
          objectP: [{name: "author", objectClassName: "user"}]
        }
      });
    });

    it('should store primitive data in the firebase', function(done) {
      var user = myObjFire.getByName("user");
      var me = user.new("Davis");
      var ref2 = ref.child("user").child(me.$id);
      ref2.on("value", function(snapshot) {
        expect(snapshot.val()).toEqual({name: "Davis"});
        done();
      });
    });

    it('should store object references in the firebase', function(done) {
      var user = myObjFire.getByName("user");
      var me = user.new("Davis");
      var message = myObjFire.getByName("message");
      var msg = message.new("This is a message", me);
      var ref2 = ref.child("message").child(msg.$id);
      ref2.on("value", function(snapshot) {
        expect(snapshot.val()).toEqual({text: "This is a message", author: me.$id});
        done();
      });
    });

    it('should store array references in the firebase', function(done) {
      var user = myObjFire.getByName("user");
      var me = user.new("Davis");
      me.$load("messages");
      var message = myObjFire.getByName("message");
      var msg = message.new("This is a message", me);
      me.addMessage(msg).then(function() {
        var ref2 = ref.child("user").child(me.$id).child("messages");
        ref2.on("value", function(snapshot) {
          var data = snapshot.val();
          var same = false;
          for (var param in data) {
            if (data[param] === msg.$id) {
              same = true;
            }
          }
          expect(same).toEqual(true);
          done();
        });
      });
    });
  });

  describe('Retrieval Tests', function() {
    beforeEach(function() {
      module('objective-fire');
      inject(function (_FireObject_, _ObjectiveFire_, _ObjectClass_, _Properties_, _$timeout_) {
        FireObject = _FireObject_;
        ObjectiveFire = _ObjectiveFire_;
        ObjectClass = _ObjectClass_;
        Properties = _Properties_;
        $timeout = _$timeout_;
      });
      ref = new Firebase("https://objective-fire.firebaseio.com/")
      myObjFire = new ObjectiveFire(ref);
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
            return this.messages.$add(msg);
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
      /*myObjFire.registerFromObjectClass(new ObjectClass("message",
        function(text, author) {
          this.text = text;
          this.author = author;
        }, null, new Properties().addPrimitiveProperty("text").addObjectProperty("author", "user")
      ));*/
      myObjFire.registerFromObject({
        name: "message",
        objectConstructor: function(text, author) {
          this.text = text;
          this.author = author;
        },
        properties: {
          primitive: [{name: "text"}],
          objectP: [{name: "author", objectClassName: "user"}]
        }
      });
    });
  });

  it('should retrieve primitive properties from the firebase', function(done) {
    var message = myObjFire.getByName("message");
    var msg = message.instance("msg:1");
    msg.$loaded().then(function() {
      expect(msg.text).toEqual("Test message");
      done();
    });
  });

  describe('Retrieval of object properties from the firebase', function() {
    it('should first retrieve the object properties as the pointers not the objects', function(done) {
      var message = myObjFire.getByName("message");
      var msg = message.instance("msg:1");
      msg.$loaded().then(function() {
        expect(msg.author).toEqual("user:1");
        done();
      });
    });
    it('should retrieve the object properties as objects once told to load them', function(done) {
      var message = myObjFire.getByName("message");
      var msg = message.instance("msg:1");
      msg.$load("author").then(function() {
        msg.author.$loaded().then(function() {
          var testObj = {name: msg.author.name, messages: msg.author.messages};
          expect(testObj).toEqual({name: "TestName", messages: ['msg:1']});
          done();
        });
      });
    });
  });

  describe('Retrieval of object array properties from the firebase', function() {
    it('should first retrieve the object array properties as the pointers not the objects', function(done) {
      var user = myObjFire.getByName("user");
      var me = user.instance("user:1");
      me.$loaded().then(function() {
        expect(me.messages).toEqual(['msg:1']);
        done();
      });
    });
    it('should retrieve the object array properties as objects once told to load them', function(done) {
      var user = myObjFire.getByName("user");
      var me = user.instance("user:1");
      me.$load("messages").then(function() {
        me.messages.$loaded().then(function() {
          expect(me.messages[0].$id).toEqual("0");
          done();
        });
      });
    });
  });

});
