<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->enum('role', ['admin', 'user'])->default('user')->after('email');
            });
        }

        if (! Schema::hasColumn('users', 'nip')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('nip')->unique()->nullable()->after('role');
            });
        }
    }

    public function down(): void
    {
        $columns = array_filter([
            Schema::hasColumn('users', 'role') ? 'role' : null,
            Schema::hasColumn('users', 'nip') ? 'nip' : null,
        ]);

        if ($columns) {
            Schema::table('users', function (Blueprint $table) use ($columns) {
                $table->dropColumn($columns);
            });
        }
    }
};
