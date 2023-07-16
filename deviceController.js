const { exec } = require('child_process');
var deviceList = [];

const getConnectedDevices = async () => {
    return new Promise((resolve, reject) => {
      exec('idevice_id -l', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${error}`);
          reject(error);
        } else if (stderr) {
          console.error(`Command stderr: ${stderr}`);
          reject(stderr);
        } else {
          let devices = stdout.trim().split('\n');
          if (devices.length === 1 && devices[0] === '') devices = [];
          else devices = devices.map(id => ({ id, status: 'ready' }));
          resolve(devices);
        }
      });
    });
};

const reloadDevices = async function() {
    deviceList = await getConnectedDevices();
}

const getDevices = function() {
    return deviceList;
}

module.exports = { getDevices, reloadDevices };