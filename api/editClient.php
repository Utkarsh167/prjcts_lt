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
    
    if (array_key_exists("client_passwd",$data_to_update))
    {
        $data_to_update['client_passwd'] = md5($data_to_update['client_passwd']);
    }

    $db->where('client_id',$data_to_update['client_id']);
    $stat = $db->update ('clients', $data_to_update);
    
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