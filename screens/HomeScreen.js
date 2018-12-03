import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  TouchableOpacity,
} from 'react-native';
import { createStackNavigator, StackActions, NavigationActions } from 'react-navigation';
import LINK_WITH_API_KEY from '../resources/link';
import ListScreen from './ListScreen/ListScreen.js';
import MenuManager from './ListScreen/MenuManager.js';
import CameraUploadButton from '../components/CameraUploadButton.js';
import GalleryUploadButton from '../components/GalleryUploadButton.js';

class HomeScreen extends React.Component {
  //Settings for header
  static navigationOptions = {
    title: 'Unbeerlievable',
    headerBackground: (
      <Image
        style={StyleSheet.absoluteFill}
        source={{ uri: 'https://assets.simpleviewcms.com/simpleview/image/fetch/q_75/https://res.cloudinary.com/simpleview/image/upload/crm/denver/23978_20090729_23978_DenverMircrobrewTour_ff0fca09-ee1e-51ac-30131aa5f4a7265f.jpg' }}
      />
    ),
    headerTitleStyle: { color: '#fff' },
  };
  
  constructor(props){
    super(props);
    this.state ={
      TextInputValue:'',
      image: null,
    }
  }
 
  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <GalleryUploadButton/>
        <CameraUploadButton/>
        <View style={styles.buttonContainer}>
              <TextInput 
                style={styles.holderStyle}
                placeholder="Enter the URL"
                onChangeText={TextInputValue => this.setState({TextInputValue})}
              />
              <Button
                style={styles.buttonHolder}
                title="Upload from URL"
                onPress={this._getOCRFromURL}
              />
        </View>
          <View style={styles.getStartedContainer}>
            <View style={styles.buttonContainer}>
              <Button
                title="Go to Beer List"
                onPress={this._gotoListScreen}
              />
            </View>          
          </View>
        </ScrollView>
      </View>
    );
  }
  
  //Invokes rerouting to ListScreen if not empty
  _gotoListScreen = async () => {
    //If Beerlist is not empty or has only been initialized but not populated do not open ListScreen
    if(MenuManager.isEmpty() || MenuManager.isNull()){
      alert("Either you haven't scanned any menus yet, or the menu you scanned is still loading!");
    }
    //Else, open ListScreen
    else{
      this.props.navigation.dispatch(StackActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({ routeName: 'BeerList' })
        ],
      }));
    }
  };

  _getOCRFromURL = async () => {
    try {
      const{TextInputValue} =this.state

      //Body of Google Vision (OCR) API request
      const body = {
        requests:[
          {
            image: {
              source: {
                imageUri: TextInputValue //image URL
              }
            },
            features:[
              {
                type: 'TEXT_DETECTION',
                maxResults: 1,
              }
            ]
          },
        ],
      };
      
      //Fetch response from Google Vision API
      const response = await fetch(LINK_WITH_API_KEY.link, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      //Response parsing procedure
      const parsed = await response.json();
      var actualDescription = [];
      for (let i = 0; i < parsed.responses[0].textAnnotations.length; i++) {
        if (parsed.responses[0].textAnnotations[i].description)
        actualDescription.push(parsed.responses[0].textAnnotations[i].description);
      }
      var googleVisionResult = actualDescription[0];

      //separates lines from google API result
      var lines = googleVisionResult.split("\n");
      lines.pop();//removes \n (last line that comes with the google vision result)

      MenuManager.push([]);//Initialize Beerlist
      let num = 0;
      
      //loop through each line and send a get request to API gateway
      for (let index = 0; index < lines.length; index++) {

        //dont query if there are any $ in the beginning of the word (prices)
        if (lines[index] != undefined && lines[index] != null && lines[index].toString().charAt(0) != '$' && lines[index].toString().toUpperCase() != "BEER" && lines[index].toString().toUpperCase() != "BEERS" && lines[index].toString().toUpperCase() != "BOTTLED BEER" && lines[index].toString().toUpperCase() != "BOTTLED BEERS" && lines[index].toString().toUpperCase() != "DRAFT BEER" && lines[index].toString().toUpperCase() != "DRAFT BEERS") { 
          //Fetch response from AWS API gateway
          const res = await fetch('https://l97xhx8swh.execute-api.us-east-1.amazonaws.com/prod/helloworld', {
            method: 'GET',
            headers: {
              'key1': lines[index],
              'x-api-key': LINK_WITH_API_KEY.api_aws,
            },
          });
          const dbResult = await res.json();

          if (dbResult == null) {//if true there where no matches
            //alert("The database returned no matches!");
          } else{//match found
            //Push query result to Beerlist
            MenuManager.getLastMenu().push({order: ++num});
            for (const [key, value] of Object.entries(dbResult)) {
              MenuManager.getLastMenuEntry()[key] = value;
            }
          }
        } 
      }
      if (MenuManager.isNull()) {
        alert("The database returned no matches!");
      }
      else
        alert("Your list is ready!");
    } catch (error) {
      alert("An error has occurred, are you sure you typed correctly?");
    }
    
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  contentContainer: {
    paddingTop: 0,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginHorizontal:10,
    flex:1,
  },
  welcomeImage: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    marginTop: 10,
    marginLeft: -10,
    alignItems:'center',
  },
  buttonContainer: {
    margin: 10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
    flex: 1,
    justifyContent: 'center',
  },
  holderStyle:{
    height:55,
    backgroundColor :'white',
    elevation:3,
    paddingHorizontal:15,
    flexDirection:'row',
    alignItems:'center',

  },
navItem: {
  marginTop:20,
}
});

// Takes route configuration object and an options object and returns a React component
// Config: 2 routes home and list screens
// options: initial route home
// Returns: the React component to route to
export default createStackNavigator({
  Home: {
    screen: HomeScreen,
  },
  BeerList: {
    screen: ListScreen,
  },
}, {
    initialRouteName: 'Home',
});