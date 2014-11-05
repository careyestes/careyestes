<?php

require_once('admin/settings.php');
require_once('admin/enqueueStylesAndScripts.php');
require_once('admin/customizer.php');
require_once('admin/customPostTypes.php');
require_once('admin/customFields.php');

if(!is_admin()) {
	// Get all site content into json
	$searchArray = array();
	$args = array(
		'post_type' => array('post', 'page', 'ce_projects'),
		'posts_per_page' => -1
	);
	$searchQuery = new WP_Query($args);
	if($searchQuery->have_posts()) {
		while($searchQuery->have_posts()) {
			$searchQuery->the_post();
			$theTitle = get_the_title();
			$theContent = get_the_content();
			$searchArray[] = array('title'=> $theTitle, 'content'=> $theContent);
		}
	}
	wp_reset_postdata();
	$jsonFile = json_encode($searchArray);
	file_put_contents('data/search.json', $jsonFile);
}