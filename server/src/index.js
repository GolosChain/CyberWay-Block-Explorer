const express = require('express');
const app = express();
const port = process.env.GLS_FRONTEND_PORT || 3000;

app.use(express.static('../build'));

app.listen(port, err => {
  if (err) {
    console.error('Server start failed:', err);
    process.exit(1);
    return;
  }

  console.log(`Frontend server listening on port ${port}!`);
});
