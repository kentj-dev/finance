<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;

class AuthServiceprovider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Gate::define('access-module', function ($user, $moduleName) {
            if ($user->superstaff) {
                return true;
            }

            return DB::table('role_user')
                ->join('role_module', 'role_user.role_id', '=', 'role_module.role_id')
                ->join('modules', 'role_module.module_id', '=', 'modules.id')
                ->join('roles', 'role_user.role_id', '=', 'roles.id')
                ->whereNull('roles.deleted_at')
                ->whereNull('role_user.deleted_at')
                ->whereNull('role_module.deleted_at')
                ->whereNull('modules.deleted_at')
                ->where('role_user.user_id', $user->id)
                ->where('modules.name', $moduleName)
                ->exists();
        });
    }
}
