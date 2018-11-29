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
    table: new BeerTable(MenuManager.getLastMenu(), (Table) => { this.
    forceUpdate(); }),
  };
  
  constructor(props) {
    super(props);
    this.state.newFilterColumn=new this.state.table.Column(this.state.table.columns.rating);
    this.state.filterColumns = [this.state.newFilterColumn];
    for(let c of this.state.table.visibleColumns){
      if(c.label == this.state.newFilterColumn.label) continue;
      this.state.filterColumns[this.state.filterColumns.length] = new this.state.table.Column(c);
      if(c.label == "") this.state.filterColumns[this.state.filterColumns.length-1].label = "Menu Order";
    }
    this.state.newFilterComparison= this.state.table.comparisonType.LESS_THAN;
    this.state.newFilterValue= "";
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
                style={{ height: 50, width: 150 }}
                selectedValue={this.state.newFilterColumn}
                onValueChange={(itemValue, itemIndex) => this.setState({newFilterColumn: itemValue})}>
                 {
                  this.state.filterColumns.map((f, i) => {
                    console.log("F: ",f);
                    return (
                       <Picker.Item key={i} label={f.label} value={f} />
                    );
                  })
                  }
              </Picker>
              <Picker
                style={{ height: 50, width: 150 }}
                selectedValue={this.state.newFilterComparison}
                onValueChange={(itemValue, itemIndex) => this.setState({newFilterComparison: itemValue})}>
                <Picker.Item label="Is less than" value={this.state.table.comparisonType.LESS_THAN} />
                <Picker.Item label="Is less than or equal to" value={this.state.table.comparisonType.LESS_THAN_OR_EQUAL_TO} />
                <Picker.Item label="Is" value={this.state.table.comparisonType.EQUAL_TO} />
                <Picker.Item label="Is greater than or equal to" value={this.state.table.comparisonType.GREATER_THAN_OR_EQUAL_TO} />
                <Picker.Item label="Is greater than" value={this.state.table.comparisonType.GREATER_THAN} />
                <Picker.Item label="Contains" value={this.state.table.comparisonType.CONTAINS} />
                <Picker.Item label="Does not contain" value={this.state.table.comparisonType.DOES_NOT_CONTAIN} />
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
                this.setState(
                  this.state.table.addFilter(new this.state.table.Filter(this.state.newFilterColumn,this.state.newFilterComparison,this.state.newFilterValue))
                );
                
              }}
            />
          </View>
          <ScrollView horizontal={true}>
            {this.state.table.render()}
          </ScrollView>
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