import React, { Component, PropTypes } from 'react';
import { FormGroup, FormControl, HelpBlock, ControlLabel, Col } from 'react-bootstrap';

import A10BaseField from './A10BaseField';

class A10Field extends A10BaseField {

  static defaultProps = {
    componentClass: 'input'
  };

  static propTypes = {
    name: PropTypes.string,
    type: PropTypes.string,
    label: PropTypes.string,
    description: PropTypes.string,
    help: PropTypes.string,
    required: PropTypes.any,
    children: PropTypes.any,
    placeholder: PropTypes.string,
    validation: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object
    ]),
    inline: PropTypes.any,
    onChange: PropTypes.func,
    ...FormControl.propTypes
  };

  constructor(props) {
    super(props);
    this.state = {
      errMsg: null,
      value: null
    };
    this.type = 'input';
  }

  valueVerify = (e) => {
    const { value } = e.target;
    const { componentClass, validation, name } = this.props;
    const { errMsg } = this.state;

    if (componentClass === 'checkbox' || componentClass === 'radio') return;
    if (!validation) return;

    if (typeof validation === 'function') {
      const failMsg = validation(value);
      if (failMsg && failMsg !== errMsg) {
        this.setState({ errMsg: failMsg });
      } else if (!failMsg) {
        this.setState({ errMsg: null });
      }
    } else {
      const validationKeys = Object.keys(validation);
      for (let i = 0; i < validationKeys.length; i++) {
        const failMsg = validation[validationKeys[i]](value);
        if (failMsg && failMsg !== errMsg) {
          this.setState({ errMsg: failMsg });
          return;
        } else if (!failMsg) {
          this.setState({ errMsg: null });
        }
      }
    }
  };

  onChange = e => {
    const { name, onChange, value: defaultVal } = this.props;
    this.valueVerify(e);
    const value = this.value;
    this.setState({ value });
    onChange && onChange(e, name, value, defaultVal);
  };

  onBlur = e => {
    this.valueVerify(e);
  };

  get value() {
    const { children } = this.props;
    if (this.type === 'checkbox') {
      if (typeof children === 'object') return this.refs['field0'].checked ? 1 : 0;
      const result = [];
      for (let i = 0; i < children.length; i++) {
        const ele = this.refs[`field${i}`];
        if (ele.checked) result.push(ele.value);
      }
      return result;
    } else if (this.type === 'radio') {
      for (let i = 0; i < children.length; i++) {
        const ele = this.refs[`field${i}`];
        if (ele.checked) return ele.value;
      }
    }
    return this.refs && this.refs['field0'] && this.refs['field0'].value;
  }

  renderFieldInput = () => {
    const { children, value: defaultVal, name } = this.props;
    const { value } = this.state;
    return (
      <div>
        {
          React.Children.map(children, (child, index) => {
            const newProps = {
              onChange: this.onChange,
              onBlur: this.onBlur,
              ref: `field${index}`
            };
            if (child.type.name === 'A10Checkbox' || child.type.name === 'Checkbox') {
              this.type = 'checkbox';
              newProps.checked = (value || defaultVal) === child.props.value;
            } else if (child.type.name === 'A10Radio' || child.type.name === 'Radio') {
              this.type = 'radio';
              newProps.checked = (value || defaultVal) === child.props.value;
              newProps.name = name;
            } else {
              newProps.value = value || defaultVal || '';
              newProps.name = name;
            }
            return React.cloneElement(child, newProps);
          })
        }
      </div>
    );
  };

  render() {
    const { errMsg } = this.state;
    const { label, help, inline, description, required } = this.props;
    if (inline) {
      return (
        <FormGroup validationState={errMsg ? 'error' : null}>
          <Col componentClass={ControlLabel}
            className={required ? 'required' : ''}
            sm={4}
            title={description}>
            {label}
          </Col>
          <Col sm={8}>
            {this.renderFieldInput()}
            <FormControl.Feedback />
            {(errMsg || help) && <HelpBlock>{errMsg || help}</HelpBlock>}
          </Col>
        </FormGroup>
      );
    } else {
      return (
        <FormGroup validationState={errMsg ? 'error' : null}>
          {label && <ControlLabel>{label}</ControlLabel>}
          {this.renderFieldInput()}
          <FormControl.Feedback />
          {(errMsg || help) && <HelpBlock>{errMsg || help}</HelpBlock>}
        </FormGroup>
      );
    }
  }

}
export default A10Field;
