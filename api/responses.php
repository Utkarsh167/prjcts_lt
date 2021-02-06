<?php
require_once '../../config/config.php';
require_once 'headers/headers_post.php';

//error_reporting(E_ALL); 
//ini_set('display_errors', 1); 

// get posted data
$check_record = json_decode(file_get_contents("php://input"));
$db = getDbInstance();

date_default_timezone_set('Asia/Calcutta');

$db->where("respondent_id", $check_record->user_id);
$users = $db->getOne ("respondents");
$respondent_id;


if($users)
{
	// respondent found do nothing
	$respondent_id = $users['respondent_id'];
}

else{
	$db->where("emp_id", $check_record->user_id);
	$users = $db->getOne ("emp_list");

	$respondent_data = array('user_id' => $users['emp_id'], 'user_name'=>$users['emp_name'], 'user_email'=> $users['emp_email'], 'created_at'=>date('Y-m-d H:i:s'));

	$users = $db->insert('respondents', $respondent_data);
	$respondent_id = $users;
}


/*$respondent_id = "1399615";
$category ="";
$subcategory ="";
$issue ="";
$option ="";
$multi_option = ""; 
$rating = 1;
$comment = "";
$survey_id=29;
$tablet_uuid = "77e93847d87db2e2";
$folloup_question_id ="";

$data = Array ("category" => $category,
               "subcategory" => $subcategory,
               "issue" => $issue,
               "options" => $option,
               "multi_option" => $multi_option,
               "rating" => $rating,
               "comment" => $comment,
               "respondent_id" =>$respondent_id,
               "survey_id" =>$survey_id,
               "created_at" => date('Y-m-d H:i:s'),
               "tablet_uuid" => $tablet_uuid,
               "followup_question_id"=>$folloup_question_id
);*/



$data = Array ("category" => $check_record->category,
               "subcategory" => $check_record->subcategory,
               "issue" => $check_record->issue,
               "options" => $check_record->option,
               "multi_option" => $check_record->multi_option,
               "rating" => $check_record->rating,
               "comment" => $check_record->comment,
               "respondent_id" =>$respondent_id,
               "survey_id" =>$check_record->survey_id,
               "created_at" => date('Y-m-d H:i:s'),
               "tablet_uuid" => $check_record->tablet_uuid,
               "followup_question_id"=>$check_record->folloup_question_id
);

///var_dump($data);
//echo json_encode(array("data" => $data));

$id = $db->insert ('responses', $data);

if($id)
{
	$data_to_update = array('survey_id' => $check_record->survey_id);
	$db->where('respondent_id', $respondent_id);
	$db->update('respondents', $data_to_update);

	echo json_encode(array("success"=>"true","message" => "Response Created Successfully"));
}
else{
	echo json_encode(array("success"=>"false","message" => $db->getLastError()));
}


?>