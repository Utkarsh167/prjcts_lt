<?php
require_once '../../config/config.php';
require_once 'headers/headers_post.php';

error_reporting(E_ALL); 
ini_set('display_errors', 1); 

$check_record = json_decode(file_get_contents("php://input"));
$db = getDbInstance();

//$rating = "negative";
//$survey_id = 29;

//$db->where('survey_id', $check_record->survey_id);
//$db->where('survey_id',$survey_id);
//$db->where('rating', $rating);
$db->where('survey_id',$check_record->survey_id);
$db->where('rating', $check_record->rating);
$followup_details = $db->getOne("followup_question"); 

if($followup_details == null){
	$db->where('survey_id',$check_record->survey_id);
	$db->where('rating', 'all');
	$followup_details = $db->getOne("followup_question");
	//var_dump($followup_details);
	if($followup_details == null)
	{
		echo json_encode(array("success"=>"true","data" => null));
	}
	else{
		$db->where('followup_question_id', $followup_details['followup_question_id']);
		$option_array = $db->getOne('survey_options');
		$followup_array = 
		array("followup_question_id"=>$followup_details['followup_question_id'],
			"followup_question"=>$followup_details['followup_question'], 
		"option_1"=>$option_array['option_1'],
		"option_2"=>$option_array['option_2'], "option_3"=>$option_array['option_3'],
		"option_4"=>$option_array['option_4'], "option_5"=>$option_array['option_5'],
		"option_6"=>$option_array['option_6']);
		echo json_encode(array("success"=>"true","data" => $followup_array));
	}
}
else{
	$db->where('followup_question_id', $followup_details['followup_question_id']);
	$option_array = $db->getOne('survey_options');

	//var_dump($option_array);

	$followup_array = 
		array("followup_question_id"=>$followup_details['followup_question_id'],
			"followup_question"=>$followup_details['followup_question'], 
		"option_1"=>$option_array['option_1'],
		"option_2"=>$option_array['option_2'], "option_3"=>$option_array['option_3'],
		"option_4"=>$option_array['option_4'], "option_5"=>$option_array['option_5'],
		"option_6"=>$option_array['option_6']);

	echo json_encode(array("success"=>"true","data" => $followup_array));
}


?>