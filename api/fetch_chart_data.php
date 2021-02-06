<?php
require_once '../../config/config.php';

// get posted data
$start_date = $_POST['start_date'];
$end_date = $_POST['end_date'];
$survey_id = $_POST['survey_id'];
//$start_date = "2019-02-1 12:19:55";
//$end_date = "2019-02-28 12:19:55";

//$start_date = "2019-02-1";
//$end_date = "2019-02-28";

$db = getDbInstance();

$OneStarRating =  $db->rawQuery("SELECT COUNT(rating) FROM responses WHERE rating =1 AND survey_id='$survey_id' AND created_at >='$start_date' AND created_at<='$end_date'");
$TwoStarRating =  $db->rawQuery("SELECT COUNT(rating) FROM responses WHERE rating =2 AND survey_id='$survey_id' AND created_at >='$start_date' AND created_at<='$end_date'");
$ThreeStarRating =  $db->rawQuery("SELECT COUNT(rating) FROM responses WHERE rating =3 AND survey_id='$survey_id' AND created_at >='$start_date' AND created_at<='$end_date'");
$FourStarRating =  $db->rawQuery("SELECT COUNT(rating) FROM responses WHERE rating =4 AND survey_id='$survey_id' AND created_at >='$start_date' AND created_at<='$end_date'");
$FiveStarRating =  $db->rawQuery("SELECT COUNT(rating) FROM responses WHERE rating =5 AND survey_id='$survey_id' AND created_at >='$start_date' AND created_at<='$end_date'");



foreach ($OneStarRating as $k) {
    foreach ($k as $count) {
        $OneStarRating= $count;
        setcookie('OneStarRating', $OneStarRating);
    }
}

foreach ($TwoStarRating as $k) {
    foreach ($k as $count) {
        $TwoStarRating= $count;
        setcookie('TwoStarRating', $TwoStarRating);
    }
}

foreach ($ThreeStarRating as $k) {
    foreach ($k as $count) {
        $ThreeStarRating= $count;
       setcookie('ThreeStarRating', $ThreeStarRating);
    }
}

foreach ($FourStarRating as $k) {
    foreach ($k as $count) {
        $FourStarRating= $count;
        setcookie('FourStarRating', $FourStarRating);
    }
}

foreach ($FiveStarRating as $k) {
    foreach ($k as $count) {
        $FiveStarRating= $count;
        setcookie('FiveStarRating', $FiveStarRating);
    }
}


/*foreach ($OneStarRating as $key => $value) {
	
	var_dump($value);
}*/


echo json_encode(array("OneStarRating"=> $OneStarRating, "TwoStarRating"=> $TwoStarRating, "ThreeStarRating"=> $ThreeStarRating, "FourStarRating"=> $FourStarRating,"FiveStarRating"=> $FiveStarRating));


?>