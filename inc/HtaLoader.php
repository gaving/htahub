<?php

/**
 * HTALoader
 *
 * Database controller.
 *
 * @author SPSA
 * @version 1.0
 * @copyright Copyright 2012, SPSA
 */

require_once 'rb.php';

/**
 * HTALoader
 *
 * Database controller.
 *
 * @author SPSA
 * @version 1.0
 * @copyright Copyright 2012, SPSA
 */
class HTALoader
{

    private $_db;

    public function __construct($database)
    {
        R::setup('sqlite:' . $database);
        R::debug(false);
        //R::freeze(false);
    }

    public function find($id)
    {
        return R::load('hta', $id);
    }

    public function add($name, $url, $graphic, $tags=array())
    {
        $hta = R::dispense('hta');

        $hta->name = $name;
        $hta->url = $url;
        $hta->graphic = $graphic;

        if ($id = R::store($hta)) {

            if (!empty($tags)) {
              // add tags
            }

            return $this->find($id);
        }

        return null;
    }

    public function del($id)
    {
        //R::exec("DELETE FROM hta WHERE id=$id");
        R::trash($this->find($id));
    }

    public function fetch(array $term=null)
    {
        if (is_null($term)) {
            $b = R::find("hta", '1 ORDER BY graphic, name ASC');
        } else {
            $b = R::find('hta',"name LIKE :name ORDER BY graphic, name ASC", array(
                ':name' => '%'.$term['name'].'%'
            ));
        }

        return R::exportAll($b);
    }

    public function fetchTags(array $term=null)
    {
        return R::getAll("SELECT t.tag, q.id, count(*) AS cnt
            FROM tags AS t, hta_tags AS qt, hta AS q
            WHERE t.id = qt.tag_id AND qt.hta_id = q.id
            GROUP BY t.id
            ORDER BY cnt DESC"
        );
    }

    public function echoJSON($data)
    {
        ob_start();
        print json_encode($data);
        ob_end_flush();
    }

    public function wipe()
    {
        R::nuke();
    }

}



?>
