# ObjectiveFire
ObjectiveFire is a library that allows Firebase to be utilized as an object oriented database.

### Getting Started

#### Include Necessary Files
Make sure that you have AngularJS and Firebase included in your project. ObjectiveFire requires these in order to run. Include ObjectiveFire with either objectivefire.min.js or objectivefire.js which are located in the dist directory.

#### Create an Instance of ObjectiveFire

Make sure that you include ObjectiveFire in your controller. Pass the constructor for ObjectiveFire a reference to your Firebase.
```javascript
angular.module('my-module').controller('MyController', function(ObjectiveFire) {
  var myFirebase = new Firebase("My Firebase URL");
  var myObjFire = new ObjectiveFire(myFirebase);
});
```

#### Create a Class of Objects

Make sure to include ObjectClass, Properties, PrimitiveProperty, ObjectProperty, and ObjectArrayProperty in your controller.
For the example we will make a person class and a dog class.

###### Define the Properties of the Class
For our purposes: a person has a first name, last name, favorite dog, and list of dogs owned and a dog has a name and a color.
The person's first name and last name would both be of the type string whereas the favorite dog will be an object. The list of dogs would be a list of objects. The dog's name and color would both be of the type string. Strings are primitive data type.
```javascript
var personProperties = new Properties(); // This creates a list of properties that each person will have
var firstName = new PrimitiveProperty("firstName"); // This creates the first name property
var lastName = new PrimitiveProperty("lastName"); // This creates the last name property
// This creates the favoriteDog property. The second argument "dog" tells ObjectiveFire that this property will be of the "dog" class
var favoriteDog = new ObjectProperty("favoriteDog", "dog");
// This creates the myDogs list. The second argument "dog" tells ObjectiveFire that each item in the list will of the "dog" class
var myDogs = new ObjectArrayProperty("myDogs", "dog");
personProperties.addProperty(firstName).addProperty(lastName).addProperty(favoriteDog).addProperty(myDogs); // This adds all the properties to the personProperties Properties object
```
###### Create the Constructor for the Class
Now once all the properties have been defined we create the actual person class. First we must define the constructor for a person.
```javascript
var personConstructor = function(firstName, lastName) {
  this.firstName = firstName; // This constructor will create a person with the given first and last name
  this.lastName = lastName;
}
```

###### Create methods for the Class
These will be methods available on all instances of the class
```javascript
var personMethods = {
  fullName: function() {
    return this.firstName + " " + this.lastName;
  }
}
```

###### Create the Actual Class
```javascript
// Here we define the person class. The "person" argument tells ObjectiveFire to refer to this class as "person" from now on
// The personProperties tell ObjectiveFire that all the properties we defined in the last step exist on this class
// The two null arguments are placeholders for a constructor or methods that the class has - these are a more advanced feature and will be covered
// later in the getting started guide
var personClass = new ObjectClass("person", personConstructor, personMethods, personProperties);
```
* The dog class would be created in a similar fashion to the person - for those that want to see it, here it is:
```javascript
var dogProperties = new Properties();
var name = new PrimitiveProperty("name");
var color = new PrimitiveProperty("color");
dogProperties.addProperty(name).addProperty(color);
var dogClass = new ObjectClass("dog", function(name, color) {
  this.name = name;
  this.color = color;
}, {
  describe: function() {
    return "I am a " + color + " dog named " + name;
  }
}, dogProperties);
```

#### Register the ObjectClasses with ObjectiveFire

Now with your instance of ObjectiveFire (which will be refered to as myObjFire from now on) you must register the created classes.
```javascript
myObjFire.registerFromObjectClass(personClass);
myObjFire.registerFromObjectClass(dogClass);
```

#### Create some new objects or objects from the Firebase

Now that the classes have been registered with ObjectiveFire, you may create instances of them.

###### Obtain the class from ObjectiveFire
You first must obtain the class registered in ObjectiveFire. Do not use the ObjectClass that you created in the previous steps.
```javascript
var person = myObjFire.getByName("person");
```

###### Create a new person
```javascript
var me = person.new("insert_first_name_here", "insert_last_name_here");
```

###### Obtain a previously created person
NObjectiveFire stores all objects of a class under a node of the name of the class i.e. if you have a class named "person", then at the node "person" all of the persons will be stored.
```javascript
var myPerson = person.instance("id_in_firebase"); // Pass the instance method on person the id of the person in the Firebase
```




## Development
Source code is contained in the src directory. The built code is in the build directory. Documentaiton is in the docs directory.

To utilize all the development features you'll need to install the npm and bower dependencies. This would be done by executing the following in the project directory:
```terminal
npm install
```
```terminal
bower install
```

ObjectiveFire uses Grunt as a task runner. Multiple Grunt tasks are configured.

1. Runs Unit Tests then watches for changes in source files and re-runs the Unit Tests whenever it changes
```terminal
grunt test
```
2. Produces documentation for the project based on the comments
```terminal
grunt doc
```
3. Creates minified (production) versions of the code
```terminal
grunt compile
```
4. Runs the Unit Tests, then produces documentaiton and production version of the code
```terminal
grunt build
```

By default grunt will run 'build'

NOTE IN ORDER TO RUN PROTRACTOR E2E TESTS THE WEBDRIVER SERVER MUST MANUALLY BE STARTED
