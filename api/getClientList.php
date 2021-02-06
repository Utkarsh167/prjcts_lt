<?php 
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

$db = getDbInstance();
date_default_timezone_set('Asia/Calcutta');

$clients = $db->get('clients');

$c = array();

foreach ($clients as $key => $value) {
	$cols = array('status_name');
	$db->where('status_id', $value['status_id']);
	$status = $db->getOne('status', null, $cols);

	$value['status_name'] = $status['status_name'];

	array_push($c, $value);
}

$status = $db->get('status');
$a = array("client_list"=>$c, "status_list"=>$status);
echo json_encode($a);

?>