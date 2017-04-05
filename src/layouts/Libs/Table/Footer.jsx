import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
// import { BootstrapTable } from 'react-bootstrap-table';  // in ECMAScript 6
import { Row, Col, Pagination } from 'react-bootstrap';

// import A10Button from 'components/Field/A10Button';

class TableFooter extends Component {

  static displayName = 'TableFooter';

  static propTypes = {
    onBatchAction: PropTypes.func
  };

  onBatchAction = e => {
    e.preventDefault();
    const { onBatchAction } = this.props;
    const dom = ReactDOM.findDOMNode(this.refs.actionSelector);
    if (!dom) return;
    onBatchAction && onBatchAction(dom.value);
  };

  render() {
    const { pagination: { items=5, paginate, activePage } } = this.props;
    // console.log(total);
    return (
      <div className="panel-footer">
        <Row>
          <Col lg={ 2 }>
            <div className="input-group pull-right">
              <select className="input-sm form-control" ref="actionSelector">
                {/*<option value="0">Bulk action</option>*/}
                <option value="del">Delete</option>
                <option value="2">Clone</option>
                <option value="3">Export</option>
              </select>
              <span className="input-group-btn">
                <button className="btn btn-sm btn-default" onClick={this.onBatchAction}>Apply</button>
              </span>
            </div>
          </Col>
          <Col lg={ 8 }></Col>
          <Col lg={ 2 } className="text-right">
            <Pagination prev next ellipsis first last boundaryLinks
              items={items} maxButtons={5} bsSize="small"
              activePage={activePage}
              onSelect={paginate}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default TableFooter;
