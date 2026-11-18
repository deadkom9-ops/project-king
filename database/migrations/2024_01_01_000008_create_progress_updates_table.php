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
        Schema::create('progress_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('submitted_by')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('percentage')->default(0)->comment('progress yang diajukan 0-100');
            $table->text('notes')->nullable();
            $table->string('file_path')->nullable()->comment('path file bukti jpg/pdf');
            $table->string('file_name')->nullable()->comment('nama file asli');
            $table->enum('approval_status', ['pending', 'approved', 'rejected', 'revision'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable()->comment('alasan reject atau catatan revisi');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->index(['approval_status', 'task_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progress_updates');
    }
};
