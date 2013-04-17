<?php

require 'auth.php';

// Database setup ////////////////////////////////////
define('CONNECTION_STRING', 'mongodb://localhost');
define('DATABASE', 'angular_test');

$connection = new Mongo(CONNECTION_STRING);
$db = $connection->{DATABASE};

// Slim setup ////////////////////////////////////////
require 'Slim/Slim.php';
\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim();

$response = $app->response();
$response['Content-Type'] = 'application/json';

// Routes ////////////////////////////////////////////

$app->post('/login', function() use ($db)
{
	$credentials = getRequestObject();

	if (property_exists($credentials, 'email') && property_exists($credentials, 'password'))
	{
		$credentials->password = sha1($credentials->email . $credentials->password);

		$user = $db->users->findOne(array(
			'email' => $credentials->email,
			'password' => $credentials->password
			));

		if ($user != null)
		{
			$ticket = array(
				'_id' => uuidSecure(),
				'user_id' => $user['_id'],
				'expires' => time() + 20 * 60
			);

			$db->tickets->insert($ticket);

			setcookie('ticket', $ticket['_id']);
			setResponseObject(array('success' => true));
			return;
		}
	}

	setResponseObject(array('success' => false));
});

$app->get('/users', function () use ($db, $response)
{
	secureAction($db, $response);

	$users = $db->users->find(array(), array('_id' => 0, 'email' => 1));

	setResponseEntities($users);
});

$app->run();

// Helper functions //////////////////////////////////

function getRequestObject()
{
	return json_decode(@file_get_contents('php://input'));
}

function setResponseObject($obj)
{
	echo json_encode($obj);
}

function convertObjectId($entity)
{
	if (isset($entity['_id']))
    	$entity['_id'] = $entity['_id']->{'$id'};
    
    return $entity;
}

function setResponseEntity($entity)
{
    setResponseObject(convertObjectId($entity));
}

function setResponseEntities($iterator, $function='convertObjectId')
{
    setResponseObject(array_map($function, iterator_to_array($iterator)));
}

function secureAction($db, $response)
{
	if (isset($_COOKIE['ticket']))
	{
		//fetch the ticket from the db
		$ticket = $db->tickets->findOne(array(
			'_id' => $_COOKIE['ticket']
		));

		//delete if expired
		if ($ticket['expires'] < time())
		{
			$db->tickets->remove(array(
				'_id' => $_COOKIE['ticket']
			));

			echo "EXPIRED";
		}
		else
		{
			//update if ticket has aged
			if ($ticket['expires'] - 10 * 60 < time())
			{
				$ticket['expires'] = time() + 20 * 60;
				$db->tickets->save($ticket);
			}

			//current log in active
			return;
		}
	}

	echo "FAILED";
	//no current log in
	http_response_code(401);
	die();
}