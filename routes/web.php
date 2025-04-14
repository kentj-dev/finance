<?php

use App\Http\Controllers\User\ActivateController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Middleware\EnsureUserIsActivated;
use App\Http\Middleware\RedirectIfActivated;

// * if dealing with files, use post method even in updating.

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified', RedirectIfActivated::class])->group(function () {
    Route::get('activate-account', [ActivateController::class, 'create'])
        ->name('activate-account');

    Route::post('activate-account', [ActivateController::class, 'store'])
        ->name('activate-account.store');
});

Route::middleware(['auth', 'verified', EnsureUserIsActivated::class])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'create'])
        ->name('dashboard');

    Route::post('dashboard/register-user', [DashboardController::class, 'createUser'])
        ->name('dashboard.register-user');

    Route::get('dashboard/view-user/{id}', [DashboardController::class, 'viewUser'])
        ->name('dashboard.view-user');

    Route::delete('dashboard/delete-user/{id}', [DashboardController::class, 'deleteUser'])
        ->name('dashboard.delete-user');

    Route::post('dashboard/update-user/{id}', [DashboardController::class, 'updateUser'])
        ->name('dashboard.update-user');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
