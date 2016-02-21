<?php
$file_type_input_name = 'file_to_upload';
$submit_type_input_name = 'submit_file';
$target_dir = 'Images/';

$photo_upload_data;

$file_name = basename($_FILES[ $file_type_input_name ]['name']);
$file_location = $target_dir . $file_name;
$upload_success = true;
$file_type = pathinfo($file_location,PATHINFO_EXTENSION);
$file_size = $_FILES[ $file_type_input_name ]['size'];
$error_msg = '';

// Check if image file is a actual image or fake image
	if(isset($_POST[ $submit_type_input_name ])) {
	    $check = getimagesize($_FILES[ $file_type_input_name ]['tmp_name']);
	    if($check !== false) {
	        $upload_success = true;
	    } else {
	        $error_msg .= 'File is not an image.\n';
	        $upload_success = false;
	    }
	}
// Check file size
	if ($_FILES[ $file_type_input_name ]["size"] > 2000000) {
	    $error_msg .= 'Sorry, your file is too large.\n';
	    $upload_success = false;
	}
// Allow certain file formats
	if($file_type != 'jpg' && $file_type != 'png' && $file_type != 'jpeg' && $file_type != 'gif' ) {
	    $error_msg .= 'Sorry, only JPG, JPEG, PNG & GIF files are allowed.\n';
	    $upload_success = false;
	}
// Check if file already exists. If it does just use the current File instead
	if (file_exists($file_location)) {
	    $error_msg .= 'File already exists. Using existing file instead\n';
	    $upload_success = false;
	}
// Check if $upload_success is set to 0 by an error
	if ($upload_success === false) {
	    $error_msg .= 'Sorry, your file was not uploaded.\n';
	} 
// if everything is ok, try to upload file
	else {
	    if (move_uploaded_file($_FILES[ $file_type_input_name ]['tmp_name'], $file_location)) {
	    	$upload_success = true;
	    }
	    else {
	        $error_msg .= 'Sorry, there was an error uploading your file.';
	        $upload_success = false;
	    }
	}

// send back information about the upload status
	$photo_upload_data["file_name"] = $file_name;
	$photo_upload_data["file_location"] = $file_location;
	$photo_upload_data["upload_success"] = $upload_success;
	$photo_upload_data["file_type"] = $file_type;
	$photo_upload_data["file_size"] = $file_size;
	$photo_upload_data["error_msg"] = $error_msg;

	echo json_encode(array($photo_upload_data, JSON_FORCE_OBJECT));































?>