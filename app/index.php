<?php

require_once '../vendor/autoload.php';
require_once 'lib/HtaLoader.php';

$config = Spyc::YAMLLoad('config.yml');
$loader = new \HtaLoader\HTALoader($config['config']['database']);

$app = new \Slim\Slim();
$app->add(New \Slim\Middleware\ContentTypes());
$app->response->headers->set('Content-Type', 'application/json');

$app->get('/htas', function () use ($app, $loader) {
    $app->response->body(json_encode($loader->fetch(array(
        'name' => $app->request()->params('name')
    ))));
});

$app->get('/load/:id', function ($id) use ($app, $loader, $config) {
    $hta = $loader->find($id)->export();
    $hta['frame'] = $config['config']['frame_id'];
    $m = new Mustache_Engine;
    $res = $app->response();
    $res['Content-Description'] = 'File Transfer';
    $res['Content-Type'] = 'application/octet-stream';
    $res['Content-Disposition'] ='attachment; filename=' . $hta['name'] . '.hta';
    $res['Content-Transfer-Encoding'] = 'binary';
    $res['Expires'] = '0';
    $res['Cache-Control'] = 'must-revalidate';
    $res['Pragma'] = 'public';
    print file_get_contents(sprintf("ico/%s.ico", $hta['graphic']));
    print $m->render(file_get_contents('tpl/hta.tpl'), $hta);
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
