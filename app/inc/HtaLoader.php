<?php

use RedBean_Facade as R;

class HTALoader
{

    private $_db;

    public function __construct($database)
    {
        R::setup('sqlite:' . $database);
        R::debug(false);
    }

    public function find($id)
    {
        return R::load('hta', $id);
    }

    public function add($name, $url, $graphic)
    {
        $hta = R::dispense('hta');
        $hta->name = $name;
        $hta->url = $url;
        $hta->graphic = $graphic;

        if ($id = R::store($hta)) {
            return $this->find($id);
        }

        return null;
    }

    public function del($id)
    {
        R::trash($this->find($id));
    }

    public function fetch(array $term=null)
    {
        if (is_null($term)) {
            $b = R::find('hta', '1 ORDER BY name DESC');
        } else {
            $b = R::find('hta','name LIKE :name ORDER BY name DESC', array(
                ':name' => '%'.$term['name'].'%'
            ));
        }
        return R::exportAll($b);
    }

    public function wipe()
    {
        R::nuke();
    }
}
