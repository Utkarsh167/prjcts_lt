 <?php 
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

$workplace_name = filter_input(INPUT_GET, 'name');
$db = getDbInstance();

 if ($workplace_name && $_SERVER['REQUEST_METHOD'] == 'GET') {
    $data_workplace = array("workplace_name" => $records->workplace_name, "admin_id" =>$records->admin_id);
    $id = $db->insert ('workplace', $data_workplace);
    if($id)
     echo json_encode(array("success"=>"true","message" => "Workplace Added Successfully"));
    }
    else{
      echo $db->getLastError();
    }

    ?>