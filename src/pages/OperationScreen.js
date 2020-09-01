import React from 'react';
import { StyleSheet, Button, View } from 'react-native';

import Header from '../components/Header';
import DataList from '../components/DataList';

import AuthService from '../services/auth.service';
import { get, post, put, del } from '../helpers/requests';
import { serializeFields, deserializeFields } from '../helpers/variableObjects';

class OperationScreen extends React.Component {
  state = {
    schema: [],
    items: []
  }

  objectName = "";

  addItem = async (item, action) => {
    let serializedItem = serializeFields(item, this.state.schema);
    serializedItem.type = this.props.route.params.operationID;
    let newItem = await request(`operation/${this.props.route.params.operationID}/`, 'POST', serializedItem);
    this.setState(prevState => ({
      items: [...prevState.items, deserializeFields(newItem, "values")]
    }))

  }

  updateDeleteItem = async (item, action) => {
    if(action === 'PUT'){
      let serializedItem = serializeFields(item, this.state.schema);
      serializedItem.type = this.props.route.params.operationID;
      let updatedItem = await request (`operation/${this.props.route.params.operationID}/${item.id}/`, 'PUT', serializedItem);

      const itemIndex = this.state.items.findIndex(data => data.id === updatedItem.id);
      const newArray = [
        // destructure all items from beginning to the indexed item
        ...this.state.items.slice(0, itemIndex),
        // add the updated item to the array
        deserializeFields(updatedItem, "values"),
        // add the rest of the items to the array from the index after the replaced item
        ...this.state.items.slice(itemIndex + 1)
        ]
        this.setState({ items: newArray });
    }
    else{
      await request (`operation/${this.props.route.params.operationID}/${item.id}/`, 'DELETE');
      const updatedItems = this.state.items.filter(el => el.id !== item.id);
      this.setState({ items: updatedItems });
    }
  }

  changeSchema = async () => {
    this.setState({schema: [
                            {
                              field: 'id',
                              name: `Codice Operazione`,
                              type: 'number',
                              fixed: true,
                              modifiable: false
                            },
                            {
                              field: 'date',
                              name: 'Data',
                              type: 'date',
                              fixed: true,
                              modifiable: true
                            },
                            {
                              field: 'barrel',
                              name: 'Barile',
                              type: 'barrel',
                              fixed: true,
                              modifiable: true
                            }
                          ]});
    let type = await request(`operation_type/${this.props.route.params.operationID}/`, 'GET');
    this.objectName = type.name;
    let schema = JSON.parse(type.schema);
    schema.forEach((item, i) => {
      item.modifiable = true;
    })
    this.setState({schema: [...this.state.schema, ...schema]});

    let items = await request(`operation/${this.props.route.params.operationID}/`, 'GET');
    items = items.map(item => deserializeFields(item, "values"));
    this.setState({items: items});
  }

  async componentDidUpdate(prevProps){
    if(this.props.route.params.operationID !== prevProps.route.params.operationID){
      this.setState({items: [], schema: []})
      this.changeSchema();
    }
  }

  async componentDidMount(){
    this.changeSchema();
  }

  render() {
    return (
      <View style={{width: '100%', height: '100%'}}>
        <Header name={this.props.route.params.operationName} openDrawer={this.props.navigation.openDrawer}/>
        <DataList objectName={this.props.route.params.operationName}
                  items={this.state.items}
                  fields={this.state.schema}
                  navigate={this.props.navigation.navigate}
                  addAction={this.addItem}
                  updateDeleteAction={this.updateDeleteItem} />
      </View>
    )
  }
}


export default OperationScreen;
