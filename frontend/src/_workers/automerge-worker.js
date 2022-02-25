onmessage = function (callback) {
  console.log('1');
  console.log('1');
  console.log('1');
  console.log('1');
  console.log('1');
  console.log('1');
  console.log('1');
  console.log('1');
  console.log('1');
  // callback();
  console.log('2');
  console.log('2');
  console.log('2');
  console.log('2');
  console.log('2');
  console.log('2');
  console.log('2');
  console.log('2');
  console.log('2');
  console.log('2');
};

onerror = function (error) {
  console.log('Worker error: ' + error.message + '\n');
  throw error;
};
