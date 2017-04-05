import React, { Component, PropTypes } from 'react';
import { values, get }  from 'lodash';

import { getPayload, getPaginationParam, getStartPage, getNextPageURL } from '../../utils';
import { UPDATE_TARGET_DATA } from '../../consts/messages';
import { REDIRECT_ROUTE } from '../../consts/messages'; // eslint-disable-line
import { querystring2obj } from '../../utils/request';

import TableLayout from '../../layouts/TableLayout';
import ModalLayout from '../../layouts/ModalLayout';

// A Place holder stands for one Col inside A10Table
export function A10TableColumn() {}
A10TableColumn.propTypes = {
  render: PropTypes.func
};

const COMPONENT_PAGE_SIZE = 25;
class A10Table extends Component {

  static displayName = 'A10Table';

  static contextTypes = {
    router: PropTypes.object.isRequired,
    apiClient: PropTypes.object.isRequired
  };

  static propTypes = {
    action: PropTypes.string.isRequired,
    dataKey: PropTypes.string.isRequired,
    pagination: PropTypes.object,
    pageMode: PropTypes.bool,
    createModalOptions: PropTypes.object,
    searchField: PropTypes.string
    // responsive striped hover newLast loadOnInitial
  };

  constructor(props, context) {
    super(props, context);
    // const {
    //   router: {
    //     route: { location }
    //   }
    // } = context;
    this.state = {
      newElement: null,
      modalVisible: false,
      activePage: this.props.pageMode ? getStartPage(window.location) + 1 : 1,
      selectedItem: [],
      data: null,
      total: 0
    };
  }

  refreshTable(pageNo=0, params) {
    const {
      action,
      pagination={ size: COMPONENT_PAGE_SIZE },
      dataKey,
      pageMode
    } = this.props;
    const { apiClient } = this.context;

    if (pageMode) {
      const pageParams = getPaginationParam(pageNo*pagination.size, pagination.size);
      if (!params) {
        params = pageParams;
      } else {
        params = { ...params, ...pageParams };
      }
    }

    let totalRequestParams = { total: true };
    if (params) totalRequestParams = { ...totalRequestParams, ...params };

    Promise.all([
      apiClient.get(action, totalRequestParams),
      apiClient.get(action, params)
    ]).then(responses => {
      const total = responses[0]['total-count'];
      const data = responses[1];
      this.setState({
        total: total,
        data: (data && data[dataKey]) || [],
        activePage: pageNo + 1
      });
    });
  }

  selectDataItem = e => {
    const { value, checked } = e.target;
    const { selectedItem } = this.state;
    if (checked) {
      this.setState({
        selectedItem: [
          ...selectedItem,
          value
        ]
      });
    } else {
      this.setState({
        selectedItem: selectedItem.filter(val => val !== value)
      });
    }
  };

  selectAllDataItem = e => {
    const { value, checked } = e.target;
    let selectedItem;
    if (checked) {
      selectedItem = this.state.data.map(itemInfo => itemInfo[value]);
    } else {
      selectedItem = [];
    }
    this.setState({ selectedItem });
  };

  renderData = (data, index=10000) => {
    const { selectedItem } = this.state;
    return (
      <tr key={index}>
        {
          this.props.children.map((child, key) => {
            const { dataField, render, checkbox, ...props } = child.props;
            const dataCol = get(data, dataField);
            let formatedData = null;
            // console.log(dataField, dataCol);
            if (checkbox) {
              formatedData = (
                  <div className="checkbox c-checkbox">
                    <label>
                      <input type="checkbox" value={dataCol} checked={selectedItem.indexOf(dataCol) > -1} onChange={this.selectDataItem} />
                      <em className="fa fa-check"></em>
                    </label>
                  </div>
              );
            } else {
              formatedData = typeof render == 'function' ? render(dataCol, data) : dataCol;
            }
            return (<td key={key} {...props}>{formatedData}</td>);
          })
        }
      </tr>
    );
  }

  paginate(pageNo) {
    this.setState({ activePage: pageNo });
    this.refreshTable(pageNo);
  }

  componentWillMount() {
    if (this.props.loadOnInitial && !this.props.isComponentEditor) {
      this.refreshTable();
    }
  }

  onSearch = val => {
    const { searchField } = this.props;
    if (val && val.length) {
      this.refreshTable(0, { [ searchField ]: val });
    } else {
      this.refreshTable();
    }
  };

  onBatchAction = actionType => {
    const { apiClient } = this.context;
    const { searchField, action } = this.props;
    const { selectedItem } = this.state;
    if (!selectedItem.length) return;
    if (actionType === 'del') {
      const promises = selectedItem.map(val => apiClient.del(`${action}${val}`));
      Promise.all(promises).then(responses => {
        this.refreshTable();
      });
    }
  };

  appendNewItem = formData => {
    const data = formData[Object.keys(formData)[0]];
    this.setState(prevState => {
      return {
        data: [ data, ...prevState.data ],
        modalVisible: false
      };
    });
  };

  setModalVisiable = isVisible => {
    this.setState({ modalVisible: isVisible });
  };

  renderModal() {
    const { createModalOptions } = this.props;
    const { modalVisible } = this.state;
    if (!createModalOptions) return null;
    const Form = createModalOptions.form;
    return (
      <ModalLayout visible={modalVisible} {...createModalOptions}>
        <Form onSuccess={this.appendNewItem} onClose={this.setModalVisiable.bind(this, false)} />
      </ModalLayout>
    );
  }

  render() {
    // console.log('rendering at a10table>>>>>>>>>>>>>>>>>>>>>>>>>>>', this.props.data);
    let {
      children,
      responsive, striped, hover, bordered,
      onCreate, onSearch,
      pagination={ size: COMPONENT_PAGE_SIZE, total: 0, items: 0 }
    } = this.props;
    const { data, total, newElement } = this.state;

    let tds = [];
    if (data && total) {
      let list = data || [];
      tds = list.map(::this.renderData);
      pagination.total = total;
      pagination.items = Math.ceil(total/pagination.size);
    }

    return (
      <div>
        <TableLayout
          tableAttrs={{ responsive, striped, bordered, hover }}
          pagination={{ paginate: ::this.paginate, activePage: this.state.activePage, ...pagination }}
          newTd={newElement}
          onCreate={this.setModalVisiable.bind(this, true)}
          onSearch={this.onSearch}
          onBatchAction={this.onBatchAction}>
          <div>
            {
              children.map((child, key) => {
                if (!child || !child.props) return null;
                let { children, checkbox, dataField } = child.props;
                if (checkbox) {
                  children = (
                    <div data-toggle="tooltip" data-title="Check All" className="checkbox c-checkbox">
                      <label>
                        <input type="checkbox" value={dataField} onChange={this.selectAllDataItem} />
                        <em className="fa fa-check"></em>
                      </label>
                    </div>
                  );
                }
                return (<th key={key}>{children}</th>);
              })
            }
          </div>
          <div>{tds}</div>
        </TableLayout>
        {this.renderModal()}
      </div>
    );
  }
}

export default A10Table;
