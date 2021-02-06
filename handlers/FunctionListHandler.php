<?php
error_reporting(E_ALL);
ini_set("display_errors","On");
require_once '../api/headers/headers_post.php';
include '../classes/functions.php'; 

$functionsList = new FunctionsList();

//$check_record = json_decode(file_get_contents("php://input"));
//var_dump($check_record);
//echo 'identifier: '. $_POST['identifier'];

if(isset($_POST['identifier']))
{
	if ($_POST['identifier']=== 'daily') {

		$functionsList->getDailyRatingData($_POST['survey_id'], "responses", $_POST['tablet_id'], $_POST['start_date'], $_POST['end_date']);
	}
	else if($_POST['identifier']==='getLast12MonthsRatingData')
	{
		$functionsList->getLastTwelveMonthData($_POST['survey_id'], $_POST['tablet_id']);
	}
	elseif ($_POST['identifier']=== '7_days') {

		$functionsList->getSevenDaysRatingData($_POST['survey_id'], "responses", $_POST['tablet_id'], $_POST['start_date'], $_POST['end_date']);
	}
	elseif($_POST['identifier'] === 'last_30_days' || $_POST['identifier'] === 'last_month' || $_POST['identifier'] === 'this_month'|| $_POST['identifier'] === 'custom_range')
	{
		//unset_cookie();
		$_POST['end_date'] = date('Y-m-d',strtotime("+1 day", strtotime($_POST['end_date'])));
		setcookie('OneStarRating',$functionsList->CalculateRating($_POST['survey_id'], 1, null,'responses',$_POST['start_date'], $_POST['end_date'], $_POST['tablet_id']));
		setcookie('TwoStarRating',$functionsList->CalculateRating($_POST['survey_id'], 2, null,'responses',$_POST['start_date'], $_POST['end_date'], $_POST['tablet_id']));
		setcookie('ThreeStarRating',$functionsList->CalculateRating($_POST['survey_id'], 3, null,'responses',$_POST['start_date'], $_POST['end_date'], $_POST['tablet_id']));
		setcookie('FourStarRating',$functionsList->CalculateRating($_POST['survey_id'], 4, null,'responses',$_POST['start_date'], $_POST['end_date'], $_POST['tablet_id']));
		setcookie('FiveStarRating',$functionsList->CalculateRating($_POST['survey_id'], 5, null,'responses',$_POST['start_date'], $_POST['end_date'], $_POST['tablet_id']));

		$start = strtotime($_POST['start_date']);
        $end = strtotime($_POST['end_date']);
        
        $days_between = ceil(abs($start - $end) / 86400);
        //echo $days_between;
        if($days_between>45)
        {
        	//echo 'i m here';
        	$functionsList->getLast3MonthsData_analytics($_POST['survey_id'], "responses", $_POST['tablet_id'],$_POST['start_date'], $_POST['end_date']);
        }
        else{
        //	echo 'i m here';
			$functionsList->getLast1MonthsData_analytics($_POST['survey_id'], "responses", $_POST['tablet_id'], $_POST['start_date'], $_POST['end_date']);
		}
	}

	elseif ($_POST['identifier'] === 'getHorizontalChartData_dropdown_analytics') {
		$functionsList->getRatingBasedOnCategories($_POST['survey_id'], $_POST['tablet_id'], $_POST['start_date'], $_POST['end_date']);
	}
	elseif ($_POST['identifier'] === 'getHorizontalChartData_analytics') {
		$functionsList->getRatingBasedOnOptions($_POST['survey_id'], $_POST['tablet_id'], $_POST['start_date'], $_POST['end_date']);
	}

elseif($_POST['identifier'] === 'Yesterday' || $_POST['identifier'] === 'Today')
	{

		setcookie('OneStarRating',$functionsList->CalculateRating($_POST['survey_id'], 1, null,'responses',$_POST['start_date'], null, $_POST['tablet_id']));
		setcookie('TwoStarRating',$functionsList->CalculateRating($_POST['survey_id'], 2, null,'responses',$_POST['start_date'], null, $_POST['tablet_id']));
		setcookie('ThreeStarRating',$functionsList->CalculateRating($_POST['survey_id'], 3, null,'responses',$_POST['start_date'], null, $_POST['tablet_id']));
		setcookie('FourStarRating',$functionsList->CalculateRating($_POST['survey_id'], 4, null,'responses',$_POST['start_date'], null, $_POST['tablet_id']));
		setcookie('FiveStarRating',$functionsList->CalculateRating($_POST['survey_id'], 5, null,'responses',$_POST['start_date'], null, $_POST['tablet_id']));

		$functionsList->getOneDayData_analytics($_POST['survey_id'], "responses", $_POST['tablet_id'], $_POST['start_date'], $_POST['end_date']);

	}

}


?>
