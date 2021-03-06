<?php
/**
 * The Template for displaying all single posts
 *
 * @package WordPress
 * @subpackage Twenty_Twelve
 * @since Twenty Twelve 1.0
 */

get_template_part( 'header', 'projects' ); ?>

	<div id="primary" class="site-content projects">
		<div id="content" role="main">

			<?php while ( have_posts() ) : the_post(); ?>
			<?php 
				$subtext = get_field('subtext');
				$projectColor = get_field('custom_color');
				$projectAnchors = get_field('project_anchors');
			?>
				<section class="projectNav">
					<section class="navContainer">
						<h1 class="entry-title"><?php the_title(); ?></h1>
						<?php if ($subtext): ?>
							<h2><?php echo $subtext; ?></h2>
						<?php endif ?>
						<?php if(isset($projectAnchors) && $projectAnchors != 0): ?>
							<ul>
								<?php foreach($projectAnchors as $anchor): ?>
									<li><a style="color: <?php echo $projectColor ?>;" href="#<?php echo $anchor['project_anchor']; ?>"><?php echo $anchor['project_anchor']; ?></a></li>
								<?php endforeach ?>
							</ul>
						<?php endif ?>
					</section>
				</section>

				<section class="projectNavFixed">
					<section class="navContainer">
						<h1 class="entry-title"><?php the_title(); ?></h1>
						<?php if ($subtext): ?>
							<h2><?php echo $subtext; ?></h2>
						<?php endif ?>
						<?php if(isset($projectAnchors) && $projectAnchors != 0): ?>
							<ul>
								<?php foreach($projectAnchors as $anchor): ?>
									<li><a style="color: <?php echo $projectColor ?>;" href="#<?php echo $anchor['project_anchor']; ?>"><?php echo $anchor['project_anchor']; ?></a></li>
								<?php endforeach ?>
							</ul>
						<?php endif ?>
					</section>
				</section>

				<article id="post-<?php the_ID(); ?>" class="projectDescription">
					<div class="entry-content">
						<?php the_content(); ?>
						<?php wp_link_pages( array( 'before' => '<div class="page-links">' . __( 'Pages:', 'twentytwelve' ), 'after' => '</div>' ) ); ?>
					</div><!-- .entry-content -->
					<footer class="entry-meta">
						<?php edit_post_link( __( 'Edit', 'twentytwelve' ), '<span class="edit-link">', '</span>' ); ?>
					</footer><!-- .entry-meta -->
				</article><!-- #post -->

				<nav class="nav-single">
					<span class="nav-previous"><?php previous_post_link( '%link', '<span class="meta-nav">' . _x( '&larr;', 'Previous post link', 'twentytwelve' ) . '</span>' ); ?></span>
					<span class="nav-next"><?php next_post_link( '%link', '<span class="meta-nav">' . _x( '&rarr;', 'Next post link', 'twentytwelve' ) . '</span>' ); ?></span>
				</nav><!-- .nav-single -->

				<?php comments_template( '', true ); ?>

			<?php endwhile; // end of the loop. ?>

		</div><!-- #content -->
	</div><!-- #primary -->

<?php get_sidebar(); ?>
<?php get_footer(); ?>