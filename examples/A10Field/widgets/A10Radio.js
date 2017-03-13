import React, { Component, PropTypes } from 'react';

import { Radio } from 'react-bootstrap';
import { A10Field, widgetWrapper } from '../../../dist';

function MyA10Radio({ ...props }) {
  const fieldProps = { ...props };
  const { options, titles } = fieldProps;

  delete fieldProps.options;
  delete fieldProps.titles;

  return (
    <A10Field {...fieldProps}>
      <div>
        {
          options.map((option, index) => {
            const title = titles[index] || option;
            return (
              <Radio value={option} inline>{title}</Radio>
            );
          })
        }
      </div>
    </A10Field>
  );
}

export const A10Radio = widgetWrapper(['app'])(MyA10Radio, {
  meta: {
    widget: {
      iconClassName: 'fa fa-rocket',
      type: 'Field',
      name: 'A10Radio',
      component: 'A10Radio',
      display: 'inline-block',
      isContainer: false,
      description: ''
    },
    defaultProps: {
      name: 'A10Radio',
      label: 'A10Radio',
      type: 'input',
      options: [],
      titles: []
    },
    propTypes: Object.assign({}, A10Field.propTypes, {
      name: PropTypes.object.isRequired,
      label: PropTypes.object.isRequired,
      conditional: PropTypes.object,
      layout: PropTypes.element,
      value: PropTypes.string.isRequired,
      options: PropTypes.array.isRequired,
      titles: PropTypes.array.isRequired
    }),
    propGroups: {
      store: 'ignore',
      name: 'basic',
      label: 'basic',
      options: 'basic',
      titles: 'basic',
      conditional: 'basic',
      layout: 'basic'
    }
  }
});
