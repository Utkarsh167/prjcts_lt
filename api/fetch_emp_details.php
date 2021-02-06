<?php

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

// get posted data
$check_record = json_decode(file_get_contents("php://input"));
$db = getDbInstance();
$db->where('emp_id', "$check_record->emp_id");
$row = $db->getOne('emp_list');
if ($db->count >= 1)
    {
    	echo json_encode(array("success"=>"true","data" => array($row)));
    }
else
    {
    	echo json_encode(array("success"=>"false","message" => "Employee Not Found"));
    }
?>