const path = require('path');
const express = require('express');
const app = express();
const port = process.env.GLS_FRONTEND_PORT || 3000;

const BUILD_DIR = path.join(__dirname, '../../build');

app.use(express.static(BUILD_DIR));

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
