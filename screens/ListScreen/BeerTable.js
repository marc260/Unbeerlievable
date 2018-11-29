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
  Animated,
  Alert
} from 'react-native';

import { createStackNavigator, StackActions, NavigationActions } from 'react-navigation';

//enumerated constants
var sortOrder = {
  ASCENDING: 1,
  DESCENDING: -1,
}

//helper classes

class Column {
  //basic constructor for setting values easily
  //copy constructor(column) just clones column
  constructor(key, label, order, width){
    if(label == undefined){
      for(let propt in key){
        this[propt] = key[propt];
      }
    }
    else{
      this.key = key;
      this.label = label;
      this.order = order;
      this.width = width;
    }
  }
}

class Filter {
  constructor(col, comparison, value){
    this.col = col;
    this.comparison = comparison;
    this.value = value;
  }
}

export default class BeerTable extends React.Component {
  constructor(Menu, UpdateCallback){
    super();
    
    this.Filter = Filter;
    this.Column = Column;
    this.menu = Menu; //menu is an array of Beers
    this.updateCallback= UpdateCallback; //this function is called whenever the table is updated
  }
  
  //Member fields
  //object containing all columns known by the table
  columns = {
    order: new Column("order","", sortOrder.ASCENDING,20),
    name: new Column("name","Name",sortOrder.ASCENDING,250),
    rating: new Column("rating","Rating",sortOrder.DESCENDING,100),
    numRatings: new Column("numRatings","Number of Ratings",sortOrder.DESCENDING,300),
    abv: new Column("abv","Alc. by vol.",sortOrder.DESCENDING,200),
    brewery: new Column("brewery","Brewery",sortOrder.ASCENDING,200),
    price: new Column("price","Price",sortOrder.ASCENDING,200)
  };
  //visible columns = columns actually shown, in the order of drawing
  visibleColumns = [this.columns.order, this.columns.name,this.columns.rating, this.columns.abv,this.columns.brewery];
  //sortByColumns = array of columns used for sorting, in order of precedence
  sortByColumns = this.visibleColumns.slice();
  //activeFilters = currently active filters (default none)
  activeFilters = [];
  
  //enumerated constants for comparison funcs used by filters
  comparisonType = {
    LESS_THAN: function(a,b) {return a < b},
    LESS_THAN_OR_EQUAL_TO: function(a,b) {return a <= b},
    EQUAL_TO: function(a,b) {return a == b},
    GREATER_THAN_OR_EQUAL_TO: function(a,b) {return a >= b},
    GREATER_THAN: function(a,b) {return a > b},
    CONTAINS: function(a,b) {return a.toString().includes(b)},
    DOES_NOT_CONTAIN: function(a,b) {return !a.toString().includes(b)},
  }
  
  //Member functions
  
    //Renders the table header, with labels for columns
  renderHeader = function() {
    return (
      <View key='-1' style={{minHeight: 40, maxHeight: 40, borderWidth:0, padding: 0, flex: 5, alignSelf: 'stretch', flexDirection: 'row' }}>
          {
            this.visibleColumns.map( (col, j) => {
                return (
                  <View key={j} style={{borderWidth:2,  minWidth: 40, width:col.width, flex:-1, flexDirection:'row'}}>
                    <Text>
                      {col.label}
                    </Text>
                    <View alignContent='flex-end'>
                      <TouchableOpacity color='#00000000' backgroundColor='#00000000' onPress={() => {this._selectHeader(col)}}>
                        <Animated.Image 
                          style={{minHeight: 24, minWidth: 24, maxHeight:24, maxWidth:24, flex: -1}} source={require("../../assets/images/arrow.png")}
                          /* style={[this.Rotate_Y_AnimatedStyle, styles.imageViewStyle]} */>
                        </Animated.Image>
                      </TouchableOpacity>
                    </View>
                  </View>
                )
            })
          }
      </View>
    );
  }
  
  //Renders one row, with information about one beer
  renderRow = function(beer, i) {
    //apply filters
    for(let f of this.activeFilters){
      if(typeof beer[f.col.key] !== "undefined"){
        //console.log("FILTER:",beer[f.col.key],f.value,f.comparison,f.comparison(beer[f.col.key],f.value));
        if(!f.comparison(beer[f.col.key],f.value)){
          return;
        }
      }
    }
    //render the row
    return (
      <View key={i} style={{minHeight:40, borderWidth:0, padding: 0, flex: 5, alignSelf: 'stretch', flexDirection: 'row' }}>
          {
            this.visibleColumns.map( (col, j) => {
              if(typeof beer[col.key] !== "undefined"){
                return (
                  <View key={j} style={{borderWidth:1, minWidth: 40, width:col.width, alignSelf: 'stretch', flex:-1}}>
                    <Text>
                      {beer[col.key].toString()}
                    </Text>
                  </View>
                )
              }
            })
          }
        <View style={{borderWidth:0,position:'absolute', top:0,left:0,right:0,bottom:0,flexDirection:'column',alignItems:'stretch',alignContent:'stretch',alignSelf:'stretch'}}>
          <Button
            alignSelf='stretch'
            title=' '
            color='#ffffff02'
            flexDirection='row'
            onPress={() => {this._selectBeer(beer)}}
          />
        </View>
      </View>
    );
  }
  
  render = function() {
    
  this.animatedValue = new Animated.Value(0);
    
  this.SetInterpolate = this.animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg']
  })
  
  this.Rotate_Y_AnimatedStyle = {
    transform: [
      { rotateY: this.SetInterpolate }
    ]
  }
    
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', alignItems: 'center'}}>
        {
          this.renderHeader()
        }
        {
          this.menu.map((beer, i) => {
              return this.renderRow(beer, i);
          })
        }
      </View>
    );
  }
  
  flip_Card_Animation=()=> {
    Animated.spring(this.animatedValue,{
      toValue: 0,
      tension: 10,
      friction: 8,
    }).start();
  }

  
  //reorder the table to sort by col. Previous sorting breaks ties
  sortMenu = function(col) {
    this.flip_Card_Animation();
    if(this.sortByColumns.indexOf(col) == 0){
      col.order *= -1;
    }
    else this.sortByColumns.unshift(this.sortByColumns.splice(this.sortByColumns.indexOf(col),1)[0]);
    console.log(this.sortByColumns);
    console.log(this.activeFilters);
    
    let sortByColumns = this.sortByColumns;
    this.menu.sort(function (a,b){
      let cmp = 0
      for (let col of sortByColumns){
        if(typeof a[col.key] === "number" && typeof b[col.key] === "number"){
          cmp = a[col.key]-b[col.key];
        }
        else if(typeof a[col.key] === "string" && typeof b[col.key] === "string"){
          cmp = a[col.key].localeCompare(b[col.key], 'en', {sensitivity: 'base'});
        }
        if(cmp !== 0) return cmp * col.order;
      }
      return cmp;
    })
    
  }
  
  //should be called externally- adds the filter to the list
  addFilter = function(filter) {
    this.activeFilters.push(filter);
    if(typeof this.updateCallback==="function")this.updateCallback(this);
  }
  
  //called when a beer is selected
  _selectBeer = function(beer) {
    Alert.alert('Details',beer.description!=="undefined" ? beer.description : "No detailed information on this beer.");
  }
  
  //called when a column's header is tapped
  _selectHeader = function(col) {
    this.sortMenu(col);
    if(typeof this.updateCallback==="function")this.updateCallback(this);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});