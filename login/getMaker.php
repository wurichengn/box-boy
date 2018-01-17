<?php

require 'sql.php';

//读取地图列表
if(isset($_GET["oid"]))
	$re = $md->select("map"
		,["[>]user"=>["uid"=>"id"]]
		,["map.id","map.name","user.img"]
		,["uid"=>$_GET["oid"]]);
else
	$re = $md->select("map"
		,["[>]user"=>["uid"=>"id"]]
		,["map.id","map.name","user.img"]);

echo json_encode($re, JSON_UNESCAPED_UNICODE); 

?>