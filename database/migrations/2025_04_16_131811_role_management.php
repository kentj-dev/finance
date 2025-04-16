<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create("roles", function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->string("name");
            $table->string("description")->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create("modules", function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->string("name");
            $table->string("description")->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create("role_module", function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->foreignUuid("role_id")
                ->constrained("roles")
                ->cascadeOnDelete();
            $table->foreignUuid("module_id")
                ->constrained("modules")
                ->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create("role_user", function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->foreignUuid("user_id")
                ->constrained("users")
                ->cascadeOnDelete();
            $table->foreignUuid("role_id")
                ->constrained("roles")
                ->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("roles");
        Schema::dropIfExists("modules");
        Schema::dropIfExists("role_module");
        Schema::dropIfExists("role_user");
    }
};
