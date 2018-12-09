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
      {/*Clickable image and text*/}
        <TouchableOpacity style={styles.welcomeContainer} onPress={this._pickImageFromCamera}>
          <Icon
            style={styles.navItem}
            name="local-see" size={65}
          />
          <Text>
            Upload from camera
          </Text>      
        </TouchableOpacity>
      </View>
    );
  }
  _pickImageFromCamera = async () => {

    console.log("Camera");
  
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
      //Obtain image
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [4, 3],
        base64: true,
      });
      
      //If the user has not canceled the selection
      if (!result.cancelled) {
        //this.setState({ image: result.uri });
        
        //Body of Google Vision (OCR) API request
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
          var num = 0;
          
          console.log("Google Vision returned:\n"+googleVisionResult);
          
          //loop through each line and send a get request to API gateway
          for (let index = 0; index < lines.length; index++) {
            //dont query if there are any $ in the beginning of the word (prices)
            if (lines[index] != undefined && lines[index] != null && lines[index].toString().charAt(0) != '$' && lines[index].toString().toUpperCase() != "BEER" && lines[index].toString().toUpperCase() != "BEERS" && lines[index].toString().toUpperCase() != "BOTTLED BEER" && lines[index].toString().toUpperCase() != "BOTTLED BEERS" && lines[index].toString().toUpperCase() != "DRAFT BEER" && lines[index].toString().toUpperCase() != "DRAFT BEERS") { 
              const res = await fetch('https://l97xhx8swh.execute-api.us-east-1.amazonaws.com/prod/helloworld', {
                method: 'GET',
                headers: {
                  'key1': lines[index],
                  'x-api-key': LINK_WITH_API_KEY.api_aws,
                },
              });
              const dbResult = await res.json();

              //console.log("Database returned:\n"+JSON.stringify(dbResult));
              
              if (dbResult == null) {//if true there where no matches
                //alert("The database returned no matches!");
              } else{//match found
                //Push query result to Beerlist
                MenuManager.getLastMenu().push({order: ++num});//index+1
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