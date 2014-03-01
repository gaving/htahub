<?php

require_once '../vendor/autoload.php';
require_once 'inc/HtaLoader.php';

$data = Spyc::YAMLLoad('config.yml');
$loader = new HTALoader($data['config']['database']);

$app = new \Slim\Slim();
$app->add(New \Slim\Middleware\ContentTypes());
$app->response->headers->set('Content-Type', 'application/json');

$app->get('/htas', function () use ($app, $loader) {
    $app->response->body(json_encode($loader->fetch(array(
        'name' => $app->request()->params('name')
    ))));
});

$app->post('/htas', function () use ($app, $loader) {
    $req = $app->request()->getBody();
    $resp = $loader->add($req['name'], $req['url'], $req['graphic'])->getProperties();
    $app->response->body(json_encode($resp));
});

$app->delete('/htas/:id', function ($id) use ($app, $loader) {
    $app->response->body(json_encode($loader->del($id)));
});

$app->run();
