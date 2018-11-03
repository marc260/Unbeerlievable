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
import { createStackNavigator, StackActions, NavigationActions } from 'react-navigation';


export default class ListScreen extends React.Component {
  static navigationOptions = {
    title: 'BeerList',
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <Button
          title="Return to Home"
          onPress={() => {
            this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({ routeName: 'Home' })
              ],
            }))
          }}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});

module.exports = ListScreen;