<?php
require_once '../../config/config.php';
require_once 'headers/headers_post.php';


//echo 'hi';

// get posted data
$check_record = json_decode(file_get_contents("php://input"));
$db = getDbInstance();

//$tablet_id = 12;

$cols = Array ('survey_id');
$db->where('tablet_id', $check_record->tablet_id);
$survey_id = $db->getOne("tablets", null, $cols);

//echo $survey_id['survey_id'];

if($survey_id['survey_id']===0)
{
	echo json_encode(array("success"=>"false","message" => "No Survey"));
	exit();
}
else{

$cols = Array ("survey_name", "survey_id", "welcome_message", "tagline");
$db->where('survey_id', $survey_id['survey_id']);
$row = $db->getOne("survey", null, $cols);
echo json_encode(array("success"=>"true","data" => array($row)));
}

?>

