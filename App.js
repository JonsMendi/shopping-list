import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, Button } from 'react-native';

const firebase = require('firebase');
require('firebase/firestore');

export default class App extends Component {
  constructor() {
    super();
    this.state ={
      lists: [],
      uid: 0,
      loggedInText: 'Please wait. You are being authenticated'
    }
  
    if (!firebase.apps.length){
      firebase.initializeApp({
      //Under, from 'apiKey' to 'measurementID' are my FireStore database credentials (copied from the website)
      apiKey: "AIzaSyD_m5gX4o0fSgw9X6aZnQm3Pm3S4eZO4yM",
      authDomain: "test-cc7b7.firebaseapp.com",
      projectId: "test-cc7b7",
      storageBucket: "test-cc7b7.appspot.com",
      messagingSenderId: "299991907516",
      appId: "1:299991907516:web:ea0ebc38627e6752eb64b9",
      measurementId: "G-ZNG3RYMBR6"
      });
    }

    this.referenceShoppinglistUser = null;
  };

  componentDidMount() {
    //Under, referenceShoppingLists is going to grab de collection(shoppinglists) in Firebase.
    this.referenceShoppingLists = firebase.firestore().collection('shoppinglists');
    // listen to authentication events
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      }
      //update user state with currently active user data
      this.setState({
        uid: user.uid,
        loggedInText: 'Hello there',
      });

      // create a reference to the active user's documents (shopping lists)
      this.referenceShoppinglistUser = firebase.firestore().collection('shoppinglists').where("uid", "==", this.state.uid);
      // listen for collection changes for current user 
      this.unsubscribeListUser = this.referenceShoppinglistUser.onSnapshot(this.onCollectionUpdate);
    });
  }
  
   componentWillUnmount() {
    // stop listening to authentication
    this.authUnsubscribe();
    // stop listening for changes
    this.unsubscribeListUser();
  }

  onCollectionUpdate = (querySnapshot) => {
    const lists = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      var data = doc.data();
      lists.push({
        name: data.name,
        items: data.items.toString(),
      });
    });
    this.setState({
      lists,
    });
  };

  //Under, addList function created just to simulate through the Button the process for adding another 'list' to the 'collection'.
  addList() {
    this.referenceShoppingLists.add({
      name: 'TestList',
      items: ['eggs', 'pasta', 'veggies'],
      //Under, uid guarantees that the new added shopping list belongs to one individual(id)
      uid: this.state.uid,
    });
  }

  render(){
    return (
      <View style={styles.container}>

        <Text>{this.state.loggedInText}</Text>

        <Text style={styles.text}>Shopping Lists</Text>
        <FlatList
            data={this.state.lists}
            renderItem={({ item }) => 
              <Text style={styles.item}>{item.name}: {item.items}</Text>}
          />

        <Button 
          onPress={() => {
            this.addList();
          }}
          title = "Add something"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,     
  },
  item: {
    fontSize: 20,
    color: 'blue',
  },
  text: {
    fontSize: 30,
  }
});
