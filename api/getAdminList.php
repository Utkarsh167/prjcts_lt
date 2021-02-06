<?php 
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

//$records = json_decode(file_get_contents("php://input"));
$db = getDbInstance();
date_default_timezone_set('Asia/Calcutta');

$cols = Array ("id", "name");
//$db->where('admin_id', $records->admin_id);
$admin = $db->get('admin_accounts',null,$cols);

/* $c = array();

foreach ($location as $key => $value) {
	$cols = array('name');
	$db->where('admin_id', $records->admin_id);
	//$status = $db->getOne('status', null, $cols);

	//$value['name'] = $status['status_name'];

	array_push($c, $value);
} */

//$status = $db->get('status');
/* if($admin>=1){
$a = array("admin_list"=>$admin);
echo json_encode($a);
}else{
    echo json_encode(array("success"=>"false","message" => "No admins"));
} */

$a = array("admin_list"=>$admin);
echo json_encode($a);

?>