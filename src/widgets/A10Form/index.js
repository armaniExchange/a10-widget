import React, { Component, PropTypes } from 'react';
import { Form } from 'react-bootstrap';
import { Map, fromJS } from 'immutable';
import { createValidationFuncs } from '@a10/a10-widget-lib';

import A10BaseField from '../A10Field/A10BaseField';

class A10Form extends Component {

  static displayName = 'A10Form';

  static contextTypes = {
    apiClient: PropTypes.object.isRequired
  };

  static defaultProps = {
    children: [null, null]
  };

  static propTypes = {
    ...Form.propTypes,
    children: PropTypes.any.isRequired,
    primaryId: PropTypes.string,
    action: PropTypes.string,
    params: PropTypes.object,
    onSuccess: PropTypes.func,
    onFail: PropTypes.func,
    schema: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      data: Map()
    };
    this.fieldCount = 0;
    if (props.schema) {
      this.schema = require(`@a10/a10-schemas/src/${props.schema}.json`);
    }
  }

  onSubmit = e => {
    e.preventDefault(); e.stopPropagation();
    const { onSubmit } = this.props;
    const { data } = this.state;

    let result = Map();
    for (let i = 0; i < this.fieldCount; i++) {
      const ele = this.refs[`field${i}`];
      if (ele.hasError()) return;
      const { name, value: defaultValue, notRegular } = ele.props;
      const key = name.split('.');
      const value = data.getIn(key);
      if (!value || notRegular) continue;
      if (typeof value === 'string' && value.length === 0) continue;
      result = result.setIn(key, value);
    }
    result = result.toJS();

    if (onSubmit) {
      onSubmit(result, e);
    } else {
      const { apiClient } = this.context;
      const { onSuccess, params, primaryId } = this.props;
      const action = this.props.action ? this.props.action : this.schema.axapi.replace(/{.*}/g, '');
      const url = primaryId ? `${action}${primaryId}` : action;
      apiClient[primaryId ? 'put' : 'post'](url, result, params).then(res => {
        onSuccess(res);
      });
    }
  };

  updateField = (e, name, value, defaultVal) => {
    this.setState({
      data: this.state.data.setIn(name.split('.'), value)
    });
  }

  checkConditional = (conditional) => {
    const { data } = this.state;
    if (typeof conditional === 'string') {
      const currentVal = data.getIn(conditional.split('.'));
      if (currentVal) {
        return true;
      }
      return false;
    } else {
      for (const key in conditional) {
        if (!conditional.hasOwnProperty(key)) continue;
        const currentVal = data.getIn(key.split('.'));
        // FIXME
        if (currentVal != conditional[key] &&
          !(currentVal == undefined && conditional[key] == false)) {
          return false;
        }
      }
      return true;
    }
  }

  initData = child => {
    let { data } = this.state;
    for (let i = 0; i < this.fieldCount; i++) {
      const ele = this.refs[`field${i}`];
      const { name, value } = ele.props;
      data = data.setIn(name.split('.'), value || ele.value);
    }
    this.setState({ data });
  }

  recursiveCloneA10Field(child) {
    const data = this.state.data;
    return React.Children.map(child, ele => {
      if (!React.isValidElement(ele)) {
        return ele;
      } else if (Object.getPrototypeOf(ele.type) == A10BaseField) {
        const { conditional, linkFrom, linkTo, value, name, validation } = ele.props;
        if (conditional && !this.checkConditional(conditional)) return null;
        const keys = name.split('.');
        const currentVal = data.getIn(keys);

        let validations = null;
        if (this.schema) {
          const fieldSchema = this.schema.properties[keys[keys.length - 1]];
          if (fieldSchema) {
            const validationFuncs = createValidationFuncs(fieldSchema);
            validations = {};
            Object.keys(fieldSchema).forEach(key => {
              if (validationFuncs[key] !== undefined) {
                validations[key] = validationFuncs[key];
              } else if (key === 'format' && validationFuncs[fieldSchema[key]] !== undefined) {
                validations[fieldSchema[key]] = validationFuncs[fieldSchema[key]];
              }
            });
          }
        }
        return React.cloneElement(ele, {
          onChange: this.updateField,
          ref: `field${this.fieldCount++}`,
          value: currentVal || value || '',
          validation: validations || validation
        });
      } else if (ele.props.children) {
        return React.cloneElement(ele, {
          children: this.recursiveCloneA10Field(ele.props.children)
        });
      }
      return ele;
    });
  }

  componentDidUpdate() {
    // console.log(this.state.data.toJS());
  }

  componentWillMount() {
    const { primaryId, action } = this.props;
    if (primaryId) {
      const { apiClient } = this.context;
      apiClient.get(`${action}/${primaryId}`).then(res => {
        this.setState({
          data: fromJS(res)
        });
      });
    }
  }

  componentDidMount() {
    this.initData(this.props.children);
  }

  render() {
    const { children, horizontal, inline } = this.props;
    this.fieldCount = 0;
    return (
      <Form horizontal={horizontal} inline={inline} onSubmit={this.onSubmit}>
        <div key="1" className="fields-container">{children && this.recursiveCloneA10Field(children[0])}</div>
        <div key="2" className="button-container">{children && children[1]}</div>
      </Form>
    );
  }

}
export default A10Form;
