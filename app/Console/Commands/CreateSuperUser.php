<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateSuperUser extends Command
{
    protected $signature = 'createsuperuser';
    protected $description = 'Create a superuser with full access';

    public function handle(): int
    {
        $name = $this->ask('Name');
        $email = $this->ask('Email');
        $password = $this->secret('Password');
        $confirmPassword = $this->secret('Confirm Password');

        if ($password !== $confirmPassword) {
            $this->error("Passwords do not match.");
            return self::FAILURE;
        }

        if (
            User::where('email', $email)
                ->orWhere('name', $name)
                ->exists()
        ) {
            $this->error("A user with that email already exists.");
            return self::FAILURE;
        }

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'superstaff' => 1,
        ]);

        $this->info("Superuser {$user->email} created successfully.");
        return self::SUCCESS;
    }
}
