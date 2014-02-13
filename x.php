<?php

require_once 'vendor/autoload.php';

require_once 'inc/HtaLoader.php';

$data = Spyc::YAMLLoad('cfg/config.yml');
$loader = new HTALoader($data['config']['database']);

$app = new \Slim\Slim();

$app->get('/htas/:tag', function ($tag) use ($app, $loader) {
    $loader->echoJSON($loader->fetchWithTag($tag));
});

$app->get('/htas', function () use ($app, $loader) {
    if (isset($_GET['tag'])) {
        $app->redirect('htas/'.$_GET['tag']);
    }
    $term = (isset($_GET['name'])) ? array('name' => $_GET['name']) : null;
    $loader->echoJSON($loader->fetch($term));
});

$app->post('/htas', function () use ($app, $loader) {
    $req = $app->request()->getBody();
    $resp = $loader->add($req['name'], $req['url'], $req['graphic'], explode(',', $req['tags']))->getProperties();
    $loader->echoJSON($resp);
});

$app->put('/htas', function () {
    echo 'This is a PUT route';
});

$app->delete('/htas/:id', function ($id) use ($app, $loader) {
    $loader->echoJSON($loader->del($id));
});

$app->get('/tags', function () use ($app, $loader) {
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
