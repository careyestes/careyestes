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
		<div class="footerLogo">
			<img class="carey-estes-logo" src="<?php echo get_template_directory_uri() ?>/assets/images/carey-estes-logo.svg" alt="Carey Estes Logo">
		</div>
		<div class="copyright">
			&copy; <?php echo date('Y'); ?> Carey Estes | <a href="mailto:carey@careyestes.com">carey@careyestes.com</a>
		</div>
		<div class="contactInfo">
		  Contact me for design/development/consultation/puns/other
		</div>
		<div class="site-info">
			<p>I built this. Everything on this site is mine unless otherwise noted. Is this built for &lt;IE9? No. Can I? Sure. Why did I not? In the words of RATM...It has to start somewhere, it has to start sometime...What better place than here? What better time than now?</p>
		</div><!-- .site-info -->
	</footer><!-- #colophon -->
</div><!-- #page -->

<!-- Analytics -->
<script type="text/javascript">
var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
</script>
<script type="text/javascript">
try {
var pageTracker = _gat._getTracker("UA-15499148-1");
pageTracker._trackPageview();
} catch(err) {}</script>

<?php wp_footer(); ?>
</body>
</html>