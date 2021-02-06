<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

$records = json_decode(file_get_contents("php://input"));
date_default_timezone_set('Asia/Calcutta');
$db = getDbInstance();

$data_workplace = array("workplace_name" => $records->workplace_name, "admin_id" =>$records->admin_id, "created_at"=>date("Y-m-d H:i:s"));
//var_dump($data_workplace);

$d = array('status_id'=>1);
$db->where('client_id', $records->client_id);
$db->update('clients', $d);

$id = $db->insert ('workplace', $data_workplace);
//echo $id;

if($id)
{
	$data_location = array("workplace_id" => $id, "name" =>$records->location_name,
	 "admin_id" =>$records->admin_id,
	"created_at" =>date("Y-m-d H:i:s"));

	$location_id = $db->insert('location', $data_location);

	if($location_id)
	{
		$area_arr = $records->area_list;

		for ($i=0; $i<sizeOf($area_arr); $i++) {
			
			$data_area = array("location_id"=>$location_id,
			 "area_name" => $area_arr[$i]->area_name,
			 "admin_id" =>$records->admin_id,
			 "created_at" =>date("Y-m-d H:i:s"));
			$area_id = $db->insert('area', $data_area);

			if($area_id)
			{

			}
			else{
				echo $db->getLastError();
			}
		}

		echo json_encode(array("success"=>"true","message" => "Workplace Added Successfully"));
	}
	else {
		echo $db->getLastError();
	}
}
else {
	echo $db->getLastError();
}




?>