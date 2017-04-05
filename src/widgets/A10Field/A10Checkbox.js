import React from 'react';
import { Checkbox } from 'react-bootstrap';

class A10Checkbox extends Checkbox {

  static propTypes = {
    ...Checkbox.propTypes
  };

  constructor(props) {
    super(props);
    this.inputRef = null;
  }

  get value() {
    if (!this.inputRef) return null;
    return this.inputRef.value;
  }

  get checked() {
    if (!this.inputRef) return null;
    return this.inputRef.checked;
  }

  render() {
    return <Checkbox {...this.props} inputRef={ref => this.inputRef = ref} />;
  }

}
export default A10Checkbox;
