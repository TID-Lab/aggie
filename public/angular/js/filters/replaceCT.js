angular.module('Aggie')
// Facebook is the source. Crowdtangle is the API fetching content from Facebook. 
// Frontend users only concerned with the source(Facebook). 
// replaceCT replaces frontend references to Crowdtangle with Facebook.
.filter('replaceCT', function() {
  return function(string) {
    if (!string) return;
    if (string === 'crowdtangle') {
      return 'facebook';
    } else {
      return string;
    }
  };
});
