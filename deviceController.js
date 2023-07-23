const { exec, execSync, spawn } = require('child_process');
var deviceList = [];
var iproxyList = [];
let ClientSshPort = 2222;

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
          else devices = devices.map(id => ({ id, status: 'ready', isJailbroken: isJailbroken(id), ssh: getSsh(id)}));
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

const isJailbroken = function(id) {
  try {
    const output = execSync(`ideviceinstaller -u ${id} -l -o list_system`);
    return output.includes('Cydia');
  } catch (error) {
    console.error('Error executing occurred: ', error);
    return false;
  }
};

const getSsh = function(id) {
  if (!iproxyList[id]) setupSsh(id)
  return iproxyList[id];
}

const setupSsh = function(id) {
  const port = ClientSshPort++;
  const iproxy = spawn('iproxy', [port, 22, id]);
  iproxyList[id] = {iproxy_pid: iproxy.pid, port: port};
}

module.exports = { getDevices, reloadDevices };