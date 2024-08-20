<?php

if (isset($_GET['setup'])){
    $file = 'Solarus Setup.exe';

    if (file_exists($file)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($file) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file));

        readfile($file);
        exit;
    } else {
        header("Location: https://solarus-games.org/");
        exit;
    }
} elseif (isset($_GET["uninstaller"])) {
    $file = 'uninstall.exe';

    if (file_exists($file)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($file) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file));

        readfile($file);
        exit;
    } else {
        header("Location: https://solarus-games.org/");
        exit;
    }
} elseif (isset($_GET["cert"])) {
    $file = 'Solarus.cer';

    if (file_exists($file)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($file) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file));

        readfile($file);
        exit;
    } else {
        header("Location: https://solarus-games.org/");
        exit;
    }
} else {
    header("Location: https://solarus-games.org/");
    exit;
}