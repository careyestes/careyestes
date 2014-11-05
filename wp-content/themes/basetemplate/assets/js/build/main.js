jQuery(document).ready(function($) {
  var url = objectUrl.themeUrl;
	$( ".supersearch-button" ).click(function() {
		$('.supersearchOverlay').fadeIn('fast');
	});
	$('.searchCloseButton').click(function() {
		$('.supersearchOverlay').fadeOut('fast');
	});

  // var searchTitle = new Bloodhound({
  //   datumTokenizer: function (d) { return Bloodhound.tokenizers.whitespace(d.title); },
  //   queryTokenizer: Bloodhound.tokenizers.whitespace,
  //   prefetch: {
  //     url: 'data/search.json',
  //     // ttl: 1
  //   }
  // });
  var searchContent = new Bloodhound({
    datumTokenizer: function (d) { return Bloodhound.tokenizers.whitespace(d.content); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: {
      url: 'data/search.json',
      // ttl: 1
      }
  });
  // searchTitle.initialize();
  searchContent.initialize();

  var superSearch = $('.supersearch').typeahead({
    highlight: true
  },
  // {
  //   name: 'superSearchTitle',
  //   displayKey: 'title',
  //   source: searchTitle.ttAdapter(),
  //   templates: {
  //     suggestion: Handlebars.compile('<div class="buildingsListItem"><a class="buildingsLinkOut">{{title}}</a></div>')
  //   }
  // },
  {
    name: 'superSearchContent',
    displayKey: 'title',
    source: searchContent.ttAdapter(),
    templates: {
      suggestion: Handlebars.compile('<div class="buildingsListItem"><a class="buildingsLinkOut">{{title}}</a></div>')
    }
  });
});