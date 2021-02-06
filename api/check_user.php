<?php

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

// get posted data
$check_record = json_decode(file_get_contents("php://input"));
$db = getDbInstance();
//$check_record->client_passwd=  md5($check_record->client_passwd);
//$check_record->passwd = md5("hemant");

$db->where('client_passwd', md5($check_record->client_passwd));
$db->where('client_email', $check_record->client_email);
$row = $db->getOne('admin_accounts');

$cols = array('status_id');
$db->where('client_id', $row['client_id']);
$client_id = $db->getOne('clients');


$cols = array('status_name');
$db->where('status_id', $client_id['status_id']);
$status = $db->getOne('status', null, $cols);

$row['status'] = $status['status_name'];
//var_dump($row);

if (sizeOf($status) >= 1)
    {
    	echo json_encode(array("success"=>"true","message" => $row));
    }
else
    {
    	echo json_encode(array("success"=>"false","message" => "User Not Found"));
    }
?>