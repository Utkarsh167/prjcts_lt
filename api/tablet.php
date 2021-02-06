<?php
require_once '../../config/config.php';
require_once 'headers/headers_post.php';

// get posted data
$check_record = json_decode(file_get_contents("php://input"));
$db = getDbInstance();
date_default_timezone_set('Asia/Calcutta');

$tablet_count = $db->get('tablets');

if(sizeof($tablet_count)>=TABLET_COUNT)
{
 echo json_encode(array("success"=>"false","message" => "Can't update more than 18 tablets."));
}
else{
//echo $check_record->tablet_name;
$cols = Array ("uuid");
$db->where("uuid", $check_record->uuid);
$row = $db->get("tablets");

if($db->count >=1)
{
	$data = Array (
				"tablet_name" => $check_record->tablet_name,
               "tablet_location" => $check_record->tablet_location,
               "tablet_area" => $check_record->tablet_area,
               "created_at" => date("Y-m-d H:i:s")
           );
	$db->where('tablet_name', $check_record->tablet_name);
	if($db->update ('tablets', $data))
	{
		echo json_encode(array("success"=>"true","message" => "Tablet updated Successfully"));
	}
	else 
	{
		echo json_encode(array("success"=>"false","message" => "Update Failed"));
	}
}
else{

$password = md5("password");
$data = Array ("tablet_name" => $check_record->tablet_name,
               "location_id" => $check_record->location_id,
               "created_at" => date("Y-m-d H:i:s"),
               "uuid" => $check_record->uuid,
               "password" => $password
);
///var_dump($data);
//echo json_encode(array("data" => $data));
$id = $db->insert ('tablets', $data);

if($id)
{
	echo json_encode(array("success"=>"true","data" => array("tablet_id"=>$id)));
}
else{
	echo json_encode(array("success"=>"false","message" => $db->getLastError()));
}
}
}
?>