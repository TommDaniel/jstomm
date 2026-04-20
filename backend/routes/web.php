<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['app' => '70 Anos da Vó', 'status' => 'ok']);
});
