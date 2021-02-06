<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

$db = getDbInstance();
//Serve POST request.  
if ($_SERVER['REQUEST_METHOD'] == 'POST') 
{   
      // Sanitize input post if we want
    $data_to_update = json_decode(file_get_contents("php://input"), true);;

    $db->where('subscription_id',$data_to_update['subscription_id']);
    $stat = $db->update ('subscriptions', $data_to_update);
    
    if($stat)
    {
        echo json_encode(array("success"=>"true","message" => "Client has been updated successfully"));
    }
    else
    {
        echo json_encode(array("success"=>"false","message" => "Error while updating client. Please try again."));
    }
}
?>