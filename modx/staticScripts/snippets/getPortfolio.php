<?php

$criteria = $modx->newQuery('modResource');
$criteria->where(array(
  'template' => 4,
  'published' => 1,
  'deleted' => 0
));
$children = $modx->getCollection('modResource', $criteria);

$ret = array();
foreach ($children as $doc) {
  $item = array(
    'id' => $doc->get('id'),
    'pagetitle' => $doc->get('pagetitle'),
    'contributors' => $doc->getTVvalue('Contributers'),
    'date' => $doc-> getTVvalue('date'),
    'technologies' => $doc->getTVvalue('technologies')
  );
  $item = $modx->getChunk('portfolioItem', $item);
  array_push($ret, $item);
}

return  implode("", $ret);
