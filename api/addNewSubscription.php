 <?php 
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

$records = json_decode(file_get_contents("php://input"));
date_default_timezone_set('Asia/Calcutta');

$data = Array("client_id" => $records->client_id, 
	"start_date"=>$records->start_date,
  "end_date"=>$records->end_date, 
"status" => $records->status,
'created_at'=>date('Y-m-d H:i:s'),
'licenseKey'=>md5(uniqid(rand(), true))
);

$db = getDbInstance();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $id = $db->insert ('subscriptions', $data);
    if($id){
     echo json_encode(array("success"=>"true","message" => "Subscription Added Successfully"));
    }
    else{
      echo $db->getLastError();
    }
}
?>