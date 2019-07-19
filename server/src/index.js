const path = require('path');
const express = require('express');
const jayson = require('jayson');
const app = express();
const port = process.env.GLS_FRONTEND_PORT || 3000;

const BUILD_DIR = path.join(__dirname, '../../build');

app.use(express.static(BUILD_DIR));

const blocksClient = jayson.client.http(process.env.GLS_BLOCKS_CONNECT);

function getTransaction(transactionId) {
  return new Promise((resolve, reject) => {
    blocksClient.request('getTransaction', { transactionId }, (err, response) => {
      if (err) {
        reject(err);
      } else if (response.error) {
        reject(response.error);
      } else {
        const transaction = response.result;

        // Это нужно чтобы переместить actions в конец объекта
        const { actions } = transaction;
        delete transaction.actions;
        transaction.actions = actions;

        resolve(transaction);
      }
    });
  });
}

app.get('/trx/:trxId.json', async (req, res) => {
  try {
    const trx = await getTransaction(req.params.trxId);

    res.json(trx);
  } catch (err) {
    if (err.code === 404) {
      res.status(404);
      res.json({
        error: 'Not found',
      });
      return;
    }

    console.error(new Date().toJSON(), 'Transaction fetch failed:', err);

    res.status(500);
    res.json({
      error: 'Internal Server Error',
    });
  }
});

// Отдаем index.html на все запросы за text/html
app.use('/*', (req, res, next) => {
  if (req.method === 'GET' && req.headers.accept.startsWith('text/html')) {
    res.sendFile(path.join(BUILD_DIR, 'index.html'));
  } else {
    next();
  }
});

app.listen(port, err => {
  if (err) {
    console.error('Server start failed:', err);
    process.exit(1);
    return;
  }

  console.log(`Frontend server listening on port ${port}!`);
});
