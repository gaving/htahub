<?php

namespace HtaLoader;

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
        if (!array_filter($term)) {
            $b = R::find('hta', '1 ORDER BY LOWER(name) DESC');
        } else {
            $b = R::find('hta','name LIKE :name OR url LIKE :url ORDER BY LOWER(name) DESC', array(
                ':name' => '%'.$term['name'].'%',
                ':url' => '%'.$term['url'].'%'
            ));
        }
        return R::exportAll($b);
    }
}
