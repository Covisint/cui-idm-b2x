'use strict';

var c = cui.idm();

// -------------------------------------
var arg2 = {};
arg2.some = 'some';
arg2.thing = 'thing';

function cb1(args) {
	// NB 'args' are the same arg(s) passed to orig invoking fn
	// 'this' is the 'context' explicitly specified inside arg obj passed to orig invoke
	cui.log('cb1', this, args);
}

c.sayDeferred('red', cb1, ['arg1', arg2])
	.then(function(args) {
		cui.log('red then', this, args);
	})
	.done(function(args) {
		cui.log('red done', this, args);
	})
	.fail(function(args) {
		cui.log('red fail', this, args);
	});

c.sayDeferred('fail', cb1, ['arg1', arg2])
	.then(function(args) {
		cui.log('fail then', this, args);
	})
	.done(function(args) {
		cui.log('fail done', this, args);
	})
	.fail(function(args) {
		cui.log('fail fail', this, args);
	});

c.sayDeferred('white', null, ['arg1', arg2])
	.then(function(args) {
		cui.log('white then', this, args);
	})
	.done(function(args) {
		cui.log('white done', this, args);
	})
	.fail(function(args) {
		cui.log('white fail', this, args);
	});

c.sayDeferredConfig({
	//message: 'blue', 
	callback: cb1, 
	context: ['arg1', arg2]
	})
	.then(function(args) {
		cui.log('blue then', this, args);
	})
	.done(function(args) {
		cui.log('blue done', this, args);
	})
	.fail(function(args) {
		cui.log('blue fail', this, args);
	});
// --------------

function sayOne() {
	function cb(args) {
		cui.log('1cb', this);
	}
  return c.sayDeferredConfig({
  	message: 'say one',
  	callback: cb,
  	context: 'one'
  });
}
function sayTwo() {
	function cb(args) {
		cui.log('2cb', this);
	}
  return c.sayDeferredConfig({
  	message: 'say two',
  	callback: cb,
  	context: 'two'
  });
}

$.when(
  sayOne(),
  sayTwo()
).then(function() {
	cui.log('when then');
}).done(function() {
	cui.log('when done');
}).fail(function() {
	cui.log('when failed');
});
// --------------