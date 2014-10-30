<?php get_header(); ?>

	<section id="primary" class="site-content home-content">
		<div id="content" role="main">
		<?php 
		$args = array(
			'post_type'      => 'ce_projects',
			'posts_per_page' => -1,
			'orderby'        => 'menu_order',
			'order'          => 'ASC'
		);
		$projectQuery = new WP_Query($args); ?>
		<?php if($projectQuery->have_posts()): ?>
			<?php while($projectQuery->have_posts()): ?>
				<?php $projectQuery->the_post(); 
					$subtext = get_field('subtext');
				?>
				<a href="<?php the_permalink() ?>">
					<figure>
						<?php the_post_thumbnail() ?>
					</figure>
					<h2><?php the_title(); ?></h2>
					<?php if($subtext): ?>
						<h3><?php echo $subtext ?></h3>
				<?php endif ?>
				</a>
			<?php endwhile ?>
		<?php endif; ?>

		</div><!-- #content -->
	</section><!-- #primary -->

<?php get_sidebar(); ?>
<?php get_footer(); ?>