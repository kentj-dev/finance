<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Validation\ValidationException;

class ActivateController extends Controller
{
    public function create(Request $request)
    {
        $email = Auth::user()->email;

        return Inertia::render('user/activate-user', [
            'email' => $email,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);
    
        $user = Auth::user();
    
        // Optional: check if the email matches the logged-in user
        if ($user->email !== $request->email) {
            throw ValidationException::withMessages([
                'email' => ['The provided email does not match the logged-in user.'],
            ]);
        }
    
        $user->forceFill([
            'password' => Hash::make($request->password),
            'activated_at' => now(),
            'remember_token' => Str::random(60),
        ])->save();
    
        return redirect()->route('home')->with('status', 'Your account has been activated.');
    }
}
