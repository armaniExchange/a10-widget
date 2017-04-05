import React, { Component, PropTypes } from 'react';
import { FormControl, InputGroup, Button } from 'react-bootstrap';

import ModalLayout from '../../layouts/ModalLayout';

class A10DynamicSelect extends Component {

  static displayName = 'A10DynamicSelect';

  static contextTypes = {
    apiClient: PropTypes.object.isRequired
  };

  static propTypes = {
    modalOptions: PropTypes.object.isRequired,
    primaryKey: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.selectRef = null;
    this.state = {
      modalVisible: false,
      options: [ '' ]
    };
  }

  get value() {
    if (this.selectRef) {
      const value = this.selectRef.value;
      return value === '' ? null : value;
    }
    return null;
  }

  appendNewItem = res => {
    const { primaryKey } = this.props;
    const key = Object.keys(res)[0];
    this.setState({
      options: [ ...this.state.options, res[key][primaryKey] ],
      modalVisible: false
    });
  };

  setModalVisiable = (isVisable) => {
    this.setState({ modalVisible: isVisable });
  };

  componentDidMount() {
    const { primaryKey, modalOptions } = this.props;
    const Form = modalOptions.form;
    const { apiClient } = this.context;
    apiClient.get(Form.url).then(res => {
      const key = Object.keys(res)[0];
      if (this.refs.inputGroup) {
        this.setState({
          options:  [ '' ].concat(res[key].map(item => item[primaryKey]))
        });
      }
    });
  }

  render() {
    const { children, modalOptions } = this.props;
    const { options, modalVisible } = this.state;
    const Form = modalOptions.form;
    return (
      <InputGroup ref="inputGroup">
        <FormControl componentClass="select" style={{ WebkitAppearance: 'none' }} inputRef={ref => this.selectRef = ref}>
          {
            options.map((val, index) => {
              return <option value={val} key={index}>{val}</option>
            })
          }
        </FormControl>
        <InputGroup.Button>
          <Button onClick={this.setModalVisiable.bind(this, true)}>+</Button>
        </InputGroup.Button>
        <ModalLayout visible={modalVisible} {...modalOptions}>
          <Form onSuccess={this.appendNewItem} onClose={this.setModalVisiable.bind(this, false)} />
        </ModalLayout>
      </InputGroup>
    );
  }

}
export default A10DynamicSelect;
