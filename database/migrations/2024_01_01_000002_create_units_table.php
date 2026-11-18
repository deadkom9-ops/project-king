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
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->unsignedBigInteger('head_id')->nullable();
            $table->enum('level', ['direktorat', 'bidang', 'unit'])->default('unit');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('units')->nullOnDelete();
            $table->foreign('head_id')->references('id')->on('users')->nullOnDelete();
        });

        // Add foreign key constraint for unit_id on users table
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('unit_id')->references('id')->on('units')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['unit_id']);
        });

        Schema::dropIfExists('units');
    }
};
