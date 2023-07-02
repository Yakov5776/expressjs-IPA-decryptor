const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

let dumpInProgress = false;

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
    if (dumpInProgress)
        res.json({ status: 'already_started'});
    else
    {
        StreamIPA();
        res.json({ status: 'started'});
    }
});

app.get('/progress', async (req, res) => {
    res.json({ status: dumpInProgress ? 'pending' : 'complete'});
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

function StreamIPA() {
    return new Promise((resolve, reject) => {
      // TODO
      dumpInProgress = true;
      setTimeout(() => {
        dumpInProgress = false;
        resolve();
      }, 5000);
    });
  }