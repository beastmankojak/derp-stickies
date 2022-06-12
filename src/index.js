const express = require('express');
const { MongoClient } = require('mongodb');
const got = require('got');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);
const child_process = require('child_process');
const exec = promisify(child_process.exec);

const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const OUT_DIR = process.env.OUT_DIR || path.join(__dirname, '..', 'out');
const WAVE_SH = path.join(__dirname, '..', 'bin', 'wave.sh');

(async () => {
  const mongoClient = new MongoClient(MONGODB_URL);
  try {
    await mongoClient.connect();
    console.log('Connected to database');

    const app = express();
    app.get('/:derp/:animation', async (req, res) => {
      try {
        const { derp, animation } = req.params;
        if (!derp || !/^DP\d{5}$/.test(derp) || animation !== 'wave') {
          console.log('Something went wrong', derp, animation);
          res.status(404).end();
        }
        const derpId = derp.toUpperCase();

        // If source file does not exist, pull it from blockfrost
        const outDir = path.join(OUT_DIR, derpId);
        const outFile = path.join(outDir, `${derpId}.png`);
        if (!fs.existsSync(outFile)) {
          const derpMeta = await mongoClient.db('derp').collection('derpMeta').findOne({ derpId });
          const image = (derpMeta?.image || '').replace('ipfs://', '');
          if (!image) {
            console.log('Missing image hash');
            res.status(500).end();
            return;
          }
          await mkdirp(path.join(OUT_DIR, derpId));
          console.log(`Pulling https://ipfs.blockfrost.dev/ipfs/${image}`);
          await pipeline(got.stream(`https://ipfs.blockfrost.dev/ipfs/${image}`), fs.createWriteStream(outFile));
          if (!fs.existsSync(outFile)) {
            console.log('File should have been downloaded but it does not exist');
            res.status(500).end();
          }
        }

        // run the script
        const waveAssets = path.join(__dirname, '..', 'assets', 'wave');
        const { stdout, stderr } = await exec(`sh ${WAVE_SH} "${outDir}" "${waveAssets}"`);
        console.log(stdout);
        console.error(stderr);

        res.setHeader('content-type', 'image/apng');
        fs.createReadStream(`${outDir}/${derpId}-wave.apng`).pipe(res);
      } catch (err) {
        console.log('Error:', err);
        res.status(500).end();
      }
    });

    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}...`);
    });
  } catch (err) {
    console.log('Error:', err);
    process.exit(1);
  }
})();