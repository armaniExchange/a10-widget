import React, { Component, PropTypes } from 'react';
import { A10Field } from '../../../dist';
import { widgetWrapper } from '../../../dist';


export default widgetWrapper([ 'app' ])(A10Field, {
  meta: {
    widget: {
      iconClassName: 'fa fa-rocket',
      type: 'Field',
      name: 'A10Field',
      component: 'A10Field',
      display: 'inline-block',
      isContainer: false,
      description: ''
    },
    defaultProps: {
      name: 'A10Field',
      label: 'A10Field',
      type: 'input',
      value: '',
      conditional: null
    },
    propTypes: Object.assign({}, A10Field.propTypes, {
      name: PropTypes.object.isRequired,
      label: PropTypes.object.isRequired,
      conditional: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
        PropTypes.bool
      ]),
      layout: PropTypes.element
    }),
    propGroups: {
      store: 'ignore',
      name: 'basic',
      label: 'basic',
      conditional: 'basic',
      layout: 'basic'
    }
  }
});
