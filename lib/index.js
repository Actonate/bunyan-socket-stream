var io = require('socket.io-client');
var stream = require('stream');
var util = require('util');
var _ = require('underscore');

function socketStream(opt) {
  opt = opt || {};
  stream.Transform.call(this, opt);

  this._eventName = opt.eventName || 'log';

  if(opt.socket) {
    this.socket = opt.socket;
  }
  else {
    this._host = opt.host || 'localhost';
    this._port = opt.port || 8000;
  
    this.socket = io.connect(util.format('http://%s:%s', this._host, this._port));
  }
}

util.inherits(socketStream, stream.Transform);

socketStream.prototype._buildObj = function(obj) {
  obj = JSON.parse(obj.toString('utf8'));
  var keys = ['hostname', 'level', 'name', 'pid', 'time', 'v'];
  
  return {
    log: _.pick(obj, keys),
    message: obj.msg,
    data: _.omit( obj, keys.concat(['msg']))
  };
};

socketStream.prototype._transform = function (obj, encoding, done) {
  // if (this.socket.connected) {
  //   this.socket.emit(this._eventName, this._buildObj(obj));
  //   this.push(obj);
  //   done();
  // } else {
  //   done(new Error('Failed to connect to socket.'));
  // }
  
  try {
    this.socket.emit(this._eventName, this._buildObj(obj));
  }
  catch(err){
    console.log(err);
  }

  this.push(obj);
  done();
};

module.exports = socketStream;
