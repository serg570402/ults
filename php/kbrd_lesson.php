<?php
require_once './visitorConnect.php';
if (isset($_GET['lang']) === true) {
    $lang  = trim($_GET['lang']);
    $query = "SELECT txt from kbrd where lang = '" . $lang . "'";
}
$result = mysqli_query($conn, $query);
$data   = mysqli_fetch_array($result);
if ($data) {
    echo $data[0];
} else {
    echo "Error: " . $query . "" . mysqli_error($dbCon);
}
