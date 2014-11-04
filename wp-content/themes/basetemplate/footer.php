<?php
/**
 * The template for displaying the footer
 *
 * Contains footer content and the closing of the #main and #page div elements.
 *
 * @package WordPress
 * @subpackage Twenty_Twelve
 * @since Twenty Twelve 1.0
 */
?>
	</div><!-- #main .wrapper -->
	<footer id="colophon" role="contentinfo">
		<div class="site-info">
			Proudly built by your mom.
		</div><!-- .site-info -->
	</footer><!-- #colophon -->
</div><!-- #page -->

<script type="text/javascript">
jQuery(document).ready(function($) {
	var departments = new Bloodhound({
        datumTokenizer: function (d) { return Bloodhound.tokenizers.whitespace(d.title); },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        prefetch: {
          url: 'data/search.json',
          // ttl: 1
          }
        });
        departments.initialize();
        var mapSearch = $('.supersearch').typeahead({
          highlight: true
        },
        {
          name: 'map-buildingName',
          displayKey: 'title',
          source: departments.ttAdapter(),
          templates: {
            suggestion: Handlebars.compile('<div class="buildingsListItem"><a class="buildingsLinkOut">{{title}}</a></div>')
          }
        });
});
</script>

<?php wp_footer(); ?>
</body>
</html>