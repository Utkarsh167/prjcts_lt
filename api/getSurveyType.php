<?php

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

$check_record = json_decode(file_get_contents("php://input"));

//var_dump($check_record);
//echo $check_record->identifier;
//echo json_encode(array("data" => $check_record->identifier));

$db = getDbInstance();
///$campaign_id = $check_record->identifier;

$survey;

$db->where("campaign_id", $check_record->campaign_id);
$db->where("status","active");
$survey = $db->getOne("survey");

if ($db->count >0)
    {
    	
    	echo json_encode(array("success"=>"true","data" => array($survey)));
    	
    }
else
    {
    	echo json_encode(array("success"=>"false","data" => "No Survey Found"));
    }

?>