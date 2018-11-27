
//Singleton class for storing and operating on the parsed menu.
//Should eventually be able to store/retrieve multiple menus.
class MenuManager{
  constructor(){
    if(!MenuManager.instance){
      this._data = [];
      MenuManager.instance = this;
    }
    
    return MenuManager.instance;
  }
  
  push(menu){
    this._data.push(menu)
  }
  
  getLastMenu(){
    return this._data[this._data.length-1];
  }
  
  getLastMenuEntry(){
    return this.getLastMenu()[this.getLastMenu().length-1];
  }
  
  pop(){
    return this._data.pop();
  }
  
  isEmpty() {
    return this._data.length == 0;
  }

  isNull() {
    if (this._data[0][0] == null)
      return true;
    else
      return false;
  }
}


const instance = new MenuManager();
Object.freeze(instance);

export default instance;