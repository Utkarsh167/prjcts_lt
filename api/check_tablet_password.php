<?php

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

// get posted data
$check_record = json_decode(file_get_contents("php://input"));
$db = getDbInstance();
echo json_encode(array("success"=>"true","message" => "Password Match"));
//echo $check_record->tablet_name;

$check_record->password=  md5($check_record->password);
//echo $check_record->password;
//$check_record->password=  md5("password");
//$db->where('tablet_name', "77e93847d87db2e2");

$db->where('password', $check_record->password);
$db->where('tablet_name', $check_record->tablet_name);
$row = $db->get('tablets');
if ($db->count >= 1)
    {
    	echo json_encode(array("success"=>"true","message" => "Password Match"));
    }
else
    {
    	echo json_encode(array("success"=>"false","message" => "Password Mismatch"));
    }
?>