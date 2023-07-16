const fs = require('fs');
const https = require('https');

const download = async function() {
    const architecture = process.arch;
    let downloadUrl;

    if (fs.existsSync('checkra1n')) return;
    if (process.platform !== 'linux') console.error('You\'re running on an Unsupported Platform!');
  
    switch (architecture)
    {
        case 'ia32':
        case 'x32':
            downloadUrl = "https://assets.checkra.in/downloads/linux/cli/i486/77779d897bf06021824de50f08497a76878c6d9e35db7a9c82545506ceae217e/checkra1n"
            break;
        case 'x64':
            downloadUrl = "https://assets.checkra.in/downloads/linux/cli/x86_64/dac9968939ea6e6bfbdedeb41d7e2579c4711dc2c5083f91dced66ca397dc51d/checkra1n"
            break;
        case 'arm':
            downloadUrl = "https://assets.checkra.in/downloads/linux/cli/arm/ff05dfb32834c03b88346509aec5ca9916db98de3019adf4201a2a6efe31e9f5/checkra1n";
            break;
        case 'arm64':
            downloadUrl = "https://assets.checkra.in/downloads/linux/cli/arm64/43019a573ab1c866fe88edb1f2dd5bb38b0caf135533ee0d6e3ed720256b89d0/checkra1n";
            break;
        default:
            console.error(`Unsupported architecture: ${architecture}`);
            return;
    }
  
    const file = fs.createWriteStream('checkra1n');
  
    https.get(downloadUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Checkra1n downloaded successfully!');
      });
    }).on('error', (err) => {
      fs.unlink('checkra1n', () => {
        console.error('Failed to download checkra1n: ', err);
      });
    });
}

module.exports = {download};