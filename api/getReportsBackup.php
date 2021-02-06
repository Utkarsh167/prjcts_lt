<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'headers/headers_post.php';
include '../classes/functions.php';  
require_once '../../config/config.php';

$db = getDbInstance();
$functionsList = new FunctionsList();
$active_survey = null;
$selected_survey_id=0;
$selected_tablet_id =null;
$campaign_id;
$responses =0;
$OneStarRating=0;
$TwoStarRating=0;
$ThreeStarRating=0;
$FourStarRating=0;
$FiveStarRating=0;
$no_of_responses =0;
$no_of_respondents =0;
$repeat_respondents=null;
$avg_rating=0;
$total_rating = 0;
$date_array = array();
$selected_location_id = 0;
$a = array();

$tablet_count = $db->get('tablets');

if(isset($_GET['selected_location_id']))
{
  $selected_location_id = $_GET['selected_location_id'];

if(isset($_GET['survey_id']))
{
    if(isset($_GET['area_id']))
    {
      $selected_tablet_id = $_GET['area_id'];
    }
    else{
     
    }
    $survey_id = $_GET['survey_id'];
    $db->where('survey_id', $survey_id);
    $active_survey = $db->getOne('survey');
    $selected_survey_id=  $active_survey['survey_id'];
    $selected_survey_name = $active_survey['survey_name'];
    $selected_location_id =$active_survey['location_id'];
}/*
else {
    $cols= array('survey_id');
    $db->where('status', 'active');
    $active_survey = $db->getOne('survey', null, $cols);
    $selected_survey_id=  $active_survey['survey_id'];
    $selected_survey_name = $active_survey['survey_name'];
    $selected_location_id =$active_survey['location_id'];
}*/
}

// get survey and location list
$db->where('location_id', $selected_location_id);
$survey_list = $db->get('survey');

$location_list = $db->get('location');

// get active survey responses
if($active_survey==null)
{

}
else{
// get overall chart data
$_GET['end_date'] = date('Y-m-d',strtotime("+1 day", strtotime($_GET['end_date'])));

$OneStarRating = $functionsList->CalculateRating($active_survey['survey_id'],1,'OneStarRating','responses', $_GET['start_date'], $_GET['end_date'], $selected_tablet_id);
$TwoStarRating = $functionsList->CalculateRating($active_survey['survey_id'],2,'TwoStarRating','responses',  $_GET['start_date'], $_GET['end_date'], $selected_tablet_id);
$ThreeStarRating = $functionsList->CalculateRating($active_survey['survey_id'],3,'ThreeStarRating','responses',  $_GET['start_date'], $_GET['end_date'], $selected_tablet_id);
$FourStarRating = $functionsList->CalculateRating($active_survey['survey_id'],4,'FourStarRating','responses',$_GET['start_date'], $_GET['end_date'], $selected_tablet_id);
$FiveStarRating = $functionsList->CalculateRating($active_survey['survey_id'],5,'FiveStarRating','responses',$_GET['start_date'], $_GET['end_date'], $selected_tablet_id);

$total_rating = $OneStarRating+$TwoStarRating+$ThreeStarRating+$FourStarRating+$FiveStarRating;

$col = array('area_id', 'uuid');
$listOfAreas = $functionsList->genericFunction($selected_survey_id, 'tablets', $col);

if($total_rating ===0)
{
$total_rating =1;
}


$db->where('survey_id', $selected_survey_id);
$tablet_list= $db->get('tablets');

$areaArr = array();
foreach ($tablet_list as $key => $value) {
	$dummy = array();
	$cols = array('area_name');
    $db->where('area_id', $value['area_id']);
    $area = $db->getOne('area', null,$cols);
    $dummy[$value['tablet_id']] = $area['area_name'];
    array_push($areaArr, $dummy);
}

$a['oneStarRating'] = $OneStarRating;
$a['twoStarRating'] = $TwoStarRating;
$a['threeStarRating'] = $ThreeStarRating;
$a['fourStarRating'] = $FourStarRating;
$a['fiveStarRating'] = $FiveStarRating;
$a['totalRating'] = $total_rating;
$a['locationList'] = $location_list;
$a['areaList'] = $listOfAreas;
$a['surveyList'] = $survey_list;
$a['areaList'] = $areaArr;

if($total_rating!=0)
{
	$a['oneStarRatingPercentage'] = round(($OneStarRating/$total_rating)*100,2);
	$a['twoStarRatingPercentage'] = round(($TwoStarRating/$total_rating)*100,2);
	$a['threeStarRatingPercentage'] = round(($ThreeStarRating/$total_rating)*100,2);
	$a['fourStarRatingPercentage'] = round(($FourStarRating/$total_rating)*100,2);
	$a['fiveStarRatingPercentage'] = round(($FiveStarRating/$total_rating)*100,2);
}
else{
	$a['oneStarRatingPercentage'] = 0;
	$a['twoStarRatingPercentage'] = 0;
	$a['threeStarRatingPercentage'] = 0;
	$a['fourStarRatingPercentage'] = 0;
	$a['fiveStarRatingPercentage'] = 0;
}

$firstChartData;
if($_GET['identifier'] === 'last_30_days' || $_GET['identifier'] === 'last_month' || $_GET['identifier'] === 'this_month'|| $_GET['identifier'] === 'custom_range')
{
	$start = strtotime($_GET['start_date']);
    $end = strtotime($_GET['end_date']);
        
    $days_between = ceil(abs($start - $end) / 86400);
    //echo $days_between;
    if($days_between>45)
    {
       // echo 'i m here';
       $firstChartData= $functionsList->getLast3MonthsData_analytics($_GET['survey_id'], "responses", $_GET['tablet_id'],$_GET['start_date'], $_GET['end_date']);
    }
    else{
        //	echo 'i m here';
		$firstChartData=$functionsList->getLast1MonthsData_analytics($_GET['survey_id'], "responses", $_GET['tablet_id'], $_GET['start_date'], $_GET['end_date']);
	}
}
elseif($_GET['identifier'] === 'Yesterday' || $_GET['identifier'] === 'Today'){
	$firstChartData = $functionsList->getOneDayData_analytics($_GET['survey_id'], "responses", $_GET['tablet_id'], $_GET['start_date'], $_GET['end_date']);
}
elseif ($_POST['identifier']=== '7_days') {
 $firstChartData=$functionsList->getSevenDaysRatingData($_GET['survey_id'], "responses", $_GET['tablet_id'], $_GET['start_date'], $_GET['end_date']);
}

$a['ratingBasedOnOptions'] = $functionsList->getRatingBasedOnOptions($_GET['survey_id'], $_GET['tablet_id'], $_GET['start_date'], $_GET['end_date']);

$a['firstChartData'] = $firstChartData;

$db->where('survey_id', $selected_survey_id);
$db->where('rating',1);
$db->orderBy("response_id","Desc");
$responses = $db->get('responses',5);

$responseArr = array();
foreach ($responses as $r) {
	$cols = Array ("user_name");
    $db->where("user_id", $r['respondent_id']);
    $user = $db->getOne("respondents", null, $cols);
    $r['name'] = $user['user_name'];

    $cols= ('location_id');
    $db->where('uuid', $r['tablet_uuid']);
    $location = $db->getOne('tablets', null, $cols);

    $cols = array('name');
    $db->where('id', $location['location_id']);
    $location = $db->getOne('location', null, $cols);
   
    $r['location'] = $location['name'];
    array_push($responseArr, $r);
}
$a['responseArr'] = $responseArr;

echo json_encode($a);
}

?>