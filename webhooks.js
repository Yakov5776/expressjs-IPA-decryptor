const https = require('https');

const sendWebhook = function(message) {
    const WEBHOOK_URL = process.env.WEBHOOK_URL
    if (!WEBHOOK_URL) return;
    
    const payload = JSON.stringify({ content: message });
  
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };
  
    const request = https.request(WEBHOOK_URL, requestOptions);
  
    request.on('error', (error) => {
      console.error('Error sending webhook: ', error);
    });
  
    request.write(payload);
    request.end();
}

module.exports = {
    sendWebhook
}