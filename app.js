const express = require('express');
const dotenv = require('dotenv');
const checkra1n = require('./checkra1n.js');
const deviceController = require('./deviceController.js');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (authHeader === process.env.ACCESS_TOKEN) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'Service is OK!' })
});

app.get('/stream-ipa', async (req, res) => {
  // TODO: find available device
 res.json({ status: 'started', device: 'todo'});
});


app.get('/device/:uuid/', (req, res) => {
  const { uuid } = req.params;
  const devices = deviceController.getDevices();
  const device = devices.find(dev => dev.id === uuid);

  if (device) res.json(device);
  else res.status(400).json({ error: 'device uuid doesn\'t exist' });
});

app.get('/get-connected-devices', async (req, res) => {
  res.json({"devices": deviceController.getDevices()});
});

app.get('/reload-devices', async (req, res) => {
  await deviceController.reloadDevices();
  res.json({ status: 'complete'});
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

(async () =>
{
  await checkra1n.download();
  await deviceController.reloadDevices();
})();