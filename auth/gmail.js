const { google } = require('googleapis');
require('dotenv').config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

function getAuthUrl() {
  const scopes = ['https://mail.google.com/', 'https://www.googleapis.com/auth/userinfo.email'];
  return oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes });
}

async function getTokens(code) {
  const { tokens } = await oAuth2Client.getToken(code);
  return tokens;
}

module.exports = { getAuthUrl, getTokens, oAuth2Client };
