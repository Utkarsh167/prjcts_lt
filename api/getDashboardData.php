<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'headers/headers_post.php';
include '../classes/functions.php';  
require_once '../../config/config.php';

$db = getDbInstance();
date_default_timezone_set('Asia/Calcutta');

$functionsList = new FunctionsList();
$a = array();

if(isset($_GET['survey_id']))
{
    $cols = array('survey_name');
	$db->where('survey_id', $_GET['survey_id']);
   	$survey_name = $db->getOne('survey', null, $cols);

   	$cols = array('location_id');
   	$db->where('survey_id', $_GET['survey_id']);
   	$location_id = $db->getOne('survey', null, $cols);
 
 	$cols = array('survey_id', 'survey_name');
   	$db->where('location_id', $location_id['location_id']);
   	$listOfSurveysAtTheLocation = $db->get('survey', null, $cols);

	$no_of_responses = $functionsList->calculateResponsesOrRespondents($_GET['survey_id'],'responses');
	$no_of_respondents = $db->rawQuery("SELECT COUNT(DISTINCT respondent_id) from responses where survey_id=".$_GET['survey_id']);
			foreach ($no_of_respondents as $k) {
    			foreach ($k as $count) {
        		$no_of_respondents= $count;
    	}
	}

	// get overall chart data
	$OneStarRating = $functionsList->CalculateRating($_GET['survey_id'],1,'OneStarRating','responses', null, null, "");
	$TwoStarRating = $functionsList->CalculateRating($_GET['survey_id'],2,'TwoStarRating','responses', null, null,"");
	$ThreeStarRating = $functionsList->CalculateRating($_GET['survey_id'],3,'ThreeStarRating','responses', null, null,"");
	$FourStarRating = $functionsList->CalculateRating($_GET['survey_id'],4,'FourStarRating','responses', null, null,"");
	$FiveStarRating = $functionsList->CalculateRating($_GET['survey_id'],5,'FiveStarRating','responses', null, null, "");
	$totalRating = $OneStarRating+$TwoStarRating+$ThreeStarRating+$FourStarRating+$FiveStarRating;

	$col = array('area_id', 'uuid');
	$listOfAreas = $functionsList->genericFunction($_GET['survey_id'], 'tablets', $col);
	$positive_index_area_wise = array();
	$areaArr = array();
	foreach ($listOfAreas as $areas) {

		$four = $functionsList->dashboardChartData($_GET['survey_id'], $areas['uuid'], 4);
		$five = $functionsList->dashboardChartData($_GET['survey_id'], $areas['uuid'], 5);
		if($totalRating==0)
		{
			$totalRating=1;
		}

		$areas['area_id'];
        $cols = array('area_name');
        $db->where('area_id', $areas['area_id']);
        $area = $db->getOne('area');

		$positive_index_area_wise[$area['area_name']] = ($four / $totalRating)*100+ ($five/$totalRating)*100;
		//array_push($positive_index_area_wise, ($four / $totalRating)*100+ ($five/$totalRating)*100);
		array_push($areaArr, $positive_index_area_wise);
	}

	if($totalRating!=0)
		{
			$a['oneStarRatingPercentage'] = round(($OneStarRating/$totalRating)*100,2);
			$a['twoStarRatingPercentage'] = round(($TwoStarRating/$totalRating)*100,2);
			$a['threeStarRatingPercentage'] = round(($ThreeStarRating/$totalRating)*100,2);
			$a['fourStarRatingPercentage'] = round(($FourStarRating/$totalRating)*100,2);
			$a['fiveStarRatingPercentage'] = round(($FiveStarRating/$totalRating)*100,2);
		}
		else{
			$a['oneStarRatingPercentage'] = 0;
			$a['twoStarRatingPercentage'] = 0;
			$a['threeStarRatingPercentage'] = 0;
			$a['fourStarRatingPercentage'] = 0;
			$a['fiveStarRatingPercentage'] = 0;
		}


	// top responses
	//$cols = array('name', 'area', 'rating', follow-up, time)
	$db->where('survey_id', $_GET['survey_id']);
    $db->orderBy("response_id","Desc");
    $responses = $db->get('responses',5);

    $r = array();
    $response_array = array();

    foreach ($responses as $key => $value) {
    	 $cols = Array ("user_name");
         $db->where("respondent_id", $value['respondent_id']);
         $user = $db->getOne("respondents", null, $cols);
         $r['userName'] = $user['user_name'];

         $cols = Array('area_id');
         $db->where('uuid', $value['tablet_uuid']);
         $tablet = $db->getOne("tablets", null, $cols);
         $cols = Array('area_name');
         $db->where('area_id',$tablet['area_id']);
         $area = $db->getOne('area', null, $cols);

         $r['areaName'] = $area['area_name'];
         $r['rating'] = $value['rating'];
         $r['followUp'] = $value['multi_option'];
         $r['date'] = $value['created_at'];
         array_push($response_array, $r);
    }
	// end top responses	

	$a['noOfResponses'] = $no_of_responses;
	$a['noOfRespondents'] = $no_of_respondents;
	$a['oneStarRating'] = $OneStarRating;
    $a['twoStarRating'] = $TwoStarRating;
    $a['threeStarRating'] = $ThreeStarRating;
    $a['fourStarRating'] = $FourStarRating;
    $a['fiveStarRating'] = $FiveStarRating;
    $a['totalRating'] = $totalRating;
    $a['positiveIndexAreaWise'] = $areaArr;
    $a['responses'] = $response_array;
    $a['areas'] = sizeof($listOfAreas);
    $a['surveyList'] = $listOfSurveysAtTheLocation;
    $a['selected_survey_name'] = $survey_name['survey_name'];
    $a['locationId'] = $location_id['location_id'];
}

//var_dump($listOfSurveysAtTheLocation);

$b = array();
array_push($b, $a);
echo json_encode($b);

?>