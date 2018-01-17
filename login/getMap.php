<?php

require 'sql.php';

//读取地图内容
$re = $md->select("map",["value"],["id"=>$_GET["id"]]);
echo $re[0]["value"];

?>