import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
} from 'react-native';
import { WebBrowser, ImagePicker, Permissions } from 'expo';
import axios from 'axios';

import { MonoText } from '../components/StyledText';
//import LINK_WITH_API_KEY from '/resources/link'


export default class HomeScreen extends React.Component {
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
                title="Pick an image from Galery"
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
                title="Permission"
                onPress={this._checkMultiPermissions}
              />
            </View>
            {image && <Image source={{ uri: image }} style={{ width: 400, height: 400 }} />}
            <View style={styles.buttonContainer}>
              <Button
                title="Request OCR"
                onPress={this._getOCRFromApi}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  _pickImage = async () => {
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
              }
            ]
          }
        ]
      }

      axios.post('https://vision.googleapis.com/v1/images:annotate?key=API_KEY', body)
      .then(res => {
          console.log(res);
          console.log(res.data);
      })
      

    }
  };

  _pickImageFromCamera = async () => {
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

      axios.post('https://vision.googleapis.com/v1/images:annotate?key=API_KEY', body)
      .then(res => {
          console.log(res);
          console.log(res.data);
      })

    }
  };

  _checkMultiPermissions = async () => {
    //check if permission was already granted
    const permission = await Permissions.getAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
    if (permission.status !== 'granted') {
      alert('Hey! You heve not enabled selected permissions');
      const newPermission = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
        if (newPermission.status !== 'granted') {
          alert('Hey! You heve not enabled selected permissions');
        }
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
  };

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };

  _getOCRFromApi = async () => {//for separate OCR testing
    let body = {
      "requests": [
        {
          "image": {
            "source": {
              "imageUri": "https://i.imgur.com/Nlot5mR.jpg" //image URL
            }
          },
          "features": [
            {
              "type": "TEXT_DETECTION"
            }
          ]
        }
      ]
    }

    /*not working:
    let response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    */
   
    axios.post('https://vision.googleapis.com/v1/images:annotate?key=API-KEY', body)
      .then(res => {
          console.log(res);
          console.log(res.data);
      })
  };
}

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
