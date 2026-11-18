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
        if (!Schema::hasTable('company_groups')) {
            Schema::create('company_groups', function (Blueprint $table) {
                $table->id();
                $table->string('name')->comment('Nama grup yang ditentukan user (contoh: Perusahaan A)');
                $table->string('prefix_code', 6)->comment('6 karakter acak huruf & angka dari sistem (contoh: A7X9K2)');
                $table->string('group_code')->unique()->comment('Kode lengkap untuk join: NAMA-GRUP-KODEPREFIX (contoh: PERUSAHAAN-A-A7X9K2)');
                $table->foreignId('owner_id')->nullable()->comment('User pembuat grup')->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        }

        if (!Schema::hasColumn('users', 'company_group_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreignId('company_group_id')
                    ->nullable()
                    ->after('unit_id')
                    ->constrained('company_groups')
                    ->nullOnDelete();
            });
        }

        if (!Schema::hasColumn('projects', 'company_group_id')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->foreignId('company_group_id')
                    ->nullable()
                    ->after('unit_id')
                    ->constrained('company_groups')
                    ->cascadeOnDelete();
            });
        }

        if (!Schema::hasColumn('units', 'company_group_id')) {
            Schema::table('units', function (Blueprint $table) {
                $table->foreignId('company_group_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('company_groups')
                    ->cascadeOnDelete();

                $table->dropUnique('units_code_unique');
                $table->unique(['company_group_id', 'code'], 'units_company_group_code_unique');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('units', 'company_group_id')) {
            Schema::table('units', function (Blueprint $table) {
                $table->dropUnique('units_company_group_code_unique');
                $table->unique('code', 'units_code_unique');
                $table->dropForeign(['company_group_id']);
                $table->dropColumn('company_group_id');
            });
        }

        if (Schema::hasColumn('projects', 'company_group_id')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropForeign(['company_group_id']);
                $table->dropColumn('company_group_id');
            });
        }

        if (Schema::hasColumn('users', 'company_group_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropForeign(['company_group_id']);
                $table->dropColumn('company_group_id');
            });
        }

        Schema::dropIfExists('company_groups');
    }
};
