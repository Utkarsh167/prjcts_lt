<?php 
require_once '../../config/config.php';
require_once 'headers/headers_post.php';

$db= getDbInstance();
$location_id=0;
$listOfDevices;
$cols = Array ("name", "campaign_id");
//$campaignList = $db->get ("campaign", null, $cols);

$location_id = 0;

if(isset($_GET['location_id']))
{
    $location_id = $_GET['location_id'];

    // get list of devices associated to that location
    $db->where('location_id', $location_id);
    $listOfDevices = $db->get('tablets');

    echo json_encode($listOfDevices);
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') 
{
    date_default_timezone_set('Asia/Calcutta');

    $data_to_store = filter_input_array(INPUT_POST);
    $data_to_store['created_at'] = date("Y-m-d H:i:s");
    $data_to_store['location_id'] = $_POST['location_id'];
    $data_to_store['survey_name'] = $_POST['survey_name'];
    $data_to_store['survey_type'] = "options";

   // var_dump($data_to_store);

    $followup_question_array = array('followup_question' => $data_to_store['followup_question'], "created_at"=>$data_to_store['created_at']);

    $followup_question_positive_array = array('followup_question' => $data_to_store['followup_question_positive'], "created_at"=>$data_to_store['created_at']);

    $positive_options_array = array("option_1"=>$data_to_store['option_1_positive'], "option_2"=>$data_to_store['option_2_positive'], "option_3"=>$data_to_store['option_3_positive'],"option_4"=>$data_to_store['option_4_positive'], "option_5"=>$data_to_store['option_5_positive'], "option_6"=>$data_to_store['option_6_positive'], "created_at"=>$data_to_store['created_at']);

     $followup_question_negative_array = array('followup_question' => $data_to_store['followup_question_negative'], "created_at"=>$data_to_store['created_at']);

    $negative_options_array = array("option_1"=>$data_to_store['option_1_negative'], "option_2"=>$data_to_store['option_2_negative'], "option_3"=>$data_to_store['option_3_negative'],"option_4"=>$data_to_store['option_4_negative'], "option_5"=>$data_to_store['option_5_negative'], "option_6"=>$data_to_store['option_6_negative'], "created_at"=>$data_to_store['created_at']);

     $followup_question_neutral_array = array('followup_question' => $data_to_store['followup_question_neutral'], "created_at"=>$data_to_store['created_at']);

    $neutral_options_array = array("option_1"=>$data_to_store['option_1_neutral'], "option_2"=>$data_to_store['option_2_neutral'], "option_3"=>$data_to_store['option_3_neutral'],"option_4"=>$data_to_store['option_4_neutral'], "option_5"=>$data_to_store['option_5_neutral'], "option_6"=>$data_to_store['option_6_neutral'], "created_at"=>$data_to_store['created_at']);

    $options_array = array("option_1"=>$data_to_store['option_1'], "option_2"=>$data_to_store['option_2'], "option_3"=>$data_to_store['option_3'],"option_4"=>$data_to_store['option_4'], "option_5"=>$data_to_store['option_5'], "option_6"=>$data_to_store['option_6'], "created_at"=>$data_to_store['created_at']);

    $array_tablet_id = $data_to_store['selected_tablets'];

    unset($data_to_store['option_1']);
    unset($data_to_store['option_2']);
    unset($data_to_store['option_3']);
    unset($data_to_store['option_4']);
    unset($data_to_store['option_5']);
    unset($data_to_store['option_6']);

    unset($data_to_store['option_1_positive']);
    unset($data_to_store['option_2_positive']);
    unset($data_to_store['option_3_positive']);
    unset($data_to_store['option_4_positive']);
    unset($data_to_store['option_5_positive']);
    unset($data_to_store['option_6_positive']);

    unset($data_to_store['option_1_neutral']);
    unset($data_to_store['option_2_neutral']);
    unset($data_to_store['option_3_neutral']);
    unset($data_to_store['option_4_neutral']);
    unset($data_to_store['option_5_neutral']);
    unset($data_to_store['option_6_neutral']);

    unset($data_to_store['option_1_negative']);
    unset($data_to_store['option_2_negative']);
    unset($data_to_store['option_3_negative']);
    unset($data_to_store['option_4_negative']);
    unset($data_to_store['option_5_negative']);
    unset($data_to_store['option_6_negative']);

    unset($data_to_store['selected_tablets']);
    unset($data_to_store['followup_question']);
    unset($data_to_store['followup_question_positive']);
    unset($data_to_store['followup_question_neutral']);
    unset($data_to_store['followup_question_negative']);

    /*var_dump($data_to_store);
    echo '<br/><br/>';
    var_dump($options_array);
    echo '<br/><br/>';
    var_dump($followup_question_array);
    echo '<br/><br/>';
    var_dump($followup_question_positive_array);
    echo '<br/><br/>';
    var_dump($followup_question_negative_array);
    echo '<br/><br/>';
    var_dump($followup_question_neutral_array);
    echo '<br/><br/>';
    var_dump($positive_options_array);
    echo '<br/><br/>';
    var_dump($neutral_options_array);
    echo '<br/><br/>';
    var_dump($negative_options_array);
    echo '<br/><br/>';*/

    $fqa = array();

    if($followup_question_neutral_array['followup_question'] != "")
    {
       array_push($fqa, "neutral");
    }
    if($followup_question_positive_array['followup_question'] != "")
    {
        array_push($fqa, "positive");
    }
    if($followup_question_negative_array['followup_question'] != "")
    {
        array_push($fqa, "negative");
    }
    if($followup_question_array['followup_question'] != "")
    {
        array_push($fqa, "all");
    }

    //var_dump($fqa);
    
   // var_dump($followup_question_neutral_array['followup_question']);

        $survey_id = $db->insert ('survey', $data_to_store);
        $data = array('survey_id'=> $survey_id);
        foreach ($array_tablet_id as $tablet_id) {
            $db->where('tablet_id', $tablet_id);
            if ($db->update ('tablets', $data))
            {
                //echo $db->count . ' records were updated';
            }   
            else echo 'update failed: ' . $db->getLastError();
        }
        //var_dump($last_id);
        if($survey_id)
        {
            foreach ($fqa as $f) {
               if($f === "positive")
               {
                    $followup_question_positive_array['survey_id'] = $survey_id;
                    $followup_question_positive_array['rating'] = "positive";
                    $followup_question_id = $db->insert ('followup_question', $followup_question_positive_array);
                    if(!$followup_question_id)
                    {
                        echo $db->getLastError();
                    }
                    $positive_options_array['followup_question_id'] = $followup_question_id;
                    $insert_options = $db->insert ('survey_options', $positive_options_array);
                   
               }
               elseif($f==="neutral")
               {
                    $followup_question_neutral_array['survey_id'] = $survey_id;
                    $followup_question_neutral_array['rating'] = "neutral";
                    $followup_question_id = $db->insert ('followup_question', $followup_question_neutral_array);
                    if(!$followup_question_id)
                    {
                        echo $db->getLastError();
                    }
                    $neutral_options_array['followup_question_id'] = $followup_question_id;
                    $insert_options = $db->insert ('survey_options', $neutral_options_array);
                    
               }
               elseif($f==="negative")
               {
                    $followup_question_negative_array['survey_id'] = $survey_id;
                    $followup_question_negative_array['rating'] = "negative";
                    $followup_question_id = $db->insert ('followup_question', $followup_question_negative_array);
                    if(!$followup_question_id)
                    {
                        echo $db->getLastError();
                    }
                    $negative_options_array['followup_question_id'] = $followup_question_id;
                    $insert_options = $db->insert ('survey_options', $negative_options_array);

               }
               elseif ($f==="all") {
                    $followup_question_array['survey_id'] = $survey_id;
                    $followup_question_array['rating'] = "all";
                    $followup_question_id = $db->insert ('followup_question', $followup_question_array);
                    if(!$followup_question_id)
                    {
                        echo $db->getLastError();
                    }
                    $options_array['followup_question_id'] = $followup_question_id;
                    $insert_options = $db->insert ('survey_options', $options_array);
                    if($insert_options)
                    {                  
                      /*  $_SESSION['success'] = "Survey added successfully!";
                        header('location: workplace');
                        exit();*/
                    }  
                }
            }
            echo json_encode(array("success"=>"true","message" => "Survey Added Successfully"));
    }
}


?>