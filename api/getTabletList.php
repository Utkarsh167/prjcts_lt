<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

$db = getDbInstance();
date_default_timezone_set('Asia/Calcutta');

$tablets = $db->get('tablets');

$a = array();

foreach ($tablets as $key => $value) {
	$cols = array('area_name');
    $db->where('area_id', $value['area_id']);
    $area = $db->getOne('area', null,$cols);
    $value['area_name'] = $area['area_name'];

    $cols = array('name');
    $db->where('id', $value['location_id']);
    $location = $db->getOne('location', $cols);
    $value['location_name'] = $location['name'];

    $cols = array('survey_name');
    $db->where('survey_id', $value['survey_id']);
    $survey = $db->getOne('survey', $cols);
    $value['survey_name'] = $survey['survey_name'];

    $db->where('tablet_id', $value['tablet_id']);
    $db->orderBy('created_at', 'desc');
    $device_status = $db->getOne('device_status');
    $created_at = $device_status['created_at'];
    $now = date("Y-m-d H:i:s");
    $start_date = new DateTime($created_at);
    $since_start = $start_date->diff(new DateTime($now));
    $minutes = $since_start->days * 24 * 60;
    $minutes += $since_start->h * 60;
    $minutes += $since_start->i;
    $value['last_responsed'] = $minutes;
    $value['battery_status'] = $device_status['battery_status'];

    array_push($a, $value);
}

echo json_encode($a);

?>