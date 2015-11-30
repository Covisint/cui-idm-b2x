
// --------------------------------
// General utilities
// --------------------------------
cui.util = {};

cui.util.hello = function() {
  cui.log('hello util');
};

cui.util.toTitleCase = function(str) {
  return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

cui.util.qs = (function(a) {
	// parse QS for a specified parameter's value
  // called like so:  
  //    var myVar = qs["myParam"];
  
  if (a === '') {
    return {};
  }

  var b = {};
  for (var i = 0; i < a.length; ++i) {
    var p = a[i].split('=');
    if (p.length !== 2) {
        continue;
    }
    b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '));
  }
  return b;
})(window.location.search.substr(1).split('&'));

// --------------------------------




