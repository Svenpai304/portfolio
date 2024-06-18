<?php
/**
 * Created by JetBrains PhpStorm.
 * User: ralph
 * Date: 4-5-2022
 * Time: 11:12 AM
 * To change this template use File | Settings | File Templates.
 *
 * DESCRIPTION
 * creates MODX elements based on text inside static files.
 * it looks trough the filesystem, finds static files and registers them as element in Modx
 * no need for a fixed file struture. the static files can be placed anywhere.
 * within the $baseDir
 *
 * PARAMETERS:
 * type:
 *      chunk
 *      snippet
 *      template
 *      plugin
 *
 * add delete:true to remove a snippet form modx based on the snippet name
 * add once:true to perform the action only once. Effectively the string SEARCHSTRING will be emptied to prevent the file from being processed each time. only with a fresh upload to server will the element be created again
 *
 *
 * USAGE in the static files:
 * <!-- YOUR SEARCHSTRING HERE{"type":"chunk","name":"TEST CHUNK", "categorie":"pinkribbon.test2.test3"}; -->
 * <!-- YOUR SEARCHSTRING HERE{"type":"chunk","name":"TEST CHUNK", "categorie":"pinkribbon.test2.test3", "delete":"true"}; -->
 * <!-- YOUR SEARCHSTRING HERE{"type":"chunk","name":"TEST CHUNK", "categorie":"pinkribbon.test2.test3", "once":"true"}; -->
 *
 * So for a snippet it's <?php // YOUR SEARCHSTRING HERE{"type":"snippet","name":"TEST SNIPPET", "categorie":"test.test2.test3"};
 *
 * USAGE as a snippet
 * [!register_elements]
 *
 */


$searchstring = '@modx-' . 'element:'; //the string is split to prevent THIS file from being processed by the register plugin
$baseDir = $modx->getOption('register-elements-path', null, "staticScripts/");
$dir = $modx->config['base_path'] . $baseDir;
$debug =  $modx->getOption('debug', $scriptProperties, false);
//$safetodelete = true;
$o = '';


if($debug){
    $modx->setLogLevel(modX::LOG_LEVEL_INFO);
}

if(!$modx){
    define('MODX_API_MODE', true);
    require_once dirname(__FILE__) . '/config.core.php';
    require_once MODX_CORE_PATH . 'model/modx/modx.class.php';
    $modx = new modX();
    $modx->initialize('web');
    $modx->getService('error', 'error.modError', '', '');
}

//------  Return if the user isn't part of one of the allowed usergroups
$usergroups = explode(',', $modx->getOption('elementhelper.usergroups', null, 'Administrator'));
if(!$modx->user->isMember($usergroups)){
    if($debug){
        $modx->log(xPDO::LOG_LEVEL_INFO, 'Not permitted');
    }
    return;
}

$files = getFiles($dir);

foreach ($files as $file) {

    $f = fopen($file, "r");
    if($f){
        while (($buffer = fgets($f, 1024)) !== false) {
            preg_match('/' . $searchstring . '(.*?);/', $buffer, $display);
            if(isset($display[1])){
                $data = json_decode($display[1], true);
                if($debug){
                    $modx->log(xPDO::LOG_LEVEL_INFO, 'process ' . $data["name"]);
                }
                if(!isLocal() && !$data["once"] == false){
                    removeCodeline($file, $searchstring);
                }
                // prep categories
                if(isset($data["categorie"])){
                    $category_names = explode('.', $data['categorie']);
                    setCategories($category_names);
                    $data["cat"] = get_category_id(end($category_names));
                } else {
                    $data["cat"] = 0;
                }
                if(isset($data["delete"]) && $data["delete"] == true){
                    $o .= deleteElement($data);
                } else {
                    $data["file"] = $file;
                    $o .= createElement($data);
                }
            }
        }

    }
    fclose($f);
}
cachebuster();

$modx->log(xPDO::LOG_LEVEL_INFO, 'Finished processing elements');
$modx->log(xPDO::LOG_LEVEL_INFO,'COMPLETED');

$modx->setLogLevel(modX::LOG_LEVEL_ERROR);


//=============================================

function isLocal(){
  
    $is = false;
    $locallist = array(
            '127.0.0.1',
            '::1'
    );
    if(strpos(strtolower($_SERVER['SERVER_NAME']), 'dev') === true){
        $is = true;
    }
    if(strpos(strtolower($_SERVER['SERVER_NAME']), 'test') === true){
        $is = true;
    }
    if(strpos(strtolower($_SERVER['SERVER_NAME']), 'local') === true){
        $is = true;
    }
    if(in_array($_SERVER['REMOTE_ADDR'], $locallist)){
        $is = true;
    }
    // $modx->log(xPDO::LOG_LEVEL_INFO, 'islocal '. $_SERVER['SERVER_NAME'] .' = '. $is );
    return $is;
}

function cachebuster(){
  global $modx;
  $buster = $modx->getOption('cache_buster');
  if($buster){
    $setting = $modx->getObject('modSystemSetting', 'cache_buster');
    $setting->set('value', $buster+1 );
    $setting->save();
  }
$modx->log(xPDO::LOG_LEVEL_INFO, 'Cachebuster= '. $buster  );
}


function removeCodeline($filename, $hit){
    $file = file($filename);
    $output = $file[0];
    $lineNumber = 0;
    foreach ($file as $lineNumber => $line) {
        if(strpos($line, $hit) !== false){
            unset($file[$lineNumber]);
            break;
        }
    }
    file_put_contents($filename, $file);
    return $output;
}

function get_category_id($name){
    global $modx;
    $category = $modx->getObject('modCategory', array('category' => $name));
    $category_id = isset($category) ? $category->get('id') : 0;
    return $category_id;
}

function create_category($name, $parent_id = 0){
    global $modx;
    $category = $modx->getObject('modCategory', array('category' => $name));
    // If the category doesn't exist create it
    if(!isset($category)){
        $category = $modx->newObject('modCategory');
        $category->set('category', $name);
    }
    $category->set('parent', $parent_id);
    $category->save();
    return $category;
}

function setCategories($cats){
    $parentcat = 0;
    foreach ($cats as $cat) {
        $newcat = create_category($cat, $parentcat);
        $parentcat = $newcat->get('id');
    }
}

function getFiles($directory, $exempt = array('.', '..', '.ds_store', '.svn'), &$files = array()){
    $handle = opendir($directory);
    while (false !== ($resource = readdir($handle))) {
        if(!in_array(strtolower($resource), $exempt)){
            if(is_dir($directory . $resource)){
                array_merge($files, getFiles($directory . $resource . '/', $exempt, $files));
            } else {
                $files[] = $directory . $resource;
            }
        }
    }
    closedir($handle);
    return $files;
}

function getDescriptionTime($desc){
    $l = strrpos($desc, "-");
    if($l > 0){
        return substr($desc, $l + 2);
    } else {
        return false;
    }
}

function getDescription($desc){
    $l = strrpos($desc, "-");
    if($l > 0){
        return substr($desc, 0, $l);
    } else {
        return $desc;
    }
}

function createElement($data){
    global $modx;
    global $debug;

    if($debug){
        $modx->log(xPDO::LOG_LEVEL_INFO, 'createElement=> ' . $data["name"] . ' ,type= ' . $data["type"] . ' ,categorie= ' . $data["categorie"]);
    }
    switch (strtolower($data["type"])) {
        case 'chunk':
            $obj = $modx->getObject('modChunk', array('name' => $data["name"]));
            if($obj){
                $obj = (getDescriptionTime($obj->get('description')) == filemtime($data['file'])) ? NULL : $obj;
            } else {
                $obj = $modx->newObject('modChunk');
                $obj->set('name', $data["name"]);
            }
            break;
        case 'snippet':
            $obj = $modx->getObject('modSnippet', array('name' => $data["name"]));
            if($obj){
                $obj = (getDescriptionTime($obj->get('description')) == filemtime($data['file'])) ? NULL : $obj;

            } else {
                $obj = $modx->newObject('modSnippet');
                $obj->set('name', $data["name"]);
            }
            break;
        case 'template':
            $obj = $modx->getObject('modTemplate', array('templatename' => $data["name"]));
            if($obj){
                $obj = (getDescriptionTime($obj->get('description')) == filemtime($data['file'])) ? NULL : $obj;
            } else {
                $obj = $modx->newObject('modTemplate');
                $obj->set('templatename', $data["name"]);
            }
            break;
        case 'plugin':
            $obj = $modx->getObject('modPlugin', array('name' => $data["name"]));
            if($obj){
                $obj = (getDescriptionTime($obj->get('description')) == filemtime($data['file'])) ? NULL : $obj;
            } else {
                $obj = $modx->newObject('modPlugin');
                $obj->set('name', $data["name"]);
            }
            break;
    }

    if($obj){
        $f = str_replace($modx->config['base_path'], "", $data["file"]);
        $obj->set('static', 1);
        $obj->set('source', 0);
        $obj->set('static_file', $f);
        $obj->set('category', $data['cat']);
        $desc = getDescription($obj->get('description'));

        if(isset($data['description'])){
            $obj->set('description', $data['description'] . " - " . filemtime($data['file']));
        } else {
            $obj->set('description', $desc . " - " . filemtime($data['file']));
        }

        $modx->log(xPDO::LOG_LEVEL_INFO, '--- Save ' . $data["name"]);

        $obj->setContent(file_get_contents($data["file"]));
        if($obj->save()){
            // $modx->cacheManager->refresh();
            return $data["type"] . ": " . $data["name"] . ' created <br>';
        } else {
            if($debug){
                $modx->log(xPDO::LOG_LEVEL_INFO, 'FAIL Element=> ' . $data["name"]);
            }
            return 'fail';
        }
    }
}

//==============================================
function deleteElement($data){
    global $modx;
    switch ($data["type"]) {
        case 'chunk':
            $obj = $modx->getObject('modChunk', array('name' => $data["name"]));
            break;
        case 'snippet':
            $obj = $modx->getObject('modSnippet', array('name' => $data["name"]));
            break;
        case 'template':
            $obj = $modx->getObject('modTemplate', array('templatename' => $data["name"]));
            break;
    }
    if($obj){
        if($obj->remove() == false){
            return 'An error occurred while trying to remove ' . $data["name"];
        } else {
            return $data["name"] . ' DELETED <br>';
        }
    }
}