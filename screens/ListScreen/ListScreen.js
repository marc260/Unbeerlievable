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
    title: 'Scanned Beer Menu',
  };
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
    this.state.newFilterColumn=this.state.newFilterColumn.key;
    this.state.newFilterComparison="LESS_THAN";
    this.state.newFilterValue= "";
  };
  
  //member functions
  render() {/* alert(JSON.stringify(MenuManager.getLastMenu())); */
    return (
      <View style={styles.container}>
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
        <View>
          <View borderWidth={1}>
            <Text>
              {"Filters:"}
            </Text>
            <ScrollView maxHeight={85}>
            {
              this.state.table.activeFilters.slice(0).reverse().map((f, i) => {
                return (
                    <ScrollView key={i} flexDirection='row' alignContent='center' horizontal={true}>
                      <Text>
                        {"   "+f.col.label+" "+f.comparison.label+" "+f.value+"   "}
                      </Text>
                      <Button
                        title="X"
                        maxWidth={40}
                        color="#db1c1c"
                        onPress={() => {
                          this.state.table.removeFilterByIndex(i);
                        }}
                      />
                    </ScrollView>
                )
              })
            }
            </ScrollView>
          </View>
          <Text>
            {"Add a new filter:"}
          </Text>
          <ScrollView flexDirection='row' horizontal={true}>
            <View flex={1} flexDirection='column' minHeight={50} minWidth={140}>
              <Picker
                style={ Platform.OS === 'ios' ?
                  {position: 'absolute', height: 50, minWidth: 140, top: -100, } :
                  {height: 50, minWidth: 140}
                }
                pickerTextEllipsisLen={5}
                selectedValue={this.state.newFilterColumn}
                onValueChange={(itemValue, itemIndex) => {this.setState({newFilterColumn: itemValue}); console.log(this.state.newFilterColumn);}}>
                {
                  this.state.filterColumns.map((f, i) => {
                    return (
                       <Picker.Item key={i} label={f.label} value={f.key} />
                    );
                  })
                }
              </Picker>
            </View>
            <View flex={1} flexDirection='column' minHeight={50} minWidth={120}>
              <Picker
                style={ Platform.OS === 'ios' ?
                  {position: 'absolute', height: 50, minWidth: 140, top: -100, } :
                  {height: 50, minWidth: 140}
                }
                pickerTextEllipsisLen={5}
                selectedValue={this.state.newFilterComparison}
                onValueChange={(itemValue, itemIndex) => {this.setState({newFilterComparison: itemValue});console.log(this.state.newFilterComparison);}}>
                <Picker.Item label="< than" value={"LESS_THAN"} />
                <Picker.Item label="< or =" value={"LESS_THAN_OR_EQUAL_TO"} />
                <Picker.Item label="Is" value={"EQUAL_TO"} />
                <Picker.Item label="> or =" value={"GREATER_THAN_OR_EQUAL_TO"} />
                <Picker.Item label="> than" value={"GREATER_THAN"} />
                <Picker.Item label="Contains" value={"CONTAINS"} />
                <Picker.Item label="Does not contain" value={"DOES_NOT_CONTAIN"} />
              </Picker>
            </View>
            <TextInput
              style={{height: 40, minWidth: 40, borderColor: 'gray', borderWidth: 1}}
              onChangeText={(text) => this.setState({newFilterValue: text})}
              value={this.state.newFilterValue}
            />
            <Text>
              {"  "}
            </Text>
            <View flex={0} flexDirection='column' maxHeight={40} maxWidth={50}>
              <Button
                title="+"
                color="#18af20"
                onPress={() => {
                  console.log(this.state.newFilterColumn,this.state.newFilterComparison);
                  console.log(this.state.table.columns[this.state.newFilterColumn],this.state.table.comparisonType[this.state.newFilterComparison]);
                  this.setState(
                    this.state.table.addFilter(new this.state.table.Filter(this.state.table.columns[this.state.newFilterColumn],this.state.table.comparisonType[this.state.newFilterComparison],this.state.newFilterValue))
                  );
                }}
              />
            </View>
          </ScrollView>
        </View>
        <ScrollView style={styles.container}>
          <ScrollView horizontal={true}>
            {this.state.table.render()}
          </ScrollView>
        </ScrollView>
      </View>
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