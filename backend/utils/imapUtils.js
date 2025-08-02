
// utils/imapUtils.js
function buildXOAuth2(email, accessToken) {
  return Buffer.from(
    `user=${email}\u0001auth=Bearer ${accessToken}\u0001\u0001`
  ).toString('base64');
}

module.exports = { buildXOAuth2 };
