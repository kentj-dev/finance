<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function create(Request $request): Response
    {
        $search = $request->query('search');

        $allUsers = User::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy("created_at", "desc")
            ->get();

        $context = [
            'users' => $allUsers,
            'filters' => [
                'search' => $search,
            ]
        ];

        return Inertia::render('dashboard', $context);
    }

    public function createUser(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        return redirect()->back();
    }

    public function viewUser(Request $request): Response
    {
        $id = $request->route('id');
        $user = User::findOrFail($id);

        $context = [
            'user' => $user,
        ];

        return Inertia::render('user/view-user', $context);
    }

    public function deleteUser(Request $request): RedirectResponse
    {
        $id = $request->route('id');

        $currentUser = auth()->user();

        if ($currentUser->id === (int) $id) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->back();
    }

    public function updateUser(Request $request): RedirectResponse
    {
        $id = $request->route('id');

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users')->ignore($id),
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users')->ignore($id),
            ],
        ]);

        $user = User::findOrFail($id);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

}
