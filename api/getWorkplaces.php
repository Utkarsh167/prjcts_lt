<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

$check_record = json_decode(file_get_contents("php://input"));
$db = getDbInstance();
date_default_timezone_set('Asia/Calcutta');

$db->where('admin_id', $check_record->admin_id);
$workplaces = $db->get('workplace');

$a = array(); 
foreach ($workplaces as $key => $value) {
	$l=array(); $b=array();
	//var_dump($value);
	$db->where('workplace_id', $value['workplace_id']);
    $listOfLocationsForWorkplace = $db->get('location');
    foreach ($listOfLocationsForWorkplace as $locations) {
       $l['location_name'] = $locations['name'];
       $l['location_id'] = $locations['id'];
       array_push($b, $l);
    }

    $value['locations'] = $b;
    array_push($a, $value);
}

echo json_encode($a);

?>
