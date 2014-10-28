<?php get_header(); ?>

	<section id="primary" class="site-content home-content">
		<div id="content" role="main">
		<?php if ( have_posts() ) : ?>
			<article>
				Loop with all projects here.
			</article>
		<?php endif; ?>

		</div><!-- #content -->
	</section><!-- #primary -->

<?php get_sidebar(); ?>
<?php get_footer(); ?>