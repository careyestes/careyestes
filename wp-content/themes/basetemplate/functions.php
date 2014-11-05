<?php

require_once('admin/settings.php');
require_once('admin/enqueueStylesAndScripts.php');
require_once('admin/customizer.php');
require_once('admin/customPostTypes.php');
require_once('admin/customFields.php');

if(!is_admin()) {
	// Get all site content into json
	$searchArray = array();
	$contentArgs = array(
		'post_type' => array('post', 'page', 'ce_projects'),
		'posts_per_page' => -1
	);
	$queryAllContent = get_posts($contentArgs);
	if($queryAllContent) {
		foreach($queryAllContent as $post) {
			setup_postdata( $post );
			$title   = get_the_title();
			$content = $post->post_content;
			$link    = get_the_permalink();
			$content = str_replace("&nbsp;", " ", $content);
			$content = html_entity_decode($content);
			$content = strip_tags($content);
			$content = preg_replace('/[\r\n]+/', " ", $content);
			$content = preg_replace('/[ \t]+/', " ", $content);
			$content = preg_replace("/[^a-z0-9\-!@#$%^&*()_+=.,?]/i", " ", $content);
			$contentArray[] = array('title' => $title, 'content' => $content, 'link' => $link);
			// var_dump($content);
			// echo "<br><br><br>";
		}
	}
// die;
$dir = get_template_directory().'/assets/json';
if ( !file_exists($dir) ) {
	mkdir ($dir, 0744);
}
file_put_contents ($dir.'/supersearch.json', json_encode($contentArray));
}