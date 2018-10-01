// App Modules
var http = require('http');
var https = require('https');
var fs = require('fs');

// User passed variables
var ingestion_host = process.env.HOST:
var ingestion_path = process.env.PATH;
var success_messages = process.env.FILTER.split('|');

// Create Fallback directory if it does not exist
if (!fs.existsSync('/blocks')){
  fs.mkdirSync('/blocks');
}

// RPC Callback forwarding server
var server = http.createServer( function(req, res) {
  if (req.method == 'POST') {
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        var block = JSON.parse(body);
        var blockparsed = JSON.parse(block.block.replace('\n',''));
        block['block'] = blockparsed;
        sendblock(block);
    });
  }
});

// Attempt a block send
function sendblock(block){
  try {
    console.log('Sending block ' + block.hash);
    var post_req  = null,
        post_data = JSON.stringify(block);
    var post_opts = {
        hostname: ingestion_host,
        port    : 443,
        path    : ingestion_path,
        method  : 'POST',
        headers : {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Content-Length': post_data.length
        }
    };
    var post_resp = '';
    post_req = https.request(post_opts, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        post_resp += chunk;
      });
      res.on('end', function () {
        console.log(post_resp);
        // Reference success codes array fallback on failure
        if ( success_messages.indexOf(post_resp) <= -1){
          writeblock(block);
        }
      });
    });
    // Fallback on general post error
    post_req.on('error', function(error) {
      console.log(error.message);
      writeblock(block);
    });
    post_req.write(post_data);
    post_req.end();
  }
  // Fallback on unknown error
  catch(error){
    console.log(error);
    writeblock(block);
  }
}

// Fallback write block to disk for manual post processing
function writeblock(block){
  try {
    fs.writeFile('/blocks/' + block.hash, JSON.stringify(block), function(error) {
      if(error) {
        console.log(error);
        console.log(block);
      }
      console.log('Fallback to disk for block ' + block.hash);
    });
  }
  // Fallback failed verbose as possible message
  catch(error){
    console.log(error);
    console.log(block);
  }
}

// Listen for RPC callbacks on port 3000
server.listen(3000);
