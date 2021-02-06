<?php
require_once '../../config/config.php';
require_once 'headers/headers_post.php';

$db = getDbInstance();
$device_record = json_decode(file_get_contents("php://input"));
date_default_timezone_set('Asia/Calcutta');

//echo $device_record->uuid;

$cols = array('tablet_id');
$db->where('uuid', $device_record->uuid);
$tablet = $db->getOne('tablets');

$tablet_id = $tablet['tablet_id'];

$data = Array (
				"battery_status" => $device_record->battery_status,
               	"tablet_id" => $tablet_id,
               	"created_at" => date("Y-m-d H:i:s")
           );

$id = $db->insert ('device_status', $data);

if($id)
{
	echo json_encode(array("success"=>"true","message" => "Battery Status Success"));
}
else{
   	echo json_encode(array("success"=>"false","message" => $db->getLastError()));
}


?>