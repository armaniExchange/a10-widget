
import React, { Component, PropTypes } from 'react';
// import { BootstrapTable } from 'react-bootstrap-table';  // in ECMAScript 6
import { Table } from 'react-bootstrap';

// import A10Button from 'components/Field/A10Button';
import TableHeader from './Libs/Table/Header';
import TableFooter from './Libs/Table/Footer';

class TableLayout extends Component {

  static displayName = 'TableLayout';

  static propTypes = {
    children: PropTypes.array.isRequired,
    onCreate: PropTypes.func,
    onSearch: PropTypes.func,
    onBatchAction: PropTypes.func
  };

  render() {
    const { tableAttrs, pagination, children, newTd, onCreate, onSearch, onBatchAction } = this.props;
    return (
      <div>
        <TableHeader onCreate={onCreate} onSearch={onSearch} />
        <Table  {...tableAttrs} >
          <thead>
            <tr>{ children[0].props.children }</tr>
          </thead>
          <tbody>
            {newTd}
            {children[1].props.children}
          </tbody>
        </Table>
        <TableFooter pagination={pagination} onBatchAction={onBatchAction} />
      </div>
    );
  }
}

export default TableLayout;
