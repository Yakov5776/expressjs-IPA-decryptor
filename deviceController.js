const { exec, execSync, spawn } = require('child_process');
const util = require('util');
const webhook = require('./webhooks.js');
const Client = require('ssh2').Client;
const execute = util.promisify(exec);
var deviceList = [];
var iproxyList = [];
let ClientSshPort = 2222;

const getConnectedDevices = async () => {
  try {
    const { stdout, stderr } = await execute('idevice_id -l');

    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
      throw new Error(stderr);
    }

    let devices = stdout.trim().split('\n');
    if (devices.length === 1 && devices[0] === '') {
      devices = [];
    } else {
      devices = await Promise.all(devices.map(async (id) => ({
        id,
        status: 'uninitialized',
        isJailbroken: await isJailbroken(id),
        ssh: await getSsh(id)
      })));
    }

    return devices;
  } catch (error) {
    console.error(`Error executing command: ${error}`);
    throw error;
  }
};

const reloadDevices = async function() {
    deviceList = await getConnectedDevices();
    await routineDeviceCheck();
}

const getDevices = function() {
    return deviceList;
}

const isJailbroken = async function(id) {
  try {
    const output = execSync(`ideviceinstaller -u ${id} -l -o list_system`);
    return output.includes('Cydia');
  } catch {
    return false;
  }
};

const getSsh = async function(id) {
  if (!iproxyList[id]) await setupSsh(id)
  return iproxyList[id];
}

const setupSsh = async function(id) {
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
      username: process.env.SSH_OVERRIDE_USERNAME || 'root',
      password: process.env.SSH_OVERRIDE_PASSWORD || 'alpine',
    };

    conn.on('ready', () => {
      device.status = 'ready';
      device.isJailbroken = true;
      conn.end();
    });
  
    conn.on('error', () => {
      if (device.status != 'offline')
      {
        device.status = 'offline';
        device.isJailbroken = false;
        webhook.sendWebhook(`[${device.id}]: Device is offline or not jailbroken! go to http://${process.env.HOST}/device/${device.id}/start-jailbreak when your device is in DFU mode.`);
      }
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

const enterRecovery = async(id) => await execute(`ideviceenterrecovery ${id}`);

module.exports = {
  getDevices,
  reloadDevices,
  routineDeviceCheck,
  performJailbreak,
  enterRecovery
};