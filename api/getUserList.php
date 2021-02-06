<?php 
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

$db = getDbInstance();
date_default_timezone_set('Asia/Calcutta');

$users = $db->get('admin_accounts');

$a = array();

foreach ($users as $key => $value) {
	$cols = array('name');
    $db->where('id', $value['location_id']);
    $location = $db->getOne('location', $cols);
    $value['location_name'] = $location['name'];

    array_push($a, $value);
}

echo json_encode($a);

?>