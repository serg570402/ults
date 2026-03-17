<?php
$servername = "localhost";
$username   = "ults_user";
$password   = "visitor";
$dbName     = "ults";
$conn       = new mysqli($servername, $username, $password, $dbName);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
// echo '<script>console.log("Connected successefully");</script>';
