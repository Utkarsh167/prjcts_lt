<?php 
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

$db = getDbInstance();

if(isset($_GET['location_id'])){
 // $location_name = $_GET['location_name'];
  $location_id = $_GET['location_id'];
  $db->where('admin_id', $_GET['admin_id']);
  $db->where('location_id', $_GET['location_id']);
  $listOfSurveysOnSelectedLocation = $db->get('survey');
  getDevicesAndResponses($listOfSurveysOnSelectedLocation, $db);
//  echo json_encode($listOfSurveysOnSelectedLocation);
}
else{
  $db->where('status', 'active');
  $db->where('admin_id', $_GET['admin_id']);
  $listOfSurveysOnSelectedLocation = $db->get('survey');
  getDevicesAndResponses($listOfSurveysOnSelectedLocation, $db);
}

function getDevicesAndResponses($listOfSurveysOnSelectedLocation, $db){
	$a = array();
	foreach ($listOfSurveysOnSelectedLocation as $key => $value) {
  		$db->where('survey_id', $value['survey_id']);
    	$response_count= $db->get('responses');
    	$value['response_count'] = sizeof($response_count);

    	$db->where('survey_id', $value['survey_id']);
    	$tablet_count= $db->get('tablets');

    	if(sizeof($tablet_count) >0)
    	{
    		$tablet_count = sizeOf($tablet_count);
    	}
    	else{
    		$tablet_count=0;
    	}
    	$value['no_of_devices']= $tablet_count;
    	array_push($a, $value);
  }
  echo json_encode($a);
}

?>
