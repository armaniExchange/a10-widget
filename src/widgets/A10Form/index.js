import React, { Component, PropTypes } from 'react';
import { Form } from 'react-bootstrap';
import { Map, fromJS } from 'immutable';

import A10BaseField from '../A10Field/A10BaseField';

class A10Form extends Component {

  static displayName = 'A10Form';

  static contextTypes = {
    apiClient: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  static defaultProps = {
    children: [null, null]
  };

  static propTypes = {
    ...Form.propTypes,
    children: PropTypes.any.isRequired,
    primaryId: PropTypes.string,
    action: PropTypes.string,
    method: PropTypes.string,
    params: PropTypes.object,
    onSuccess: PropTypes.func,
    onFail: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      data: Map()
    };
    this.fieldCount = 0;
  }

  onSubmit = e => {
    e.preventDefault(); e.stopPropagation();
    const { onSubmit } = this.props;
    const { data } = this.state;

    let result = Map();
    for (let i = 0; i < this.fieldCount; i++) {
      const ele = this.refs[`field${i}`];
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
      const { action, method, onSuccess, params, primaryId } = this.props;
      const url = primaryId ? `${action}${primaryId}` : action;
      apiClient[method](url, result, params).then(res => {
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
        const { conditional, linkFrom, linkTo, value, name } = ele.props;
        if (conditional && !this.checkConditional(conditional)) return null;
        const currentVal = data.getIn(name.split('.'));
        const newProps = {
          onChange: this.updateField,
          ref: `field${this.fieldCount++}`,
          value: currentVal || value || ''
        };
        // console.log(name, currentVal, name.split('.'), data);
        // if (linkFrom) {
        //   newProps.linkData[linkTo] = this.state.data.getIn(linkFrom.split('.'));
        // }
        return React.cloneElement(ele, newProps);
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
