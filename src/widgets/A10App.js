import React, { Component, PropTypes } from 'react';

import { getRequest } from '../utils/api';

class A10App extends Component {

  static displayName = 'A10App';

  static childContextTypes = {
    apiClient: PropTypes.object.isRequired
  };

  static propTypes = {
    authFailHandle: PropTypes.func,
    apiErrorHandle: PropTypes.func,
    getAuthToken: PropTypes.func
  };

  getChildContext() {
    return {
      apiClient: {
        get: this.getAPIRequest.bind(this, 'get'),
        post: this.getAPIRequest.bind(this, 'post'),
        put: this.getAPIRequest.bind(this, 'put'),
        del: this.getAPIRequest.bind(this, 'del')
      }
    };
  }

  getAPIRequest = (method, url, data=null, params=null, querystring=null) => {
    let options = {};
    if (method === 'get') {
      options.querystring = data;
      options.params = params;
    } else {
      options.data = data;
      options.querystring = querystring;
      options.params = params;
    }

    const { getAuthToken, authFailHandle, apiErrorHandle } = this.props;
    const token = (getAuthToken && getAuthToken()) || null;
    if (token) options.headers = { Authorization: `A10 ${token}` };
    return getRequest(method, url, options).then(res => {
      return res.body;
    }).catch(err => {
      console.error(err);
      if (err.message === 'Authorization Required') {
        authFailHandle && authFailHandle();
      } else {
        const errResBody = err.response.body;
        let errMsg = 'Unknow Error';
        if (errResBody && errResBody.response && errResBody.response.err && errResBody.response.err.msg) {
          errMsg = errResBody.response.err.msg;
        }
        apiErrorHandle && apiErrorHandle(err.message, errMsg);
        throw new Error(errMsg);
      }
    });
  };

  render() {
    return (
      <div className='a10-app'>{this.props.children}</div>
    );
  }

}
export default A10App;
