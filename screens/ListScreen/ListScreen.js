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
  Picker,
} from 'react-native';

import { createStackNavigator, StackActions, NavigationActions } from 'react-navigation';
import BeerTable from './BeerTable.js';  
import MenuManager from './MenuManager.js'

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
    table: new BeerTable(MenuManager.getLastMenu(), (Table) => { this.forceUpdate(); }),
    newFilterColumn: "Column to filter...",
    newFilterComparison: "Is",
    newFilterValue: "",
  };
  
  
  //member functions
  render() {/* alert(JSON.stringify(MenuManager.getLastMenu())); */
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
          <View>
            <Text>
              {"Filters"}
            </Text>
            <View>
            {/*TODO display list of active filters here...*/}
            </View>
            <View flexDirection='row'>
              <Picker
                style={{ height: 50, width: 100 }}
                selectedValue={this.state.newFilterColumn}
                onValueChange={(itemValue, itemIndex) => this.setState({newFilterColumn: itemValue})}>
                <Picker.Item label={this.state.table.columns.rating.label} value={this.state.table.columns.rating} />
                <Picker.Item label={this.state.table.columns.name.label} value={this.state.table.columns.name} />
              </Picker>
              <Picker
                style={{ height: 50, width: 100 }}
                selectedValue={this.state.newFilterComparison}
                onValueChange={(itemValue, itemIndex) => this.setState({newFilterComparison: itemValue})}>
                <Picker.Item label="Is less than" value={this.state.table.comparisonType.LESS_THAN} />
                <Picker.Item label="Is less than or equal to" value={this.state.table.comparisonType.LESS_THAN_OR_EQUAL_TO} />
                <Picker.Item label="Is" value={this.state.table.comparisonType.EQUAL_TO} />
                <Picker.Item label="Is greater than or equal to" value={this.state.table.comparisonType.GREATER_THAN_OR_EQUAL_TO} />
                <Picker.Item label="Is greater than" value={this.state.table.comparisonType.GREATER_THAN} />
              </Picker>
              <TextInput
                style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                onChangeText={(text) => this.setState({newFilterValue: text})}
                value={this.state.newFilterValue}
              />
            </View>
            <Button
              title="Add new filter"
              onPress={() => {
                this.state.table.addFilter(new this.state.table.Filter(this.state.newFilterColumn,this.state.newFilterComparison,this.state.newFilterValue));
              }}
            />
          </View>
          {this.state.table.render()}
        </ScrollView>
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