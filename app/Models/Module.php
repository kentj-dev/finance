<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Module extends Model
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'description',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_module', 'module_id', 'role_id')
            ->wherePivotNull('deleted_at');
    }

    public function users()
    {
        return $this->roles()->with('users');
    }


    public static function booted()
    {
        static::creating(function ($user) {
            $user->id = (string) Str::uuid();
        });
    }
}
