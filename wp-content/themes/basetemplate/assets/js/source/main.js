jQuery(document).ready(function($) {
  var url = objectUrl.themeUrl;
	$( ".supersearch-button" ).click(function() {
		$('.supersearchOverlay').fadeIn('fast');
	});
	$('.searchCloseButton').click(function() {
		$('.supersearchOverlay').fadeOut('fast');
	});
});