<?php 

add_action('init', 'projects_post_type');
function projects_post_type() {
        $labels = array(
        'name' => 'Projects',
        'singular_name' => 'Project',
        'menu_name' => 'Projects',
        'add_new' => 'Add New Project',
        'add_new_item' => 'Add New Project',
        'edit' => 'Edit',
        'edit_item' => 'Edit Project',
        'new_item' => 'New Project',
        'view' => 'View Project',
        'view_item' => 'View Project',
        'search_items' => 'Search Projects',
        'not_found' => 'No Projects Found',
        'not_found_in_trash' => 'No Projects Found in Trash',
        'parent' => 'Parent Project',
        );
        // Create an array for the $args
        $args = array( 'labels' => $labels, 
                'public' => true,
                'publicly_queryable' => true,
                'exclude_from_search' => false,
                'show_ui' => true, 
                'query_var' => true,
                'rewrite' => array('slug'=>'projects','with_front'=>true),
                'capability_type' => 'post',
                'hierarchical' => false,
                'menu_position' => 20,
                'supports' => array('title', 'excerpt', 'editor', 'thumbnail'),
        );

        register_post_type( 'ce_projects', $args );
        flush_rewrite_rules();
}


?>