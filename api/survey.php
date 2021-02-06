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

/*if(isset($check_record->campaign_id))
{
$db->where("campaign_id", $check_record->campaign_id);
$db->where("status","active");
$survey = $db->getOne("survey");
}*/

$categories;
if(strcmp($check_record->identifier,"category")==0)
{
	$cols = Array ("name","category_id");
    $db->where('status', 'enable');
    $categories = $db->get("categories", null, $cols);
}
elseif (strcmp($check_record->identifier, "subcategory")==0) {
	 $cols = Array ("name","subcategory_id");
	 $db->where("category_id", $check_record->category_id);
     $db->where('status', 'enable');
	 $categories = $db->get("subcategory", null, $cols);
}
elseif (strcmp($check_record->identifier, "issues")==0) {
	$cols = Array ("name","issue_id","options");
	$db->where("subcategory_id", $check_record->subcategory_id);
    $db->where('status', 'enable');
	$categories = $db->get("issues", null, $cols);
}
elseif(strcmp($check_record->identifier, "options")==0)
{
	$cols = Array ("name");
	$db->where("issue_id", $check_record->issue_id);
    $db->where('status', 'enable');
	$categories = $db->get("options", null, $cols);
}

if ($db->count >0)
    {
    		echo json_encode(array("success"=>"true","data" => $categories));
    }
else
    {
    	echo json_encode(array("success"=>"false","data" => "No Campaign"));
    }

?>