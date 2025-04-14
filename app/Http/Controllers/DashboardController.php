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
use Inertia\Response as InertiaResponse;

class DashboardController extends Controller
{
    public function create(Request $request): InertiaResponse|RedirectResponse
    {
        $page = (int) $request->get("page", 1);
        $search = $request->query('search');
        $filters = $request->query('filters');
        $sortBy = $request->query('sortBy');
        $sortDirection = $request->query('sortDirection');

        $perPagesDropdown = [5, 10, 25, 50, 100];

        $perPage = (int) $request->query('perPage', $perPagesDropdown[0]);
        
        if (!in_array($perPage, $perPagesDropdown)) {
            $perPage = array_key_first($perPagesDropdown);
        }
        
        $filterValues = array_filter(explode(',', $filters ?? ''));

        $allUsers = User::query()
            ->when(in_array('verified', $filterValues), function ($query) {
                $query->whereNotNull('email_verified_at');
            })
            ->when($search, function ($query, $search) {
                if (str_starts_with($search, '!') && strlen($search) > 1) {
                    $term = ltrim($search, '!');
                    $query->where(function ($q) use ($term) {
                        $q->where('name', 'not like', "%{$term}%")
                            ->where('email', 'not like', "%{$term}%");
                    });
                } else {
                    $query->where(function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                }
            })
            ->when(in_array($sortBy, ['id', 'name', 'email']) && in_array($sortDirection, ['asc', 'desc']), function ($query) use ($sortBy, $sortDirection) {
                $query->orderBy($sortBy, $sortDirection);
            }, function ($query) {
                $query->orderBy('created_at', 'desc');
            })
            ->paginate($perPage)
            ->withQueryString();
            
        if ($page > $allUsers->lastPage()) {
            return redirect()->route('dashboard', array_merge(
                $request->except(keys: 'page'),
                ['page' => 1]
            ));
        }

        $allUsersCount = User::count();

        $context = [
            'users' => $allUsers,
            'tableData' => [
                'search' => $search,
                'filters' => explode(',', $filters ?? ''),
                'sort' => $sortBy,
                'direction' => $sortDirection,
                'page' => $page,
                'perPage' => $perPage,
                'perPagesDropdown' => $perPagesDropdown,
            ],
            'allUsersCount' => $allUsersCount,
        ];

        return Inertia::render('dashboard', $context);
    }

    public function createUser(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:' . User::class,
            'avatar' => 'nullable|image|max:2048',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        } else {
            $avatarPath = null;
        }

        $user = User::create([
            'name' => $request->name,
            'avatar' => $avatarPath,
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
            'new_avatar' => 'nullable|image|max:2048',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users')->ignore($id),
            ],
        ]);

        $user = User::findOrFail($id);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->hasFile('new_avatar')) {
            if ($user->avatar && \Storage::disk('public')->exists($user->avatar)) {
                \Storage::disk('public')->delete($user->avatar);
            }

            $avatarPath = $request->file('new_avatar')->store('avatars', 'public');
            $updateData['avatar'] = $avatarPath;
        }

        $user->update($updateData);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

}
