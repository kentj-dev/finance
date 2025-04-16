<?php

namespace App\Http\Controllers\RoleManagement;

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

class ModulesController extends Controller
{
    public function create(Request $request): InertiaResponse|RedirectResponse
    {
        $page = (int) $request->get("page", 1);
        $search = $request->query('search');
        $sortBy = $request->query('sortBy');
        $sortDirection = $request->query('sortDirection');

        $perPagesDropdown = [5, 10, 25, 50, 100];

        $perPage = (int) $request->query('perPage', $perPagesDropdown[0]);

        if (!in_array($perPage, $perPagesDropdown)) {
            $perPage = array_key_first($perPagesDropdown);
        }

        $modules = Module::with('roles.users')
            ->when($search, function ($query, $search) {
                $term = ltrim($search, '!');
                $query->where(function ($q) use ($term) {
                    $q->where('name', 'like', "%{$term}%")
                        ->orWhere('description', 'like', "%{$term}%");
                });
            })
            ->when(in_array($sortBy, ['id', 'name', 'description', 'created_at']) && in_array($sortDirection, ['asc', 'desc']), function ($query) use ($sortBy, $sortDirection) {
                $query->orderBy($sortBy, $sortDirection);
            }, function ($query) {
                $query->orderBy('created_at', 'desc');
            })
            ->paginate($perPage)
            ->withQueryString();

        $modules->getCollection()->transform(function ($module) {
            $module->users = $module->roles->flatMap->users->unique('id')->values();
            return $module;
        });

        if ($page > $modules->lastPage()) {
            return redirect()->route('modules', array_merge(
                $request->except(keys: 'page'),
                ['page' => 1]
            ));
        }

        $allModulesCount = Module::count();

        $context = [
            'modules' => $modules,
            'tableData' => [
                'search' => $search,
                'filters' => explode(',', $filters ?? ''),
                'sort' => $sortBy,
                'direction' => $sortDirection,
                'page' => $page,
                'perPage' => $perPage,
                'perPagesDropdown' => $perPagesDropdown,
            ],
            'allModulesCount' => $allModulesCount
        ];

        return Inertia::render('role-management/modules', $context);
    }

    public function viewManageModule(Request $request): InertiaResponse
    {
        $moduleId = $request->route('id');

        $module = Module::with('roles')->find($moduleId);

        $roles = Role::orderBy('name')->get();

        $context = [
            'module' => $module,
            'roles' => $roles
        ];

        return Inertia::render('role-management/manage-module', $context);
    }

    public function updateModulePermissions(Request $request): RedirectResponse
    {
        $moduleId = $request->moduleId;

        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('modules')->ignore($moduleId),
            ],
            'description' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $rolesId = $request->rolesId ?? [];
        $moduleName = $request->name;
        $moduleDescription = $request->description;

        DB::transaction(function () use ($moduleId, $rolesId, $moduleName, $moduleDescription) {
            foreach ($rolesId as $roleId) {
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

            RoleModule::where('module_id', $moduleId)
                ->whereNotIn('role_id', $rolesId)
                ->whereNull('deleted_at')
                ->delete();

            Module::where('id', $moduleId)
                ->update([
                    'name' => $moduleName,
                    'description' => $moduleDescription,
                ]);
        });

        return redirect()->back()->with('success', 'Module updated successfully.');
    }

    public function createModule(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:' . Module::class
            ],
            'description' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $moduleName = $request->name;
        $moduleDescription = $request->description;

        Module::create([
            'name' => $moduleName,
            'description' => $moduleDescription
        ]);

        return redirect()->back()->with('success', 'Module added successfully.');
    }

    public function delete(Request $request): RedirectResponse
    {
        $moduleId = $request->route('id');

        $module = Module::find($moduleId);
        $module->delete();

        return redirect()->back();
    }
}
