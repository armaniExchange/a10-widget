import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Button, Table, Row, Col, InputGroup, FormControl, Pagination } from 'react-bootstrap';
import { forEach, isObject, upperFirst } from 'lodash';
import moment from 'moment';
import { List } from 'immutable';

import A10BaseField from './A10BaseField';
import ModalLayout from '../../layouts/ModalLayout';

import './assets/a10multifield.scss';

class A10MultiField extends A10BaseField {

  static displayName = 'A10MultiField';

  static propTypes = {
    children: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.any,
    listComponent: PropTypes.element,
    errorMsg: PropTypes.string,
    onChange: PropTypes.func
  };

  static defaultPropTypes = {
    children: []
  };

  constructor(props, context) {
    super(props, context);
    this.displayLimit = 10;
    this.state = {
      modalVisible: false,
      data: [],
      currentPage: 1,
      keyword: null
    };
  }

  get value() {
    return this.state.data.map(data => {
      delete data._id;
      return data;
    });
  }

  updateFilter = () => {
    const { children, activeData } = this.props;
    const data = activeData ? activeData.toJS() : [];
    const keyword = ReactDOM.findDOMNode(this.refs.search).value;

    let newData = List();
    for (let i = 0; i < data.length; i++) {
      let hasSearch = false;
      for (let j = 0; j < children.length; j++) {
        const child = children[j];
        const { searchable, name } = child.props;
        const value = data[i][name] + '';
        if (searchable) hasSearch = true;
        if (searchable && value.indexOf(keyword) >= 0) {
          newData.push(data[i]);
          break;
        }
      }
      if (!hasSearch) newData.push(data[i]);
    }

    this.setState({
      keyword,
      currentPage: 1,
      data: newData
    });
  }

  setModalVisiable = (isVisable) => {
    const { name, modalOptions } = this.props;
    this.setState({ modalVisible: isVisable });
  };

  renderTitles(kids) {
    return kids.map((child, index) => {
      return (<td key={index}> {child.props.title || upperFirst(child.props.name) } </td>);
    });
  }

  renderPagination(data) {
    const totalPage = Math.ceil(data.length / this.displayLimit);
    if (totalPage === 0) return null;
    return (
      <Col lg={ 12 } className="text-right">
        <Pagination prev next items={totalPage}
          maxButtons={3}
          onSelect={this.changePage}
          activePage={this.state.currentPage}
          bsSize="small" />
      </Col>
    );
  }

  changePage = pageNumber => {
    this.setState({ currentPage: pageNumber });
  };

  onError = (message) => {
    const { onError } = this.props;
    onError && onError(message);
  };

  isMatchConditional(conditional, name, value) {
    if (!conditional) return false;
    if (conditional[name] === value) return true;
    return false;
  }

  renderItem(kids, data, index) {
    const { primaryKey } = this.props;

    const items = [];
    for (let i = 0; i < kids.length; i++) {
      const child = kids[i];
      const { name, conditional } = child.props;
      const value = data[name];
      items.push((
        <td key={`${data._id}.${i}`}>
          {
            React.cloneElement(child, {
              name,
              disabled: this.isMatchConditional(conditional, name, value),
              onChange: (e) => {
                const { data } = this.state;
                data[index][name] = e.target.value;
                this.setState({ data: List(data) });
              },
              value: value || ''
            })
          }
        </td>
      ));
    }

    return <tr key={index}>{items}</tr>;
  }

  renderItemRow(items) {
    const { children } = this.props;
    const { currentPage } = this.state;
    const startPos = (currentPage - 1) * this.displayLimit;

    const rows = [];
    for (let i = startPos; rows.length < this.displayLimit && i < items.length; i++) {
      const item = this.renderItem(children, items[i], i);
      rows.push(item);
    }

    return rows;
  }

  inlineCreate = kids => {
    let newItem = {};
    kids.forEach(kid => {
      const { name, value } = kid.props;
      newItem[name] = value || '';
    });
    this.appendNewItem(newItem);
  };

  modalCreate = newItemInfo => {
    const key = Object.keys(newItemInfo)[0];
    this.appendNewItem(newItemInfo[key]);
    this.setState({ modalVisible: false });
  };

  appendNewItem = newItemInfo => {
    newItemInfo._id = moment().unix();
    this.setState(prevState => {
      return {
        data: [ newItemInfo, ...prevState.data ],
        currentPage: 1
      };
    });
  };

  componentDidUpdate(prevProps, prevState) {
    const { onChange, name, value } = this.props;
    if (prevProps.value !== value && List.isList(value)) {
      this.setState({ data: value.toJS() });
    }
    if (onChange && prevState.data !== this.state.data) {
      onChange(null, name, this.value);
    }
  }

  componentDidMount() {
    // FIXME, LOAD DATA
  }

  render() {
    const { errorMsg, modalOptions, children } = this.props;
    const { data, modalVisible } = this.state;
    const Form = modalOptions.form;

    // <TableFields ref="table" kids={children} name={name} { ...rest } />
    return (
      <div>
        <Row>
          <Col md={6} >
            <div>
              <InputGroup>
                <FormControl ref="search" type="text" placeholder="Keywords" />
                <InputGroup.Button>
                  <Button bsStyle="default" onClick={this.updateFilter}>Search</Button>
                </InputGroup.Button>
              </InputGroup>
            </div>
          </Col>
          <Col md={6} className="text-right">
            {<Button onClick={this.inlineCreate.bind(this, children)} bsStyle="primary">
                <span className="fa fa-plus" aria-hidden="true"></span> New
              </Button>}
            { modalOptions && <Button bsStyle="default" onClick={this.setModalVisiable.bind(this, true)}>Create...</Button> }
            {<span>{errorMsg}</span>}
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Table responsive striped hover className="port-list-container">
              <thead>
                <tr>
                  { this.renderTitles(children) }
                </tr>
              </thead>
              <tbody>
                { this.renderItemRow(data) }
              </tbody>
            </Table>
          </Col>
        </Row>

        <div className="panel-footer">
          <Row>
            { this.renderPagination(data) }
          </Row>
        </div>

        <ModalLayout visible={modalVisible} {...modalOptions}>
          <Form
            onClose={this.setModalVisiable.bind(this, false)}
            onSubmit={this.modalCreate} />
        </ModalLayout>
      </div>
    );
  }
}
export default A10MultiField;
