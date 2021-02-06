<?php 
require_once '../../config/config.php';
require_once 'headers/headers_post.php';


$records = json_decode(file_get_contents("php://input"));
$db = getDbInstance();

// Let's not delete a client only put him in archived mode
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $db->where('subscription_id', $records->subscription_id);
    $data = array('status'=>'archived');
    $stat = $db->update('subscriptions', $data);
    if ($stat) {
      echo json_encode(array("success"=>"true","message" => "Subscription Archived Successfully"));
    }
    else{
    	echo $db->getLastError();
    }
}

?>