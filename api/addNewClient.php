 <?php 
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../config/config.php';
require_once 'headers/headers_post.php';

$records = json_decode(file_get_contents("php://input"));
date_default_timezone_set('Asia/Calcutta');
$db = getDbInstance();

// sort post data of the client and insert in the server
$data = Array("client_name" => $records->client_name, 
	"client_email"=>$records->client_email,
"client_website" => $records->client_website,
'created_at'=>date('Y-m-d H:i:s'),
"status_id"=>$records->status_id,
'client_passwd'=>  md5($records->client_passwd),
'no_of_licenses' => $records->no_of_licenses
);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $id = $db->insert ('clients', $data);
    if($id){
        // if the client has been inserted successfully in the database
        // then insert the admin user in the panel that is accessible for the client
        // FYI client will be added in the deluxe admin panel
    	$data_adminUsers = Array("name" => $records->client_name, 
    		"client_email"=>$records->client_email,
    		"client_id"=>$id,
    		"client_passwd"=>md5($records->client_passwd), 
    		"admin_type" => "super",
    		'created_at'=>date('Y-m-d H:i:s'),
    		'no_of_licenses' => $records->no_of_licenses);
    	$adminUserId = $db->insert ('admin_accounts', $data_adminUsers);

        if($adminUserId)
        {
            // if the admin has been inserted successfully then add the 
            // details of the subscription. Subscription will start from the day 
            // client has been created and will go upto the years mentioned by deluxe admin
            // Further subscription details can be edited by deluxe admin later

            $data_subscription = Array("client_id" => $id, 
                "start_date"=>$records->start_date,
                "end_date"=>$records->end_date, 
                'created_at'=>date('Y-m-d H:i:s'),
                'subscription_period' => $records->subscription_period,
                'licenseKey'=>md5(uniqid(rand(), true))
            );

            $subscription_id = $db->insert('subscriptions', $data_subscription);

            if($subscription_id)
            {
                
                // it means that subscription have been added successfully
        	   echo json_encode(array("success"=>"true","message" => "Client Added Successfully"));
            }
            else{
                // send the error message
                echo $db->getLastError();
            }
    	}
    	else{
            // send error message if not able to insert admin user
    		echo $db->getLastError();
    	}
    }
    else{
        // send the error message if not able to insert client
      return $db->getLastError();
    }
}
?>