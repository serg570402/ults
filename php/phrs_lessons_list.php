<?php
require_once './visitorConnect.php';
if (isset($_GET['tblName']) === true) {
    $tblName = $_GET['tblName'];
    $query   = "SELECT id, title from $tblName";
}

$result = $conn->query($query) or die($conn->error);
$array  = "";
$output = "";
while ($row = $result->fetch_array()) {
    $array  = $row['id'] . ';;' . $row['title'];
    $output = $output . $array . '//';
}
echo $output;
