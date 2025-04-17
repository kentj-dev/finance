<?php

namespace App\Http\Controllers\RoleManagement;

use App\Attributes\RoleAccess;
use App\Models\Role;
use App\Models\RoleModule;
use App\Models\Module;
use App\Models\RoleUser;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class RolesController extends Controller
{
    #[RoleAccess('Roles')]
    public function create(Request $request): InertiaResponse|RedirectResponse
    {
        $page = (int) $request->get("page", 1);
        $search = $request->query('search');
        $sortBy = $request->query('sortBy');
        $sortDirection = $request->query('sortDirection');

        $sortFields = ['id', 'name', 'description', 'created_at'];
        $perPagesDropdown = [5, 10, 25, 50, 100];

        $perPage = (int) $request->query('perPage', $perPagesDropdown[0]);

        if (!in_array($perPage, $perPagesDropdown)) {
            $perPage = array_key_first($perPagesDropdown);
        }

        $query = Role::with('users');

        if ($search) {
            $term = ltrim($search, '!');
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%");
            });
        }

        if (in_array($sortBy, $sortFields) && in_array($sortDirection, ['asc', 'desc'])) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $roles = $query->paginate($perPage)->withQueryString();

        if ($page > $roles->lastPage()) {
            return redirect()->route('roles', array_merge(
                $request->except(keys: 'page'),
                ['page' => 1]
            ));
        }

        $allRolesCount = Role::count();

        $context = [
            'roles' => $roles,
            'tableData' => [
                'search' => $search,
                'filters' => explode(',', $filters ?? ''),
                'sort' => $sortBy,
                'direction' => $sortDirection,
                'page' => $page,
                'perPage' => $perPage,
                'perPagesDropdown' => $perPagesDropdown,
            ],
            'allRolesCount' => $allRolesCount
        ];

        return Inertia::render('role-management/roles', $context);
    }

    #[RoleAccess('Roles')]
    public function delete(Request $request): RedirectResponse
    {
        $roleId = $request->route('id');

        $role = Role::find($roleId);
        $role->delete();

        return redirect()->back();
    }

    #[RoleAccess('Roles')]
    public function revokeUserRole(Request $request): RedirectResponse
    {
        $userId = $request->route('id');
        $roleId = $request->roleId;

        $roleUser = RoleUser::where('user_id', operator: $userId)
            ->where('role_id', $roleId)
            ->whereNull('deleted_at')
            ->first();

        if ($roleUser) {
            $roleUser->delete();
        }

        return redirect()->back()->with('success', 'Role revoked successfully.');
    }

    #[RoleAccess('Roles')]
    public function revertUserRole(Request $request): RedirectResponse
    {
        $userId = $request->route('id');
        $roleId = $request->roleId;

        $roleUser = RoleUser::withTrashed()
            ->where('user_id', $userId)
            ->where('role_id', $roleId)
            ->first();

        if ($roleUser) {
            $roleUser->restore();
        }

        return redirect()->back()->with('success', 'Role restored successfully.');
    }

    #[RoleAccess('Roles')]
    public function viewRolePermissions(Request $request): InertiaResponse
    {
        $roleId = $request->route('id');

        $role = Role::with(['roleModules.module'])->find($roleId);

        $modules = Module::orderBy('name')->get();

        $context = [
            'role' => $role,
            'modules' => $modules
        ];

        return Inertia::render('role-management/manage-role', $context);
    }

    #[RoleAccess('Roles')]
    public function manageRoleModulePermissions(Request $request): RedirectResponse
    {
        $roleId = $request->roleId;

        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles')->ignore($roleId),
            ],
            'description' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $modulesId = $request->modulesId ?? [];
        $roleName = $request->name;
        $roleDescription = $request->description;
        $forAdmin = $request->for_admin ?? false;

        DB::transaction(function () use ($roleId, $modulesId, $roleName, $roleDescription, $forAdmin) {
            foreach ($modulesId as $moduleId) {
                $existing = RoleModule::withTrashed()
                    ->where('role_id', $roleId)
                    ->where('module_id', $moduleId)
                    ->first();

                if ($existing) {
                    $existing->restore();
                } else {
                    RoleModule::create([
                        'role_id' => $roleId,
                        'module_id' => $moduleId,
                    ]);
                }
            }

            RoleModule::where('role_id', $roleId)
                ->whereNotIn('module_id', $modulesId)
                ->whereNull('deleted_at')
                ->delete();

            Role::where('id', $roleId)
                ->update([
                    'name' => $roleName,
                    'description' => $roleDescription,
                    'for_admin' => $forAdmin
                ]);
        });

        return redirect()->back()->with('success', 'Role updated successfully.');
    }

    #[RoleAccess('Roles')]
    public function createRole(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:' . Role::class
            ],
            'description' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $roleName = $request->name;
        $roleDescription = $request->description;

        Role::create([
            'name' => $roleName,
            'description' => $roleDescription
        ]);

        return redirect()->back()->with('success', 'Role added successfully.');
    }
}
