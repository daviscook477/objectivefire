# ObjectiveFire
ObjectiveFire is a library that allows Firebase to be utilized as an object oriented database.

### Getting Started

#### Include Necessary Files
Make sure that you have AngularJS and Firebase included in your project. ObjectiveFire requires these in order to run. Include ObjectiveFire with either objectivefire.min.js or objectivefire.js which are located in the dist directory.

#### Create an instance of the ObjectiveFire class

Make sure that you include ObjectiveFire in your AngularJS dependencies. Pass the constructor for ObjectiveFire a reference to your Firebase.
```javascript
var myFirebase = new Firebase("My Firebase URL");
var myObjFire = new ObjectiveFire(myFirebase);
```

#### Create a class of objects.

Make sure to include ObjectClass, Properties, PrimitiveProperty, ObjectProperty, and ObjectArrayProperty in your AngularJS dependencies. For this guide we will be making two classes - a dog class and a person class.

###### Define the properties of the class

The person class will have four different properties. These properties are the data that will be stored in the Firebase for the person. These properties are first name, last name, favorite dog, and list of dogs. The first name and last name will be stored as raw data in the Firebase. The favorite dog will be stored as a dog object. The list of dogs will be stored as an array of dog objects.

When a property is stored as raw data it will be made as a PrimitiveProperty. When an object is stored as an object it will be made as an ObjectProperty. When an object is stored as an array of objects will be made as an ObjectArrayProperty.
```javascript
var personProperties = new Properties();
var firstName = new PrimitiveProperty("firstName");
var lastName = new PrimitiveProperty("lastName");
var favoriteDog = new ObjectProperty("favoriteDog", "dog");
var myDogs = new ObjectArrayProperty("myDogs", "dog");
personProperties.addProperty(firstName);
personProperties.addProperty(lastName);
personProperties.addProperty(favoriteDog);
personProperties.addProperty(myDogs);
```
###### Define the constructor of the class

The person constructor will be invoked whenever a new person is created. This constructor sets the perons's firstName and lastName to be equal to the passed parameters.
```javascript
var personConstructor = function(firstName, lastName) {
  this.firstName = firstName;
  this.lastName = lastName;
}
```

###### Create the methods of the class

The person methods will included on each object of the person class. This example method of fullName just provides a concatenation of the person's firstName and lastName.
```javascript
var personMethods = {
  fullName: function() {
    return this.firstName + " " + this.lastName;
  }
};
```

###### Create the class itself as an ObjectClass

The ObjectClass is a compilation of the class's properties, methods, and constructor. The ObjectClass is also given a name by which it will be referred.
```javascript
var personClass = new ObjectClass("person", personConstructor, personMethods, personProperties);
```

###### The creation of the Dog class

The dog class will have two different properties. These properties are name and color. The name and color will be stored as raw data in the Firebase.
```javascript
var dogProperties = new Properties();
var name = new PrimitiveProperty("name");
var color = new PrimitiveProperty("color");
dogProperties.addProperty(name);
dogProperties.addProperty(color);
var dogConstructor = function(name, color) {
  this.name = name;
  this.color = color;
};
var dogMethods = {
  describe: function() {
    return "I am a " + color + " dog named " + name;
  }
};
var dogClass = new ObjectClass("dog", dogConstructor, dogMethods, dogProperties);
```

#### Register the ObjectClass with your ObjectiveFire

Now with your instance of ObjectiveFire  you must register the created classes.
```javascript
myObjFire.registerFromObjectClass(personClass);
myObjFire.registerFromObjectClass(dogClass);
```

#### Create some new instances of the classes or existing instances of the classes from the Firebase

###### Obtain the class from ObjectiveFire

You first must obtain the class registered in ObjectiveFire. Do not use the ObjectClass that you created in the previous steps.
```javascript
var person = myObjFire.getByName("person");
```

###### Create a new person

Creating a new person object will create a new object in the Firebase.
```javascript
var me = person.new("insert_first_name_here", "insert_last_name_here");
```

###### Obtain a existing person from the Firebase

Obtaining a person from the Firebase will retrieve the object that already exists. Objects are referenced to by an id. This id is the node at which the person resides. 
```javascript
var myPerson = person.instance("id_in_firebase");
```
