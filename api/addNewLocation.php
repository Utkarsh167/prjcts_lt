<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'headers/headers_post.php'; 
require_once '../../config/config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') 
{
    date_default_timezone_set('Asia/Calcutta');
	$data_to_store = filter_input_array(INPUT_POST);
   	// $data_to_store['workplace_id'] = $_GET['workplace_id'];
    $db = getDbInstance();
    //var_dump($data_to_store);
    // $data_to_store['passwd'] = md5($data_to_store['passwd']);
    $last_id = $db->insert ('location', $data_to_store);
    if($last_id)
    {
       echo json_encode(array("success"=>"true","message" => "Location Added Successfully"));
    }  
    else
    {
    	echo json_encode(array("success"=>"false","message" => $db->getLastError()));
    }
    
}


?>