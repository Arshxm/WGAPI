const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

function generatePrivateKey(callback) {
  exec('wg genkey', (error, stdout, stderr) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, stdout.trim());
    }
  });
}

const configs = []; // Store client configurations

app.post('/generate-config', (req, res) => {
  try {
    const { numberOfClients, serverPublicKey, serverIP, allowedIP, dns, endpoint } = req.body;

    if (!numberOfClients || typeof numberOfClients !== 'number' || numberOfClients < 1) {
      return res.status(400).json({ error: 'Invalid number of clients' });
    }

    // Clear existing client configurations
    configs.length = 0;

    const serverIPOctets = serverIP.split('.'); // Split server IP into octets
    if (serverIPOctets.length !== 4) {
      return res.status(400).json({ error: 'Invalid server IP format' });
    }

    let lastOctet = parseInt(serverIPOctets[3]); // Declare lastOctet as a let variable

    const generateConfigForClient = (clientIndex) => {
      if (clientIndex > numberOfClients) {
        // All client configurations generated, send the response
        res.json({ clientConfigs: configs });
        return;
      }

      generatePrivateKey((privateKeyError, privateKey) => {
        if (privateKeyError) {
          return res.status(500).json({ error: 'Private key generation failed' });
        }

        const clientPublicKey = exec(`echo ${privateKey} | wg pubkey`, (error, stdout, stderr) => {
          if (error) {
            return res.status(500).json({ error: 'Public key generation failed' });
          }

          const clientPublicKey = stdout.trim();
          const clientIP = `${serverIPOctets[0]}.${serverIPOctets[1]}.${serverIPOctets[2]}.${lastOctet}/32`;

          const wgConfig = `[Interface]
PrivateKey = ${privateKey}
Address = ${clientIP}
DNS = ${dns}

[Peer]
PublicKey = ${serverPublicKey}
AllowedIPs = ${allowedIP}
Endpoint = ${endpoint}`;

          const updatedClientConfig = {
            clientIndex: clientIndex,
            publicKey: clientPublicKey,
            config: wgConfig,
          };

          configs.push(updatedClientConfig);
          lastOctet++; // Increment the last octet for the next client

          // Generate configuration for the next client
          generateConfigForClient(clientIndex + 1);
        });
      });
    };

    // Start generating configurations for clients
    generateConfigForClient(1);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/download-config/:clientIndex?', (req, res) => {
  try {
    const clientIndex = req.params.clientIndex;

    if (clientIndex) {
      // If a client index is specified, return the configuration for that client
      const clientIndexInt = parseInt(clientIndex);
      if (!isNaN(clientIndexInt) && clientIndexInt > 0 && clientIndexInt <= configs.length) {
        const config = configs[clientIndexInt - 1];
        const configFileName = `wireguard-config-client-${clientIndex}.conf`;

        fs.writeFileSync(configFileName, config.config);

        res.download(configFileName, configFileName, (err) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'File download failed' });
          } else {
            fs.unlinkSync(configFileName);
          }
        });
      } else {
        res.status(404).json({ error: 'Client configuration not found' });
      }
    } else {
      // If no client index is specified, return the entire list of client configurations
      res.json({ clientConfigs: configs });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
