import superagent from 'superagent';

const methods = [ 'get', 'post', 'put', 'patch', 'del' ];

function formatUrl(path) {
  const adjustedPath = path[0] !== '/' ? '/' + path : path;
  return adjustedPath;
}

export function getRequest(method, url, options={ data: null, headers: {}, params: null, querystring: null }) {
  return new Promise((resolve, reject) => {
    let { data, headers, params, querystring } = options;

    let finalUrl = url;
    if (params) {
      for (const key in params) {
        if (!params.hasOwnProperty(key)) continue;
        finalUrl = finalUrl.replace(`\{${key}\}`, params[key]);
      }
      finalUrl = finalUrl.replace(/{(\w|-)+}/g, '');
    }
    let request = superagent(method, formatUrl(finalUrl));

    headers = {
      ...headers,
      'Content-Type': 'application/json',
      // FIXME
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    };

    if (data) {
      request = request.type('form').send(data);
    }

    if (querystring) {
      for (const key in querystring) {
        if (!querystring.hasOwnProperty(key)) continue;
        request = request.query({ [key]: querystring[key] });
      }
    }

    if (headers) {
      for (const key in headers) {
        if (!headers.hasOwnProperty(key)) continue;
        request = request.set(key, headers[key]);
      }
    }

    request.timeout(10000).end((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}
