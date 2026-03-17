<?php
$servername = "localhost";
$username   = "nikita";
$password   = "2008";
$dbName     = "ultsuz_lts";
$conn       = new mysqli($servername, $username, $password, $dbName);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
