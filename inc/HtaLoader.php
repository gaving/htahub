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
                foreach ($tags as $tag) {
                    $htag = R::dispense('hta_tags');
                    $htag->hta_id = $id;
                    $htag->tag_id = $tag;
                    R::store($htag);
                }
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

    public function fetchWithTag($tag=null)
    {
        return R::getAll(sprintf("SELECT h.*
            FROM hta AS h
            INNER JOIN hta_tags ht ON (ht.hta_id = h.id)
            INNER JOIN tags t ON (t.id = ht.tag_id)
            WHERE t.tag = '%s'", $tag)
        );
    }

    public function fetchTags(array $term=null)
    {
/*        $yeah = R::getAll("SELECT t.tag, t.id, count(*) AS cnt*/
            //FROM tags AS t
            //INNER JOIN hta_tags qt ON (qt.tag_id = t.id)
            //INNER JOIN hta q ON (q.id = qt.hta_id)
            //ORDER BY cnt DESC"
        /*);*/
        $yeah = R::getAll("SELECT t.tag, t.id FROM tags AS t");
        return $yeah;
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
