<?php

header('Content-Type: application/json');
sleep(1);
if(isset($_POST['username'])) {
	if($_POST['username'] == 'amsify' && $_POST['pass'] == '123456') {
		echo json_encode(array('status'	=> 'success', 'message' => 'Form submitted successfully'));	
		exit();	
	}
}

echo json_encode(array(
				'status'	=> 'error',
				'errors' 	=> [
					'username' 	=> 'Username should be amsify',
					'pass' 		=> 'Password should be 123456'
				]
			));