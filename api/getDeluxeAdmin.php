<?php

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

// get posted data
$check_record = json_decode(file_get_contents("php://input"));
$db = getDbInstance();
$check_record->passwd=  md5($check_record->passwd);
//$check_record->passwd = md5("hemant");

$db->where('passwd', $check_record->passwd);
$db->where('email', $check_record->email);
$row = $db->get('deluxe_admin');
//var_dump($row);

if ($db->count >= 1)
    {
    	echo json_encode(array("success"=>"true","message" => $row));
    }
else
    {
    	echo json_encode(array("success"=>"false","message" => "User Not Found"));
    }
?>