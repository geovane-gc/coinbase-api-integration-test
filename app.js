// native NodeJS https module
const https = require("https");
const CryptoJS = require("crypto-js");

const SIGNING_KEY = process.env.SECRET_KEY;
const ACCESS_KEY = process.env.API_KEY;
const PASSPHRASE = process.env.PASSPHRASE;
const REST_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};
const PROD_URL = "api.prime.coinbase.com";

// The path of the API endpoint being called
let requestPath = `/v1/portfolios`;

// The method of the request: GET, POST, PUT, DELETE, etc
let method = REST_METHODS.GET;

const currentTimeInSecs = Math.floor(Date.now() / 1000);

// Body will be JSON (POST) or empty string (GET)
const body = "";

function sign(str, secret) {
  const hash = CryptoJS.HmacSHA256(str, secret);
  return hash.toString(CryptoJS.enc.Base64);
}

function buildPayload(ts, method, requestPath, body) {
  return `${ts}${method}${requestPath}${body}`;
}

const strToSign = buildPayload(currentTimeInSecs, method, requestPath, body);
const sig = sign(strToSign, SIGNING_KEY);
const headers = new Map();
headers.set("X-CB-ACCESS-KEY", ACCESS_KEY);
headers.set("X-CB-ACCESS-PASSPHRASE", PASSPHRASE);
headers.set("X-CB-ACCESS-SIGNATURE", sig);
headers.set("X-CB-ACCESS-TIMESTAMP", currentTimeInSecs);
headers.set("Content-Type", "application/json");
const requestOptions = {
  hostname: PROD_URL,
  path: requestPath,
  method: REST_METHODS.GET,
  headers: Object.fromEntries(headers),
};

https
  .get(requestOptions, (res) => {
    let data = [];
    console.log("Status Code:", res.statusCode);
    res.on("data", (chunk) => {
      data.push(chunk);
    });
    res.on("end", () => {
      console.log("Response ended: ");
      const parsedResponse = JSON.parse(Buffer.concat(data).toString());
      console.log(parsedResponse);
    });
  })
  .on("error", (err) => {
    console.log("Error: ", err.message);
  });
