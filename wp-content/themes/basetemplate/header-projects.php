<?php 
  $id = get_queried_object_id();
  $thisProjectColor = get_field('custom_color', $id);
?><!DOCTYPE html>
<!--[if IE 7]>
<html class="ie ie7" <?php language_attributes(); ?>>
<![endif]-->
<!--[if IE 8]>
<html class="ie ie8" <?php language_attributes(); ?>>
<![endif]-->
<!--[if !(IE 7) | !(IE 8)  ]><!-->
<html <?php language_attributes(); ?>>
<!--<![endif]-->
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>" />
<meta name="viewport" content="width=device-width" />
<title><?php 	
		wp_title( '|', true, 'right' );
		// Add the blog name.
		bloginfo( 'name' );
		// Add the blog description for the home/front page.
		$site_description = get_bloginfo( 'description', 'display' );
		if ( $site_description && ( is_home() || is_front_page() ) )
			echo " | $site_description";
?></title>
<link rel="profile" href="http://gmpg.org/xfn/11" />
<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />
<link href='http://fonts.googleapis.com/css?family=Anonymous+Pro:400,700' rel='stylesheet' type='text/css'>
<?php // Loads HTML5 JavaScript file to add support for HTML5 elements in older IE versions. ?>
<!--[if lt IE 9]>
<script src="<?php echo get_template_directory_uri(); ?>/js/html5.js" type="text/javascript"></script>
<![endif]-->
<?php wp_head(); ?>
<style type="text/css">
  .projectDescription a {
  	color: <?php echo $thisProjectColor; ?>;
  	
  }
</style>
</head>
<body <?php body_class(); ?>>
<section class="projectStickyHeader" style="border-top: 8px solid <?php echo $thisProjectColor ?>">
  <div class="projectThumb">
  	<?php if($id) {
			echo get_the_post_thumbnail( $id, 'thumbnail');
		} ?>
  </div>
  <div class="stickyLogoHeader">
  	<section class="stickyNav">
  		<button class="supersearch-button"></button>
	  	<a class="carey-estes-sticky-masthead" href="<?php echo esc_url( home_url( '/' ) ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" rel="home">
				<img class="carey-estes-logo-white" src="<?php echo get_template_directory_uri() ?>/assets/images/carey-estes-logo-white.svg" alt="Carey Estes Logo">
			</a>
			<a href="<?php echo home_url() ?>" class="viewAll"></a>
  	</section>
  </div>
</section>
<div id="page" class="hfeed site projectHeader">
	<header class="site-header" role="banner">
		<a class="carey-estes-masthead" href="<?php echo esc_url( home_url( '/' ) ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" rel="home">
			<img class="carey-estes-logo" src="<?php echo get_template_directory_uri() ?>/assets/images/carey-estes-logo.svg" alt="Carey Estes Logo">
			<hgroup>
				<h1 class="site-title"><?php bloginfo( 'name' ); ?></h1>
				<h2 class="site-description"><?php bloginfo( 'description' ); ?></h2>
			</hgroup>
		</a>

		<nav class="main-navigation" role="navigation">
			<div class="pageNav">
				<button class="supersearch-button" >Looking for something specific? </button>
				<a href="<?php echo home_url() ?>" class="viewAll">
					View All Projects
				</a>
			</div>
		</nav>
	</header>
	<section class="supersearchOverlay">
		<div class="searchCloseButton">Close Button</div>
		<div class="supersearchIcon"></div>
		<div class="supersearchContainer">
			<input class="supersearch" type="text" placeholder="Start typing...">
		</div>
	</section>

	<div id="main" class="wrapper">