<?php

header('Content-Type: application/json');
sleep(1);

$validate = false;

if(isset($_POST['value'])) {
	if($_POST['value'] == 'amsify') {
		echo json_encode(array('status'	=> 'success'));	
		exit();	
	}
}

echo json_encode(array(
				'status'	=> 'error',
				'message' 	=> 'Value must be amsify',
			));