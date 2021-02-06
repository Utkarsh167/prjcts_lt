<?php
require_once '../../config/config.php';
require_once 'headers/headers_post.php';

// get posted data
$check_record = json_decode(file_get_contents("php://input"));
$db = getDbInstance();

$cols = Array ('area_id','area_name');
$db->where('location_id', $check_record->location_id);
$area = $db->get("area", null, $cols);

$cols = Array ('survey_id','survey_name');
$db->where('location_id', $check_record->location_id);
$db->where('status', 'active');
$survey = $db->get("survey", null, $cols);



$r = array("area_list"=>$area,"survey_list"=>$survey);

/* if(sizeof($r->area_list)>=1 || sizeof($r->survey_list)>=1){

} */

echo json_encode($r);

/* if ($db->count >0)
    {
    	foreach ($row as $r) { 
        	echo json_encode(array("success"=>"true","data" => array($r)));
    	}
    }
else
    {
    	echo json_encode(array("success"=>"false","message" => "No Campaign"));
    } */


?>