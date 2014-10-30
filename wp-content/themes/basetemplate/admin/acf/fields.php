<?php 

if(function_exists("register_field_group")) {
	register_field_group(array(
	    'id' => 'acf_project_info',
	    'title' => 'Project Info',
	    'fields' => array(
	    	array(
	    		'key' => 'project_subtext',
	    		'label' => 'SubText',
	    		'name' => 'subtext',
	    		'type' => 'text'
		    ),
		    array(
		        'key'           => 'project_background_image',
		        'label'         => __('Image'),
		        'name'          => 'background_image',
		        'type'          => 'image',
		        'instructions'  => __('Select the image for a full screen background.'),
		      ),
		    array(
				'key'          => 'project_custom_color',
				'label'        => 'Project Color',
				'name'         => 'custom_color',
				'type'         => 'color_picker',
				'instructions' => 'Add custom color for project'
		      )
		    ),
		    'location' => array(
		    array(
		        array(
		          'param'    => 'post_type',
		          'operator' => '==',
		          'value'    => 'ce_projects',
		          'order_no' => 0,
		          'group_no' => 0,
		        ),
		      ),
		    ),
		      'options'        => array(
		        'position'       => 'normal',
		        'layout'         => 'default',
		        'hide_on_screen' => array(
		        ),
		      ),
		    'menu_order' => 0,
	));
}

 ?>