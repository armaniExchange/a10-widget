import React from 'react';
import { Radio } from 'react-bootstrap';

class A10Radio extends Radio {

  static propTypes = {
    ...Radio.propTypes
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
    return <Radio {...this.props} inputRef={ref => this.inputRef = ref} />;
  }

}
export default A10Radio;
