const express = require('express');
const app = express();

const options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now());
  }
};

app.use(express.static('public', options));
app.get('/', function (req, res) {
  res.send('hello world');
});
const port = process.env.PORT || 3001;
app.listen(port, function () {
  console.log('Express server listening on port ' + port);
});
