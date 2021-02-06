<?php
require_once '../../config/config.php';

$db = getDbInstance();
$db->rawQuery("UPDATE responses set read_status = '1'");

?>