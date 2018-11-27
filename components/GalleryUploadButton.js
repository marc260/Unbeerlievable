import React from 'react';
import {View, Text, StyleSheet, Button, Platform,TouchableOpacity, Image} from 'react-native';
import { Entypo, FontAwesome } from '@expo/vector-icons';
import { ImagePicker, Permissions } from 'expo';
import LINK_WITH_API_KEY from '../resources/link';
import MenuManager from '../screens/ListScreen/MenuManager.js';
import Icon from 'react-native-vector-icons/MaterialIcons';

class CameraUploadButton extends React.Component{
 
  constructor(props){
    super(props);
  }

  render() {
    return (
      <View style={styles.center}>
        <TouchableOpacity style={styles.welcomeContainer} onPress={this._pickImage}>
          <Image
            style={styles.welcomeImage}
            source={__DEV__
              ? require('../assets/images/logo.png')//our logo
              : require('../assets/images/robot-prod.png')}
              
          />
          <Text>
            Upload from gallery
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  _pickImage = async () => {
    //check if permission was already granted
    const permission = await Permissions.getAsync(Permissions.CAMERA_ROLL);
    if (permission.status !== 'granted') {
      //alert('Hey! You heve not enabled selected permissions'); 
      const newPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (newPermission.status !== 'granted') {
          alert('Hey! You have not enabled selected permissions');
        }
    }
    else {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        base64: true,
      });
  
      if (!result.cancelled) {
        //this.setState({ image: result.uri });
  
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
        try {
            //Parse response
          var actualDescription = [];
          for (let i = 0; i < parsed.responses[0].textAnnotations.length; i++) {
            if (parsed.responses[0].textAnnotations[i].description)
            actualDescription.push(parsed.responses[0].textAnnotations[i].description);
          }
          //Only the first will be the full response text description
          var googleVisionResult = actualDescription[0];

          //separates lines from google API result
          var lines = googleVisionResult.split("\n");
          lines.pop();//removes \n (last line that comes with the google vision result)

          MenuManager.push([]);

          //loop through each line and send a get request to API gateway
          for (let index = 0; index < lines.length; index++) {
            if (lines[index].charAt(0) != '$') { //dont query if there are any $ in the begging of the word (prices)
                //search = search.replace(/\n|\r/g, "");
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
                  //stringfy obj
                MenuManager.getLastMenu().push({order: index+1});
                for (const [key, value] of Object.entries(dbResult)) {
                  MenuManager.getLastMenuEntry()[key] = value;
                }
              }
            } 
          }

          if (MenuManager.isNull()) {
            alert("The database returned no matches!");
          }
        } catch (error) {
          //console.log("NO DATA!");
          alert("No text detected!");
        }
      }
    }
  };
}



const styles = {
  center: { alignItems: 'center'},
  welcomeImage: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    marginTop: 10,
    marginLeft: -10,
    alignItems:'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginHorizontal:10,
    flex:1,
  },
};

export default CameraUploadButton;