<?php

require 'sql.php';

$a = file_get_contents("php://input");
$a = json_decode($a, JSON_UNESCAPED_UNICODE);

//读取地图列表
$re = [];
if(isset($a["id"]))
	$re = $md->select("map",["id"],["id"=>$a["id"]]);

if(!isset($a["id"]) || count($re) == 0){
	$re = $md->insert("map",$a);
}else{
	$re = $md->update("map",["name"=>$a["name"],"value"=>$a["value"]],["id"=>$a["id"],"uid"=>$a["uid"]]);
}

//echo json_encode($re, JSON_UNESCAPED_UNICODE);;

?>