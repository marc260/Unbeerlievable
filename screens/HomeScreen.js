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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ImagePicker, Permissions } from 'expo';
import { createStackNavigator, StackActions, NavigationActions } from 'react-navigation';
import LINK_WITH_API_KEY from '../resources/link';
import ListScreen from './ListScreen/ListScreen.js';
import MenuManager from './ListScreen/MenuManager.js';
import CameraUploadButton from '../components/CameraUploadButton.js';
import GalleryUploadButton from '../components/GalleryUploadButton.js';

import Hyperlink from 'react-native-hyperlink';

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Unbeerlievable',
    headerBackground: (
      <Image
        style={StyleSheet.absoluteFill}
        source={{ uri: 'https://assets.simpleviewcms.com/simpleview/image/fetch/q_75/https://res.cloudinary.com/simpleview/image/upload/crm/denver/23978_20090729_23978_DenverMircrobrewTour_ff0fca09-ee1e-51ac-30131aa5f4a7265f.jpg' }}
      />
    ),
    headerTitleStyle: { color: '#fff' },
    headerMode:'Screen',
    cardStyle:{backgroundColor:'#000000'},
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
  
  _gotoListScreen = async () => {
    if(MenuManager.isEmpty()){
      alert("You haven't scanned any menus yet!");
    }
    else{
      this.props.navigation.dispatch(StackActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({ routeName: 'BeerList' })
        ],
      }));
    }
  };

  _getOCRFromURL = async () => {//for separate OCR testing
    const{TextInputValue} =this.state
    console.log(TextInputValue); 
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

  const response = await fetch(LINK_WITH_API_KEY.link, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const parsed = await response.json();
  //console.log(parsed);
  var actualDescription = [];
  for (let i = 0; i < parsed.responses[0].textAnnotations.length; i++) {
    if (parsed.responses[0].textAnnotations[i].description)
    actualDescription.push(parsed.responses[0].textAnnotations[i].description);
  }
  this.setState({
    Description: actualDescription[0],
  });
  //console.log(actualDescription[0]);
  console.log(actualDescription[0]);
  var googleVisionResult = actualDescription[0];
  var fullResult = [];

  //separates lines from google API result
  var lines = googleVisionResult.split("\n");
  lines.pop();//removes \n (last line that comes with the google vision result)

  MenuManager.push([]);
  
  //loop through each line and send a get request to API gateway
  for (let index = 0; index < lines.length; index++) {
    console.log('Line ' + index + ' ' + lines[index]);
    if (lines[index].charAt(0) != '$') { //dont query if there are any $ in the begging of the word (prices)
        //search = search.replace(/\n|\r/g, "");
      const res = await fetch('https://l97xhx8swh.execute-api.us-east-1.amazonaws.com/prod/helloworld', {
        method: 'GET',
        headers: {
          'key1': lines[index],
          'x-api-key': LINK_WITH_API_KEY.api_aws,
        },
      });
      //console.log(res);
      const dbResult = await res.json();
      console.log(dbResult);

      if (dbResult == null) {//if true there where no matches
        fullResult.push(lines[index] + " returned with no matches.\n");
      } else{//match found
          //stringfy obj
          MenuManager.getLastMenu().push({order: index+1});
        for (const [key, value] of Object.entries(dbResult)) {
          console.log(`${key}: ${value}`);
          fullResult.push(key + ": " + value + '\n');
          MenuManager.getLastMenuEntry()[key] = value;
        }
        fullResult.push('\n');
      }
    } 
  }
  //console.log(fullResult);
  //present DB result to 
  this.setState({
    DBResult: fullResult,
  });

  };
}

export default createStackNavigator({
  Home: {
    screen: HomeScreen,
    headerMode:'none'
  },
  BeerList: {
    screen: ListScreen,
  },
}, {
    initialRouteName: 'Home'
});



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
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
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  buttonHolder:{
    margin:10,
    position:'absolute',
    bottom:0,
    left:0,
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
