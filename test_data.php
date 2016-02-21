<?php

// "INSERT INTO `food_data` (`entry_number`, `food_identifier`, `person_identifier`, `is_interested`, `date_recorded`) VALUES
// (32, 'x29XwEzDXc', 'fEutAhDCZE', 1, '2016-01-13 21:33:09'),
// (33, 'WeeSypTZkR', 'fEutAhDCZE', 1, '2016-01-13 21:33:46'),
// (34, '6zkawUjEZh', 'fEutAhDCZE', 1, '2016-01-13 21:33:50'),
// (35, '92moUUNOT8', 'fEutAhDCZE', 1, '2016-01-13 21:33:52'),
// (36, 'tzOvdXcdg0', 'fEutAhDCZE', 0, '2016-01-13 21:37:41'),
// (37, 'pqDUjpGx67', 'fEutAhDCZE', 1, '2016-01-13 21:35:40'),
// (38, 'UCDd8PLJT0', 'fEutAhDCZE', 1, '2016-01-13 21:37:23')";


$one_month_ago = 1450139980;
$today_ish = 1453755918;
$amount_of_data_points = 1000;

$food_identifiers_array = array("6zkawUjEZh","92moUUNOT8","bOwnM6YtrL","HJ5smrKOSc",
								"JYbJjqNVPR","mAopqsc5n4","PfsiwzMPMp","pqDUjpGx67",
								"tBVna7yTsE","tzOvdXcdg0","UCDd8PLJT0","uuOWwxChmk",
								"WeeSypTZkR","WGfHBMHCMj","x29XwEzDXc","YeAJBLTmsT");

function random_str($length, $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
{
    $str = '';
    $max = mb_strlen($keyspace, '8bit') - 1;
    for ($i = 0; $i < $length; ++$i) {
        $str .= $keyspace[rand(0, $max)];
    }
    return $str;
}

function random_date($history_time,$present_time) {
	$int= mt_rand($history_time,$present_time);
	return date("Y-m-d H:i:s",$int);
}




$sql_query = "INSERT INTO food_data (food_identifier, person_identifier, is_interested, date_recorded) VALUES ";

for ($i = 0; $i < $amount_of_data_points; $i++) {
	$sql_query .= "('". /*"6zkawUjEZh"*/$food_identifiers_array[mt_rand (0,15)] ."', '" 
		. random_str(10) ."', ". mt_rand (0,1) .", '". random_date($one_month_ago, $today_ish) ."')";
	if ($i != $amount_of_data_points - 1) {
		$sql_query .=",";
	}

}


echo $sql_query;

?>


















