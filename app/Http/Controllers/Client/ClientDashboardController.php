<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Inertia\Response as InertiaResponse;

class ClientDashboardController extends Controller
{
    public function create(Request $request): InertiaResponse
    {
        return Inertia::render('client-side/client-dashboard');
    }
}
