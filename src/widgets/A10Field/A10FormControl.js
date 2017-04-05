import React from 'react';
import ReactDOM from 'react-dom';
import { FormControl } from 'react-bootstrap';

class A10FormControl extends FormControl {

  static propTypes = {
    ...FormControl.propTypes
  };

  constructor(props) {
    super(props);
    this.inputRef = null;
  }

  get value() {
    if (!this.inputRef) return null;
    return this.inputRef.value;
  }

  render() {
    return <FormControl {...this.props} inputRef={ref => this.inputRef = ref} />;
  }

}
export default A10FormControl;
