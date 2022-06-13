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

const offsets = {
  Astro: 42, // DP09278
  Buff: 56, // DP00775
  Corpo: 34, // DP08206
  Cyborg: 46, // DP05128
  DJ: 40, // DP02086
  Dave: 34, // DP09005
  Deity: 29, // DP05980
  Ghost: 30, // DP03456
  "Mad Scientist": 40, // DP06259
  Magic: 36, // DP03876
  Monk: 36, // DP04354
  Ninja: 32, //DP05806
  Redneck: 50, // DP08280
  Stoner: 27, // DP07079
  Viking: 34, // DP03672
};

(async () => {
  const mongoClient = new MongoClient(MONGODB_URL);
  try {
    await mongoClient.connect();
    console.log('Connected to database');

    const app = express();
    app.get('/:derp/:animation', async (req, res) => {
      try {
        const { derp, animation } = req.params;
        if (!derp || !/^DP\d{5}$/.test(derp) || animation !== 'wave.apng') {
          console.log('Something went wrong', derp, animation);
          res.status(404).end();
        }
        const derpId = derp.toUpperCase();

        // Pull derp metadata from database
        const derpMeta = await mongoClient.db('derp').collection('derpMeta').findOne({ derpId });

        // If source file does not exist, pull it from blockfrost
        const outDir = path.join(OUT_DIR, derpId);
        const outFile = path.join(outDir, `${derpId}.png`);
        if (!fs.existsSync(outFile)) {
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

        const { body } = derpMeta;
        const offset = offsets[body];

        // run the script
        const waveAssets = path.join(__dirname, '..', 'assets', 'wave');
        const { stdout, stderr } = await exec(`sh ${WAVE_SH} "${outDir}" "${waveAssets}" ${offset}`);
        console.log(stdout);
        console.error(stderr);

        res.setHeader('content-type', 'image/apng');
        fs.createReadStream(`${outDir}/wave.apng`).pipe(res);
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