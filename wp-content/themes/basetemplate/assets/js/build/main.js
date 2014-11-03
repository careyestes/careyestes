jQuery(document).ready(function($) {
  var url = objectUrl.themeUrl;
	$( ".supersearch-button" ).click(function() {
		$('.supersearchOverlay').fadeIn('fast');
	});
	$('.searchCloseButton').click(function() {
		$('.supersearchOverlay').fadeOut('fast');
	});
  var countries = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('title'),
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  limit: 10,
  prefetch: {
    // url points to a json file that contains an array of country names, see
    // https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
    url: 'data/search.json',
    // the json file contains an array of strings, but the Bloodhound
    // suggestion engine expects JavaScript objects so this converts all of
    // those strings
    filter: function(list) {
      return $.map(list, function(country) { return { name: country }; });
    }
  }
});

// kicks off the loading/processing of `local` and `prefetch`
countries.initialize();

// passing in `null` for the `options` arguments will result in the default
// options being used
$('.supersearch').typeahead(null, {
  name: 'countries',
  displayKey: 'title',
  // `ttAdapter` wraps the suggestion engine in an adapter that
  // is compatible with the typeahead jQuery plugin
  source: countries.ttAdapter()
});
});