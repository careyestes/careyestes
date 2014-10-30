jQuery(document).ready(function($) {
	$( ".supersearch-button" ).click(function() {
		$('.supersearchOverlay').fadeIn('fast');
	});
	$('.searchCloseButton').click(function() {
		$('.supersearchOverlay').fadeOut('fast');
	});
});