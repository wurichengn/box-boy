<?php 

require 'Medoo.php';
use Medoo\Medoo;

//数据库配置
$md_config = [
	// required
	'database_type' => 'mysql',
	'database_name' => 'boxboy',
	'server' => '127.0.0.1',
	'username' => 'boxboy',
	'password' => 'root',
 
	// [optional]
	'charset' => 'utf8',
	'port' => 3306
];

//调试环境
if(strtoupper(substr(PHP_OS,0,3))==='WIN'){
    $md_config['username'] = "root";
    $md_config["database_name"] = "box_boy";
}

$md = new Medoo($md_config);

?>