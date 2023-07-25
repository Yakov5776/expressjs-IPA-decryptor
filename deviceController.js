const { exec, execSync, spawn } = require('child_process');
const webhook = require('./webhooks.js');
const Client = require('ssh2').Client;
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
          else devices = devices.map(id => ({ id, status: 'uninitialized', isJailbroken: isJailbroken(id), ssh: getSsh(id)}));
          resolve(devices);
        }
      });
    });
};

const reloadDevices = async function() {
    deviceList = await getConnectedDevices();
    await routineDeviceCheck();
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
  const iproxy = spawn('iproxy', [port, 22, '-u', id]); // if you're having problems with iproxy, try omitting '-u'
  iproxyList[id] = {iproxy_pid: iproxy.pid, port: port};
}

const routineDeviceCheck = function() {
  for (const device of deviceList)
  {
    const conn = new Client();
    const port = device.ssh.port;

    const connectionParams = {
      host: '127.0.0.1',
      port,
      username: process.env.ssh_override_username || 'root',
      password: process.env.ssh_override_username || 'alpine',
    };

    conn.on('ready', () => {
      device.status = 'ready';
      device.isJailbroken = true;
      conn.end();
    });
  
    conn.on('error', (err) => {
      device.status = 'offline';
      device.isJailbroken = false;
      webhook.sendWebhook(`[${device.id}]: Device is offline or not jailbroken! go to http://${process.env.HOST}/device/${device.id}/start-jailbreak when your device is in DFU mode.`);
    });

    conn.connect(connectionParams);
  }
}

const performJailbreak = async(id) =>
{
  // TODO
  return new Promise((resolve, reject) => {
    resolve();
  })
}

module.exports = {
  getDevices,
  reloadDevices,
  routineDeviceCheck,
  performJailbreak
};