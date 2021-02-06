<?php

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

// get posted data
$check_record = json_decode(file_get_contents("php://input"));
$db = getDbInstance();


//$db->where('uuid', "77e93847d87db2e2");
$db->where('uuid', $check_record->uuid);
$row = $db->getOne('tablets');

if ($db->count >= 1)
    {
    	echo json_encode(array("success"=>"true","data" => $row));
    	//echo json_encode(array("success"=>"true",array("data" => array($row), "area"=>$area)));
    }
else
    {
    	echo json_encode(array("success"=>"false","message" => "Tablet not found"));
    }
?>