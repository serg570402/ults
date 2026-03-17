<?php
$servername = "localhost";
$username   = "nikita";
$password   = "niki2008";
$dbName     = "ults";
$conn       = new mysqli($servername, $username, $password, $dbName);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
