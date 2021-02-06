<?php
require_once '../../config/config.php';
require_once 'headers/headers_post.php';

// get posted data
$check_record = json_decode(file_get_contents("php://input"));
$db = getDbInstance();

$cols = Array ('survey_id');
$db->where('tablet_id', $check_record->tablet_id);
$survey_id = $db->get("tablets", null, $cols);

$cols = Array ("campaign_id");
$db->where('survey_id', $survey_id['survey_id']);
$campaign_id = $db->get("survey", null, $cols);

$cols = Array ("campaign", "status", "description", "campaign_id");
$db->where('campaign_id', $campaign_id['campaign_id']);
$row = $db->get("campaign", null, $cols);

if ($db->count >0)
    {
    	foreach ($row as $r) { 
        	echo json_encode(array("success"=>"true","data" => array($r)));
    	}
    }
else
    {
    	echo json_encode(array("success"=>"false","message" => "No Campaign"));
    }


?>