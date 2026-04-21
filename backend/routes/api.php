<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\AlbumController;
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\RadioController;
use App\Http\Controllers\ApartmentController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PaymentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::get('/trips', [TripController::class, 'index']);
Route::get('/trips/{trip}', [TripController::class, 'show']);
Route::get('/trips/{trip}/points', [TripController::class, 'points']);

// Authentication
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Albums
    Route::apiResource('albums', AlbumController::class);
    Route::get('/albums/{album}/photos', [PhotoController::class, 'index']);
    Route::post('/albums/{album}/photos', [PhotoController::class, 'store']);
    Route::delete('/photos/{photo}', [PhotoController::class, 'destroy']);

    // Radios
    Route::apiResource('radios', RadioController::class)->except(['show']);
    Route::put('/radios/{radio}/favorite', [RadioController::class, 'toggleFavorite']);

    // Apartments / Bookings / Payments
    Route::get('/agenda', [ApartmentController::class, 'agenda']);
    Route::apiResource('apartments', ApartmentController::class);
    Route::post('/apartments/{apartment}/sync-airbnb', [ApartmentController::class, 'syncAirbnb']);
    Route::get('/apartments/{apartment}/bookings', [BookingController::class, 'index']);
    Route::post('/apartments/{apartment}/bookings', [BookingController::class, 'store']);
    Route::apiResource('bookings', BookingController::class)->only(['show', 'update', 'destroy']);
    Route::post('/bookings/{booking}/payments', [PaymentController::class, 'store']);
    Route::delete('/payments/{payment}', [PaymentController::class, 'destroy']);
});
