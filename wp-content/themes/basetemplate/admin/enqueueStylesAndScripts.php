<?php

function ce_template_scripts_styles() {
	global $wp_styles;
	wp_enqueue_style( 'ce-template-style', get_stylesheet_uri() );
	wp_enqueue_style( 'ce-template-ie', get_template_directory_uri() . '/assets/styles/ie.css', array( 'ce-template-style' ), '20121010' );
	$wp_styles->add_data( 'ce-template-ie', 'conditional', 'lt IE 9' );
	wp_enqueue_script( 'js-plugins', get_template_directory_uri().'/assets/js/plugins.min.js', array('jquery') , '20140801', true );
	wp_enqueue_script( 'js-main', get_template_directory_uri().'/assets/js/main.min.js', array('jquery') , '20140801', true );

}
add_action( 'wp_enqueue_scripts', 'ce_template_scripts_styles' );