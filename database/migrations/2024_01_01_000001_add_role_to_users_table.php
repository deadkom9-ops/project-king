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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', [
                'admin',
                'direktur',
                'wakil_direktur',
                'kepala_bidang',
                'kepala_unit',
                'project_manager',
                'member',
            ])->default('member')->after('password');
            $table->unsignedBigInteger('unit_id')->nullable()->after('role');
            $table->string('avatar')->nullable()->after('unit_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'unit_id', 'avatar']);
        });
    }
};
