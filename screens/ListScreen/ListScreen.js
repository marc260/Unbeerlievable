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
import BeerTable from './BeerTable.js';  

export default class ListScreen extends React.Component {
  
  //member variables
  static navigationOptions = {
    title: 'BeerList',
  };
  Menu = [
    { order: 1, name: "Test", rating: 4},
    { order: 2, name: "Test2", rating: 4.5},
    { order: 3, name: "Abcd", rating: 3},
  ];
  state = {
    table: new BeerTable(this.Menu, (Table) => { this.forceUpdate(); }),
  };
  
  //member functions
  render() {
    return (
      <ScrollView style={styles.container}>
        <View>
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
        </View>
        <ScrollView style={styles.container}>
          {this.state.table.render()}
        </ScrollView>
      </ScrollView>
    );
  }
  
  tableUpdate = function(Table){
    this.setState({table: Table});
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