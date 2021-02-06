<?php 
require_once '../../config/config.php';
require_once 'headers/headers_post.php';


$records = json_decode(file_get_contents("php://input"));
$db = getDbInstance();

// Let's not delete a client only put him in archived mode
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $db->where('client_id', $records->client_id);
    $data = array('client_status'=>'archived');
    $stat = $db->update('clients', $data);
    if ($stat) {
      echo json_encode(array("success"=>"true","message" => "Client Archived Successfully"));
    }
    else{
    	echo $db->getLastError();
    }
}

?>