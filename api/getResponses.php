<?php

error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

$search_string = filter_input(INPUT_GET, 'search_string');
$filter_col = filter_input(INPUT_GET, 'filter_col');
$order_by = filter_input(INPUT_GET, 'order_by');
$page = filter_input(INPUT_GET, 'page');

if(isset($_GET['survey_id']) || isset($_GET['date']))
{
$db = getDbInstance();
$current_date = null;
$selected_survey_id = null;
$result;
$pagelimit = 10;

if ($page == "") {
    $page = 1;
}
// If filter types are not selected we show latest added data first
if ($filter_col == "") {
    $filter_col = "response_id";
}
if ($order_by == "") {
    $order_by = "desc";
}

if(isset($_GET['survey_id']))
{
    $selected_survey_id = $_GET['survey_id'];
    //$current_date = date("Y-m-d");
}
else if(isset($_GET['date']))
{
    if($_GET['selected_survey_id'])
    {
       $selected_survey_id = $_GET['selected_survey_id']; 
    }
    $current_date = $_GET['date'];
}

$select = array('response_id','category', 'subcategory', 'issue', 'options', 'rating', 'comment', 'created_at', 'respondent_id', 'survey_id', 'multi_option', 'tablet_uuid');

// If user searches 
if ($search_string) {
    $db->where('response_id', '%' . $search_string . '%', 'like');
    $db->orwhere('category', '%' . $search_string . '%', 'like');
    $db->orwhere('subcategory','%'.$search_string.'%','like');
    $db->orwhere('issue', '%'.$search_string.'%','like');
    $db->orwhere('options', '%'.$search_string.'%','like');
    $db->orwhere('rating', '%'.$search_string.'%','like');
    $db->orwhere('created_at', '%'.$search_string.'%','like');
}

if ($order_by) {
    $db->orderBy($filter_col, $order_by);
}

if($current_date!=null)
{
    if($selected_survey_id === "")
    {
        $selected_survey_id=0;
    }
    else{
        $db->pageLimit = $pagelimit;
        $db->where('survey_id', $selected_survey_id);
        $result = $db->arraybuilder()->paginate("responses", $page, $select);
    }
}
else{
    if($selected_survey_id === "")
    {
        $selected_survey_id=0;
    }
    else{
        $db->pageLimit = $pagelimit;
        $db->where('survey_id', $selected_survey_id);
        $db->where('created_at', '%'.$current_date.'%','like');
        $result = $db->arraybuilder()->paginate("responses", $page, $select);
    }
}

$a = array(); $returnArr = array();
foreach ($result as $key => $value) {

    $cols = Array ("user_name");
    $db->where("respondent_id", $value['respondent_id']);
    $user = $db->getOne("respondents", null, $cols);

    $a['name'] = $user['user_name'];
    $a['created_at'] = $value['created_at'];
    $a['rating'] = $value['rating'];
    $a['comment'] = $value['comment'];

    $cols = Array('area_id');
    $db->where('uuid', $value['tablet_uuid']);
    $tablet = $db->getOne("tablets", null, $cols);

    $cols = Array('area_name');
    $db->where('area_id',$tablet['area_id']);
    $area = $db->getOne('area', null, $cols);

    $a['areaName'] = $area['area_name'];

    $cols = array('survey_name', 'location_id');
    $db->where('survey_id', $value['survey_id']);
    $survey = $db->getOne('survey', null, $cols);
    //echo $survey['survey_name'];

    $a['surveyName'] = $survey['survey_name'];

    $cols = array('name');
    $db->where('id', $survey['location_id']);
    $location = $db->getOne('location', null, $cols);
    $a['locationName']=  $location['name'];
    $a['multiOption'] = $value['multi_option'];

    array_push($returnArr, $a);
}

echo json_encode($returnArr);
}

?>