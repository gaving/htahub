<?php

/**
 * Hta builder
 *
 * Database controller.
 *
 * @author SPSA
 * @version 1.0
 * @copyright Copyright 2012, SPSA
 */

require_once 'inc/Slim/Slim.php';
require_once 'inc/mustache.php';
require_once 'inc/HtaLoader.php';
require_once 'inc/spyc.php';

$data = Spyc::YAMLLoad('cfg/config.yml');
$loader = new HTALoader($data['config']['database']);

$app = new Slim();
$app->add(new Slim_Middleware_ContentTypes());

$app->get('/htas', function () use ($app) {
    global $loader;
    $term = (isset($_GET['name'])) ? array('name' => $_GET['name']) : null;
    $loader->echoJSON($loader->fetch($term));
});

$app->post('/htas', function () use ($app) {
    global $loader;
    $req = $app->request()->getBody();
    error_log(var_export($req, true));
    $resp = $loader->add($req['name'], $req['url'], $req['graphic'], explode(',', $req['tags']))->getProperties();
    $loader->echoJSON($resp);
});

$app->put('/htas', function () {
    echo 'This is a PUT route';
});

$app->delete('/htas/:id', function ($id) use ($app) {
    global $loader;
    error_log(var_export($id, true));
    $loader->echoJSON($loader->del($id));
});

$app->get('/tags', function () use ($app) {
    global $loader;
    $term = (isset($_GET['name'])) ? array('name' => $_GET['name']) : null;
    $loader->echoJSON($loader->fetchTags($term));
});

$app->post('/tags', function () {
    echo 'This is a POST route';
});

$app->put('/tags', function () {
    echo 'This is a PUT route';
});

$app->delete('/tags', function () {
    echo 'This is a DELETE route';
});

$app->run();

?>
