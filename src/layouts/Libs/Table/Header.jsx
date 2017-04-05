import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Row, Col, Button, FormControl, InputGroup } from 'react-bootstrap';

// import { A10Button } from '../../../widgets/A10Field/FieldWidgets/A10Button';

class TableHeader extends Component {

  static displayName = 'TableHeader';

  static propTypes = {
    onCreate: PropTypes.func,
    onSearch: PropTypes.func
  };

  onClickCreateBtn = e => {
    e.preventDefault();
    const { onCreate } = this.props;
    onCreate && onCreate();
  }

  onClickSearchBtn = e => {
    e.preventDefault();
    const dom = ReactDOM.findDOMNode(this.refs.searchVal);
    const { onSearch } = this.props;
    onSearch && onSearch(dom.value);
  }

  render() {
    return (
      <div className="dataTables_wrapper form-inline dt-bootstrap no-footer">
        <Row>
          <Col md={6} >
            <InputGroup>
              <FormControl ref="searchVal" placeholder="Keywords" />
              <InputGroup.Button>
                <Button bsStyle="default" onClick={this.onClickSearchBtn}>Search</Button>
              </InputGroup.Button>
            </InputGroup>
          </Col>
          <Col md={6}>
            <Button bsClass="btn btn-labeled btn-success pull-right" onClick={this.onClickCreateBtn}>
              <span className="btn-label"><i className="fa fa-plus"></i></span> Create
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default TableHeader;
