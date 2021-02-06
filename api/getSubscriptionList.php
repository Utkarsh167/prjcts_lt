<?php 
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

$db = getDbInstance();
date_default_timezone_set('Asia/Calcutta');

$subscriptions = $db->get('subscriptions');

$a = array();

foreach ($subscriptions as $key => $value) {
	$cols = array('client_name', 'status_id');
	$db->where('client_id', $value['client_id']);
	$client = $db->getOne('clients', null, $cols);
	$value['client_name'] = $client['client_name'];

	$cols = array('status_name');
	$db->where('status_id', $client['status_id']);
	$status = $db->getOne('status', null, $cols);

	$value['status_name'] = $status['status_name'];
	array_push($a, $value);
}

echo json_encode($a);

?>