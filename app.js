const axios = require("axios");
const CryptoJS = require("crypto-js");

let now = new Date();
let timestamp = Math.floor(now.getTime() / 1000) - 30;

function sign(str, secret) {
  const hash = CryptoJS.HmacSHA256(str, secret);
  return hash.toString(CryptoJS.enc.Base64);
}

function buildPayload(ts, method, requestPath, body) {
  return `${ts}${method}${requestPath}${body}`;
}

const strToSign = buildPayload(
  Math.floor(Date.now() / 1000),
  "GET", // Alterar para o tipo de rota HTTP
  "/v1/portfolios", // Alterar para a rota desejada
  "" // Alterar para o corpo da requisição, caso necessário
);

const sig = sign(strToSign, `${process.env.SECRET_KEY}`);

const config = {
  method: "get", // Alterar para o tipo de rota HTTP
  maxBodyLength: Infinity,
  url: `${process.env.API_URL}/v1/portfolios`, // Alterar para a rota desejada
  headers: {
    "Content-Type": "application/json",
    "X-CB-ACCESS-KEY": `${process.env.API_KEY}`,
    "X-CB-ACCESS-PASSPHRASE": `${process.env.PASSPHRASE}`,
    "X-CB-ACCESS-SIGNATURE": sig.toString(),
    "X-CB-ACCESS-TIMESTAMP": timestamp.toString(),
  },
};

axios
  .request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log("error ->", error.response.data.message);
  });
