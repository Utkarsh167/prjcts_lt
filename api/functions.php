<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
//require_once '../includes/auth_validate.php';

//echo $_SERVER["PHP_SELF"];
//echo dirname(__DIR__).'/config/config.php';
//echo __DIR__ . "/../somefilein_parent.php";
require_once $_SERVER['DOCUMENT_ROOT'].'/feediback-new/config/config.php';

class FunctionsList{

	var $db;

	function __construct() {
		// initialize database
		$this->db= getDbInstance();
    }

    function dashboardChartData($survey_id, $uuid, $rating)
    {
    	$cols = array('rating');
    	$this->db->where('survey_id', $survey_id);
    	$this->db->where('tablet_uuid', $uuid);
    	$this->db->where('rating', $rating);
    	$count = $this->db->get('responses', null, $cols);

    	return sizeOf($count);
    }

    function CalculateRating($survey_id, $rating, $cookie_key, $class_name, $start_date, $end_date, $tablet_id){

        $main_arr = array();
        $sub_arr = array();
        $tablet = array();

        $cols = array('uuid');
        $this->db->where('tablet_id', $tablet_id);
        $tablet = $this->db->getOne('tablets', null, $cols);
    
    	$cols = array('rating');
    	$this->db->where('survey_id', $survey_id);
    	$this->db->where('rating', $rating);
        if($tablet!=null) {
            
            $this->db->where('tablet_uuid', $tablet['uuid']);
        }

        if($start_date!=null)
        {
            if($end_date!=null){
                $this->db->where ('created_at', $start_date, ">=");
                $this->db->where ('created_at', $end_date, "<=");
            }
            else{
                $this->db->where('created_at', '%' . $start_date . '%', 'like');
            }
        }
    	$count = $this->db->get($class_name, null, $cols);

    	return sizeof($count);
    }

    function calculateResponsesOrRespondents($survey_id, $class_name){

    	$this->db->where('survey_id', $survey_id);
    	$count = $this->db->get($class_name);

    	return sizeof($count);
    }

    function genericFunction($survey_id, $class_name, $cols_array){
        
        $this->db->where('survey_id', $survey_id);
        $data = $this->db->get($class_name, null, $cols_array);
        return $data;
    }

    function getSevenDaysRatingData($survey_id, $class_name, $tablet_id, $start_date, $end_date){
        $stackedBarDataArray = array();
        $date_array = array();
        $OneStarRating_total=0;
        $TwoStarRating_total=0;
        $ThreeStarRating_total=0;
        $FourStarRating_total=0;
        $FiveStarRating_total=0;

        for($i=1; $i<=7; $i++)
        {
        $OneStarRatingForBarChart =  $this->CalculateRating($survey_id,1,'OneStarRatingForBarChartDay'.strval($i),$class_name, date('Y-m-d', 
                    strtotime('-'.strval($i-1).' days')),null, $tablet_id);  

        $TwoStarRatingForBarChart =  $this->CalculateRating($survey_id,2,'TwoStarRatingForBarChartDay'.strval($i),$class_name, date('Y-m-d', 
                    strtotime('-'.strval($i-1).' days')), null, $tablet_id);

        $ThreeStarRatingForBarChart =  $this->CalculateRating($survey_id,3,'ThreeStarRatingForBarChartDay'.strval($i),$class_name, date('Y-m-d', 
                    strtotime('-'.strval($i-1).' days')), null, $tablet_id);

        $FourStarRatingForBarChart =  $this->CalculateRating($survey_id,4,'FourStarRatingForBarChartDay'.strval($i),$class_name, date('Y-m-d', 
                    strtotime('-'.strval($i-1).' days')), null, $tablet_id);

        $FiveStarRatingForBarChart =  $this->CalculateRating($survey_id,5,'FiveStarRatingForBarChartDay'.strval($i),$class_name, date('Y-m-d', 
                    strtotime('-'.strval($i-1).' days')), null, $tablet_id);

        $OneStarRating_total += $OneStarRatingForBarChart;
        $TwoStarRating_total += $TwoStarRatingForBarChart;
        $ThreeStarRating_total += $ThreeStarRatingForBarChart;
        $FourStarRating_total += $FourStarRatingForBarChart;
        $FiveStarRating_total += $FiveStarRatingForBarChart;

        array_push($stackedBarDataArray, array(
                    'OneStarRatingForBarChartDay'.strval($i)=>$OneStarRatingForBarChart,
                    'TwoStarRatingForBarChartDay'.strval($i)=>$TwoStarRatingForBarChart, 
                    'ThreeStarRatingForBarChartDay'.strval($i)=>$ThreeStarRatingForBarChart, 
                    'FourStarRatingForBarChartDay'.strval($i)=>$FourStarRatingForBarChart, 
                    'FiveStarRatingForBarChartDay'.strval($i)=>$FiveStarRatingForBarChart));

                if($i===8){}
                else{
                    $date = date('y-m-d', strtotime('-'.strval($i-1).' days'));
                    array_push($date_array, $date);
                }
            }
            echo json_encode($stackedBarDataArray);

            setcookie('label_array', json_encode($date_array));
            setcookie('OneStarRating',$OneStarRating_total);
            setcookie('TwoStarRating',$TwoStarRating_total);
            setcookie('ThreeStarRating',$ThreeStarRating_total);
            setcookie('FourStarRating',$FourStarRating_total);
            setcookie('FiveStarRating',$FiveStarRating_total);
        }

    function getLast3MonthsData_analytics($survey_id,$class_name, $tablet_id, $start_date, $end_date){
        $start = $start_date;
        $start =  date('Y-m-d', strtotime($start_date));
        $next = date('Y-m-d',strtotime("+6 day", strtotime($start)));

        $stackedBarDataArray= array();
        $label_array= array();

        $c=1;

        while($start<=$end_date)
        {
           // echo $start.' +6 days '.$next.'<br/>';
            $data_arr = array();
            unset($subArr); 
            $subArr = array(); 

            for($i=1; $i<=5; $i++)
            {
                $next_date = date('Y-m-d',strtotime("+1 day", strtotime($next)));
                $count = $this->CalculateRating($survey_id,$i,
                    'FourStarRating','responses', $start, $next_date, $tablet_id);

                $subArr["week".$i."rating".$i] = $count;
            }
            
            $aDate = date("d-m", strtotime($start));
            $bDate = date("d-m", strtotime($next));

            $start = date('Y-m-d',strtotime("+7 day", strtotime($start)));
            $next = date('Y-m-d',strtotime("+7 day", strtotime($next)));
            array_push($label_array, $aDate.' to '.$bDate);
            array_push($stackedBarDataArray, $subArr);
            $c++;
        }
        
        echo json_encode($stackedBarDataArray);
        setcookie('label_array', json_encode($label_array));
    }   

     function getLast1MonthsData_analytics($survey_id,$class_name, $tablet_id, 
        $start_date, $end_date){

        $start = $start_date;
        $next = $next = date('Y-m-d',strtotime("+1 day", strtotime($start)));;
        $stackedBarDataArray= array();
        $label_array= array();
    
        $c=1;

        while($start<date('Y-m-d',strtotime($end_date)))
        {
            //echo $start.' +6 days '.$next.'<br/>';
            $data_arr = array();
            unset($subArr); 
            $subArr = array(); 

            for($i=1; $i<=5; $i++)
            {
              
                $count = $this->CalculateRating($survey_id,$i,
                    'FourStarRating','responses', $start, null, $tablet_id);

                $subArr["week".$i."rating".$i] = $count;
            }

            $aDate = date("d-m", strtotime($start));
           
            array_push($label_array, $aDate);
            $start = date('Y-m-d',strtotime("+1 day", strtotime($start)));
            $next = date('Y-m-d',strtotime("+1 day", strtotime($next)));

            array_push($stackedBarDataArray, $subArr);
            $c++;
        }
       // setcookie('label_array', json_encode($label_array));
        echo json_encode($stackedBarDataArray); 
        setcookie('label_array', json_encode($label_array));
    }    

    function getLastTwelveMonthData($survey_id, $tablet_id){
        //unset($_COOKIE['stackedBarDataArray']);
       // echo '1';
        $stackedBarDataArray= array();

        $month_array = array();

        for($i=1; $i<=12; $i++)
        {

           if($i==1){
            // First day of the month.
            $query_date = date('Y-m-d');
            //date_format($query_date,"Y-m-d");

            $end_date= date('Y-m-01', strtotime($query_date));
            // Last day of the month.
            $start_date =  date('Y-m-t', strtotime($query_date));

            }
            else{

            // start and end date is for last 12 months
            // this will give first and last date of last 12 months respectively
            $start_date= date("Y-m-d", mktime(0, 0, 0, date("m")-(($i-1)-1), 0));
            $end_date = date("Y-m-d", mktime(0, 0, 0, date("m")-(($i-1)), 1));
            }

          //  echo $start_date.'end data: '.$end_date.'<br/>';

            $year = date('y', strtotime($start_date));
            $month = date('F', strtotime($start_date));
           // echo $month.' '.$year;

            array_push($month_array, substr($month,0,3).' '.$year);
            setcookie('label_array', json_encode($month_array));

            unset($subArr); // $foo is gone
            $subArr = array(); // $foo is here again

            // for each month calculate rating from 1-5
           for($rating =1; $rating<=5; $rating++)
            {
                $count = $this->CalculateRating($survey_id,$rating, 
                    "month".$i."rating".$rating, "responses", 
                    $end_date, $start_date, $tablet_id);   

                $subArr["month".$i."rating".$rating] = $count;
            }
            //var_dump(json_encode($subArr));
            array_push($stackedBarDataArray, $subArr);
        }
        echo json_encode($stackedBarDataArray);
        //setCookie('label_array', json_encode($month_array));
    }

    function last2WeeksRatingData($survey_id){
        
        $stackedBarDataArray= array();
        $subArr = array(); 
        $dataset1 = array();
        $dataset2 = array();

        for($i=1; $i<=5; $i++)
        {
            $data = $this->db->rawQuery("SELECT 'last week' AS week, COUNT(*) AS rows FROM responses WHERE created_at >= CURDATE() - INTERVAL  6 DAY AND created_at  < CURDATE() + INTERVAL  1 DAY AND rating='$i' AND survey_id ='$survey_id'
                UNION ALL
                SELECT 'previous week' AS week, COUNT(*) AS rows FROM responses WHERE created_at >= CURDATE() - INTERVAL 13 DAY AND created_at  < CURDATE() - INTERVAL  6 DAY AND rating=5
                    AND survey_id ='$survey_id' ");

           
           var_dump($data);
        }
    }

    function getOneDayData_analytics($survey_id, $class_name ,$tablet_id, $start_date, $end_date){

        $start = $start_date;
        $next = $next = date('Y-m-d H:i:s',strtotime("+2 hours", strtotime($start)));;
        $stackedBarDataArray= array();
        $label_array= array();
    
        $c=1;

        $start = strtotime($start);
        $start = date('Y-m-d H:i:s', $start);

        for($timer=0; $timer<12; $timer++)
        {
           // echo $start.' +2 hours '.$next.'<br/>';
            $data_arr = array();
            unset($subArr); 
            $subArr = array(); 

            for($i=1; $i<=5; $i++)
            {             
                $count = $this->CalculateRating($survey_id,$i,
                    'FourStarRating','responses', $start, $next, $tablet_id);
                $subArr["week".$i."rating".$i] = $count;
            }

            $start_hour = strtotime($start);
            $end_hour = strtotime($next);
           
            array_push($label_array, date('H', $start_hour).'-'.date('H', $end_hour));

            $start = date('Y-m-d H:i:s',strtotime("+2 hours", strtotime($start)));
            $next = date('Y-m-d H:i:s',strtotime("+2 hours", strtotime($next)));

            array_push($stackedBarDataArray, $subArr);
            $c++;
        }
        
        echo json_encode($stackedBarDataArray);
        setcookie('label_array', json_encode($label_array));
    }

    function getRatingBasedOnOptions($survey_id, $tablet_id, $start_date, $end_date){

        $end_date = date('Y-m-d',strtotime("+1 day", strtotime($end_date)));
       // echo $start_date; echo $end_date;
        $key_arr = [];
        $old_key_arr = array();
        $data_arr = array();
        $pain_points = array();
        $neutral_points = array();
        $satisfactory_points = array();
        $uuid = null;

        $cols = array('uuid');
        $this->db->where('tablet_id', $tablet_id);
        $tablet = $this->db->getOne('tablets', null, $cols);
       
        if($tablet!=null) $uuid = $tablet['uuid'];
       
        for($i=1; $i<=5; $i++)
        {
            if($uuid!=null)
            {
                $data = $this->db->rawQuery("SELECT multi_option, SUM(rating = $i) AS ratingCount FROM responses WHERE survey_id=$survey_id AND created_at>='$start_date' AND created_at<='$end_date' AND tablet_uuid='$uuid' GROUP BY multi_option");
            }
            else{
                $data = $this->db->rawQuery("SELECT multi_option, SUM(rating = $i) AS ratingCount FROM responses WHERE survey_id=$survey_id AND created_at >='$start_date' AND created_at<='$end_date' GROUP BY multi_option");
            }

            foreach ($data as $key => $value) {
                $value=array_values($value);
                $key_arr[$value[0]] = $value[1];
            }
            
          //  var_dump($key_arr);
            if(empty($key_arr))
            {
                $key_arr = [];
            }
            array_push($data_arr, $key_arr);
            $old_key_arr = $key_arr;

            if($i==1 || $i==2){
                array_push($pain_points, $old_key_arr);
            }
            else if($i==3)
            {
                array_push($neutral_points, $old_key_arr);
            }
            else if($i==4 || $i==5)
            {
               // asort($old_key_arr);
                array_push($satisfactory_points, $old_key_arr);
            }
            unset($key_arr);
        }
          echo json_encode(array("location_wise_data_full"=>$data_arr, "pain_points"=>$pain_points,
                          "neutral_points"=>$neutral_points, "satisfactory_points"=>$satisfactory_points));
    }

    function getRatingBasedOnArea($survey_id, $tablet_id, $start_date, $end_date){

        $end_date = date('Y-m-d',strtotime("+1 day", strtotime($end_date)));
       // echo $survey_id.'<br/><br/>';
        $cols = array('uuid', 'area_id', 'tablet_id');
        $this->db->where('survey_id', $survey_id);

        if($tablet_id!="") $this->db->where('tablet_id', $tablet_id);
        
        $tablets = $this->db->get('tablets', null, $cols);
        $subArr = array();
        $main_arr= array();

        foreach ($tablets as $t) {
           unset($subArr);
           for($i=1; $i<=5; $i++)
           {
            //echo $t['uuid'];
            $cols = array('area_name');
            $this->db->where('area_id', $t['area_id']);
            $area = $this->db->getOne('area', null, $cols);

            $this->db->where('tablet_uuid', $t['uuid']);
            $this->db->where('rating', $i);
            $this->db->where ('created_at', $start_date, ">=");
            $this->db->where ('created_at', $end_date, "<=");
            $this->db->where('survey_id', $survey_id);
            $responses = $this->db->get('responses');
            $subArr['rating'.$i] = sizeof($responses);
           }
           $subArr = array($area['area_name']=>$subArr);
           array_push($main_arr, $subArr);        
        }
        
        echo json_encode($main_arr);
    }


}

?>