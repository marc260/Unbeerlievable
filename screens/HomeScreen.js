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
} from 'react-native';
import { ImagePicker, Permissions } from 'expo';
import { createStackNavigator, StackActions, NavigationActions } from 'react-navigation';



import LINK_WITH_API_KEY from '../resources/link';
import ListScreen from '../screens/ListScreen.js';

class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    image: null,
  };


  render() {
    let { image } = this.state;
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.welcomeContainer}>
            <Image
              source={
                __DEV__
                  ? require('../assets/images/logo.png')//our logo
                  : require('../assets/images/robot-prod.png')
              }
              style={styles.welcomeImage}
            />
          </View>
          <View style={styles.getStartedContainer}>
            <View style={styles.buttonContainer}>
              <Button
                title="Pick an image from Gallery"
                onPress={this._pickImage}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="Pick an image from Camera Roll"
                onPress={this._pickImageFromCamera}
              />
            </View>    
            <View style={styles.buttonContainer}>
              <Button
                title="Request OCR from URL"
                onPress={this._gotoListScreen}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="Beer List"
                onPress={this._gotoListScreen}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="DB"
                onPress={this._requestDB}
              />
            </View>
            {image && <Image source={{ uri: image }} style={{ width: 300, height: 300 }} />}
            {this.state.Description?(<Text> 
            {this.state.Description} </Text>):(null)}
          </View>
        </ScrollView>
      </View>
    );
  }
  
  _gotoListScreen = async () => {
    console.log(ListScreen);
    this.props.navigation.dispatch(StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: 'BeerList' })
      ],
    }));
  };
  
  _pickImage = async () => {
    //check if permission was already granted
    const permission = await Permissions.getAsync(Permissions.CAMERA_ROLL);
    if (permission.status !== 'granted') {
      //alert('Hey! You heve not enabled selected permissions'); 
      const newPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (newPermission.status !== 'granted') {
          alert('Hey! You heve not enabled selected permissions');
        }
    }
    else{ //all granted
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        base64: true,
      });
      console.log(result);
  
      if (!result.cancelled) {
        this.setState({
          image: result.uri,
        });
        
        let body = {
          "requests": [
            {
              "image": {
                "content": result.base64,
              },
              "features": [
                {
                  "type": "TEXT_DETECTION"
                  //,"maxResults":5
                }
              ]
            }
          ]
        }

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
        console.log(actualDescription[0]);
        var search = actualDescription[0];
        search = search.replace(/\n|\r/g, "");
        const res = await fetch('https://l97xhx8swh.execute-api.us-east-1.amazonaws.com/prod/helloworld', {
          method: 'GET',
          headers: {
            'key1': search,
            'x-api-key': LINK_WITH_API_KEY.api_aws,
          },
        });
        console.log(res);
        const test = await res.json();
        console.log(test);
        this.setState({
          Description: test,
        });
      }
    }
  };

  _pickImageFromCamera = async () => {

    //check if permission was already granted
    const permission = await Permissions.getAsync(Permissions.CAMERA);
    if (permission.status !== 'granted') {
      //alert('Hey! You heve not enabled selected permissions'); 
      const newPermission = await Permissions.askAsync(Permissions.CAMERA);
        if (newPermission.status !== 'granted') {
          alert('Hey! You heve not enabled selected permissions');
        }
    }
    else {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        base64: true,
      });
  
      console.log(result);
  
      if (!result.cancelled) {
        this.setState({ image: result.uri });
  
        let body = {
          "requests": [
            {
              "image": {
                "content": result.base64,
              },
              "features": [
                {
                  "type": "TEXT_DETECTION"
                }
              ]
            }
          ]
        }
        
        //Request from Google Vision API
        const response = await fetch(LINK_WITH_API_KEY.link, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        const parsed = await response.json();
       
        //Parse response
        var actualDescription = [];
        for (let i = 0; i < parsed.responses[0].textAnnotations.length; i++) {
          if (parsed.responses[0].textAnnotations[i].description)
          actualDescription.push(parsed.responses[0].textAnnotations[i].description);
        }
        //Only the first will be the full response text description
        this.setState({
          Description: actualDescription[0],
        });
        console.log(actualDescription[0]);
      }
    }
  };

  _getOCRFromApi = async () => {//for separate OCR testing
    const body = {
      requests:[
        {
          image: {
            source: {
              imageUri: "https://i.imgur.com/IuYOb09.jpg" //image URL
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
  console.log(actualDescription[0]);

  };

  _requestDB = async () =>{
    const res = await fetch('https://l97xhx8swh.execute-api.us-east-1.amazonaws.com/prod/helloworld', {
      method: 'GET',
      headers: {
        'key1': 'Stout',
        'x-api-key': 'ZMoSqqhCP45ar7425Wqyy4B7p9NCMTBr1wSzUnu9',
      },
    });
    console.log(res);
    const test = await res.json();
    console.log(test);
    this.setState({
      Description: test,
    });
  };
}

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



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
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
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
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
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
