const express = require('express');
const dotenv = require('dotenv');
const git = require('git-rev-sync');
const path = require('path');
const { UseAuthentication } = require('./middleware.js'); 
const deviceController = require('./deviceController.js');


dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  try {
    const commitHash = git.long();
    res.json({ status: 'Service is OK!', version: commitHash });
  } catch (err) {
    console.error('Error retrieving commit hash:', err);
    res.json({ status: 'Service is OK!' });
  }
});

app.use(express.static(path.join(__dirname, 'static')));

app.use(UseAuthentication);

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

app.get('/device/:uuid/start-jailbreak', async (req, res) => {
  const { uuid } = req.params;
  deviceController.performJailbreak(uuid)
    .then(() => {
      res.json({ status: 'completed'});
    })
    .catch((err) => {
      res.status(500).json({ status: 'failed', error: err.message});
    });
});

app.get('/get-connected-devices', async (req, res) => {
  res.json({"devices": deviceController.getDevices()});
});

app.get('/reload-devices', async (req, res) => {
  await deviceController.reloadDevices();
  res.json({ status: 'completed'});
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

(async () =>
{
  await deviceController.reloadDevices();
})();