<?php

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

$check_record = json_decode(file_get_contents("php://input"));
$db = getDbInstance();

$survey;

$db->where('survey_id', $check_record->survey_id);
$survey=$db->get('survey_options');

if ($db->count >0)
    {
        foreach ($survey as $r) { 
            echo json_encode(array("success"=>"true","data" => array($r)));
        }
    }
else
    {
    	echo json_encode(array("success"=>"false","data" => "No Survey"));
    }

?>