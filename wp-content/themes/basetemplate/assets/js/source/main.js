jQuery(document).ready(function($) {
  var url = objectUrl.themeUrl;
  // Init Typeahead
  var searchContent = new Bloodhound({
      datumTokenizer: function (d) { 
          return Bloodhound.tokenizers.whitespace(d.content);
        },
        limit: 5,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        prefetch: {
            url: url+'/assets/json/supersearch.json',
            ttl: 1
        }
    });

  searchContent.initialize();

  var superSearch = $('.supersearch').typeahead({
    highlight: true
  },
  {
    name: 'superSearchContent',
    displayKey: 'title',
    source: searchContent.ttAdapter(),
    templates: {
      suggestion: Handlebars.compile('<a href="{{link}}" class="projectListItem"><span>{{title}}</span></a>')
    }
  });

  // Add modal for supersearch
  $( ".supersearch-button" ).click(function() {
    $('.supersearchOverlay').fadeIn('fast');
    $('.supersearch').focus();
  });
  $('.searchCloseButton').click(function() {
    $('.supersearchOverlay').fadeOut('fast');
  });
  // Add hover state for homepage tiles
  $('.projectTile').hover(function() {
    var thisId = $(this).attr('class').split(' ').pop();
    $('#'+thisId).fadeIn('fast');
  }, function() {
    var thisId = $(this).attr('class').split(' ').pop();
    $('#'+thisId).fadeOut('fast');
  });
  // Add sticky header on scroll
  $('.pageNav').waypoint(function() {
    if ($(".stickyLogoHeader").is(":hidden")) {
      $(".stickyLogoHeader").slideDown(100);
    } else {
          $(".stickyLogoHeader").slideUp(100);
      }
  });
});