<?php

require 'sql.php';

//删除地图
$re = $md->delete("map",["id"=>$_GET["id"],"uid"=>$_GET["uid"]]);

?>