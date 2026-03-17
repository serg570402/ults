<?php
require_once './visitorConnect.php';
if (isset($_GET['id']) === true) {
    $id    = $_GET['id'];
    $tbln  = $_GET['tbln'];
    $query = "SELECT wrds from $tbln where id = '" . $id . "'";
}
$result = mysqli_query($conn, $query);
$data   = mysqli_fetch_array($result);
if ($data) {
    echo $data[0];
} else {
    echo "Error: " . $sql . "" . mysqli_error($dbCon);
}
