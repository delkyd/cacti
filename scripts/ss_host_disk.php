<?php
$no_http_headers = true;

/* display No errors */
error_reporting(E_ERROR);

include_once(dirname(__FILE__) . "/../include/config.php");
include_once(dirname(__FILE__) . "/../lib/snmp.php");

if ( $_SERVER["argc"] > 1 ) {
	$args = $_SERVER["argv"];
	array_shift($args);
	return call_user_func_array("ss_host_disk", $args);
}

function ss_host_disk($hostname, $snmp_community, $snmp_version, $host_id, $cmd, $arg1, $arg2 = "", $snmp_port = 161, $snmp_timeout = 500) {
	$oids = array(
		"total" => ".1.3.6.1.2.1.25.2.3.1.5",
		"used" => ".1.3.6.1.2.1.25.2.3.1.6",
		"failures" => ".1.3.6.1.2.1.25.2.3.1.7",
		"index" => ".1.3.6.1.2.1.25.2.3.1.1",
		"description" => ".1.3.6.1.2.1.25.2.3.1.3",
		"sau" => ".1.3.6.1.2.1.25.2.3.1.4"
		);

	if ((func_num_args() == "10") || (func_num_args() == "7") || (func_num_args() == "6")) {
		if ($cmd == "index") {
			$return_arr = ss_host_disk_reindex(cacti_snmp_walk($hostname, $snmp_community, $oids["index"], $snmp_version, "", "", $snmp_port, $snmp_timeout));

			for ($i=0;($i<sizeof($return_arr));$i++) {
				print $return_arr[$i] . "\n";
			}
		}elseif ($cmd == "query") {
			$arg = $arg1;

			$arr_index = ss_host_disk_reindex(cacti_snmp_walk($hostname, $snmp_community, $oids["index"], $snmp_version, "", "", $snmp_port, $snmp_timeout));
			$arr = ss_host_disk_reindex(cacti_snmp_walk($hostname, $snmp_community, $oids[$arg], $snmp_version, "", "", $snmp_port, $snmp_timeout));

			for ($i=0;($i<sizeof($arr_index));$i++) {
				print $arr_index[$i] . "!" . $arr[$i] . "\n";
			}
		}elseif ($cmd == "get") {
			$arg = $arg1;
			$index = $arg2;

			if (($arg == "total") || ($arg == "used")) {
				/* get hrStorageAllocationUnits from the snmp cache since it is faster */
				$sau = db_fetch_cell("select field_value from host_snmp_cache where host_id=$host_id and field_name='hrStorageAllocationUnits' and snmp_index='$index'");

				return cacti_snmp_get($hostname, $snmp_community, $oids[$arg] . ".$index", $snmp_version, "", "", $snmp_port, $snmp_timeout) * $sau;
			}else{
				return cacti_snmp_get($hostname, $snmp_community, $oids[$arg] . ".$index", $snmp_version, "", "", $snmp_port, $snmp_timeout);
			}
		}
	} else {
		return "ERROR: Invalid Parameters\n";
	}
}

function ss_host_disk_reindex($arr) {
	$return_arr = array();

	for ($i=0;($i<sizeof($arr));$i++) {
		$return_arr[$i] = $arr[$i]["value"];
	}

	return $return_arr;
}

?>