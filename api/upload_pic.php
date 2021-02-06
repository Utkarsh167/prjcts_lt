<?php
require_once '../../config/config.php';

$db = getDbInstance();

date_default_timezone_set('Asia/Calcutta');
$date= date("Y-m-d H-i-s");

$thisPath = dirname($_SERVER['PHP_SELF']);

//echo $thisPath .'<br/><br/>';

$user_name = $_POST['user_name'];
$consignment_no = $_POST['consignment_no'];

$target_dir = '../receipts/'.$consignment_no.'/'.$date.'/'.$user_name;

$target_file = $target_dir .'/'. basename($_FILES["fileToUpload"]["name"]);

$var = explode("../receipts/",$target_file);

//echo $var[1];

$uploadOk = 1;
$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
// Check if image file is a actual image or fake image
if(isset($_POST["submit"])) {
    $check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);
    if($check !== false) {
        echo "File is an image - " . $check["mime"] . "."."<br/><br/>";
        $uploadOk = 1;
    } else {
        echo "File is not an image.";
        $uploadOk = 0;
    }
}
// Check if file already exists
if (file_exists($target_file)) {
    echo "Sorry, file already exists.";
    $uploadOk = 0;
}
// Check file size
if ($_FILES["fileToUpload"]["size"] > 500000) {
    echo "Sorry, your file is too large.";
    $uploadOk = 0;
}
// Allow certain file formats
if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
&& $imageFileType != "gif" ) {
    echo "Sorry, only JPG, JPEG, PNG & GIF files are allowed.";
    $uploadOk = 0;
}
// Check if $uploadOk is set to 0 by an error
if ($uploadOk == 0) {
    echo "Sorry, your file was not uploaded.";
// if everything is ok, try to upload file
} else {

	if(!file_exists($target_dir))
	{
		mkdir($target_dir,0777, true);
	}

    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) 
    {
      //  echo "The file ". basename( $_FILES["fileToUpload"]["name"]). " has been uploaded.";

    	$uploadedPath = "thedartexpress.com/admin-panel/receipts/".$var[1];
    		//echo $uploadedPath;
		
		$db->where('consignment_no',$consignment_no);
    	$checkIfUserExist= $db->get('customers');

    	foreach ($checkIfUserExist as $r) 
    	{
    		if(empty($r['receipt']))
    		{
    			$data_to_update['receipt'] = $uploadedPath;
         		$db->where('consignment_no',$consignment_no);
    			$stat = $db->update ('customers', $data_to_update);

    			if($stat)
    			{
    				echo 'success';
    			}
    			else
    			{
    				echo 'error';
    			}
    		}
    		else 
    		{
    			echo "reciept exist";
    		}
    	}
		
    } else {
        echo "Sorry, there was an error uploading your file.";
    }
}


?> 
