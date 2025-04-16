<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Inertia\Response as InertiaResponse;

class DashboardController extends Controller
{
    public function create(Request $request): InertiaResponse|RedirectResponse
    {
        $module = Module::where('name', 'Dashboard')->firstOrFail();

        return Inertia::render('dashboard', [
            'module' => $module,
        ]);
    }
}
