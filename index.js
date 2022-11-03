'use strict';

const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});

const CHEKING_LOOP_SLEEP = 60 * 1000;
const SERVER_REQUEST_TIMEOUT = 30 * 1000;

let CURRENT_SB_SERVER_URL = 'https://sponsor.ajay.app';

const MAIN_SERVER = {
  baseUrl: 'https://sponsor.ajay.app',
  probingPath: '/api/status'
};

const MIRRORS = [{
  baseUrl: 'https://sponsorblock.kavin.rocks',
  probingPath: '/api/userInfo'
}, {
  baseUrl: 'https://sponsorblock.gleesh.net',
  probingPath: '/api/userInfo'
}, {
  baseUrl: 'https://sb.doubleuu.win',
  probingPath: ''
}];

async function _httpClient(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: SERVER_REQUEST_TIMEOUT } ,(res) => {
      let data = [];

      res.on('data', chunk => {
        data.push(chunk);
      });

      res.on('end', () => {
        res.dataBuff = Buffer.concat(data);

        resolve(res);
      });
    }).on('error', e => reject(e));
  });
}

async function _probeServer(host) {
  return new Promise(async (resolve) => {
    let statusCode = 200;

    try {
      let res = await _httpClient(host);
      statusCode = res.statusCode;
    } catch (error) {
      console.error(error);
      statusCode = 500;
    }

    resolve(statusCode <= 299);
  });
};

function startServerCheckingLoop() {
  setInterval(async () => {
    let mainServerIsHealthy = await _probeServer(`${MAIN_SERVER.baseUrl}${MAIN_SERVER.probingPath}`);

    if (mainServerIsHealthy) {
      CURRENT_SB_SERVER_URL = MAIN_SERVER.baseUrl;
    } else {
      let mirrorsHealth = await Promise.all(MIRRORS.map(MIRROR => _probeServer(`${MIRROR.baseUrl}${MIRROR.probingPath}`)));

      let firstHealthyMirrorIndex = mirrorsHealth.indexOf(true);
      if (firstHealthyMirrorIndex !== -1) {
        CURRENT_SB_SERVER_URL = MIRRORS[firstHealthyMirrorIndex].baseUrl;
      }
    }

    console.log(CURRENT_SB_SERVER_URL);
  }, CHEKING_LOOP_SLEEP);
};

function startPorxyServer() {
  http.createServer((req, res) => {
    if (req.url === '/current') {
      res.end(CURRENT_SB_SERVER_URL);
    } else {
      proxy.web(req, res, {
        changeOrigin: true,
        secure: true,
        target: CURRENT_SB_SERVER_URL
      });
    }
  }).listen(4480);
};

startPorxyServer();
startServerCheckingLoop();
